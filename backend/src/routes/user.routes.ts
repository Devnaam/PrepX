import express from 'express';
import {
  getUserByUsername,
  updateProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  updatePrivacySettings,
  searchUsers,
} from '../controllers/user.controller';
import { protect, optionalAuth } from '../middleware/auth';
import upload from '../config/multer';

const router = express.Router();

// Public routes
router.get('/search', searchUsers);
router.get('/:username', optionalAuth, getUserByUsername);

// Protected routes
router.patch('/me', protect, updateProfile);
router.post(
  '/upload-profile-picture',
  protect,
  upload.single('profilePicture'),
  uploadProfilePicture
);
router.delete('/profile-picture', protect, deleteProfilePicture);
router.patch('/privacy-settings', protect, updatePrivacySettings);

export default router;
