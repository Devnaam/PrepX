import express from 'express';
import {
  getHomeFeed,
  createPost,
  toggleLike,
  deletePost,
  getUserPosts,
} from '../controllers/post.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/feed', protect, getHomeFeed);
router.post('/', protect, createPost);
router.post('/:postId/like', protect, toggleLike);
router.delete('/:postId', protect, deletePost);
router.get('/user/:username', getUserPosts);

export default router;
