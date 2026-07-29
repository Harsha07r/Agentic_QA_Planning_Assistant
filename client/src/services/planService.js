import api from './api';

export const planService = {
  getDashboardStats: () => api.get('/plans/dashboard/stats'),

  getPlans: (params = {}) => api.get('/plans', { params }),

  getPlanById: (id) => api.get(`/plans/${id}`),

  createPlan: (data) => api.post('/plans', data),

  updatePlan: (id, data) => api.put(`/plans/${id}`, data),

  deletePlan: (id) => api.delete(`/plans/${id}`),

  getPlanVersions: (planId) => api.get(`/plans/${planId}/versions`),

  getVersionById: (planId, versionId) =>
    api.get(`/plans/${planId}/versions/${versionId}`),

  getAllVersions: (params = {}) => api.get('/plans/versions', { params }),

  restoreVersion: (planId, versionId) =>
    api.post(`/plans/${planId}/versions/${versionId}/restore`),
};

export const healthCheck = () => api.get('/health');
