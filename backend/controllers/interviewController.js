const Interview = require('../models/Interview');
const User = require('../models/User');
const geminiService = require('../services/groqService');

// @desc    Create new interview session with AI-generated questions
// @route   POST /api/interviews
exports.createInterview = async (req, res, next) => {
  try {
    const { role, experienceLevel, difficulty, numberOfQuestions } = req.body;

    if (!role || !experienceLevel || !difficulty || !numberOfQuestions) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const questions = await geminiService.generateQuestions({
      role, experienceLevel, difficulty, numberOfQuestions: Number(numberOfQuestions),
    });

    const interview = await Interview.create({
      user: req.user._id,
      role,
      experienceLevel,
      difficulty,
      numberOfQuestions: Number(numberOfQuestions),
      questions,
      status: 'in-progress',
    });

    res.status(201).json({ success: true, interview });
  } catch (error) {
    console.error('Question generation error:', error);
    next(error);
  }
};

// @desc    Get single interview
// @route   GET /api/interviews/:id
exports.getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.status(200).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

// @desc    Save/update an answer for a question
// @route   PUT /api/interviews/:id/answer
exports.saveAnswer = async (req, res, next) => {
  try {
    const { questionId, userAnswer, timeTaken } = req.body;

    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const question = interview.questions.find(q => q.questionId === questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    question.userAnswer = userAnswer;
    question.timeTaken = timeTaken || question.timeTaken;

    await interview.save();
    res.status(200).json({ success: true, interview });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark on a question
// @route   PUT /api/interviews/:id/bookmark
exports.toggleBookmark = async (req, res, next) => {
  try {
    const { questionId } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const question = interview.questions.find(q => q.questionId === questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    question.isBookmarked = !question.isBookmarked;
    await interview.save();

    res.status(200).json({ success: true, isBookmarked: question.isBookmarked });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate follow-up question for an answer
// @route   POST /api/interviews/:id/followup
exports.generateFollowUp = async (req, res, next) => {
  try {
    const { questionId } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const question = interview.questions.find(q => q.questionId === questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    if (!question.userAnswer) {
      return res.status(400).json({ success: false, message: 'Answer this question first' });
    }

    const followUp = await geminiService.generateFollowUp({
      questionText: question.questionText,
      userAnswer: question.userAnswer,
      role: interview.role,
    });

    question.followUpQuestion = followUp;
    await interview.save();

    res.status(200).json({ success: true, followUpQuestion: followUp });
  } catch (error) {
    next(error);
  }
};

// @desc    Save follow-up answer
// @route   PUT /api/interviews/:id/followup-answer
exports.saveFollowUpAnswer = async (req, res, next) => {
  try {
    const { questionId, followUpAnswer } = req.body;
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    const question = interview.questions.find(q => q.questionId === questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    question.followUpAnswer = followUpAnswer;
    await interview.save();

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit interview - evaluate all answers and finalize
// @route   POST /api/interviews/:id/submit
exports.submitInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

    // Evaluate each question
    for (const question of interview.questions) {
      const evaluation = await geminiService.evaluateAnswer({
        questionText: question.questionText,
        userAnswer: question.userAnswer,
        role: interview.role,
        experienceLevel: interview.experienceLevel,
        type: question.type,
      });
      question.evaluation = evaluation;
    }

    // Calculate overall score
    const scores = interview.questions.map(q => q.evaluation?.overallScore || 0);
    const overallScore = scores.length
      ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
      : 0;

    // Generate overall analysis
    const analysis = await geminiService.generateOverallAnalysis({
      role: interview.role,
      questions: interview.questions,
    });

    interview.overallScore = overallScore;
    interview.strengthAnalysis = analysis.strengthAnalysis || [];
    interview.weaknessAnalysis = analysis.weaknessAnalysis || [];
    interview.recommendations = analysis.recommendations || [];
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.totalDuration = interview.questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0);

    await interview.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    const allCompleted = await Interview.find({ user: req.user._id, status: 'completed' });
    user.stats.totalInterviews = allCompleted.length;
    user.stats.averageScore = Number(
      (allCompleted.reduce((sum, i) => sum + i.overallScore, 0) / allCompleted.length).toFixed(1)
    );
    await user.save();

    res.status(200).json({ success: true, interview });
  } catch (error) {
    console.error('Submit interview error:', error);
    next(error);
  }
};

// @desc    Get user's interview history
// @route   GET /api/interviews
exports.getInterviewHistory = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const interviews = await Interview.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookmarked questions
// @route   GET /api/interviews/bookmarks
exports.getBookmarkedQuestions = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id, 'questions.isBookmarked': true });

    const bookmarks = [];
    interviews.forEach(interview => {
      interview.questions.forEach(q => {
        if (q.isBookmarked) {
          bookmarks.push({
            interviewId: interview._id,
            role: interview.role,
            questionId: q.questionId,
            questionText: q.questionText,
            type: q.type,
            difficulty: q.difficulty,
            userAnswer: q.userAnswer,
            evaluation: q.evaluation,
          });
        }
      });
    });

    res.status(200).json({ success: true, bookmarks });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an interview
// @route   DELETE /api/interviews/:id
exports.deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.status(200).json({ success: true, message: 'Interview deleted' });
  } catch (error) {
    next(error);
  }
};