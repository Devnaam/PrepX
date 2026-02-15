import mongoose, { Schema, CallbackError } from 'mongoose';
import { IQuestion } from '../types';

const questionSchema = new Schema<IQuestion>(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [500, 'Question text cannot exceed 500 characters'],
    },
    options: [
      {
        optionText: {
          type: String,
          required: true,
          trim: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
      },
    ],
    correctOptionIndex: {
      type: Number,
      required: [true, 'Correct option index is required'],
      min: [0, 'Correct option index must be between 0-3'],
      max: [3, 'Correct option index must be between 0-3'],
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
      trim: true,
      maxlength: [1000, 'Explanation cannot exceed 1000 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: {
        values: [
          'MATHEMATICS',
          'REASONING',
          'ENGLISH',
          'GENERAL_KNOWLEDGE',
          'CURRENT_AFFAIRS',
          'SCIENCE',
          'HISTORY',
          'GEOGRAPHY',
          'POLITY',
          'ECONOMICS',
        ],
        message: '{VALUE} is not a valid subject',
      },
      uppercase: true,
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
      maxlength: [100, 'Topic cannot exceed 100 characters'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['EASY', 'MEDIUM', 'HARD'],
        message: '{VALUE} is not a valid difficulty level',
      },
      uppercase: true,
    },
    examTypes: [
      {
        type: String,
        enum: [
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
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAdminCreated: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    totalAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    correctAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for accuracy percentage
questionSchema.virtual('accuracyPercentage').get(function () {
  if (this.totalAttempts === 0) return 0;
  return Math.round((this.correctAttempts / this.totalAttempts) * 100);
});

// Validation: Ensure exactly 4 options
questionSchema.pre('save', function (next: (err?: CallbackError) => void) {
  if (this.options.length !== 4) {
    return next(new Error('Question must have exactly 4 options') as CallbackError);
  }
  next();
});

// Indexes for performance
questionSchema.index({ subject: 1, difficulty: 1 });
questionSchema.index({ createdBy: 1 });
questionSchema.index({ isApproved: 1, isActive: 1 });
questionSchema.index({ examTypes: 1 });
questionSchema.index({ createdAt: -1 });

const Question = mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
