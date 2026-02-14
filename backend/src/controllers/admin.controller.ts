import { Response } from 'express';
import User from '../models/User.model';
import Question from '../models/Question.model';
import Post from '../models/Post.model';
import UserAttempt from '../models/UserAttempt.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';

// ==================== DASHBOARD ====================

// @desc    Get admin dashboard overview
// @route   GET /api/v1/admin/dashboard
// @access  Private/Admin
export const getDashboardOverview = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Total users
    const totalUsers = await User.countDocuments();
    const totalUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    // Total questions
    const totalQuestions = await Question.countDocuments({ isActive: true });
    const pendingQuestions = await Question.countDocuments({
      isApproved: false,
      isActive: true,
    });

    // Active users today
    const today = new Date().toISOString().split('T')[0];
    const activeUsersToday = await UserAttempt.distinct('userId', {
      attemptDate: today,
    });

    // Total attempts
    const totalAttempts = await UserAttempt.countDocuments();

    // Recent users (last 5)
    const recentUsers = await User.find()
      .select('username fullName createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // User growth (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          overview: {
            totalUsers,
            totalUsersToday,
            totalQuestions,
            pendingQuestions,
            activeUsersToday: activeUsersToday.length,
            totalAttempts,
          },
          recentUsers,
          userGrowth,
        },
        'Dashboard data retrieved successfully'
      )
    );
  }
);

// ==================== QUESTION MANAGEMENT ====================

// @desc    Get all questions with filters
// @route   GET /api/v1/admin/questions
// @access  Private/Admin
export const getAllQuestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      limit = 20,
      skip = 0,
      status = 'all', // 'all', 'pending', 'approved', 'rejected'
      subject,
      difficulty,
      search,
    } = req.query;

    // Build query
    const query: any = { isActive: true };

    if (status === 'pending') {
      query.isApproved = false;
    } else if (status === 'approved') {
      query.isApproved = true;
    }

    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { questionText: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Question.countDocuments(query);

    const questions = await Question.find(query)
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
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

// @desc    Approve question
// @route   PATCH /api/v1/admin/questions/:id/approve
// @access  Private/Admin
export const approveQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    question.isApproved = true;
    await question.save();

    res.status(200).json(
      new ApiResponse(200, { question }, 'Question approved successfully')
    );
  }
);

// @desc    Reject/delete question
// @route   DELETE /api/v1/admin/questions/:id
// @access  Private/Admin
export const deleteQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    // Soft delete
    question.isActive = false;
    await question.save();

    res.status(200).json(
      new ApiResponse(200, {}, 'Question deleted successfully')
    );
  }
);

// @desc    Bulk approve questions
// @route   POST /api/v1/admin/questions/bulk-approve
// @access  Private/Admin
export const bulkApproveQuestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      throw new ApiError(400, 'Question IDs array is required');
    }

    const result = await Question.updateMany(
      { _id: { $in: questionIds } },
      { isApproved: true }
    );

    res.status(200).json(
      new ApiResponse(
        200,
        { approvedCount: result.modifiedCount },
        'Questions approved successfully'
      )
    );
  }
);

// @desc    Get question analytics
// @route   GET /api/v1/admin/questions/analytics
// @access  Private/Admin
export const getQuestionAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Subject-wise breakdown
    const subjectBreakdown = await Question.aggregate([
      {
        $match: { isActive: true, isApproved: true },
      },
      {
        $group: {
          _id: '$subject',
          total: { $sum: 1 },
          totalAttempts: { $sum: '$totalAttempts' },
          correctAttempts: { $sum: '$correctAttempts' },
        },
      },
      {
        $project: {
          subject: '$_id',
          total: 1,
          totalAttempts: 1,
          correctAttempts: 1,
          accuracy: {
            $cond: {
              if: { $gt: ['$totalAttempts', 0] },
              then: {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$correctAttempts', '$totalAttempts'] },
                      100,
                    ],
                  },
                  0,
                ],
              },
              else: 0,
            },
          },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // Difficulty breakdown
    const difficultyBreakdown = await Question.aggregate([
      {
        $match: { isActive: true, isApproved: true },
      },
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
        },
      },
    ]);

    // Most attempted questions
    const mostAttempted = await Question.find({ isActive: true, isApproved: true })
      .select('questionText subject topic totalAttempts correctAttempts')
      .sort({ totalAttempts: -1 })
      .limit(10)
      .lean();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          subjectBreakdown,
          difficultyBreakdown,
          mostAttempted,
        },
        'Question analytics retrieved successfully'
      )
    );
  }
);

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit = 20, skip = 0, search, status = 'all' } = req.query;

    // Build query
    const query: any = {};

    if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'active') {
      query.isBanned = false;
    }

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
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

// @desc    Get user details
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
export const getUserDetails = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Get user's recent activity
    const recentAttempts = await UserAttempt.find({ userId: id })
      .populate('questionId', 'questionText subject')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get user's posts
    const postCount = await Post.countDocuments({ author: id });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          user,
          recentAttempts,
          postCount,
        },
        'User details retrieved successfully'
      )
    );
  }
);

// @desc    Ban user
// @route   PATCH /api/v1/admin/users/:id/ban
// @access  Private/Admin
export const banUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (user.isAdmin) {
      throw new ApiError(403, 'Cannot ban admin users');
    }

    user.isBanned = true;
    await user.save();

    res.status(200).json(
      new ApiResponse(200, { user }, 'User banned successfully')
    );
  }
);

// @desc    Unban user
// @route   PATCH /api/v1/admin/users/:id/unban
// @access  Private/Admin
export const unbanUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.isBanned = false;
    await user.save();

    res.status(200).json(
      new ApiResponse(200, { user }, 'User unbanned successfully')
    );
  }
);

// ==================== ANALYTICS ====================

// @desc    Get user analytics
// @route   GET /api/v1/admin/analytics/users
// @access  Private/Admin
export const getUserAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { days = 30 } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Active users per day
    const activeUsers = await UserAttempt.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            userId: '$userId',
          },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          activeUsers: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Total stats
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          userGrowth,
          activeUsers,
          stats: {
            totalUsers,
            bannedUsers,
            verifiedUsers,
            activeUsers: totalUsers - bannedUsers,
          },
        },
        'User analytics retrieved successfully'
      )
    );
  }
);

// @desc    Get engagement analytics
// @route   GET /api/v1/admin/analytics/engagement
// @access  Private/Admin
export const getEngagementAnalytics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { days = 7 } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - Number(days));

    // Questions attempted per day
    const questionAttempts = await UserAttempt.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          attempts: { $sum: 1 },
          correct: {
            $sum: { $cond: ['$isCorrect', 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Posts per day
    const postsPerDay = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          questionAttempts,
          postsPerDay,
        },
        'Engagement analytics retrieved successfully'
      )
    );
  }
);

// ==================== CONTENT MODERATION ====================

// @desc    Get all posts (for moderation)
// @route   GET /api/v1/admin/posts
// @access  Private/Admin
export const getAllPosts = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit = 20, skip = 0, status = 'all' } = req.query;

    const query: any = {};

    if (status === 'reported') {
      query.isReported = true;
    } else if (status === 'hidden') {
      query.isHidden = true;
    }

    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .populate('author', 'username fullName')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const hasMore = Number(skip) + posts.length < total;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          posts,
          total,
          hasMore,
        },
        'Posts retrieved successfully'
      )
    );
  }
);

// @desc    Hide/unhide post
// @route   PATCH /api/v1/admin/posts/:id/hide
// @access  Private/Admin
export const toggleHidePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    post.isHidden = !post.isHidden;
    await post.save();

    res.status(200).json(
      new ApiResponse(
        200,
        { post },
        `Post ${post.isHidden ? 'hidden' : 'unhidden'} successfully`
      )
    );
  }
);

// @desc    Delete post
// @route   DELETE /api/v1/admin/posts/:id
// @access  Private/Admin
export const deletePost = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    res.status(200).json(
      new ApiResponse(200, {}, 'Post deleted successfully')
    );
  }
);
