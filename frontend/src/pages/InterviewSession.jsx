import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiMic, FiMicOff, FiBookmark, FiClock, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { interviewService } from '../services/interviewService';
import { useTimer } from '../hooks/useTimer';
import { useSpeechToText } from '../hooks/useSpeechToText';
import Button from '../components/common/Button';
import LoadingScreen from '../components/common/LoadingScreen';

const TIME_PER_QUESTION = 120; // 2 minutes

const InterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [generatingFollowUp, setGeneratingFollowUp] = useState(false);

  const { seconds, reset, formatted } = useTimer(TIME_PER_QUESTION, true);
  const { transcript, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechToText();

  // Fetch interview data
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await interviewService.getById(id);
        if (data.interview.status === 'completed') {
          navigate(`/interview/${id}/results`);
          return;
        }
        setInterview(data.interview);
      } catch {
        toast.error('Failed to load interview');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id, navigate]);

  // Sync answer when question changes
  useEffect(() => {
    if (interview) {
      const q = interview.questions[currentIndex];
      setAnswer(q.userAnswer || '');
      setFollowUpAnswer(q.followUpAnswer || '');
      reset(TIME_PER_QUESTION);
      resetTranscript();
    }
  }, [currentIndex, interview]);

  // Append speech transcript to answer
  useEffect(() => {
    if (transcript) {
      setAnswer(prev => (prev ? prev + ' ' : '') + transcript);
      resetTranscript();
    }
  }, [transcript]);

  const saveCurrentAnswer = useCallback(async () => {
    if (!interview) return;
    const question = interview.questions[currentIndex];
    const timeTaken = TIME_PER_QUESTION - seconds;
    try {
      await interviewService.saveAnswer(id, {
        questionId: question.questionId,
        userAnswer: answer,
        timeTaken,
      });
    } catch {
      toast.error('Failed to save answer');
    }
  }, [interview, currentIndex, answer, seconds, id]);

  const handleNavigation = async (direction) => {
    await saveCurrentAnswer();
    setInterview(prev => {
      const updated = { ...prev };
      updated.questions[currentIndex].userAnswer = answer;
      return { ...updated };
    });

    if (direction === 'next' && currentIndex < interview.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'prev' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleToggleBookmark = async () => {
    const question = interview.questions[currentIndex];
    try {
      const { data } = await interviewService.toggleBookmark(id, question.questionId);
      setInterview(prev => {
        const updated = { ...prev };
        updated.questions[currentIndex].isBookmarked = data.isBookmarked;
        return { ...updated };
      });
      toast.success(data.isBookmarked ? 'Question bookmarked' : 'Bookmark removed');
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const handleGenerateFollowUp = async () => {
    if (!answer.trim()) {
      toast.error('Answer the question first');
      return;
    }
    await saveCurrentAnswer();
    setGeneratingFollowUp(true);
    try {
      const question = interview.questions[currentIndex];
      const { data } = await interviewService.generateFollowUp(id, question.questionId);
      setInterview(prev => {
        const updated = { ...prev };
        updated.questions[currentIndex].followUpQuestion = data.followUpQuestion;
        return { ...updated };
      });
      toast.success('Follow-up question generated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate follow-up');
    } finally {
      setGeneratingFollowUp(false);
    }
  };

  const handleSaveFollowUp = async () => {
    const question = interview.questions[currentIndex];
    try {
      await interviewService.saveFollowUpAnswer(id, question.questionId, followUpAnswer);
      toast.success('Follow-up answer saved');
    } catch {
      toast.error('Failed to save follow-up');
    }
  };

  const handleSubmit = async () => {
    await saveCurrentAnswer();
    setSubmitting(true);
    try {
      await interviewService.submit(id);
      toast.success('Interview submitted! Generating feedback...');
      navigate(`/interview/${id}/results`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit interview');
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!interview) return null;

  const question = interview.questions[currentIndex];
  const isLastQuestion = currentIndex === interview.questions.length - 1;
  const progress = ((currentIndex + 1) / interview.questions.length) * 100;

  const typeColors = {
    technical: 'bg-blue-500/20 text-blue-500',
    behavioral: 'bg-purple-500/20 text-purple-500',
    situational: 'bg-orange-500/20 text-orange-500',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium">Question {currentIndex + 1} of {interview.questions.length}</span>
          <div className={`flex items-center gap-1 font-semibold ${seconds <= 20 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            <FiClock size={14} /> {formatted}
          </div>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-600 to-accent-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeColors[question.type]}`}>
              {question.type.toUpperCase()}
            </span>
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-lg transition-colors ${question.isBookmarked ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-400 hover:bg-white/10'}`}
              aria-label="Bookmark question"
            >
              <FiBookmark fill={question.isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>

          <h2 className="text-lg md:text-xl font-semibold leading-relaxed">{question.questionText}</h2>

          {/* Answer Input */}
          <div className="relative">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here, or use the microphone..."
              rows={6}
              className="glass-input resize-none pr-12"
            />
            {isSupported && (
              <button
                onClick={isListening ? stopListening : startListening}
                className={`absolute right-3 top-3 p-2 rounded-lg transition-colors ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-primary-500/10 text-primary-500 hover:bg-primary-500/20'
                }`}
                aria-label="Voice input"
              >
                {isListening ? <FiMicOff /> : <FiMic />}
              </button>
            )}
          </div>
          {isListening && (
            <p className="text-xs text-primary-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Listening...
            </p>
          )}

          {/* Follow-up section */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            {!question.followUpQuestion ? (
              <button
                onClick={handleGenerateFollowUp}
                disabled={generatingFollowUp}
                className="text-sm text-primary-500 hover:underline disabled:opacity-50"
              >
                {generatingFollowUp ? 'Generating follow-up...' : '+ Generate AI follow-up question'}
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-accent-500">Follow-up: {question.followUpQuestion}</p>
                <textarea
                  value={followUpAnswer}
                  onChange={(e) => setFollowUpAnswer(e.target.value)}
                  onBlur={handleSaveFollowUp}
                  placeholder="Your follow-up answer..."
                  rows={3}
                  className="glass-input resize-none text-sm"
                />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={() => handleNavigation('prev')}
          disabled={currentIndex === 0}
          className="flex items-center gap-1"
        >
          <FiChevronLeft /> Previous
        </Button>

        {isLastQuestion ? (
          <Button onClick={handleSubmit} isLoading={submitting} className="flex items-center gap-2">
            <FiCheckCircle /> Submit Interview
          </Button>
        ) : (
          <Button onClick={() => handleNavigation('next')} className="flex items-center gap-1">
            Next <FiChevronRight />
          </Button>
        )}
      </div>
    </div>
  );
};

export default InterviewSession;