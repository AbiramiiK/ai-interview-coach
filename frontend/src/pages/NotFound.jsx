import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center gradient-bg p-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card p-10 text-center"
    >
      <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary-500 to-accent-400 bg-clip-text text-transparent">404</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">Page not found</p>
      <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
    </motion.div>
  </div>
);

export default NotFound;