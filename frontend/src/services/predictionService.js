import api from './api';

export const predictionService = {
  async predict(transactionData) {
    const response = await api.post('/predictions/predict', transactionData);
    return response.data;
  },

  async predictBatch(formData, onProgress) {
    const response = await api.post('/predictions/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    return response.data;
  },

  async getHistory(limit = 50) {
    const response = await api.get(`/predictions/history?limit=${limit}`);
    return response.data;
  },

  async getPredictionById(id) {
    const response = await api.get(`/predictions/${id}`);
    return response.data;
  }
};
