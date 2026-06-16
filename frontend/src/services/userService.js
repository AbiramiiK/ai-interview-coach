import api from './api';

export const userService = {
  updateProfile: (payload) => api.put('/users/profile', payload),
  getAnalytics: () => api.get('/users/analytics'),
};