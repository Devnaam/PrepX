import { Response } from 'express';
import Question from '../models/Question.model';
import UserAttempt from '../models/UserAttempt.model';
import User from '../models/User.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';
import mongoose from 'mongoose';
import { getDateString } from '../utils/dateHelper';

// @desc    Get MCQ feed for Learn tab
// @route   GET /api/v1/questions/feed
// @access  Private
export const getQuestionFeed = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const {
      limit = 20,
      skip = 0,
      subject,
      topics,
      difficulty,
      examTypes,
    } = req.query;

    // Build query
    const query: any = {
      isApproved: true,
      isActive: true,
    };

    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (topics) {
      const topicArray = Array.isArray(topics) ? topics : [topics];
      query.topic = { $in: topicArray };
    }
    if (examTypes) {
      const examArray = Array.isArray(examTypes) ? examTypes : [examTypes];
      query.examTypes = { $in: examArray };
    }

    // Get questions user has already answered correctly 2+ times
    const userCorrectAttempts = await UserAttempt.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId as string),
          isCorrect: true,
        },
      },
      {
        $group: {
          _id: '$questionId',
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gte: 2 },
        },
      },
    ]);

    const masteredQuestionIds = userCorrectAttempts.map((item) => item._id);

    // Exclude mastered questions (optional - for better learning experience)
    // Uncomment if you want to hide mastered questions
    // if (masteredQuestionIds.length > 0) {
    //   query._id = { $nin: masteredQuestionIds };
    // }

    // Get total count
    const total = await Question.countDocuments(query);

    // Get questions
    const questions = await Question.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const hasMore = Number(skip) + questions.length < total;
    const nextSkip = Number(skip) + questions.length;

    res.status(200).json(
      new ApiResponse(
        200,
        {
          questions,
          total,
          hasMore,
          nextSkip,
        },
        'Questions retrieved successfully'
      )
    );
  }
);

// @desc    Submit answer to a question
// @route   POST /api/v1/questions/:questionId/attempt
// @access  Private
export const submitAnswer = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { questionId } = req.params;
    const { selectedOptionIndex, timeTaken } = req.body;

    // Validate input
    if (
      selectedOptionIndex === undefined ||
      selectedOptionIndex < 0 ||
      selectedOptionIndex > 3
    ) {
      throw new ApiError(400, 'Invalid option selected');
    }

    if (!timeTaken || timeTaken < 0) {
      throw new ApiError(400, 'Invalid time taken');
    }

    // Get question
    const question = await Question.findById(questionId);
    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    // Check if answer is correct
    const isCorrect = selectedOptionIndex === question.correctOptionIndex;

    // Save user attempt
    const today = getDateString();
    const userAttempt = await UserAttempt.create({
      userId,
      questionId,
      selectedOptionIndex,
      isCorrect,
      timeTaken,
      attemptDate: today,
    });

    // Update question stats
    question.totalAttempts += 1;
    if (isCorrect) {
      question.correctAttempts += 1;
    }
    await question.save();

    // Update user stats
    const user = await User.findById(userId);
    if (user) {
      user.totalQuestionsAttempted += 1;
      if (isCorrect) {
        user.totalCorrectAnswers += 1;
      }

      // Update streak
      const lastActiveDate = user.lastActiveDate
        ? getDateString(user.lastActiveDate)
        : null;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getDateString(yesterday);

      if (lastActiveDate === today) {
        // Already active today, no change to streak
      } else if (lastActiveDate === yesterdayStr) {
        // Active yesterday, increment streak
        user.currentStreak += 1;
        if (user.currentStreak > user.longestStreak) {
          user.longestStreak = user.currentStreak;
        }
      } else {
        // Streak broken, reset to 1
        user.currentStreak = 1;
      }

      user.lastActiveDate = new Date();
      await user.save();
    }

    // Get today's stats for user
    const todayAttempts = await UserAttempt.countDocuments({
      userId,
      attemptDate: today,
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          isCorrect,
          correctOptionIndex: question.correctOptionIndex,
          explanation: question.explanation,
          userStats: {
            totalAttempted: user?.totalQuestionsAttempted || 0,
            totalCorrect: user?.totalCorrectAnswers || 0,
            currentStreak: user?.currentStreak || 0,
            todayAttempted: todayAttempts,
          },
        },
        isCorrect ? 'Correct answer!' : 'Incorrect answer'
      )
    );
  }
);

// @desc    Create a new question
// @route   POST /api/v1/questions
// @access  Private
export const createQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    const {
      questionText,
      options,
      correctOptionIndex,
      explanation,
      subject,
      topic,
      difficulty,
      examTypes,
    } = req.body;

    // Validate options
    if (!options || options.length !== 4) {
      throw new ApiError(400, 'Question must have exactly 4 options');
    }

    // Create question
    const question = await Question.create({
      questionText,
      options,
      correctOptionIndex,
      explanation,
      subject,
      topic,
      difficulty,
      examTypes,
      createdBy: userId,
      isAdminCreated: req.user?.isAdmin || false,
      isApproved: req.user?.isAdmin || false, // Auto-approve if admin
    });

    // Update user's posts count
    await User.findByIdAndUpdate(userId, {
      $inc: { postsCount: 1 },
    });

    res.status(201).json(
      new ApiResponse(201, { question }, 'Question created successfully')
    );
  }
);

// @desc    Get question by ID
// @route   GET /api/v1/questions/:questionId
// @access  Public
export const getQuestionById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { questionId } = req.params;

    const question = await Question.findById(questionId)
      .populate('createdBy', 'username fullName profilePicture')
      .lean();

    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    res.status(200).json(
      new ApiResponse(200, { question }, 'Question retrieved successfully')
    );
  }
);
