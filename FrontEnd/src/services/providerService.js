import api from '../utils/api';

export const providerService = {
  getPatients: (providerId) => api.get(`/providers/${providerId}/patients`),
  getPatientCompliance: (providerId, patientId) => 
    api.get(`/providers/${providerId}/patients/${patientId}/compliance`),
  createAdvisory: (data) => api.post('/advisories', data),
  getPatientAdvisories: (patientId) => api.get(`/advisories/${patientId}`),
};

