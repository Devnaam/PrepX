import api from './api';

export const followService = {
  // Follow user
  followUser: async (userId: string) => {
    const response: any = await api.post(`/follow/${userId}`);
    return response.data;
  },

  // Unfollow user
  unfollowUser: async (userId: string) => {
    const response: any = await api.delete(`/follow/${userId}`);
    return response.data;
  },

  // Get followers
  getFollowers: async (userId: string, limit = 20, skip = 0) => {
    const response: any = await api.get(`/follow/followers/${userId}`, {
      params: { limit, skip },
    });
    return response.data;
  },

  // Get following
  getFollowing: async (userId: string, limit = 20, skip = 0) => {
    const response: any = await api.get(`/follow/following/${userId}`, {
      params: { limit, skip },
    });
    return response.data;
  },
};
