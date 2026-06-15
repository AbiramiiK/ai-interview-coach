import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiPlusCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { interviewService } from '../services/interviewService';
import { SkeletonCard } from '../components/common/Skeleton';
import ScoreCircle from '../components/common/ScoreCircle';

const InterviewHistory = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await interviewService.getHistory();
        setInterviews(data.interviews);
      } catch {
        toast.error('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this interview? This cannot be undone.')) return;
    try {
      await interviewService.delete(id);
      setInterviews(prev => prev.filter(i => i._id !== id));
      toast.success('Interview deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = interviews.filter(i => filter === 'all' || i.status === filter);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Interview History</h1>
        <Link to="/interview/setup" className="btn-primary flex items-center gap-2 text-sm">
          <FiPlusCircle /> New Interview
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'completed', 'in-progress'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-primary-500 text-white' : 'glass-card hover:bg-white/10'
            }`}
          >
            {f.replace('-', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-10 text-center text-gray-500 dark:text-gray-400">
          No interviews found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((interview, i) => (
            <motion.div
              key={interview._id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-4 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex items-center gap-4">
                {interview.status === 'completed' ? (
                  <ScoreCircle score={interview.overallScore} size={50} />
                ) : (
                  <div className="w-[50px] h-[50px] rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 text-xs font-semibold">
                    {Math.round((interview.questions.filter(q => q.userAnswer).length / interview.questions.length) * 100)}%
                  </div>
                )}
                <div>
                  <p className="font-semibold">{interview.role}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {interview.experienceLevel} • {interview.difficulty} • {interview.numberOfQuestions} questions
                  </p>
                  <p className="text-xs text-gray-400">{new Date(interview.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={interview.status === 'completed' ? `/interview/${interview._id}/results` : `/interview/${interview._id}/session`}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  {interview.status === 'completed' ? 'View Results' : 'Continue'}
                </Link>
                <button onClick={() => handleDelete(interview._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;