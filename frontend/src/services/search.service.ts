import api from './api';

export const searchService = {
  // Search users
  searchUsers: async (query: string, limit = 20, skip = 0) => {
    const response: any = await api.get('/search/users', {
      params: { q: query, limit, skip },
    });
    return response.data;
  },

  // Search questions
  searchQuestions: async (
    query: string,
    filters?: { subject?: string; difficulty?: string },
    limit = 20,
    skip = 0
  ) => {
    const response: any = await api.get('/search/questions', {
      params: { q: query, ...filters, limit, skip },
    });
    return response.data;
  },

  // Get trending topics
  getTrendingTopics: async (limit = 10) => {
    const response: any = await api.get('/search/trending-topics', {
      params: { limit },
    });
    return response.data;
  },

  // Get subjects
  getSubjects: async () => {
    const response: any = await api.get('/search/subjects');
    return response.data;
  },

  // Get topics by subject
  getTopicsBySubject: async (subject: string) => {
    const response: any = await api.get(`/search/topics/${subject}`);
    return response.data;
  },

  // Get suggested users
  getSuggestedUsers: async (limit = 10) => {
    const response: any = await api.get('/search/suggested-users', {
      params: { limit },
    });
    return response.data;
  },
};
