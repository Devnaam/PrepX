import React, { useState } from 'react';
import { PostCard } from '@/components/home/PostCard';
import { CreatePost } from '@/components/home/CreatePost';
import { usePosts } from '@/hooks/usePosts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Loader } from '@/components/common/Loader';
import { Plus } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';

export const Home: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { posts, isLoading, hasMore, loadMore } = usePosts();
  const [showCreatePost, setShowCreatePost] = useState(false);

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Home</h1>
            <button
              onClick={() => setShowCreatePost(true)}
              className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Quick Create Post Card */}
        <div
          onClick={() => setShowCreatePost(true)}
          className="card p-4 mb-4 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <p className="flex-1 text-gray-500">What's on your mind?</p>
          </div>
        </div>

        {/* Posts Feed */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🏠</p>
            <p className="text-xl text-gray-600 mb-2">No posts yet</p>
            <p className="text-sm text-gray-500">
              Follow users to see their posts here!
            </p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}

            {/* Load More Trigger */}
            <div
              ref={loadMoreRef}
              className="h-20 flex items-center justify-center"
            >
              {isLoading && <Loader />}
            </div>

            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg font-semibold">You're all caught up! 🎉</p>
                <p className="text-sm mt-2">Check back later for more posts</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
};
