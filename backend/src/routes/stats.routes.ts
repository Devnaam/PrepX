import express from 'express';
import {
  getTodayStats,
  getWeekStats,
  getMonthStats,
  getActivityGraph,
  getAllTimeStats,
} from '../controllers/stats.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/today', getTodayStats);
router.get('/week', getWeekStats);
router.get('/month', getMonthStats);
router.get('/activity-graph', getActivityGraph);
router.get('/all-time', getAllTimeStats);

export default router;
