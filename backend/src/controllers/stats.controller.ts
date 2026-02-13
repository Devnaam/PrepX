import { Response } from 'express';
import UserAttempt from '../models/UserAttempt.model';
import User from '../models/User.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';
import {
  getDateString,
  getCurrentWeek,
  getCurrentMonth,
  getDateRange,
  getDayName,
  getLastNMonthsDates,
} from '../utils/dateHelper';

// @desc    Get today's stats
// @route   GET /api/v1/stats/today
// @access  Private
export const getTodayStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const today = getDateString();

    // Get today's attempts
    const todayAttempts = await UserAttempt.find({
      userId,
      attemptDate: today,
    });

    const attempted = todayAttempts.length;
    const correct = todayAttempts.filter((a) => a.isCorrect).length;
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const timeSpent = Math.round(
      todayAttempts.reduce((sum, a) => sum + a.timeTaken, 0) / 60
    ); // in minutes

    // Subject-wise breakdown
    const subjectBreakdown = await UserAttempt.aggregate([
      {
        $match: {
          userId,
          attemptDate: today,
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
          attempted: { $sum: 1 },
          correct: {
            $sum: { $cond: ['$isCorrect', 1, 0] },
          },
        },
      },
      {
        $project: {
          subject: '$_id',
          attempted: 1,
          correct: 1,
          accuracy: {
            $cond: [
              { $eq: ['$attempted', 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ['$correct', '$attempted'] }, 100] }, 0] },
            ],
          },
        },
      },
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          date: today,
          attempted,
          correct,
          accuracy,
          timeSpent,
          subjectBreakdown,
        },
        'Today\'s stats retrieved successfully'
      )
    );
  }
);

// @desc    Get weekly stats
// @route   GET /api/v1/stats/week
// @access  Private
export const getWeekStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { start, end } = getCurrentWeek();
    const dates = getDateRange(start, end);

    // Get all attempts for the week
    const weekAttempts = await UserAttempt.find({
      userId,
      attemptDate: { $gte: start, $lte: end },
    }).populate('questionId', 'subject topic');

    const totalAttempted = weekAttempts.length;
    const totalCorrect = weekAttempts.filter((a) => a.isCorrect).length;
    const overallAccuracy =
      totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    // Daily breakdown
    const dailyBreakdown = dates.map((date) => {
      const dayAttempts = weekAttempts.filter((a) => a.attemptDate === date);
      const attempted = dayAttempts.length;
      const correct = dayAttempts.filter((a) => a.isCorrect).length;
      const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

      return {
        date,
        dayName: getDayName(date),
        attempted,
        correct,
        accuracy,
      };
    });

    // Weakest topics this week
    const topicStats: any = {};
    weekAttempts.forEach((attempt: any) => {
      const topic = attempt.questionId?.topic;
      if (topic) {
        if (!topicStats[topic]) {
          topicStats[topic] = { attempted: 0, correct: 0 };
        }
        topicStats[topic].attempted += 1;
        if (attempt.isCorrect) {
          topicStats[topic].correct += 1;
        }
      }
    });

    const weakestTopics = Object.entries(topicStats)
      .map(([topic, stats]: [string, any]) => ({
        topic,
        attempted: stats.attempted,
        accuracy: Math.round((stats.correct / stats.attempted) * 100),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          weekStart: start,
          weekEnd: end,
          totalAttempted,
          totalCorrect,
          overallAccuracy,
          dailyBreakdown,
          weakestTopics,
        },
        'Weekly stats retrieved successfully'
      )
    );
  }
);

// @desc    Get monthly stats
// @route   GET /api/v1/stats/month
// @access  Private
export const getMonthStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { month } = req.query;

    let start: string, end: string;

    if (month && typeof month === 'string') {
      // Format: YYYY-MM
      const [year, monthNum] = month.split('-').map(Number);
      const firstDay = new Date(year, monthNum - 1, 1);
      const lastDay = new Date(year, monthNum, 0);
      start = getDateString(firstDay);
      end = getDateString(lastDay);
    } else {
      ({ start, end } = getCurrentMonth());
    }

    // Get all attempts for the month
    const monthAttempts = await UserAttempt.find({
      userId,
      attemptDate: { $gte: start, $lte: end },
    }).populate('questionId', 'subject');

    const totalAttempted = monthAttempts.length;
    const totalCorrect = monthAttempts.filter((a) => a.isCorrect).length;
    const overallAccuracy =
      totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

    // Best day
    const dailyCount: any = {};
    monthAttempts.forEach((attempt) => {
      dailyCount[attempt.attemptDate] =
        (dailyCount[attempt.attemptDate] || 0) + 1;
    });

    const bestDay = Object.entries(dailyCount).reduce(
      (max: any, [date, count]: any) => {
        return count > max.attempted ? { date, attempted: count } : max;
      },
      { date: null, attempted: 0 }
    );

    // Most practiced subject
    const subjectCount: any = {};
    monthAttempts.forEach((attempt: any) => {
      const subject = attempt.questionId?.subject;
      if (subject) {
        subjectCount[subject] = (subjectCount[subject] || 0) + 1;
      }
    });

    const mostPracticedSubject =
      Object.keys(subjectCount).length > 0
        ? Object.entries(subjectCount).reduce((max: any, [subject, count]: any) =>
            count > max.count ? { subject, count } : max
          , { subject: null, count: 0 }).subject
        : null;

    // TODO: Calculate rank compared to all users (implement later with more users)
    const rank = {
      position: null,
      percentile: null,
    };

    res.status(200).json(
      new ApiResponse(
        200,
        {
          month: month || getDateString().slice(0, 7),
          totalAttempted,
          totalCorrect,
          overallAccuracy,
          bestDay: bestDay.date ? bestDay : null,
          mostPracticedSubject,
          rank,
        },
        'Monthly stats retrieved successfully'
      )
    );
  }
);

// @desc    Get activity graph data (GitHub-style)
// @route   GET /api/v1/stats/activity-graph
// @access  Private
export const getActivityGraph = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { months = 6 } = req.query;

    const monthsNum = Math.min(Number(months), 12); // Max 12 months
    const dates = getLastNMonthsDates(monthsNum);

    // Get all attempts for the date range
    const attempts = await UserAttempt.aggregate([
      {
        $match: {
          userId,
          attemptDate: { $in: dates },
        },
      },
      {
        $group: {
          _id: '$attemptDate',
          count: { $sum: 1 },
        },
      },
    ]);

    // Create a map for quick lookup
    const attemptMap: any = {};
    attempts.forEach((item) => {
      attemptMap[item._id] = item.count;
    });

    // Create activity data for all dates
    const activities = dates.map((date) => {
      const count = attemptMap[date] || 0;
      let level = 0;

      if (count === 0) level = 0;
      else if (count <= 10) level = 1;
      else if (count <= 30) level = 2;
      else if (count <= 50) level = 3;
      else level = 4;

      return {
        date,
        count,
        level,
      };
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          activities,
          totalDays: dates.length,
          activeDays: activities.filter((a) => a.count > 0).length,
        },
        'Activity graph retrieved successfully'
      )
    );
  }
);

// @desc    Get all-time stats
// @route   GET /api/v1/stats/all-time
// @access  Private
export const getAllTimeStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Subject-wise breakdown (all time)
    const subjectBreakdown = await UserAttempt.aggregate([
      {
        $match: { userId },
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
          attempted: { $sum: 1 },
          correct: {
            $sum: { $cond: ['$isCorrect', 1, 0] },
          },
        },
      },
      {
        $project: {
          subject: '$_id',
          attempted: 1,
          correct: 1,
          accuracy: {
            $cond: [
              { $eq: ['$attempted', 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ['$correct', '$attempted'] }, 100] }, 0] },
            ],
          },
        },
      },
      {
        $sort: { attempted: -1 },
      },
    ]);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          totalAttempted: user.totalQuestionsAttempted,
          totalCorrect: user.totalCorrectAnswers,
          overallAccuracy: user.overallAccuracy,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          subjectBreakdown,
        },
        'All-time stats retrieved successfully'
      )
    );
  }
);
