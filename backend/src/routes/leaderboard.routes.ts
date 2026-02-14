import express from 'express';
import {
  getGlobalLeaderboard,
  getWeeklyLeaderboard,
  getSubjectLeaderboard,
  getFriendsLeaderboard,
  getLeaderboardSummary,
} from '../controllers/leaderboard.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/global', getGlobalLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);
router.get('/subject/:subject', getSubjectLeaderboard);
router.get('/summary', getLeaderboardSummary);

// Protected routes
router.get('/friends', protect, getFriendsLeaderboard);

export default router;
