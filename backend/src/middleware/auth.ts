import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import ApiError from '../utils/ApiError';
import asyncHandler from './asyncHandler';
import { AuthRequest } from '../types';

// Protect routes - require authentication
export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Log for debugging
    console.log('🔐 Auth Middleware:', {
      hasAuthHeader: !!req.headers.authorization,
      hasCookie: !!req.cookies.token,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
    });

    // Check if token exists
    if (!token) {
      throw new ApiError(401, 'Not authorized to access this route');
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;

      console.log('✅ Token verified for user:', decoded.username);

      // Get user from token
      const user = await User.findById(decoded._id).select('-password');

      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      // Check if user is banned
      if (user.isBanned) {
        throw new ApiError(403, 'Your account has been banned');
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error: any) {
      console.error('❌ Token verification failed:', error.message);
      
      if (error.name === 'JsonWebTokenError') {
        throw new ApiError(401, 'Invalid token');
      }
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(401, 'Token expired');
      }
      throw error;
    }
  }
);

// Optional authentication - doesn't throw error if no token
export const optionalAuth = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as any;
        const user = await User.findById(decoded._id).select('-password');
        if (user && !user.isBanned) {
          req.user = user;
        }
      } catch (error) {
        // Continue without user
      }
    }

    next();
  }
);

// Admin only middleware
export const adminOnly = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authorized');
    }

    if (!req.user.isAdmin) {
      throw new ApiError(403, 'Admin access required');
    }

    next();
  }
);
