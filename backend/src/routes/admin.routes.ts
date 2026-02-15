import express from 'express';
import { uploadFile } from '../middleware/upload';
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
  createQuestion,
  updateQuestion,
  getQuestionById,

  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  awardBadgeToUser,

  bulkUploadQuestions,
  downloadTemplate,
} from '../controllers/admin.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// ==================== DASHBOARD ====================
router.get('/dashboard', getDashboardOverview);

// ==================== QUESTION MANAGEMENT ====================
// IMPORTANT: Specific routes MUST come before dynamic :id routes
router.get('/questions/analytics', getQuestionAnalytics);
router.get('/questions/template', downloadTemplate); // ✅ MOVED UP
router.post('/questions/bulk-upload', uploadFile.single('file'), bulkUploadQuestions); // ✅ MOVED UP
router.post('/questions/bulk-approve', bulkApproveQuestions);
router.post('/questions/create', createQuestion);
router.get('/questions', getAllQuestions);
router.get('/questions/:id', getQuestionById); // ✅ Now comes AFTER specific routes
router.patch('/questions/:id/approve', approveQuestion);
router.patch('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

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

// ==================== BADGE MANAGEMENT ====================
router.get('/badges', getAllBadges);
router.post('/badges', createBadge);
router.patch('/badges/:id', updateBadge);
router.delete('/badges/:id', deleteBadge);
router.post('/badges/award', awardBadgeToUser);

export default router;
