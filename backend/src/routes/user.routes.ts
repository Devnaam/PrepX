import express from 'express';
import {
  getCurrentUser,
  updateProfile,
  changePassword,
  updatePrivacySettings,
  getUserByUsername,
  getUserStats,
  deleteAccount,
} from '../controllers/user.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protected routes (require authentication)
router.get('/me', protect, getCurrentUser);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/privacy', protect, updatePrivacySettings);
router.delete('/account', protect, deleteAccount);

// Public routes
router.get('/:username', getUserByUsername);
router.get('/:userId/stats', getUserStats);

export default router;
