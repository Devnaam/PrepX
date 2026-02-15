import { Request } from 'express';
import mongoose, { Document } from 'mongoose';

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: IUser;
}

// User Interface
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  fullName: string;
  profilePicture?: {
    url: string;
    publicId: string;
  };
  bio?: string;
  targetExam?: string;
  targetExams?: string[];
  totalQuestionsAttempted: number;
  totalCorrectAnswers: number;
  overallAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  privacy: {
    profileVisibility: 'EVERYONE' | 'FOLLOWERS' | 'PRIVATE';
    showActivityGraph: boolean;
    showActivity?: boolean;
    showStreak: boolean;
    showQuestionsAttempted: boolean;
    showBadges: boolean;
    showPostedQuestions: boolean;
    showFollowersCount: boolean;
    followApprovalRequired: boolean;
  };
  isVerified: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

// Question Interface
export interface IQuestion extends Document {
  questionText: string;
  options: {
    optionText: string;
    isCorrect: boolean;
  }[];
  correctOptionIndex: number;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  examTypes: string[];
  createdBy: mongoose.Types.ObjectId;
  isAdminCreated: boolean;
  isApproved: boolean;
  totalAttempts: number;
  correctAttempts: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Post Interface
export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  content: string;
  postType: 'TEXT' | 'QUESTION_SHARE' | 'ACHIEVEMENT';
  sharedQuestion?: mongoose.Types.ObjectId;
  achievement?: {
    type: string;
    milestone: number;
  };
  likesCount: number;
  commentsCount: number;
  isActive: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Export more interfaces as we build them
export interface IUserAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeTaken: number;
  attemptedAt: Date;
  attemptDate: string;
}
