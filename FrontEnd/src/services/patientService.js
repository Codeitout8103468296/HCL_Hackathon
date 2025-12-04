import api from '../utils/api';

export const patientService = {
  getDashboard: (patientId) => api.get(`/patients/${patientId}/dashboard`),
  getProfile: (patientId) => api.get(`/patients/${patientId}/profile`),
  updateProfile: (patientId, data) => api.put(`/patients/${patientId}/profile`, data),
  getGoals: (patientId) => api.get(`/patients/${patientId}/goals`),
  logGoal: (patientId, data) => api.post(`/patients/${patientId}/goals`, data),
  getWellness: (patientId, range = '7d') => api.get(`/wellness/${patientId}?range=${range}`),
  submitWellness: (data) => api.post('/wellness', data),
  getReminders: (patientId) => api.get(`/reminders/${patientId}`),
  createReminder: (data) => api.post('/reminders', data),
  markReminder: (reminderId) => api.post(`/reminders/${reminderId}/mark`),
  getRecommendations: (patientId) => api.get(`/recommendations/${patientId}`),
  getSymptomHistory: (patientId) => api.get(`/symptoms/history/${patientId}`),
  submitSymptomReport: (data) => api.post('/symptoms/report', data),
  getEmergencyCard: (patientId) => api.get(`/patients/${patientId}/emergency-card`),
  generateEmergencyCard: (patientId, data) => api.post(`/patients/${patientId}/emergency-card`, data),
  getAdvisories: (patientId) => api.get(`/advisories/${patientId}`),
};

