import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlusCircle, FiClock, FiTrendingUp, FiAward, FiArrowRight } from 'react-icons/fi';
import { interviewService } from '../services/interviewService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { SkeletonStatCard, SkeletonCard } from '../components/common/Skeleton';
import ScoreCircle from '../components/common/ScoreCircle';

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, historyRes] = await Promise.all([
          userService.getAnalytics(),
          interviewService.getHistory(),
        ]);
        setAnalytics(analyticsRes.data.data);
        setRecentInterviews(historyRes.data.interviews.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Interviews', value: analytics?.totalInterviews ?? 0, icon: FiClock, color: 'from-blue-500 to-cyan-400' },
    { label: 'Average Score', value: `${analytics?.averageScore ?? 0}/10`, icon: FiAward, color: 'from-purple-500 to-pink-400' },
    { label: 'Best Strength', value: analytics?.topStrengths?.[0] || 'N/A', icon: FiTrendingUp, color: 'from-green-500 to-emerald-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primary-600/10 to-accent-500/10"
      >
        <div>
          <h1 className="text-2xl font-bold mb-1">Ready for your next practice session?</h1>
          <p className="text-gray-500 dark:text-gray-400">Generate AI-powered questions tailored to your target role.</p>
        </div>
        <Link to="/interview/setup" className="btn-primary inline-flex items-center gap-2 whitespace-nowrap">
          <FiPlusCircle /> New Interview
        </Link>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="text-white" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold mt-1 truncate">{stat.value}</p>
            </motion.div>
          ))
        )}
      </div>

      {/* Recent Interviews */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Interviews</h2>
          <Link to="/history" className="text-sm text-primary-500 hover:underline flex items-center gap-1">
            View all <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : recentInterviews.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p className="mb-4">No interviews yet. Start your first practice session!</p>
            <Link to="/interview/setup" className="btn-primary inline-flex items-center gap-2">
              <FiPlusCircle /> Start Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentInterviews.map((interview, i) => (
              <motion.div
                key={interview._id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {interview.status === 'completed' && (
                    <ScoreCircle score={interview.overallScore} size={48} />
                  )}
                  <div>
                    <p className="font-semibold">{interview.role}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {interview.experienceLevel} • {interview.difficulty} • {new Date(interview.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Link
                  to={interview.status === 'completed'
                    ? `/interview/${interview._id}/results`
                    : `/interview/${interview._id}/session`}
                  className="text-sm text-primary-500 hover:underline"
                >
                  {interview.status === 'completed' ? 'View Results' : 'Continue'}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;