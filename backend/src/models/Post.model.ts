import mongoose, { Schema, Document } from 'mongoose';

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
  createdAt: Date;
  updatedAt: Date;
}

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
  },
  {
    timestamps: true,
  }
);

// Indexes
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isActive: 1 });

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
