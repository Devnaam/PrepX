import api from './api';

export const leaderboardService = {
  // Get global leaderboard
  getGlobalLeaderboard: async (limit = 50, skip = 0) => {
    const response: any = await api.get('/leaderboard/global', {
      params: { limit, skip },
    });
    return response.data;
  },

  // Get weekly leaderboard
  getWeeklyLeaderboard: async (limit = 50) => {
    const response: any = await api.get('/leaderboard/weekly', {
      params: { limit },
    });
    return response.data;
  },

  // Get subject leaderboard
  getSubjectLeaderboard: async (subject: string, limit = 50) => {
    const response: any = await api.get(`/leaderboard/subject/${subject}`, {
      params: { limit },
    });
    return response.data;
  },

  // Get friends leaderboard
  getFriendsLeaderboard: async () => {
    const response: any = await api.get('/leaderboard/friends');
    return response.data;
  },

  // Get leaderboard summary
  getLeaderboardSummary: async () => {
    const response: any = await api.get('/leaderboard/summary');
    return response.data;
  },
};
