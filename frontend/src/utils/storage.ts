import { STORAGE_KEYS } from '@/constants';
import { User } from '@/types';

export const storage = {
  // Auth Token
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  removeToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // User Data
  getUser: (): User | null => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData || userData === 'undefined') {
      return null;
    }
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  setUser: (user: User): void => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },

  // Clear all
  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },
};
