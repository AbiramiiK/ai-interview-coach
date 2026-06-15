import { FiMenu, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 glass-card rounded-none border-x-0 border-t-0 px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-white/10 rounded-lg">
          <FiMenu size={20} />
        </button>
        <h2 className="font-semibold text-lg hidden sm:block">
          Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
          aria-label="Logout"
        >
          <FiLogOut size={18} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;