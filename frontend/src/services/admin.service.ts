import api from './api';

export const adminService = {
  // ==================== DASHBOARD ====================
  getDashboard: async () => {
    const response: any = await api.get('/admin/dashboard');
    return response.data;
  },

  // ==================== QUESTION MANAGEMENT ====================
  getAllQuestions: async (params: {
    limit?: number;
    skip?: number;
    status?: string;
    subject?: string;
    difficulty?: string;
    search?: string;
  }) => {
    const response: any = await api.get('/admin/questions', { params });
    return response.data;
  },

  approveQuestion: async (questionId: string) => {
    const response: any = await api.patch(
      `/admin/questions/${questionId}/approve`
    );
    return response.data;
  },

  deleteQuestion: async (questionId: string) => {
    const response: any = await api.delete(`/admin/questions/${questionId}`);
    return response.data;
  },

  bulkApproveQuestions: async (questionIds: string[]) => {
    const response: any = await api.post('/admin/questions/bulk-approve', {
      questionIds,
    });
    return response.data;
  },

  getQuestionAnalytics: async () => {
    const response: any = await api.get('/admin/questions/analytics');
    return response.data;
  },

  // ==================== USER MANAGEMENT ====================
  getAllUsers: async (params: {
    limit?: number;
    skip?: number;
    search?: string;
    status?: string;
  }) => {
    const response: any = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserDetails: async (userId: string) => {
    const response: any = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  banUser: async (userId: string, reason?: string) => {
    const response: any = await api.patch(`/admin/users/${userId}/ban`, {
      reason,
    });
    return response.data;
  },

  unbanUser: async (userId: string) => {
    const response: any = await api.patch(`/admin/users/${userId}/unban`);
    return response.data;
  },

  // ==================== ANALYTICS ====================
  getUserAnalytics: async (days: number = 30) => {
    const response: any = await api.get('/admin/analytics/users', {
      params: { days },
    });
    return response.data;
  },

  getEngagementAnalytics: async (days: number = 7) => {
    const response: any = await api.get('/admin/analytics/engagement', {
      params: { days },
    });
    return response.data;
  },

  // ==================== CONTENT MODERATION ====================
  getAllPosts: async (params: {
    limit?: number;
    skip?: number;
    status?: string;
  }) => {
    const response: any = await api.get('/admin/posts', { params });
    return response.data;
  },

  toggleHidePost: async (postId: string) => {
    const response: any = await api.patch(`/admin/posts/${postId}/hide`);
    return response.data;
  },

  deletePost: async (postId: string) => {
    const response: any = await api.delete(`/admin/posts/${postId}`);
    return response.data;
  },

  // Add to existing adminService object

createQuestion: async (data: any) => {
  const response: any = await api.post('/admin/questions/create', data);
  return response.data;
},

updateQuestion: async (questionId: string, data: any) => {
  const response: any = await api.patch(`/admin/questions/${questionId}`, data);
  return response.data;
},

getQuestionById: async (questionId: string) => {
  const response: any = await api.get(`/admin/questions/${questionId}`);
  return response.data;
},

// Add to adminService object

// ==================== BADGE MANAGEMENT ====================
getAllBadges: async () => {
  const response: any = await api.get('/admin/badges');
  return response.data;
},

createBadge: async (data: any) => {
  const response: any = await api.post('/admin/badges', data);
  return response.data;
},

updateBadge: async (badgeId: string, data: any) => {
  const response: any = await api.patch(`/admin/badges/${badgeId}`, data);
  return response.data;
},

deleteBadge: async (badgeId: string) => {
  const response: any = await api.delete(`/admin/badges/${badgeId}`);
  return response.data;
},

awardBadge: async (userId: string, badgeId: string) => {
  const response: any = await api.post('/admin/badges/award', { userId, badgeId });
  return response.data;
},

bulkUploadQuestions: async (formData: FormData) => {
  const response: any = await api.post('/admin/questions/bulk-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
},


};
