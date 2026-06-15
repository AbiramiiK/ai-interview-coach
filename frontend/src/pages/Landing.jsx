import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiZap, FiTarget, FiTrendingUp, FiFileText, FiMic, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: FiTarget, title: 'Role-Specific Questions', desc: 'AI-generated questions tailored to your role, experience, and difficulty level.' },
  { icon: FiMic, title: 'Voice Answers', desc: 'Speak your answers naturally with built-in speech-to-text support.' },
  { icon: FiTrendingUp, title: 'Detailed Analytics', desc: 'Track your progress with performance charts and strength/weakness analysis.' },
  { icon: FiFileText, title: 'PDF Reports', desc: 'Download comprehensive interview reports with AI feedback and scores.' },
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen gradient-bg overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
            <FiZap className="text-white text-xl" />
          </div>
          <span className="font-bold text-xl">MockAI</span>
        </div>
        <Link to={user ? '/dashboard' : '/login'} className="btn-secondary text-sm">
          {user ? 'Dashboard' : 'Sign In'}
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 pt-12 md:pt-24 pb-20 text-center max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
        >
          Ace Your Next Interview with{' '}
          <span className="bg-gradient-to-r from-primary-500 to-accent-400 bg-clip-text text-transparent">
            AI-Powered
          </span>{' '}
          Practice
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
        >
          Practice technical, behavioral, and situational questions tailored to your role.
          Get instant AI feedback, scores, and personalized improvement plans.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <Link to={user ? '/interview/setup' : '/signup'} className="btn-primary inline-flex items-center gap-2">
            Get Started <FiArrowRight />
          </Link>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass-card p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600/20 to-accent-500/20 flex items-center justify-center mx-auto mb-4">
                <f.icon className="text-primary-500 text-xl" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;