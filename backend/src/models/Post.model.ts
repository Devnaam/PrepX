import mongoose, { Schema } from 'mongoose';
import { IPost } from '../types';

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Content cannot exceed 500 characters'],
    },
    postType: {
      type: String,
      enum: ['TEXT', 'QUESTION_SHARE', 'ACHIEVEMENT'],
      required: true,
    },
    sharedQuestion: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
    },
    achievement: {
      type: {
        type: String,
        enum: ['STREAK', 'QUESTIONS', 'ACCURACY'],
      },
      milestone: Number,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isActive: 1 });
postSchema.index({ isHidden: 1 });

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
