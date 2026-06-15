import { useEffect, useState } from 'react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  RadialLinearScale, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { SkeletonChart, SkeletonStatCard } from '../components/common/Skeleton';
import Card from '../components/common/Card';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  RadialLinearScale, Title, Tooltip, Legend, Filler
);

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await userService.getAnalytics();
        setData(data.data);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#9ca3af' } },
    },
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, max: 10 },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonStatCard key={i} />)}
        </div>
        <SkeletonChart />
        <SkeletonChart />
      </div>
    );
  }

  if (!data || data.totalInterviews === 0) {
    return (
      <div className="glass-card p-10 text-center text-gray-500 dark:text-gray-400">
        <h2 className="text-xl font-semibold mb-2">No Analytics Yet</h2>
        <p>Complete your first interview to see detailed performance insights.</p>
      </div>
    );
  }

  const progressData = {
    labels: data.progressOverTime.map(p => new Date(p.date).toLocaleDateString()),
    datasets: [{
      label: 'Score',
      data: data.progressOverTime.map(p => p.score),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      fill: true,
      tension: 0.4,
    }],
  };

  const typeData = {
    labels: ['Technical', 'Behavioral', 'Situational'],
    datasets: [{
      label: 'Average Score',
      data: [data.avgByType.technical, data.avgByType.behavioral, data.avgByType.situational],
      backgroundColor: ['#6366f1', '#a855f7', '#f97316'],
      borderRadius: 8,
    }],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Performance Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Interviews</p>
          <p className="text-3xl font-bold mt-1">{data.totalInterviews}</p>
        </Card>
        <Card delay={0.1}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
          <p className="text-3xl font-bold mt-1">{data.averageScore}/10</p>
        </Card>
        <Card delay={0.2}>
          <p className="text-sm text-gray-500 dark:text-gray-400">Top Strength</p>
          <p className="text-lg font-semibold mt-1 line-clamp-2">{data.topStrengths[0] || 'N/A'}</p>
        </Card>
      </div>

      {/* Progress over time */}
      <Card delay={0.1}>
        <h2 className="font-semibold mb-4">Progress Over Time</h2>
        <div className="h-72">
          <Line data={progressData} options={chartOptions} />
        </div>
      </Card>

      {/* Score by question type */}
      <Card delay={0.2}>
        <h2 className="font-semibold mb-4">Average Score by Question Type</h2>
        <div className="h-72">
          <Bar data={typeData} options={chartOptions} />
        </div>
      </Card>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card delay={0.3}>
          <h2 className="font-semibold mb-4 text-green-500">Top Strengths</h2>
          <ul className="space-y-2">
            {data.topStrengths.map((s, i) => (
              <li key={i} className="text-sm bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg">
                {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card delay={0.4}>
          <h2 className="font-semibold mb-4 text-red-500">Areas to Improve</h2>
          <ul className="space-y-2">
            {data.topWeaknesses.map((w, i) => (
              <li key={i} className="text-sm bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg">
                {w}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;