import { useState } from 'react';
import { FiUser, FiMail, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.preferences?.targetRole || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userService.updateProfile({
        name,
        preferences: { ...user.preferences, targetRole },
      });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white font-bold text-2xl">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold text-lg">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="glass-input pl-11"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" value={user?.email} disabled className="glass-input pl-11 opacity-60" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Target Role</label>
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="glass-input">
              <option value="">Select a target role</option>
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>Full Stack Developer</option>
              <option>Data Analyst</option>
              <option>Data Scientist</option>
              <option>Java Developer</option>
              <option>Python Developer</option>
              <option>UI/UX Designer</option>
            </select>
          </div>

          <Button type="submit" isLoading={loading} className="flex items-center gap-2">
            <FiSave /> Save Changes
          </Button>
        </form>
      </Card>

      {/* Stats Summary */}
      <Card delay={0.1}>
        <h2 className="font-semibold mb-4">Your Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/30 dark:bg-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{user?.stats?.totalInterviews || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Total Interviews</p>
          </div>
          <div className="bg-white/30 dark:bg-white/5 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{user?.stats?.averageScore || 0}/10</p>
            <p className="text-xs text-gray-500 mt-1">Average Score</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;