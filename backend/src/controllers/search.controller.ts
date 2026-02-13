import { Response } from 'express';
import User from '../models/User.model';
import Question from '../models/Question.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';

// @desc    Search users
// @route   GET /api/v1/search/users
// @access  Public
export const searchUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { q, limit = 20, skip = 0 } = req.query;

    if (!q || typeof q !== 'string') {
      throw new ApiError(400, 'Search query is required');
    }

    const searchQuery = q.trim();

    if (searchQuery.length < 2) {
      throw new ApiError(400, 'Search query must be at least 2 characters');
    }

    // Search by username, fullName, or email
    const query = {
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { fullName: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
      ],
      isActive: true,
    };

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select(
        'username fullName profilePicture bio followersCount followingCount totalQuestionsAttempted overallAccuracy'
      )
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ followersCount: -1 })
      .lean();

    const hasMore = Number(skip) + users.length < total;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          users,
          total,
          hasMore,
        },
        'Users retrieved successfully'
      )
    );
  }
);

// @desc    Search questions
// @route   GET /api/v1/search/questions
// @access  Public
export const searchQuestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { q, subject, difficulty, limit = 20, skip = 0 } = req.query;

    if (!q || typeof q !== 'string') {
      throw new ApiError(400, 'Search query is required');
    }

    const searchQuery = q.trim();

    if (searchQuery.length < 3) {
      throw new ApiError(400, 'Search query must be at least 3 characters');
    }

    // Build query
    const query: any = {
      $or: [
        { questionText: { $regex: searchQuery, $options: 'i' } },
        { topic: { $regex: searchQuery, $options: 'i' } },
        { explanation: { $regex: searchQuery, $options: 'i' } },
      ],
      isApproved: true,
      isActive: true,
    };

    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;

    const total = await Question.countDocuments(query);

    const questions = await Question.find(query)
      .select('-__v')
      .populate('createdBy', 'username fullName profilePicture')
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ totalAttempts: -1, createdAt: -1 })
      .lean();

    const hasMore = Number(skip) + questions.length < total;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          questions,
          total,
          hasMore,
        },
        'Questions retrieved successfully'
      )
    );
  }
);

// @desc    Get trending topics
// @route   GET /api/v1/search/trending-topics
// @access  Public
export const getTrendingTopics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit = 10 } = req.query;

    // Get top topics by total attempts in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingTopics = await Question.aggregate([
      {
        $match: {
          isApproved: true,
          isActive: true,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { subject: '$subject', topic: '$topic' },
          count: { $sum: '$totalAttempts' },
          questions: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: Number(limit),
      },
      {
        $project: {
          _id: 0,
          subject: '$_id.subject',
          topic: '$_id.topic',
          attempts: '$count',
          questions: 1,
        },
      },
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        { topics: trendingTopics },
        'Trending topics retrieved successfully'
      )
    );
  }
);

// @desc    Get subject-wise question count
// @route   GET /api/v1/search/subjects
// @access  Public
export const getSubjects = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const subjects = await Question.aggregate([
      {
        $match: {
          isApproved: true,
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 },
          totalAttempts: { $sum: '$totalAttempts' },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          subject: '$_id',
          questionCount: '$count',
          totalAttempts: 1,
        },
      },
    ]);

    res.status(200).json(
      new ApiResponse(200, { subjects }, 'Subjects retrieved successfully')
    );
  }
);

// @desc    Get topics by subject
// @route   GET /api/v1/search/topics/:subject
// @access  Public
export const getTopicsBySubject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { subject } = req.params;

    const topics = await Question.aggregate([
      {
        $match: {
          subject: subject.toUpperCase(),
          isApproved: true,
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$topic',
          count: { $sum: 1 },
          totalAttempts: { $sum: '$totalAttempts' },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $project: {
          _id: 0,
          topic: '$_id',
          questionCount: '$count',
          totalAttempts: 1,
        },
      },
    ]);

    res.status(200).json(
      new ApiResponse(200, { topics }, 'Topics retrieved successfully')
    );
  }
);

// @desc    Get suggested users to follow
// @route   GET /api/v1/search/suggested-users
// @access  Private
export const getSuggestedUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { limit = 10 } = req.query;

    // Get users the current user is already following
    const Follow = (await import('../models/Follow.model')).default;
    const following = await Follow.find({
      follower: userId,
      status: 'ACCEPTED',
    }).select('following');

    const followingIds = following.map((f) => f.following);
    followingIds.push(userId); // Exclude self

    // Get top users not followed yet
    const suggestedUsers = await User.find({
      _id: { $nin: followingIds },
      isActive: true,
    })
      .select(
        'username fullName profilePicture bio followersCount totalQuestionsAttempted overallAccuracy'
      )
      .sort({ followersCount: -1, totalQuestionsAttempted: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json(
      new ApiResponse(
        200,
        { users: suggestedUsers },
        'Suggested users retrieved successfully'
      )
    );
  }
);
