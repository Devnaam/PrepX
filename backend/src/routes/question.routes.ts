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

// ⚠️ IMPORTANT: Specific routes MUST come BEFORE parameterized routes!

// Protected routes (specific paths first)
router.get('/feed', protect, getQuestionFeed);  // ✅ /feed comes first
router.get('/my/questions', protect, getMyQuestions);  // ✅ Specific path
router.post('/', protect, createQuestion);

// Parameterized routes (these should be at the bottom)
router.get('/:questionId', getQuestionById);  // ✅ Now this won't catch /feed
router.post('/:questionId/attempt', protect, submitAnswer);
router.put('/:questionId', protect, updateQuestion);
router.delete('/:questionId', protect, deleteQuestion);

// Admin only routes
router.post('/:questionId/approve', protect, adminOnly, approveQuestion);
router.post('/:questionId/reject', protect, adminOnly, rejectQuestion);

export default router;
