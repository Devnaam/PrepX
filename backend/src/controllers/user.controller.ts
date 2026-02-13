import { Response } from 'express';
import User from '../models/User.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';

// @desc    Get current user profile
// @route   GET /api/v1/users/me
// @access  Private
export const getCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, { user }, 'User retrieved successfully')
    );
  }
);

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;

    const { fullName, bio, targetExams, profilePicture } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Validate fullName
    if (fullName !== undefined) {
      const trimmedName = fullName.trim();
      if (trimmedName.length < 2) {
        throw new ApiError(400, 'Full name must be at least 2 characters');
      }
      if (trimmedName.length > 100) {
        throw new ApiError(400, 'Full name cannot exceed 100 characters');
      }
      user.fullName = trimmedName;
    }

    // Validate bio
    if (bio !== undefined) {
      const trimmedBio = bio.trim();
      if (trimmedBio.length > 200) {
        throw new ApiError(400, 'Bio cannot exceed 200 characters');
      }
      user.bio = trimmedBio;
    }

    // Validate targetExams
    if (targetExams !== undefined) {
      if (!Array.isArray(targetExams)) {
        throw new ApiError(400, 'Target exams must be an array');
      }
      user.targetExams = targetExams;
    }

    // Update profile picture
    if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    // Return updated user (exclude password)
    const updatedUser = await User.findById(userId).select('-password');

    res.status(200).json(
      new ApiResponse(
        200,
        { user: updatedUser },
        'Profile updated successfully'
      )
    );
  }
);

// @desc    Change password
// @route   PUT /api/v1/users/change-password
// @access  Private
export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Current and new password are required');
    }

    if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
      throw new ApiError(400, 'Passwords must be strings');
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters');
    }

    if (newPassword.length > 128) {
      throw new ApiError(400, 'New password cannot exceed 128 characters');
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      throw new ApiError(400, 'New password must be different from current password');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json(
      new ApiResponse(200, {}, 'Password changed successfully')
    );
  }
);

// @desc    Update privacy settings
// @route   PUT /api/v1/users/privacy
// @access  Private
export const updatePrivacySettings = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { profileVisibility, showActivity, followApprovalRequired } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Validate and update privacy settings
    if (profileVisibility !== undefined) {
      const validVisibilities = ['PUBLIC', 'PRIVATE', 'FOLLOWERS_ONLY'];
      if (!validVisibilities.includes(profileVisibility)) {
        throw new ApiError(400, 'Invalid profile visibility value');
      }
      user.privacy.profileVisibility = profileVisibility;
    }

    if (showActivity !== undefined) {
      if (typeof showActivity !== 'boolean') {
        throw new ApiError(400, 'showActivity must be a boolean');
      }
      user.privacy.showActivity = showActivity;
    }

    if (followApprovalRequired !== undefined) {
      if (typeof followApprovalRequired !== 'boolean') {
        throw new ApiError(400, 'followApprovalRequired must be a boolean');
      }
      user.privacy.followApprovalRequired = followApprovalRequired;
    }

    await user.save();

    res.status(200).json(
      new ApiResponse(
        200,
        { privacy: user.privacy },
        'Privacy settings updated successfully'
      )
    );
  }
);

// @desc    Get user by username
// @route   GET /api/v1/users/:username
// @access  Public
export const getUserByUsername = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { username } = req.params;

    if (!username || username.trim().length === 0) {
      throw new ApiError(400, 'Username is required');
    }

    const user = await User.findOne({ username: username.toLowerCase() })
      .select('-password -email')
      .lean();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, { user }, 'User retrieved successfully')
    );
  }
);

// @desc    Get user stats
// @route   GET /api/v1/users/:userId/stats
// @access  Public
export const getUserStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select(
        'username fullName profilePicture totalQuestionsAttempted totalCorrectAnswers overallAccuracy currentStreak longestStreak followersCount followingCount postsCount'
      )
      .lean();

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, { stats: user }, 'User stats retrieved successfully')
    );
  }
);

// @desc    Delete user account (soft delete)
// @route   DELETE /api/v1/users/account
// @access  Private
export const deleteAccount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { password } = req.body;

    if (!password) {
      throw new ApiError(400, 'Password is required to delete account');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Incorrect password');
    }

    // Soft delete - mark as inactive
    user.isActive = false;
    await user.save();

    // TODO: Additional cleanup tasks:
    // - Delete or anonymize user's posts
    // - Remove from followers/following
    // - Delete user attempts
    // - Clear bookmarks

    res.status(200).json(
      new ApiResponse(200, {}, 'Account deleted successfully')
    );
  }
);
