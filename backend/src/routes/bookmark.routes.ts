import express from 'express';
import {
  toggleBookmark,
  getBookmarks,
  checkBookmarks,
  getBookmarkStats,
  clearAllBookmarks,
} from '../controllers/bookmark.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getBookmarks);
router.get('/stats', getBookmarkStats);
router.post('/check', checkBookmarks);
router.post('/:questionId', toggleBookmark);
router.delete('/clear', clearAllBookmarks);

export default router;
