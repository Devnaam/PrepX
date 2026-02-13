import api from './api';
import { TodayStats, WeekStats, ActivityData } from '@/types';

export const statsService = {
  // Get today's stats
  getTodayStats: async () => {
    return api.get<any, TodayStats>('/stats/today');
  },

  // Get weekly stats
  getWeekStats: async () => {
    return api.get<any, WeekStats>('/stats/week');
  },

  // Get monthly stats
  getMonthStats: async (month?: string) => {
    return api.get('/stats/month', {
      params: month ? { month } : {},
    });
  },

  // Get activity graph data
  getActivityGraph: async (months = 6) => {
    return api.get<any, { activities: ActivityData[] }>(
      '/stats/activity-graph',
      {
        params: { months },
      }
    );
  },

  // Get all-time stats
  getAllTimeStats: async () => {
    return api.get('/stats/all-time');
  },
};
