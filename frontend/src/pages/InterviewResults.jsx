import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiDownload, FiBookmark, FiArrowLeft, FiTrendingUp, FiTrendingDown, FiTarget } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { interviewService } from '../services/interviewService';
import { reportService } from '../services/reportService';
import { SkeletonCard } from '../components/common/Skeleton';
import ScoreCircle from '../components/common/ScoreCircle';
import Card from '../components/common/Card';

const InterviewResults = () => {
  const { id } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await interviewService.getById(id);
        setInterview(data.interview);
      } catch {
        toast.error('Failed to load results');
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await reportService.downloadPDF(id);
      toast.success('Report downloaded!');
    } catch {
      toast.error('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleBookmark = async (questionId) => {
    try {
      const { data } = await interviewService.toggleBookmark(id, questionId);
      setInterview(prev => ({
        ...prev,
        questions: prev.questions.map(q => q.questionId === questionId ? { ...q, isBookmarked: data.isBookmarked } : q),
      }));
    } catch {
      toast.error('Failed to bookmark');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!interview) return null;

  const typeColors = {
    technical: 'bg-blue-500/20 text-blue-500',
    behavioral: 'bg-purple-500/20 text-purple-500',
    situational: 'bg-orange-500/20 text-orange-500',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/history" className="text-sm text-gray-500 hover:text-primary-500 flex items-center gap-1">
          <FiArrowLeft /> Back to History
        </Link>
        <button onClick={handleDownload} disabled={downloading} className="btn-primary flex items-center gap-2 text-sm">
          <FiDownload /> {downloading ? 'Generating...' : 'Download PDF Report'}
        </button>
      </div>

      {/* Score Overview */}
      <Card className="text-center space-y-4">
        <h1 className="text-xl font-bold">{interview.role} Interview Results</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {interview.experienceLevel} • {interview.difficulty} • {interview.questions.length} questions
        </p>
        <div className="flex justify-center">
          <ScoreCircle score={interview.overallScore} size={120} label="Overall Score" />
        </div>
      </Card>

      {/* Strengths, Weaknesses, Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card delay={0.1}>
          <div className="flex items-center gap-2 mb-3 text-green-500">
            <FiTrendingUp /> <h3 className="font-semibold">Strengths</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {interview.strengthAnalysis?.map((s, i) => <li key={i}>• {s}</li>)}
          </ul>
        </Card>

        <Card delay={0.2}>
          <div className="flex items-center gap-2 mb-3 text-red-500">
            <FiTrendingDown /> <h3 className="font-semibold">Weaknesses</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {interview.weaknessAnalysis?.map((w, i) => <li key={i}>• {w}</li>)}
          </ul>
        </Card>

        <Card delay={0.3}>
          <div className="flex items-center gap-2 mb-3 text-blue-500">
            <FiTarget /> <h3 className="font-semibold">Recommendations</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            {interview.recommendations?.map((r, i) => <li key={i}>• {r}</li>)}
          </ul>
        </Card>
      </div>

      {/* Question Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Question Breakdown</h2>
        {interview.questions.map((q, i) => (
          <Card key={q.questionId} delay={i * 0.05}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeColors[q.type]}`}>
                  {q.type.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500">{q.difficulty}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleBookmark(q.questionId)}
                  className={q.isBookmarked ? 'text-yellow-500' : 'text-gray-400'}
                >
                  <FiBookmark fill={q.isBookmarked ? 'currentColor' : 'none'} />
                </button>
                <ScoreCircle score={q.evaluation?.overallScore || 0} size={44} />
              </div>
            </div>

            <h3 className="font-semibold mb-2">Q{i + 1}. {q.questionText}</h3>

            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Your Answer:</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 bg-white/30 dark:bg-white/5 p-3 rounded-lg">
                {q.userAnswer || 'No answer provided'}
              </p>
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="bg-white/30 dark:bg-white/5 rounded-lg p-2">
                <p className="text-xs text-gray-500">Technical</p>
                <p className="font-bold">{q.evaluation?.technicalAccuracy ?? '-'}/10</p>
              </div>
              <div className="bg-white/30 dark:bg-white/5 rounded-lg p-2">
                <p className="text-xs text-gray-500">Communication</p>
                <p className="font-bold">{q.evaluation?.communicationScore ?? '-'}/10</p>
              </div>
              <div className="bg-white/30 dark:bg-white/5 rounded-lg p-2">
                <p className="text-xs text-gray-500">Confidence</p>
                <p className="font-bold">{q.evaluation?.confidenceScore ?? '-'}/10</p>
              </div>
            </div>

            {q.evaluation?.suggestions && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-500 mb-1">Suggestions:</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{q.evaluation.suggestions}</p>
              </div>
            )}

            {q.evaluation?.sampleAnswer && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Sample Answer:</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 bg-primary-500/5 p-3 rounded-lg">
                  {q.evaluation.sampleAnswer}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InterviewResults;