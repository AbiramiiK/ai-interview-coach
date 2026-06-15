import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiBookmark } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { interviewService } from '../services/interviewService';
import { SkeletonCard } from '../components/common/Skeleton';
import Card from '../components/common/Card';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const { data } = await interviewService.getBookmarks();
        setBookmarks(data.bookmarks);
      } catch {
        toast.error('Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const handleRemove = async (interviewId, questionId) => {
    try {
      await interviewService.toggleBookmark(interviewId, questionId);
      setBookmarks(prev => prev.filter(b => !(b.interviewId === interviewId && b.questionId === questionId)));
      toast.success('Removed from bookmarks');
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

  const typeColors = {
    technical: 'bg-blue-500/20 text-blue-500',
    behavioral: 'bg-purple-500/20 text-purple-500',
    situational: 'bg-orange-500/20 text-orange-500',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Bookmarked Questions</h1>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="glass-card p-10 text-center text-gray-500 dark:text-gray-400">
          <FiBookmark className="mx-auto text-3xl mb-3" />
          <p>No bookmarked questions yet. Bookmark difficult questions during interviews to review them later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((b, i) => (
            <Card key={`${b.interviewId}-${b.questionId}`} delay={i * 0.05}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeColors[b.type]}`}>
                    {b.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">{b.difficulty} • {b.role}</span>
                </div>
                <button onClick={() => handleRemove(b.interviewId, b.questionId)} className="text-yellow-500">
                  <FiBookmark fill="currentColor" />
                </button>
              </div>
              <h3 className="font-semibold mb-2">{b.questionText}</h3>
              {b.userAnswer && (
                <p className="text-sm text-gray-600 dark:text-gray-300 bg-white/30 dark:bg-white/5 p-3 rounded-lg mb-2">
                  {b.userAnswer}
                </p>
              )}
              {b.evaluation?.sampleAnswer && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Sample Answer:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 bg-primary-500/5 p-3 rounded-lg">
                    {b.evaluation.sampleAnswer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;