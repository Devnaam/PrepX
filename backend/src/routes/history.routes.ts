import express from 'express';
import {
  getHistory,
  getHistoryStats,
  getAttemptDetails,
  clearHistory,
} from '../controllers/history.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getHistory);
router.get('/stats', getHistoryStats);
router.get('/:attemptId', getAttemptDetails);
router.delete('/', clearHistory);

export default router;
