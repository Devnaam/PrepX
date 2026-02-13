import { Response } from 'express';
import Follow from '../models/Follow.model';
import User from '../models/User.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';

// @desc    Follow a user
// @route   POST /api/v1/follow/:userId
// @access  Private
export const followUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const currentUserId = req.user?._id;
    const { userId } = req.params;

    if (currentUserId?.toString() === userId) {
      throw new ApiError(400, 'Cannot follow yourself');
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw new ApiError(404, 'User not found');
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: userId,
    });

    if (existingFollow) {
      throw new ApiError(400, 'Already following this user');
    }

    // Determine status based on privacy
    const status = targetUser.privacy.followApprovalRequired
      ? 'PENDING'
      : 'ACCEPTED';

    await Follow.create({
      follower: currentUserId,
      following: userId,
      status,
    });

    // Update counts if accepted
    if (status === 'ACCEPTED') {
      await User.findByIdAndUpdate(currentUserId, {
        $inc: { followingCount: 1 },
      });
      await User.findByIdAndUpdate(userId, {
        $inc: { followersCount: 1 },
      });
    }

    res.status(200).json(
      new ApiResponse(
        200,
        { status },
        status === 'ACCEPTED' ? 'Following user' : 'Follow request sent'
      )
    );
  }
);

// @desc    Unfollow a user
// @route   DELETE /api/v1/follow/:userId
// @access  Private
export const unfollowUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const currentUserId = req.user?._id;
    const { userId } = req.params;

    const follow = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: userId,
    });

    if (!follow) {
      throw new ApiError(404, 'Not following this user');
    }

    // Update counts if was accepted
    if (follow.status === 'ACCEPTED') {
      await User.findByIdAndUpdate(currentUserId, {
        $inc: { followingCount: -1 },
      });
      await User.findByIdAndUpdate(userId, {
        $inc: { followersCount: -1 },
      });
    }

    res.status(200).json(
      new ApiResponse(200, {}, 'Unfollowed successfully')
    );
  }
);

// @desc    Get followers of a user
// @route   GET /api/v1/follow/followers/:userId
// @access  Public
export const getFollowers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const followers = await Follow.find({
      following: userId,
      status: 'ACCEPTED',
    })
      .populate('follower', 'username fullName profilePicture bio')
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({
      following: userId,
      status: 'ACCEPTED',
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          followers: followers.map((f) => f.follower),
          total,
          hasMore: Number(skip) + followers.length < total,
        },
        'Followers retrieved successfully'
      )
    );
  }
);

// @desc    Get following of a user
// @route   GET /api/v1/follow/following/:userId
// @access  Public
export const getFollowing = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const following = await Follow.find({
      follower: userId,
      status: 'ACCEPTED',
    })
      .populate('following', 'username fullName profilePicture bio')
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ createdAt: -1 });

    const total = await Follow.countDocuments({
      follower: userId,
      status: 'ACCEPTED',
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          following: following.map((f) => f.following),
          total,
          hasMore: Number(skip) + following.length < total,
        },
        'Following retrieved successfully'
      )
    );
  }
);
