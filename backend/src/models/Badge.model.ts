import mongoose, { Schema, Document } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: {
    type: string;
    value: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const badgeSchema = new Schema<IBadge>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    criteria: {
      type: {
        type: String,
        enum: [
          'QUESTIONS_ATTEMPTED',
          'QUESTIONS_CORRECT',
          'STREAK_DAYS',
          'ACCURACY_PERCENTAGE',
          'POSTS_CREATED',
          'FOLLOWERS_COUNT',
        ],
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
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

export default mongoose.model<IBadge>('Badge', badgeSchema);
