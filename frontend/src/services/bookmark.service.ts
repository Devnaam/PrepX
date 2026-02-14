import api from './api';

export const bookmarkService = {
  // Toggle bookmark
  toggleBookmark: async (questionId: string) => {
    const response: any = await api.post(`/bookmarks/${questionId}`);
    return response.data;
  },

  // Get bookmarks
  getBookmarks: async (filters?: {
    limit?: number;
    skip?: number;
    subject?: string;
    difficulty?: string;
  }) => {
    const response: any = await api.get('/bookmarks', { params: filters });
    return response.data;
  },

  // Check bookmarks
  checkBookmarks: async (questionIds: string[]) => {
    const response: any = await api.post('/bookmarks/check', { questionIds });
    return response.data;
  },

  // Get bookmark stats
  getBookmarkStats: async () => {
    const response: any = await api.get('/bookmarks/stats');
    return response.data;
  },

  // Clear all bookmarks
  clearAllBookmarks: async () => {
    const response: any = await api.delete('/bookmarks/clear');
    return response.data;
  },
};
