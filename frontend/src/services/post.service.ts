import api from './api';
import { Post, CreatePostData } from '@/types';

export const postService = {
  // Get home feed
  getHomeFeed: async (limit = 20, skip = 0) => {
    const response: any = await api.get('/posts/feed', {
      params: { limit, skip },
    });
    return response.data;
  },

  // Create post
  createPost: async (data: CreatePostData) => {
    const response: any = await api.post('/posts', data);
    return response.data;
  },

  // Toggle like
  toggleLike: async (postId: string) => {
    const response: any = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  // Delete post
  deletePost: async (postId: string) => {
    const response: any = await api.delete(`/posts/${postId}`);
    return response.data;
  },

  // Get user posts
  getUserPosts: async (username: string, limit = 20, skip = 0) => {
    const response: any = await api.get(`/posts/user/${username}`, {
      params: { limit, skip },
    });
    return response.data;
  },
};
