import api from './api';

export const analyticsService = {
  async getOverview() {
    const response = await api.get('/analytics/overview');
    return response.data;
  },

  async getTrends(days = 14) {
    const response = await api.get(`/analytics/trends?days=${days}`);
    return response.data;
  },

  async getRiskDistribution() {
    const response = await api.get('/analytics/risk-distribution');
    return response.data;
  },

  async getCategories() {
    const response = await api.get('/analytics/categories');
    return response.data;
  },

  // Transactions
  async getTransactions(params = {}) {
    const query = new URLSearchParams();
    if (params.skip) query.append('skip', params.skip);
    if (params.limit) query.append('limit', params.limit);
    if (params.risk_level) query.append('risk_level', params.risk_level);
    if (params.prediction) query.append('prediction', params.prediction);
    if (params.search) query.append('search', params.search);

    const response = await api.get(`/transactions?${query.toString()}`);
    return response.data;
  },

  async getTransactionById(id) {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async deleteTransaction(id) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  // Admin APIs
  async getAdminUsers(params = {}) {
    const query = new URLSearchParams();
    if (params.role) query.append('role', params.role);
    if (params.search) query.append('search', params.search);
    const response = await api.get(`/admin/users?${query.toString()}`);
    return response.data;
  },

  async toggleUserStatus(userId, isActive) {
    const response = await api.patch(`/admin/users/${userId}/status`, { is_active: isActive });
    return response.data;
  },

  async changeUserRole(userId, role) {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async getAdminStats() {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  async getModelInfo() {
    const response = await api.get('/admin/model-info');
    return response.data;
  }
};
