import React, { useState } from 'react';
import { X, Image, Smile } from 'lucide-react';
import { useCreatePost } from '@/hooks/usePosts';
import { useAppSelector } from '@/hooks/useRedux';

interface CreatePostProps {
  onClose: () => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ onClose }) => {
  const { user } = useAppSelector((state) => state.auth);
  const createPost = useCreatePost();
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        postType: 'TEXT',
      });
      setContent('');
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-white w-full h-full sm:h-auto sm:rounded-2xl sm:max-w-lg sm:max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
        {/* ==================== HEADER - INSTAGRAM STYLE ==================== */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>
          <h3 className="text-base font-semibold text-gray-900">New Post</h3>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || createPost.isPending}
            className="text-sm font-semibold text-[#0095f6] hover:text-[#1877f2] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {createPost.isPending ? 'Sharing...' : 'Share'}
          </button>
        </div>

        {/* ==================== CONTENT ==================== */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-[2px] flex-shrink-0">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-sm sm:text-base font-bold">
                    {user?.fullName.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500">@{user?.username}</p>
              </div>
            </div>

            {/* Textarea */}
            <form onSubmit={handleSubmit}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full border-none focus:outline-none focus:ring-0 resize-none text-sm sm:text-base text-gray-900 placeholder:text-gray-400 min-h-[120px] sm:min-h-[150px]"
                maxLength={500}
                autoFocus
              />
            </form>

            {/* Character Count */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Add image (Coming soon)"
                >
                  <Image className="w-5 h-5 text-gray-400" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Add emoji (Coming soon)"
                >
                  <Smile className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <span className={`text-xs font-medium ${
                content.length > 450 
                  ? 'text-red-500' 
                  : content.length > 400 
                  ? 'text-orange-500' 
                  : 'text-gray-400'
              }`}>
                {content.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* ==================== BOTTOM TIPS (OPTIONAL) ==================== */}
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Share your thoughts, questions, or learning tips with the community
          </p>
        </div>
      </div>
    </div>
  );
};
