import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updatePassword,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/update-password', protect, updatePassword);

export default router;
