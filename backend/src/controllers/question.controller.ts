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

    // Validate required fields
    if (!questionText || questionText.trim().length < 10) {
      throw new ApiError(400, 'Question text must be at least 10 characters');
    }

    if (!explanation || explanation.trim().length < 20) {
      throw new ApiError(400, 'Explanation must be at least 20 characters');
    }

    // Validate options
    if (!options || options.length !== 4) {
      throw new ApiError(400, 'Question must have exactly 4 options');
    }

    // Check if all options have text
    const hasEmptyOption = options.some(
      (opt: any) => !opt.optionText || opt.optionText.trim().length === 0
    );
    if (hasEmptyOption) {
      throw new ApiError(400, 'All options must have text');
    }

    // Validate correct option index
    if (
      correctOptionIndex === undefined ||
      correctOptionIndex < 0 ||
      correctOptionIndex > 3
    ) {
      throw new ApiError(400, 'Invalid correct option index');
    }

    // Validate subject and difficulty
    if (!subject || !difficulty) {
      throw new ApiError(400, 'Subject and difficulty are required');
    }

    // Validate subject enum
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
    if (!validSubjects.includes(subject)) {
      throw new ApiError(400, 'Invalid subject');
    }

    // Validate difficulty enum
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
    if (!validDifficulties.includes(difficulty)) {
      throw new ApiError(400, 'Invalid difficulty level');
    }

    // Create question
    const question = await Question.create({
      questionText: questionText.trim(),
      options,
      correctOptionIndex,
      explanation: explanation.trim(),
      subject,
      topic: topic?.trim() || 'General',
      difficulty,
      examTypes: examTypes || [],
      createdBy: userId,
      isAdminCreated: req.user?.isAdmin || false,
      isApproved: req.user?.isAdmin || false, // Auto-approve if admin
      isActive: req.user?.isAdmin || false, // Active only if admin
    });

    // Update user's contributions count
    await User.findByIdAndUpdate(userId, {
      $inc: { postsCount: 1 },
    });

    const message = req.user?.isAdmin
      ? 'Question created and published successfully'
      : 'Question submitted for review. You will be notified once approved.';

    res.status(201).json(
      new ApiResponse(201, { question }, message)
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

// @desc    Get user's submitted questions
// @route   GET /api/v1/questions/my-questions
// @access  Private
export const getMyQuestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { limit = 20, skip = 0, status } = req.query;

    const query: any = {
      createdBy: userId,
    };

    // Filter by approval status
    if (status === 'pending') {
      query.isApproved = false;
      query.isActive = false;
    } else if (status === 'approved') {
      query.isApproved = true;
      query.isActive = true;
    } else if (status === 'rejected') {
      query.isApproved = false;
      query.isActive = false;
    }

    const total = await Question.countDocuments(query);

    const questions = await Question.find(query)
      .select('-__v')
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
        'Your questions retrieved successfully'
      )
    );
  }
);

// @desc    Update a question (admin or creator only)
// @route   PUT /api/v1/questions/:questionId
// @access  Private
export const updateQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    // Check if user is admin or creator
    const isAdmin = req.user?.isAdmin;
    const isCreator = question.createdBy.toString() === userId?.toString();

    if (!isAdmin && !isCreator) {
      throw new ApiError(403, 'Not authorized to update this question');
    }

    // Only allow editing if not yet approved (unless admin)
    if (question.isApproved && !isAdmin) {
      throw new ApiError(400, 'Cannot edit approved questions');
    }

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

    // Update fields
    if (questionText) question.questionText = questionText.trim();
    if (options) question.options = options;
    if (correctOptionIndex !== undefined)
      question.correctOptionIndex = correctOptionIndex;
    if (explanation) question.explanation = explanation.trim();
    if (subject) question.subject = subject;
    if (topic) question.topic = topic.trim();
    if (difficulty) question.difficulty = difficulty;
    if (examTypes) question.examTypes = examTypes;

    await question.save();

    res.status(200).json(
      new ApiResponse(200, { question }, 'Question updated successfully')
    );
  }
);

// @desc    Delete a question (admin or creator only)
// @route   DELETE /api/v1/questions/:questionId
// @access  Private
export const deleteQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    // Check if user is admin or creator
    const isAdmin = req.user?.isAdmin;
    const isCreator = question.createdBy.toString() === userId?.toString();

    if (!isAdmin && !isCreator) {
      throw new ApiError(403, 'Not authorized to delete this question');
    }

    // Soft delete
    question.isActive = false;
    await question.save();

    // Update user's posts count
    await User.findByIdAndUpdate(question.createdBy, {
      $inc: { postsCount: -1 },
    });

    res.status(200).json(
      new ApiResponse(200, {}, 'Question deleted successfully')
    );
  }
);

// @desc    Approve a question (admin only)
// @route   POST /api/v1/questions/:questionId/approve
// @access  Private (Admin)
export const approveQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { questionId } = req.params;

    if (!req.user?.isAdmin) {
      throw new ApiError(403, 'Admin access required');
    }

    const question = await Question.findById(questionId);
    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    question.isApproved = true;
    question.isActive = true;
    await question.save();

    // TODO: Send notification to question creator

    res.status(200).json(
      new ApiResponse(200, { question }, 'Question approved successfully')
    );
  }
);

// @desc    Reject a question (admin only)
// @route   POST /api/v1/questions/:questionId/reject
// @access  Private (Admin)
export const rejectQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { questionId } = req.params;
    const { reason } = req.body;

    if (!req.user?.isAdmin) {
      throw new ApiError(403, 'Admin access required');
    }

    const question = await Question.findById(questionId);
    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    question.isApproved = false;
    question.isActive = false;
    await question.save();

    // TODO: Send notification to question creator with rejection reason

    res.status(200).json(
      new ApiResponse(200, {}, 'Question rejected')
    );
  }
);
