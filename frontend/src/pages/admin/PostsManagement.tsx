import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Loader } from '@/components/common/Loader';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const PostsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('all');

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['admin-posts', status],
    queryFn: () => adminService.getAllPosts({ status, limit: 50 }),
  });

  // Toggle hide mutation
  const toggleHideMutation = useMutation({
    mutationFn: adminService.toggleHidePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast.success('Post updated successfully');
    },
    onError: () => {
      toast.error('Failed to update post');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: adminService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      toast.success('Post deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete post');
    },
  });

  const posts = postsData?.posts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Content Moderation
        </h1>
        <p className="text-gray-600 mt-1">Manage posts and content</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex gap-2">
          {['all', 'reported', 'hidden'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                status === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No posts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any) => (
            <div
              key={post._id}
              className={cn(
                'bg-white rounded-xl shadow-sm border p-6',
                post.isHidden ? 'border-red-300 bg-red-50' : 'border-gray-200'
              )}
            >
              {/* Author */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold">
                    {post.author?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {post.author?.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{post.author?.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {post.isHidden && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      Hidden
                    </span>
                  )}
                  {post.isReported && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                      Reported
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {post.postType}
                </span>
                <p className="text-gray-900 mt-2">{post.content?.text}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <span>❤️ {post.likesCount} likes</span>
                <span>💬 {post.commentsCount} comments</span>
                <span>
                  📅 {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleHideMutation.mutate(post._id)}
                  disabled={toggleHideMutation.isPending}
                  className={cn(
                    'btn-sm',
                    post.isHidden ? 'btn-success' : 'btn-warning'
                  )}
                >
                  {post.isHidden ? (
                    <>
                      <Eye className="w-4 h-4" />
                      Unhide
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Delete this post permanently?')) {
                      deleteMutation.mutate(post._id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="btn-danger btn-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
