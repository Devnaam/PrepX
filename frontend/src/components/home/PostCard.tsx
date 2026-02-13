import React, { useState } from 'react';
import { Post } from '@/types';
import { Heart, MessageCircle, Trash2, Share2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToggleLike, useDeletePost } from '@/hooks/usePosts';
import { useAppSelector } from '@/hooks/useRedux';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const toggleLike = useToggleLike();
  const deletePost = useDeletePost();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  const handleLike = async () => {
    try {
      const result = await toggleLike.mutateAsync(post._id);
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deletePost.mutateAsync(post._id);
    }
  };

  const isOwnPost = currentUser?._id === post.author._id;

  const getAchievementEmoji = (type: string) => {
    switch (type) {
      case 'STREAK':
        return '🔥';
      case 'QUESTIONS':
        return '📚';
      case 'ACCURACY':
        return '🎯';
      default:
        return '🏆';
    }
  };

  return (
    <div className="card p-4 mb-4">
      {/* Author Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold">
            {post.author.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{post.author.fullName}</p>
            <p className="text-xs text-gray-500">
              @{post.author.username} •{' '}
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>

        {isOwnPost && (
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Achievement Badge */}
      {post.postType === 'ACHIEVEMENT' && post.achievement && (
        <div className="mb-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl">
              {getAchievementEmoji(post.achievement.type)}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Achievement Unlocked!
              </p>
              <p className="text-xs text-gray-600">
                {post.achievement.type === 'STREAK' &&
                  `${post.achievement.milestone} day streak!`}
                {post.achievement.type === 'QUESTIONS' &&
                  `${post.achievement.milestone} questions answered!`}
                {post.achievement.type === 'ACCURACY' &&
                  `${post.achievement.milestone}% accuracy!`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shared Question */}
      {post.postType === 'QUESTION_SHARE' && post.sharedQuestion && (
        <div className="mb-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
              {post.sharedQuestion.subject.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-gray-500">
              {post.sharedQuestion.topic}
            </span>
          </div>
          <p className="text-sm text-gray-900 line-clamp-2">
            {post.sharedQuestion.questionText}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-200">
        <button
          onClick={handleLike}
          disabled={toggleLike.isPending}
          className={cn(
            'flex items-center gap-2 transition-colors',
            isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
          )}
        >
          <Heart
            className={cn('w-5 h-5', isLiked && 'fill-current')}
          />
          <span className="text-sm font-medium">{likesCount}</span>
        </button>

        <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.commentsCount}</span>
        </button>

        <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors ml-auto">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
