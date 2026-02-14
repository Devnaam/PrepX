import { Response } from 'express';
import Bookmark from '../models/Bookmark.model';
import Question from '../models/Question.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';

// @desc    Toggle bookmark (add/remove)
// @route   POST /api/v1/bookmarks/:questionId
// @access  Private
export const toggleBookmark = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { questionId } = req.params;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    // Check if already bookmarked
    const existingBookmark = await Bookmark.findOne({
      userId,
      questionId,
    });

    if (existingBookmark) {
      // Remove bookmark
      await existingBookmark.deleteOne();
      res.status(200).json(
        new ApiResponse(
          200,
          { isBookmarked: false },
          'Bookmark removed'
        )
      );
    } else {
      // Add bookmark
      await Bookmark.create({
        userId,
        questionId,
      });
      res.status(200).json(
        new ApiResponse(
          200,
          { isBookmarked: true },
          'Question bookmarked'
        )
      );
    }
  }
);

// @desc    Get user's bookmarked questions
// @route   GET /api/v1/bookmarks
// @access  Private
export const getBookmarks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { limit = 20, skip = 0, subject, difficulty } = req.query;

    // Build query for questions
    const questionQuery: any = {
      isApproved: true,
      isActive: true,
    };

    if (subject) questionQuery.subject = subject;
    if (difficulty) questionQuery.difficulty = difficulty;

    // Get bookmarked question IDs
    const bookmarks = await Bookmark.find({ userId })
      .select('questionId')
      .sort({ createdAt: -1 })
      .lean();

    const bookmarkedQuestionIds = bookmarks.map((b) => b.questionId);

    // Add to query
    questionQuery._id = { $in: bookmarkedQuestionIds };

    // Get total count
    const total = await Question.countDocuments(questionQuery);

    // Get questions
    const questions = await Question.find(questionQuery)
      .select('-__v')
      .populate('createdBy', 'username fullName profilePicture')
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
        'Bookmarks retrieved successfully'
      )
    );
  }
);

// @desc    Check if questions are bookmarked
// @route   POST /api/v1/bookmarks/check
// @access  Private
export const checkBookmarks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds)) {
      throw new ApiError(400, 'questionIds must be an array');
    }

    const bookmarks = await Bookmark.find({
      userId,
      questionId: { $in: questionIds },
    }).select('questionId');

    const bookmarkedIds = bookmarks.map((b) => b.questionId.toString());

    res.status(200).json(
      new ApiResponse(200, { bookmarkedIds }, 'Bookmark status retrieved')
    );
  }
);

// @desc    Get bookmark statistics
// @route   GET /api/v1/bookmarks/stats
// @access  Private
export const getBookmarkStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    // Total bookmarks
    const total = await Bookmark.countDocuments({ userId });

    // Subject-wise breakdown
    const bookmarks = await Bookmark.find({ userId })
      .populate({
        path: 'questionId',
        select: 'subject difficulty',
      })
      .lean();

    const subjectBreakdown: Record<string, number> = {};
    const difficultyBreakdown: Record<string, number> = {};

    bookmarks.forEach((bookmark: any) => {
      if (bookmark.questionId) {
        const subject = bookmark.questionId.subject;
        const difficulty = bookmark.questionId.difficulty;

        subjectBreakdown[subject] = (subjectBreakdown[subject] || 0) + 1;
        difficultyBreakdown[difficulty] =
          (difficultyBreakdown[difficulty] || 0) + 1;
      }
    });

    res.status(200).json(
      new ApiResponse(
        200,
        {
          total,
          subjectBreakdown,
          difficultyBreakdown,
        },
        'Bookmark stats retrieved successfully'
      )
    );
  }
);

// @desc    Clear all bookmarks
// @route   DELETE /api/v1/bookmarks/clear
// @access  Private
export const clearAllBookmarks = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    const result = await Bookmark.deleteMany({ userId });

    res.status(200).json(
      new ApiResponse(
        200,
        { deletedCount: result.deletedCount },
        'All bookmarks cleared'
      )
    );
  }
);
