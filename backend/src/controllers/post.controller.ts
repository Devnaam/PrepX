import { Response } from 'express';
import Post from '../models/Post.model';
import Like from '../models/Like.model';
import Follow from '../models/Follow.model';
import User from '../models/User.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';

// @desc    Get home feed (posts from followed users)
// @route   GET /api/v1/posts/feed
// @access  Private
export const getHomeFeed = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { limit = 20, skip = 0 } = req.query;

    // Get users that current user follows
    const following = await Follow.find({
      follower: userId,
      status: 'ACCEPTED',
    }).select('following');

    const followingIds = following.map((f) => f.following);
    
    // Include own posts too
    followingIds.push(new mongoose.Types.ObjectId(userId as string));

    // Get posts from followed users + own posts
    const posts = await Post.find({
      author: { $in: followingIds },
      isActive: true,
    })
      .populate('author', 'username fullName profilePicture')
      .populate('sharedQuestion', 'questionText subject topic difficulty')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    // Check which posts current user has liked
    const postIds = posts.map((p: any) => p._id);
    const userLikes = await Like.find({
      user: userId,
      post: { $in: postIds },
    }).select('post');

    const likedPostIds = new Set(userLikes.map((l) => l.post.toString()));

    // Add isLiked flag to each post
    const postsWithLikeStatus = posts.map((post: any) => ({
      ...post,
      isLiked: likedPostIds.has(post._id.toString()),
    }));

    const total = await Post.countDocuments({
      author: { $in: followingIds },
      isActive: true,
    });

    const hasMore = Number(skip) + posts.length < total;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          posts: postsWithLikeStatus,
          total,
          hasMore,
        },
        'Feed retrieved successfully'
      )
    );
  }
);

// @desc    Create a new post
// @route   POST /api/v1/posts
// @access  Private
export const createPost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { content, postType, sharedQuestion, achievement } = req.body;

    if (!content || !postType) {
      throw new ApiError(400, 'Content and post type are required');
    }

    const post = await Post.create({
      author: userId,
      content,
      postType,
      sharedQuestion,
      achievement,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username fullName profilePicture')
      .populate('sharedQuestion', 'questionText subject topic difficulty');

    // Update user's posts count
    await User.findByIdAndUpdate(userId, {
      $inc: { postsCount: 1 },
    });

    res.status(201).json(
      new ApiResponse(201, { post: populatedPost }, 'Post created successfully')
    );
  }
);

// @desc    Like/Unlike a post
// @route   POST /api/v1/posts/:postId/like
// @access  Private
export const toggleLike = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // Check if already liked
    const existingLike = await Like.findOne({ user: userId, post: postId });

    if (existingLike) {
      // Unlike
      await existingLike.deleteOne();
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();

      res.status(200).json(
        new ApiResponse(
          200,
          { isLiked: false, likesCount: post.likesCount },
          'Post unliked'
        )
      );
    } else {
      // Like
      await Like.create({ user: userId, post: postId });
      post.likesCount += 1;
      await post.save();

      res.status(200).json(
        new ApiResponse(
          200,
          { isLiked: true, likesCount: post.likesCount },
          'Post liked'
        )
      );
    }
  }
);

// @desc    Delete a post
// @route   DELETE /api/v1/posts/:postId
// @access  Private
export const deletePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // Check if user is the author
    if (post.author.toString() !== userId?.toString()) {
      throw new ApiError(403, 'Not authorized to delete this post');
    }

    post.isActive = false;
    await post.save();

    // Update user's posts count
    await User.findByIdAndUpdate(userId, {
      $inc: { postsCount: -1 },
    });

    res.status(200).json(
      new ApiResponse(200, {}, 'Post deleted successfully')
    );
  }
);

// @desc    Get posts by user
// @route   GET /api/v1/posts/user/:username
// @access  Public
export const getUserPosts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { username } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const posts = await Post.find({
      author: user._id,
      isActive: true,
    })
      .populate('author', 'username fullName profilePicture')
      .populate('sharedQuestion', 'questionText subject topic difficulty')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const total = await Post.countDocuments({
      author: user._id,
      isActive: true,
    });

    const hasMore = Number(skip) + posts.length < total;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          posts,
          total,
          hasMore,
        },
        'User posts retrieved successfully'
      )
    );
  }
);
