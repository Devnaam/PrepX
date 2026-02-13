import mongoose, { Schema } from 'mongoose';
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
      min: [0, 'Correct option index must be between 0 and 3'],
      max: [3, 'Correct option index must be between 0 and 3'],
    },
    explanation: {
      type: String,
      required: [true, 'Explanation is required'],
      trim: true,
      maxlength: [1000, 'Explanation cannot exceed 1000 characters'],
    },

    // Classification
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      enum: {
        values: [
          'GENERAL_KNOWLEDGE',
          'GENERAL_SCIENCE',
          'MATHEMATICS',
          'ENGLISH',
          'REASONING',
          'COMPUTER',
          'CURRENT_AFFAIRS',
        ],
        message: '{VALUE} is not a valid subject',
      },
    },
    topic: {
      type: String,
      required: [true, 'Topic is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: {
        values: ['EASY', 'MEDIUM', 'HARD'],
        message: '{VALUE} is not a valid difficulty level',
      },
    },

    // Exam Association
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
        ],
      },
    ],

    // Source & Quality
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

    // Engagement Stats
    totalAttempts: {
      type: Number,
      default: 0,
      min: [0, 'Total attempts cannot be negative'],
    },
    correctAttempts: {
      type: Number,
      default: 0,
      min: [0, 'Correct attempts cannot be negative'],
    },

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for accuracy percentage
questionSchema.virtual('accuracyPercentage').get(function () {
  if (this.totalAttempts === 0) return 0;
  return Math.round((this.correctAttempts / this.totalAttempts) * 100);
});

// Indexes for performance
questionSchema.index({ subject: 1, topic: 1, difficulty: 1 });
questionSchema.index({ isApproved: 1, isActive: 1 });
questionSchema.index({ createdBy: 1 });
questionSchema.index({ examTypes: 1 });
questionSchema.index({ createdAt: -1 });

// Validation: Exactly 4 options (FIXED)
questionSchema.pre('validate', function () {
  if (this.options.length !== 4) {
    throw new Error('Question must have exactly 4 options');
  }
});

const Question = mongoose.model<IQuestion>('Question', questionSchema);

export default Question;
