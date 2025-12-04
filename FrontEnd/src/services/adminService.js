import api from '../utils/api';

export const adminService = {
  getAllProviders: () => api.get('/admin/providers'),
  getAllPatients: () => api.get('/admin/patients'),
  getStats: () => api.get('/admin/stats'),
};

