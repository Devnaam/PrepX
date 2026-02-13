import express from 'express';
import {
  getQuestionFeed,
  submitAnswer,
  createQuestion,
  getQuestionById,
  getMyQuestions,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  rejectQuestion,
} from '../controllers/question.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/:questionId', getQuestionById);

// Protected routes
router.get('/feed', protect, getQuestionFeed);
router.post('/:questionId/attempt', protect, submitAnswer);
router.post('/', protect, createQuestion);
router.get('/my/questions', protect, getMyQuestions);
router.put('/:questionId', protect, updateQuestion);
router.delete('/:questionId', protect, deleteQuestion);

// Admin only routes
router.post('/:questionId/approve', protect, adminOnly, approveQuestion);
router.post('/:questionId/reject', protect, adminOnly, rejectQuestion);

export default router;
