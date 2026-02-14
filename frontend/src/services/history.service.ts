import api from './api';

export interface HistoryFilters {
  limit?: number;
  skip?: number;
  result?: 'correct' | 'incorrect' | 'all';
  subject?: string;
  difficulty?: string;
  sortBy?: 'recent' | 'oldest';
}

export const historyService = {
  // Get history
  getHistory: async (filters?: HistoryFilters) => {
    const response: any = await api.get('/history', { params: filters });
    return response.data;
  },

  // Get history stats
  getHistoryStats: async () => {
    const response: any = await api.get('/history/stats');
    return response.data;
  },

  // Get attempt details
  getAttemptDetails: async (attemptId: string) => {
    const response: any = await api.get(`/history/${attemptId}`);
    return response.data;
  },

  // Clear history
  clearHistory: async (result?: 'correct' | 'incorrect' | 'all') => {
    const response: any = await api.delete('/history', {
      params: { result },
    });
    return response.data;
  },
};
