import { Response } from 'express';
import User from '../models/User.model';
import UserAttempt from '../models/UserAttempt.model';
import Follow from '../models/Follow.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';
import { getDateString } from '../utils/dateHelper';

// @desc    Get global leaderboard
// @route   GET /api/v1/leaderboard/global
// @access  Public
export const getGlobalLeaderboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit = 50, skip = 0 } = req.query;

    // Get top users by overall accuracy and questions attempted
    const users = await User.find({ isActive: true })
      .select(
        'username fullName profilePicture totalQuestionsAttempted totalCorrectAnswers overallAccuracy currentStreak'
      )
      .sort({ overallAccuracy: -1, totalQuestionsAttempted: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    // Add rank
    const rankedUsers = users.map((user, index) => ({
      ...user,
      rank: Number(skip) + index + 1,
    }));

    // Get current user's rank if authenticated
    let currentUserRank = null;
    if (req.user) {
      const currentUser = await User.findById(req.user._id).select(
        'overallAccuracy totalQuestionsAttempted'
      );
      if (currentUser) {
        const higherRankedCount = await User.countDocuments({
          isActive: true,
          $or: [
            { overallAccuracy: { $gt: currentUser.overallAccuracy } },
            {
              overallAccuracy: currentUser.overallAccuracy,
              totalQuestionsAttempted: { $gt: currentUser.totalQuestionsAttempted },
            },
          ],
        });
        currentUserRank = higherRankedCount + 1;
      }
    }

    const total = await User.countDocuments({ isActive: true });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          users: rankedUsers,
          total,
          currentUserRank,
        },
        'Global leaderboard retrieved successfully'
      )
    );
  }
);

// @desc    Get weekly leaderboard
// @route   GET /api/v1/leaderboard/weekly
// @access  Public
export const getWeeklyLeaderboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { limit = 50 } = req.query;

    // Get start of current week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Aggregate weekly stats
    const weeklyStats = await UserAttempt.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalAttempts: { $sum: 1 },
          correctAnswers: {
            $sum: { $cond: ['$isCorrect', 1, 0] },
          },
        },
      },
      {
        $project: {
          userId: '$_id',
          totalAttempts: 1,
          correctAnswers: 1,
          accuracy: {
            $cond: {
              if: { $gt: ['$totalAttempts', 0] },
              then: {
                $round: [
                  { $multiply: [{ $divide: ['$correctAnswers', '$totalAttempts'] }, 100] },
                  0,
                ],
              },
              else: 0,
            },
          },
        },
      },
      {
        $sort: { accuracy: -1, totalAttempts: -1 },
      },
      {
        $limit: Number(limit),
      },
    ]);

    // Populate user details
    const userIds = weeklyStats.map((stat) => stat.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('username fullName profilePicture')
      .lean();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const leaderboard = weeklyStats.map((stat, index) => ({
      rank: index + 1,
      user: userMap.get(stat.userId.toString()),
      weeklyStats: {
        totalAttempts: stat.totalAttempts,
        correctAnswers: stat.correctAnswers,
        accuracy: stat.accuracy,
      },
    }));

    // Get current user's weekly rank if authenticated
    let currentUserWeeklyRank = null;
    if (req.user) {
      const currentUserStats = weeklyStats.find(
        (s) => s.userId.toString() === req.user?._id.toString()
      );
      if (currentUserStats) {
        currentUserWeeklyRank = weeklyStats.findIndex(
          (s) => s.userId.toString() === req.user?._id.toString()
        ) + 1;
      }
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          leaderboard,
          weekStartDate: startOfWeek,
          currentUserWeeklyRank,
        },
        'Weekly leaderboard retrieved successfully'
      )
    );
  }
);

// @desc    Get subject-wise leaderboard
// @route   GET /api/v1/leaderboard/subject/:subject
// @access  Public
export const getSubjectLeaderboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { subject } = req.params;
    const { limit = 50 } = req.query;

    // Validate subject
    const validSubjects = [
      'MATHEMATICS',
      'GENERAL_KNOWLEDGE',
      'REASONING',
      'ENGLISH',
      'GENERAL_SCIENCE',
      'CURRENT_AFFAIRS',
      'COMPUTER',
      'HISTORY',
      'GEOGRAPHY',
      'ECONOMICS',
    ];

    if (!validSubjects.includes(subject.toUpperCase())) {
      throw new ApiError(400, 'Invalid subject');
    }

    // Get questions for this subject
    const Question = (await import('../models/Question.model')).default;
    const questions = await Question.find({
      subject: subject.toUpperCase(),
      isApproved: true,
      isActive: true,
    }).select('_id');

    const questionIds = questions.map((q) => q._id);

    // Aggregate subject-wise stats
    const subjectStats = await UserAttempt.aggregate([
      {
        $match: {
          questionId: { $in: questionIds },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalAttempts: { $sum: 1 },
          correctAnswers: {
            $sum: { $cond: ['$isCorrect', 1, 0] },
          },
        },
      },
      {
        $match: {
          totalAttempts: { $gte: 5 }, // Minimum 5 attempts to qualify
        },
      },
      {
        $project: {
          userId: '$_id',
          totalAttempts: 1,
          correctAnswers: 1,
          accuracy: {
            $round: [
              { $multiply: [{ $divide: ['$correctAnswers', '$totalAttempts'] }, 100] },
              0,
            ],
          },
        },
      },
      {
        $sort: { accuracy: -1, totalAttempts: -1 },
      },
      {
        $limit: Number(limit),
      },
    ]);

    // Populate user details
    const userIds = subjectStats.map((stat) => stat.userId);
    const users = await User.find({ _id: { $in: userIds } })
      .select('username fullName profilePicture')
      .lean();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const leaderboard = subjectStats.map((stat, index) => ({
      rank: index + 1,
      user: userMap.get(stat.userId.toString()),
      subjectStats: {
        totalAttempts: stat.totalAttempts,
        correctAnswers: stat.correctAnswers,
        accuracy: stat.accuracy,
      },
    }));

    res.status(200).json(
      new ApiResponse(
        200,
        {
          subject: subject.toUpperCase(),
          leaderboard,
        },
        'Subject leaderboard retrieved successfully'
      )
    );
  }
);

// @desc    Get friends leaderboard
// @route   GET /api/v1/leaderboard/friends
// @access  Private
export const getFriendsLeaderboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    // Get users that current user follows
    const following = await Follow.find({
      follower: userId,
      status: 'ACCEPTED',
    }).select('following');

    const followingIds = following.map((f) => f.following);
    followingIds.push(new mongoose.Types.ObjectId(userId as string)); // Include self

    // Get friend stats
    const friends = await User.find({
      _id: { $in: followingIds },
      isActive: true,
    })
      .select(
        'username fullName profilePicture totalQuestionsAttempted totalCorrectAnswers overallAccuracy currentStreak'
      )
      .sort({ overallAccuracy: -1, totalQuestionsAttempted: -1 })
      .lean();

    // Add rank
    const rankedFriends = friends.map((friend, index) => ({
      ...friend,
      rank: index + 1,
      isCurrentUser: friend._id.toString() === userId?.toString(),
    }));

    res.status(200).json(
      new ApiResponse(
        200,
        {
          friends: rankedFriends,
          total: friends.length,
        },
        'Friends leaderboard retrieved successfully'
      )
    );
  }
);

// @desc    Get leaderboard summary
// @route   GET /api/v1/leaderboard/summary
// @access  Public
export const getLeaderboardSummary = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    // Get top 3 global users
    const topGlobal = await User.find({ isActive: true })
      .select('username fullName profilePicture overallAccuracy totalQuestionsAttempted')
      .sort({ overallAccuracy: -1, totalQuestionsAttempted: -1 })
      .limit(3)
      .lean();

    // Get weekly leader
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyLeader = await UserAttempt.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalAttempts: { $sum: 1 },
          correctAnswers: {
            $sum: { $cond: ['$isCorrect', 1, 0] },
          },
        },
      },
      {
        $project: {
          userId: '$_id',
          totalAttempts: 1,
          correctAnswers: 1,
          accuracy: {
            $round: [
              { $multiply: [{ $divide: ['$correctAnswers', '$totalAttempts'] }, 100] },
              0,
            ],
          },
        },
      },
      {
        $sort: { accuracy: -1, totalAttempts: -1 },
      },
      {
        $limit: 1,
      },
    ]);

    let topWeekly = null;
    if (weeklyLeader.length > 0) {
      const weeklyUser = await User.findById(weeklyLeader[0].userId).select(
        'username fullName profilePicture'
      );
      topWeekly = {
        user: weeklyUser,
        stats: weeklyLeader[0],
      };
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          topGlobal,
          topWeekly,
        },
        'Leaderboard summary retrieved successfully'
      )
    );
  }
);
