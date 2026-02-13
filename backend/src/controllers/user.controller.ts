import { Response } from 'express';
import User from '../models/User.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinary';

// @desc    Get user profile by username
// @route   GET /api/v1/users/:username
// @access  Public (but respects privacy settings)
export const getUserByUsername = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check privacy settings
    const currentUserId = req.user?._id.toString();
    const targetUserId = user._id.toString();

    // If viewing own profile, return everything
    if (currentUserId === targetUserId) {
      return res
        .status(200)
        .json(new ApiResponse(200, { user }, 'User retrieved successfully'));
    }

    // Apply privacy filters
    const userResponse: any = user.toJSON();

    if (user.privacy.profileVisibility === 'PRIVATE') {
      // Only show basic info for private profiles
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            user: {
              _id: user._id,
              username: user.username,
              fullName: user.fullName,
              profilePicture: user.profilePicture,
              privacy: { profileVisibility: 'PRIVATE' },
            },
          },
          'User retrieved successfully'
        )
      );
    }

    // Apply individual privacy settings
    if (!user.privacy.showActivityGraph) {
      delete userResponse.lastActiveDate;
    }
    if (!user.privacy.showStreak) {
      delete userResponse.currentStreak;
      delete userResponse.longestStreak;
    }
    if (!user.privacy.showQuestionsAttempted) {
      delete userResponse.totalQuestionsAttempted;
      delete userResponse.totalCorrectAnswers;
      delete userResponse.overallAccuracy;
    }
    if (!user.privacy.showFollowersCount) {
      delete userResponse.followersCount;
      delete userResponse.followingCount;
    }

    res
      .status(200)
      .json(new ApiResponse(200, { user: userResponse }, 'User retrieved successfully'));
  }
);

// @desc    Update user profile
// @route   PATCH /api/v1/users/me
// @access  Private
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    // Fields that can be updated
    const allowedUpdates = ['fullName', 'bio', 'targetExam'];
    const updates: any = {};

    // Filter only allowed fields
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'No valid fields to update');
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res
      .status(200)
      .json(new ApiResponse(200, { user }, 'Profile updated successfully'));
  }
);

// @desc    Upload/Update profile picture
// @route   POST /api/v1/users/upload-profile-picture
// @access  Private
export const uploadProfilePicture = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new ApiError(400, 'Please upload an image file');
    }

    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Delete old profile picture from Cloudinary if exists
    if (user.profilePicture?.publicId) {
      await deleteFromCloudinary(user.profilePicture.publicId);
    }

    // Upload new image to Cloudinary
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      'prepx/profile-pictures'
    );

    // Update user with new profile picture
    user.profilePicture = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
    };

    await user.save();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          profilePicture: user.profilePicture,
        },
        'Profile picture uploaded successfully'
      )
    );
  }
);

// @desc    Delete profile picture
// @route   DELETE /api/v1/users/profile-picture
// @access  Private
export const deleteProfilePicture = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.profilePicture?.publicId) {
      throw new ApiError(400, 'No profile picture to delete');
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(user.profilePicture.publicId);

    // Remove from user document
    user.profilePicture = { url: '', publicId: '' };
    await user.save();

    res
      .status(200)
      .json(
        new ApiResponse(200, {}, 'Profile picture deleted successfully')
      );
  }
);

// @desc    Update privacy settings
// @route   PATCH /api/v1/users/privacy-settings
// @access  Private
export const updatePrivacySettings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    const allowedPrivacyFields = [
      'profileVisibility',
      'showActivityGraph',
      'showStreak',
      'showQuestionsAttempted',
      'showBadges',
      'showPostedQuestions',
      'showFollowersCount',
      'followApprovalRequired',
    ];

    const privacyUpdates: any = {};

    Object.keys(req.body).forEach((key) => {
      if (allowedPrivacyFields.includes(key)) {
        privacyUpdates[`privacy.${key}`] = req.body[key];
      }
    });

    if (Object.keys(privacyUpdates).length === 0) {
      throw new ApiError(400, 'No valid privacy fields to update');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: privacyUpdates },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, { privacy: user.privacy }, 'Privacy settings updated successfully')
      );
  }
);

// @desc    Search users
// @route   GET /api/v1/users/search
// @access  Public
export const searchUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { q, limit = 20, skip = 0 } = req.query;

    if (!q || typeof q !== 'string') {
      throw new ApiError(400, 'Search query is required');
    }

    const searchQuery = {
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { fullName: { $regex: q, $options: 'i' } },
      ],
      isBanned: false,
    };

    const users = await User.find(searchQuery)
      .select('username fullName profilePicture bio currentStreak targetExam')
      .limit(Number(limit))
      .skip(Number(skip))
      .sort({ followersCount: -1 });

    const total = await User.countDocuments(searchQuery);

    res.status(200).json(
      new ApiResponse(
        200,
        {
          users,
          total,
          hasMore: Number(skip) + users.length < total,
        },
        'Users retrieved successfully'
      )
    );
  }
);
