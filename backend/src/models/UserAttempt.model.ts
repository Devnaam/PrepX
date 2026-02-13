import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeTaken: number;
  attemptedAt: Date;
  attemptDate: string;
}

const userAttemptSchema = new Schema<IUserAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    selectedOptionIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    timeTaken: {
      type: Number,
      required: true,
      min: 0,
    },
    attemptedAt: {
      type: Date,
      default: Date.now,
    },
    attemptDate: {
      type: String,
      required: true,
      // Format: 'YYYY-MM-DD'
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound indexes for performance
userAttemptSchema.index({ userId: 1, attemptDate: -1 });
userAttemptSchema.index({ userId: 1, questionId: 1 });
userAttemptSchema.index({ userId: 1, attemptDate: 1, isCorrect: 1 });

const UserAttempt = mongoose.model<IUserAttempt>(
  'UserAttempt',
  userAttemptSchema
);

export default UserAttempt;
