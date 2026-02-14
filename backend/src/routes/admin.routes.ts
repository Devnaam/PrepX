import express from 'express';
import {
  // Dashboard
  getDashboardOverview,
  // Question Management
  getAllQuestions,
  approveQuestion,
  deleteQuestion,
  bulkApproveQuestions,
  getQuestionAnalytics,
  // User Management
  getAllUsers,
  getUserDetails,
  banUser,
  unbanUser,
  // Analytics
  getUserAnalytics,
  getEngagementAnalytics,
  // Content Moderation
  getAllPosts,
  toggleHidePost,
  deletePost,
} from '../controllers/admin.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// ==================== DASHBOARD ====================
router.get('/dashboard', getDashboardOverview);

// ==================== QUESTION MANAGEMENT ====================
router.get('/questions', getAllQuestions);
router.get('/questions/analytics', getQuestionAnalytics);
router.patch('/questions/:id/approve', approveQuestion);
router.delete('/questions/:id', deleteQuestion);
router.post('/questions/bulk-approve', bulkApproveQuestions);

// ==================== USER MANAGEMENT ====================
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);

// ==================== ANALYTICS ====================
router.get('/analytics/users', getUserAnalytics);
router.get('/analytics/engagement', getEngagementAnalytics);

// ==================== CONTENT MODERATION ====================
router.get('/posts', getAllPosts);
router.patch('/posts/:id/hide', toggleHidePost);
router.delete('/posts/:id', deletePost);

export default router;
