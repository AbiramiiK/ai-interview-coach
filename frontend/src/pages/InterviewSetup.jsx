import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCode, FiServer, FiLayers, FiDatabase, FiCpu, FiFeather, FiGitBranch, FiFigma } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { interviewService } from '../services/interviewService';
import Button from '../components/common/button';

const roles = [
  { name: 'Frontend Developer', icon: FiCode },
  { name: 'Backend Developer', icon: FiServer },
  { name: 'Full Stack Developer', icon: FiLayers },
  { name: 'Data Analyst', icon: FiDatabase },
  { name: 'Data Scientist', icon: FiCpu },
  { name: 'Java Developer', icon: FiFeather },
  { name: 'Python Developer', icon: FiGitBranch },
  { name: 'UI/UX Designer', icon: FiFigma },
];

const experienceLevels = ['Fresher', '1-3 years', '3-5 years'];
const difficulties = [
  { name: 'Easy', color: 'from-green-500 to-emerald-400' },
  { name: 'Medium', color: 'from-yellow-500 to-orange-400' },
  { name: 'Hard', color: 'from-red-500 to-pink-500' },
];
const questionCounts = [5, 10, 15, 20];

const InterviewSetup = () => {
  const [form, setForm] = useState({
    role: '', experienceLevel: '', difficulty: '', numberOfQuestions: 10,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isComplete = form.role && form.experienceLevel && form.difficulty;

  const handleStart = async () => {
    if (!isComplete) {
      toast.error('Please complete all selections');
      return;
    }
    setLoading(true);
    try {
      const { data } = await interviewService.create(form);
      toast.success('Interview questions generated!');
      navigate(`/interview/${data.interview._id}/session`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Setup Your Interview</h1>
        <p className="text-gray-500 dark:text-gray-400">Customize your mock interview session</p>
      </div>

      {/* Role Selection */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h2 className="font-semibold mb-4">1. Select Role</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {roles.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => setForm({ ...form, role: name })}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                form.role === name
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-transparent bg-white/40 dark:bg-white/5 hover:border-primary-500/30'
              }`}
            >
              <Icon className={`text-xl ${form.role === name ? 'text-primary-500' : 'text-gray-400'}`} />
              <span className="text-xs font-medium">{name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Experience Level */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h2 className="font-semibold mb-4">2. Experience Level</h2>
        <div className="grid grid-cols-3 gap-3">
          {experienceLevels.map((level) => (
            <button
              key={level}
              onClick={() => setForm({ ...form, experienceLevel: level })}
              className={`p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                form.experienceLevel === level
                  ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                  : 'border-transparent bg-white/40 dark:bg-white/5 hover:border-primary-500/30'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Difficulty */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <h2 className="font-semibold mb-4">3. Difficulty Level</h2>
        <div className="grid grid-cols-3 gap-3">
          {difficulties.map(({ name, color }) => (
            <button
              key={name}
              onClick={() => setForm({ ...form, difficulty: name })}
              className={`p-4 rounded-xl border-2 transition-all font-medium text-sm relative overflow-hidden ${
                form.difficulty === name
                  ? 'border-primary-500'
                  : 'border-transparent bg-white/40 dark:bg-white/5 hover:border-primary-500/30'
              }`}
            >
              {form.difficulty === name && (
                <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-20`} />
              )}
              <span className="relative z-10">{name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Number of Questions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
        <h2 className="font-semibold mb-4">4. Number of Questions</h2>
        <div className="grid grid-cols-4 gap-3">
          {questionCounts.map((count) => (
            <button
              key={count}
              onClick={() => setForm({ ...form, numberOfQuestions: count })}
              className={`p-4 rounded-xl border-2 transition-all font-bold ${
                form.numberOfQuestions === count
                  ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                  : 'border-transparent bg-white/40 dark:bg-white/5 hover:border-primary-500/30'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </motion.div>

      <Button onClick={handleStart} isLoading={loading} className="w-full md:w-auto md:px-12">
        {loading ? 'Generating Questions...' : 'Start Interview'}
      </Button>
    </div>
  );
};

export default InterviewSetup;