import express from 'express';
import {
  searchUsers,
  searchQuestions,
  getTrendingTopics,
  getSubjects,
  getTopicsBySubject,
  getSuggestedUsers,
} from '../controllers/search.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/users', searchUsers);
router.get('/questions', searchQuestions);
router.get('/trending-topics', getTrendingTopics);
router.get('/subjects', getSubjects);
router.get('/topics/:subject', getTopicsBySubject);

// Protected routes
router.get('/suggested-users', protect, getSuggestedUsers);

export default router;
