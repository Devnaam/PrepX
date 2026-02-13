import api from './api';
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/types';

export const authService = {
  // Register new user
  register: async (data: RegisterData) => {
    return api.post<any, AuthResponse>('/auth/register', data);
  },

  // Login user
  login: async (credentials: LoginCredentials) => {
    return api.post<any, AuthResponse>('/auth/login', credentials);
  },

  // Get current user
  getCurrentUser: async () => {
    return api.get<any, { user: User }>('/auth/me');
  },

  // Logout user
  logout: async () => {
    return api.post('/auth/logout');
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string) => {
    return api.put('/auth/update-password', {
      currentPassword,
      newPassword,
    });
  },
};
