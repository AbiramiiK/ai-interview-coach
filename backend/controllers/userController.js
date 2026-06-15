const User = require('../models/User');
const Interview = require('../models/Interview');

// @desc    Update user profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences.toObject(), ...preferences };

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics dashboard data
// @route   GET /api/users/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ user: req.user._id, status: 'completed' })
      .sort({ completedAt: 1 });

    const totalInterviews = interviews.length;
    const averageScore = totalInterviews > 0
      ? (interviews.reduce((sum, i) => sum + i.overallScore, 0) / totalInterviews).toFixed(1)
      : 0;

    // Aggregate strengths/weaknesses
    const strengthMap = {};
    const weaknessMap = {};
    interviews.forEach(i => {
      (i.strengthAnalysis || []).forEach(s => strengthMap[s] = (strengthMap[s] || 0) + 1);
      (i.weaknessAnalysis || []).forEach(w => weaknessMap[w] = (weaknessMap[w] || 0) + 1);
    });

    const topStrengths = Object.entries(strengthMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);
    const topWeaknesses = Object.entries(weaknessMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);

    // Progress over time
    const progressOverTime = interviews.map(i => ({
      date: i.completedAt,
      score: i.overallScore,
      role: i.role,
    }));

    // Score breakdown by question type
    const typeScores = { technical: [], behavioral: [], situational: [] };
    interviews.forEach(i => {
      i.questions.forEach(q => {
        if (q.evaluation?.overallScore != null && typeScores[q.type]) {
          typeScores[q.type].push(q.evaluation.overallScore);
        }
      });
    });

    const avgByType = {};
    Object.keys(typeScores).forEach(type => {
      const arr = typeScores[type];
      avgByType[type] = arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;
    });

    res.status(200).json({
      success: true,
      data: {
        totalInterviews,
        averageScore,
        topStrengths,
        topWeaknesses,
        progressOverTime,
        avgByType,
      },
    });
  } catch (error) {
    next(error);
  }
};