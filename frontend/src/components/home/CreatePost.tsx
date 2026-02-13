import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/common/Button';
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Create Post</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold flex-shrink-0">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 border-none focus:ring-0 resize-none text-gray-900 placeholder:text-gray-400"
              rows={5}
              maxLength={500}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {content.length} / 500
            </span>
            <Button
              type="submit"
              disabled={!content.trim() || createPost.isPending}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              Post
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
