import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiPlusCircle, FiClock, FiBarChart2, FiBookmark, FiUser, FiX, FiZap,
} from 'react-icons/fi';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/interview/setup', label: 'New Interview', icon: FiPlusCircle },
  { to: '/history', label: 'History', icon: FiClock },
  { to: '/analytics', label: 'Analytics', icon: FiBarChart2 },
  { to: '/bookmarks', label: 'Bookmarks', icon: FiBookmark },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

const Sidebar = ({ isOpen, onClose }) => {
  const content = (
    <div className="h-full flex flex-col glass-card rounded-none lg:rounded-r-2xl border-l-0">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
            <FiZap className="text-white text-xl" />
          </div>
          <span className="font-bold text-lg">MockAI</span>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
          <FiX size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white shadow-lg'
                  : 'hover:bg-white/10 text-gray-600 dark:text-gray-300'
              }`
            }
          >
            <Icon size={18} />
            <span className="font-medium text-sm">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 text-xs text-gray-400 text-center">
        AI Mock Interview Platform © 2026
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-30">
        {content}
      </aside>

      {/* Mobile */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 h-screen w-64 z-50 lg:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;