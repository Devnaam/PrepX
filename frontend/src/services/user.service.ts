import api from './api';
import { User } from '@/types';

export const userService = {
  // Get user by username
  getUserByUsername: async (username: string) => {
    return api.get<any, { user: User }>(`/users/${username}`);
  },

  // Update profile
  updateProfile: async (data: Partial<User>) => {
    return api.patch<any, { user: User }>('/users/me', data);
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return api.post('/users/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete profile picture
  deleteProfilePicture: async () => {
    return api.delete('/users/profile-picture');
  },

  // Update privacy settings
  updatePrivacySettings: async (settings: Partial<User['privacy']>) => {
    return api.patch('/users/privacy-settings', settings);
  },

  // Search users
  searchUsers: async (query: string, limit = 20, skip = 0) => {
    return api.get('/users/search', {
      params: { q: query, limit, skip },
    });
  },
};
