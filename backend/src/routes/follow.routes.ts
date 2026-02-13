import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from '../controllers/follow.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/:userId', protect, followUser);
router.delete('/:userId', protect, unfollowUser);
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);

export default router;
