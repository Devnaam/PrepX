import { Response } from 'express';
import UserAttempt from '../models/UserAttempt.model';
import Question from '../models/Question.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';

// @desc    Get user's question history
// @route   GET /api/v1/history
// @access  Private
export const getHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const {
      limit = 20,
      skip = 0,
      result, // 'correct' | 'incorrect' | 'all'
      subject,
      difficulty,
      sortBy = 'recent', // 'recent' | 'oldest'
    } = req.query;

    // Build query
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId as string),
    };

    if (result === 'correct') {
      query.isCorrect = true;
    } else if (result === 'incorrect') {
      query.isCorrect = false;
    }

    // Get attempts
    const attempts = await UserAttempt.find(query)
      .populate({
        path: 'questionId',
        select: 'questionText options subject topic difficulty explanation',
        match: {
          isActive: true,
          ...(subject && { subject }),
          ...(difficulty && { difficulty }),
        },
      })
      .sort({ createdAt: sortBy === 'recent' ? -1 : 1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    // Filter out attempts where question was deleted
    const validAttempts = attempts.filter((attempt) => attempt.questionId !== null);

    // Get total count
    const totalQuery = { ...query };
    if (subject || difficulty) {
      // Need to get question IDs that match the criteria
      const questionQuery: any = { isActive: true };
      if (subject) questionQuery.subject = subject;
      if (difficulty) questionQuery.difficulty = difficulty;

      const matchingQuestions = await Question.find(questionQuery).select('_id');
      const questionIds = matchingQuestions.map((q) => q._id);
      totalQuery.questionId = { $in: questionIds };
    }

    const total = await UserAttempt.countDocuments(totalQuery);
    const hasMore = Number(skip) + validAttempts.length < total;

    // Calculate stats
    const correctCount = validAttempts.filter(
      (a) => a.isCorrect
    ).length;
    const incorrectCount = validAttempts.length - correctCount;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          attempts: validAttempts,
          total,
          hasMore,
          stats: {
            correct: correctCount,
            incorrect: incorrectCount,
            accuracy:
              validAttempts.length > 0
                ? Math.round((correctCount / validAttempts.length) * 100)
                : 0,
          },
        },
        'History retrieved successfully'
      )
    );
  }
);

// @desc    Get history statistics
// @route   GET /api/v1/history/stats
// @access  Private
export const getHistoryStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    // Total attempts
    const totalAttempts = await UserAttempt.countDocuments({ userId });

    // Correct/Incorrect breakdown
    const correctAttempts = await UserAttempt.countDocuments({
      userId,
      isCorrect: true,
    });
    const incorrectAttempts = totalAttempts - correctAttempts;

    // Subject-wise breakdown
    const subjectStats = await UserAttempt.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId as string),
        },
      },
      {
        $lookup: {
          from: 'questions',
          localField: 'questionId',
          foreignField: '_id',
          as: 'question',
        },
      },
      {
        $unwind: '$question',
      },
      {
        $group: {
          _id: '$question.subject',
          total: { $sum: 1 },
          correct: {
            $sum: { $cond: ['$isCorrect', 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          subject: '$_id',
          total: 1,
          correct: 1,
          accuracy: {
            $round: [{ $multiply: [{ $divide: ['$correct', '$total'] }, 100] }, 0],
          },
        },
      },
      {
        $sort: { total: -1 },
      },
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity = await UserAttempt.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId as string),
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          total: { $sum: 1 },
          correct: {
            $sum: { $cond: ['$isCorrect', 1, 0] },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          total: 1,
          correct: 1,
        },
      },
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          totalAttempts,
          correctAttempts,
          incorrectAttempts,
          overallAccuracy:
            totalAttempts > 0
              ? Math.round((correctAttempts / totalAttempts) * 100)
              : 0,
          subjectStats,
          recentActivity,
        },
        'History stats retrieved successfully'
      )
    );
  }
);

// @desc    Get single attempt details
// @route   GET /api/v1/history/:attemptId
// @access  Private
export const getAttemptDetails = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { attemptId } = req.params;

    const attempt = await UserAttempt.findOne({
      _id: attemptId,
      userId,
    })
      .populate({
        path: 'questionId',
        select: 'questionText options correctOptionIndex explanation subject topic difficulty',
      })
      .lean();

    if (!attempt) {
      throw new ApiError(404, 'Attempt not found');
    }

    res.status(200).json(
      new ApiResponse(200, { attempt }, 'Attempt details retrieved successfully')
    );
  }
);

// @desc    Delete history (all or filtered)
// @route   DELETE /api/v1/history
// @access  Private
export const clearHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { result } = req.query; // 'correct' | 'incorrect' | 'all'

    const query: any = {
      userId: new mongoose.Types.ObjectId(userId as string),
    };

    if (result === 'correct') {
      query.isCorrect = true;
    } else if (result === 'incorrect') {
      query.isCorrect = false;
    }

    const deleteResult = await UserAttempt.deleteMany(query);

    res.status(200).json(
      new ApiResponse(
        200,
        { deletedCount: deleteResult.deletedCount },
        'History cleared successfully'
      )
    );
  }
);
