import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/CustomButton';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8">
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
          <FiZap className="text-white text-2xl" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-center mb-1">Welcome Back</h1>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Sign in to continue your prep</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email" required placeholder="Email address"
            className="glass-input pl-11"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="password" required placeholder="Password"
            className="glass-input pl-11"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <Button type="submit" isLoading={loading} className="w-full">
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary-500 font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;