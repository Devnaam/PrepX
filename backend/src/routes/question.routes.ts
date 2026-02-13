import express from 'express';
import {
  getQuestionFeed,
  submitAnswer,
  createQuestion,
  getQuestionById,
} from '../controllers/question.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// Protected routes
router.get('/feed', protect, getQuestionFeed);
router.post('/:questionId/attempt', protect, submitAnswer);
router.post('/', protect, createQuestion);
router.get('/:questionId', getQuestionById);

export default router;
