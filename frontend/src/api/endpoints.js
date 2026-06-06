import api from './axios';

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
  profile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
};

// ─── Connections ─────────────────────────────────────────
export const connectionsAPI = {
  list: () => api.get('/connections/'),
  create: (data) => api.post('/connections/', data),
  get: (id) => api.get(`/connections/${id}/`),
  update: (id, data) => api.put(`/connections/${id}/`, data),
  delete: (id) => api.delete(`/connections/${id}/`),
  test: (id) => api.post(`/connections/${id}/test/`),
};

// ─── Discovery ───────────────────────────────────────────
export const discoveryAPI = {
  schemas: (connId) => api.get(`/discovery/${connId}/schemas/`),
  tables: (connId, schema) => api.get(`/discovery/${connId}/schemas/${schema}/tables/`),
  columns: (connId, schema, table) =>
    api.get(`/discovery/${connId}/schemas/${schema}/tables/${table}/columns/`),
  preview: (connId, schema, table, data) =>
    api.post(`/discovery/${connId}/schemas/${schema}/tables/${table}/preview/`, data),
};

// ─── Transfers ───────────────────────────────────────────
export const transfersAPI = {
  list: () => api.get('/transfers/'),
  create: (data) => api.post('/transfers/', data),
  get: (id) => api.get(`/transfers/${id}/`),
  delete: (id) => api.delete(`/transfers/${id}/`),
  execute: (id) => api.post(`/transfers/${id}/execute/`),
  logs: (id) => api.get(`/transfers/${id}/logs/`),
};

// ─── Monitoring ──────────────────────────────────────────
export const monitoringAPI = {
  dashboard: () => api.get('/monitoring/dashboard/'),
  connectionsStatus: () => api.get('/monitoring/connections/status/'),
  transferHistory: () => api.get('/monitoring/transfers/history/'),
  activity: () => api.get('/monitoring/activity/'),
};