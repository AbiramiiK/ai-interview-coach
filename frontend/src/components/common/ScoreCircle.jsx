import { motion } from 'framer-motion';

/**
 * Animated circular score indicator (out of 10)
 */
const ScoreCircle = ({ score = 0, size = 80, label }) => {
  const max = 10;
  const percentage = (score / max) * 100;
  const radius = size / 2 - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (score >= 7) return '#22c55e';
    if (score >= 4) return '#eab308';
    return '#ef4444';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke="currentColor" strokeWidth="6" fill="none"
            className="text-gray-200 dark:text-white/10"
          />
          <motion.circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={getColor()} strokeWidth="6" fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{score.toFixed ? score.toFixed(1) : score}</span>
        </div>
      </div>
      {label && <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>}
    </div>
  );
};

export default ScoreCircle;