import { Response } from 'express';
import User from '../models/User.model';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import asyncHandler from '../middleware/asyncHandler';
import { AuthRequest } from '../types';

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password || !fullName) {
      throw new ApiError(400, 'Please provide all required fields');
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApiError(409, 'Email already registered');
      }
      if (existingUser.username === username) {
        throw new ApiError(409, 'Username already taken');
      }
    }

    // Create user
    const user = await User.create({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      fullName: fullName.trim(),
    });

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from response
    const userResponse = user.toJSON();

    res.status(201).json(
      new ApiResponse(
        201,
        {
          user: userResponse,
          token,
        },
        'User registered successfully'
      )
    );
  }
);

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password');
  }

  // Find user and include password
  const user = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }],
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check if user is banned
  if (user.isBanned) {
    throw new ApiError(403, 'Your account has been banned');
  }

  // Compare password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate token
  const token = user.generateAuthToken();

  // Remove password from response
  const userResponse = user.toJSON();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: userResponse,
        token,
      },
      'Login successful'
    )
  );
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  // User is already attached to req by protect middleware
  const user = req.user;

  if (!user) {
    throw new ApiError(401, 'Not authorized');
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
      },
      'User retrieved successfully'
    )
  );
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Clear cookie if using cookie-based auth
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json(
    new ApiResponse(200, {}, 'Logged out successfully')
  );
});

// @desc    Update password
// @route   PUT /api/v1/auth/update-password
// @access  Private
export const updatePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, 'Please provide current and new password');
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
    }

    // Get user with password
    const user = await User.findById(req.user?._id).select('+password');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isPasswordMatch = await user.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      throw new ApiError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = user.generateAuthToken();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          token,
        },
        'Password updated successfully'
      )
    );
  }
);
