import mongoose, { Schema, Document } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index to prevent duplicate bookmarks
bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);

export default Bookmark;
