import api from './api';

export interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  targetExams?: string[];
  profilePicture?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface PrivacySettings {
  profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';
  showActivity?: boolean;
  followApprovalRequired?: boolean;
}

export const userService = {
  // Get current user
  getCurrentUser: async () => {
    const response: any = await api.get('/users/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileData) => {
    const response: any = await api.put('/users/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData) => {
    const response: any = await api.put('/users/change-password', data);
    return response.data;
  },

  // Update privacy settings
  updatePrivacySettings: async (data: PrivacySettings) => {
    const response: any = await api.put('/users/privacy', data);
    return response.data;
  },

  // Get user by username
  getUserByUsername: async (username: string) => {
    const response: any = await api.get(`/users/${username}`);
    return response.data;
  },

  // Get user stats
  getUserStats: async (userId: string) => {
    const response: any = await api.get(`/users/${userId}/stats`);
    return response.data;
  },

  // Delete account
  deleteAccount: async (password: string) => {
    const response: any = await api.delete('/users/account', {
      data: { password },
    });
    return response.data;
  },
};
