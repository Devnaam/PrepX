import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [
        /^[a-z0-9_]+$/,
        'Username can only contain lowercase letters, numbers, and underscores',
      ],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries by default
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },

    // Profile
    profilePicture: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
    targetExam: {
      type: String,
      enum: {
        values: [
          'SSC_CGL',
          'SSC_CHSL',
          'RAILWAYS_NTPC',
          'RAILWAYS_GROUP_D',
          'IBPS_PO',
          'SBI_CLERK',
          'STATE_PSC',
          'DEFENSE',
          'TEACHING',
          'OTHER',
        ],
        message: '{VALUE} is not a valid exam type',
      },
      default: null,
    },

    // Stats
    totalQuestionsAttempted: {
      type: Number,
      default: 0,
      min: [0, 'Questions attempted cannot be negative'],
    },
    totalCorrectAnswers: {
      type: Number,
      default: 0,
      min: [0, 'Correct answers cannot be negative'],
    },
    currentStreak: {
      type: Number,
      default: 0,
      min: [0, 'Streak cannot be negative'],
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: [0, 'Longest streak cannot be negative'],
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },

    // Social
    followersCount: {
      type: Number,
      default: 0,
      min: [0, 'Followers count cannot be negative'],
    },
    followingCount: {
      type: Number,
      default: 0,
      min: [0, 'Following count cannot be negative'],
    },
    postsCount: {
      type: Number,
      default: 0,
      min: [0, 'Posts count cannot be negative'],
    },

    // Privacy Settings
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['EVERYONE', 'FOLLOWERS', 'PRIVATE'],
        default: 'EVERYONE',
      },
      showActivityGraph: {
        type: Boolean,
        default: true,
      },
      showStreak: {
        type: Boolean,
        default: true,
      },
      showQuestionsAttempted: {
        type: Boolean,
        default: true,
      },
      showBadges: {
        type: Boolean,
        default: true,
      },
      showPostedQuestions: {
        type: Boolean,
        default: true,
      },
      showFollowersCount: {
        type: Boolean,
        default: true,
      },
      followApprovalRequired: {
        type: Boolean,
        default: false,
      },
    },

    // Account Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Virtual for overall accuracy
userSchema.virtual('overallAccuracy').get(function () {
  if (this.totalQuestionsAttempted === 0) return 0;
  return Math.round(
    (this.totalCorrectAnswers / this.totalQuestionsAttempted) * 100
  );
});

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash if password is modified
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token method
userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    }
  );
};

// Indexes for performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ currentStreak: -1 }); // For leaderboards

const User = mongoose.model<IUser>('User', userSchema);

export default User;
