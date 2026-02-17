import React, { useState } from 'react';
import { Post } from '@/types';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
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
  const [showMenu, setShowMenu] = useState(false);

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
      setShowMenu(false);
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
    <article className="bg-white py-3 sm:py-4">
      {/* ==================== HEADER ==================== */}
      <div className="px-4 flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Profile Picture */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-[2px] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-white p-[2px]">
              <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                {post.author.fullName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Author Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {post.author.username}
              </p>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }).replace('about ', '')}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-900" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[160px] z-50">
                {isOwnPost ? (
                  <>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        alert('Report coming soon');
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 transition-colors"
                    >
                      Report
                    </button>
                    <button
                      onClick={() => setShowMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==================== CONTENT ==================== */}
      <div className="px-4 mb-3">
        <p className="text-sm sm:text-base text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      {/* ==================== ACHIEVEMENT BADGE ==================== */}
      {post.postType === 'ACHIEVEMENT' && post.achievement && (
        <div className="px-4 mb-3">
          <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl flex-shrink-0">
                {getAchievementEmoji(post.achievement.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 mb-0.5">
                  Achievement Unlocked!
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
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
        </div>
      )}

      {/* ==================== SHARED QUESTION ==================== */}
      {post.postType === 'QUESTION_SHARE' && post.sharedQuestion && (
        <div className="px-4 mb-3">
          <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-600 text-white rounded">
                {post.sharedQuestion.subject.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-gray-600 truncate">
                {post.sharedQuestion.topic}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-900 line-clamp-3">
              {post.sharedQuestion.questionText}
            </p>
          </div>
        </div>
      )}

      {/* ==================== ACTION BUTTONS ==================== */}
      <div className="px-4 mb-2">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={toggleLike.isPending}
            className="p-1 hover:opacity-60 transition-opacity disabled:opacity-40"
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={cn(
                'w-6 h-6 sm:w-7 sm:h-7',
                isLiked ? 'fill-red-500 text-red-500' : 'text-gray-900'
              )}
            />
          </button>

          {/* Comment Button */}
          <button
            className="p-1 hover:opacity-60 transition-opacity"
            aria-label="Comment"
          >
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900" />
          </button>

          {/* Share Button */}
          <button
            className="p-1 hover:opacity-60 transition-opacity"
            aria-label="Share"
          >
            <Share2 className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900" />
          </button>

          {/* Bookmark Button (Right Aligned) */}
          <button
            className="p-1 hover:opacity-60 transition-opacity ml-auto"
            aria-label="Save"
          >
            <Bookmark className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900" />
          </button>
        </div>
      </div>

      {/* ==================== LIKES COUNT ==================== */}
      <div className="px-4">
        {likesCount > 0 && (
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Comments Preview */}
        {post.commentsCount > 0 && (
          <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            View all {post.commentsCount} comment{post.commentsCount !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    </article>
  );
};
