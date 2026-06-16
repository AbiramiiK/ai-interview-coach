import api from './api';

export const interviewService = {
  create: (payload) => api.post('/interviews', payload),
  getById: (id) => api.get(`/interviews/${id}`),
  saveAnswer: (id, payload) => api.put(`/interviews/${id}/answer`, payload),
  toggleBookmark: (id, questionId) => api.put(`/interviews/${id}/bookmark`, { questionId }),
  generateFollowUp: (id, questionId) => api.post(`/interviews/${id}/followup`, { questionId }),
  saveFollowUpAnswer: (id, questionId, followUpAnswer) =>
    api.put(`/interviews/${id}/followup-answer`, { questionId, followUpAnswer }),
  submit: (id) => api.post(`/interviews/${id}/submit`),
  getHistory: (status) => api.get('/interviews', { params: status ? { status } : {} }),
  getBookmarks: () => api.get('/interviews/bookmarks'),
  delete: (id) => api.delete(`/interviews/${id}`),
};