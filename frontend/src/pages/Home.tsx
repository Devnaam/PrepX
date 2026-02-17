import React, { useState } from 'react';
import { PostCard } from '@/components/home/PostCard';
import { CreatePost } from '@/components/home/CreatePost';
import { usePosts } from '@/hooks/usePosts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Loader } from '@/components/common/Loader';
import { Plus, Send } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ==================== HEADER ==================== */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              PrepX
            </h1>
            <button
              onClick={() => setShowCreatePost(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Create post"
            >
              <Send className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
            </button>
          </div>
        </div>
      </div>

      {/* ==================== CONTENT WITH BOTTOM NAV PADDING ==================== */}
      <div className="max-w-2xl mx-auto pb-24">
        {/* Quick Create Post Card - Instagram Stories Style */}
        <div className="px-4 py-4 border-b border-gray-200">
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-[2px] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-sm sm:text-base font-bold">
                  {user?.fullName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm sm:text-base text-gray-500">
                Share something with your community...
              </p>
            </div>
            <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </button>
        </div>

        {/* ==================== POSTS FEED ==================== */}
        {posts.length === 0 ? (
          <div className="text-center px-4 py-16 sm:py-20">
            <div className="mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full border-4 border-gray-200 flex items-center justify-center">
                <Send className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Welcome to PrepX!
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mb-1">
              When you follow people, you'll see their posts here.
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              Start exploring and connect with learners
            </p>
            
            {/* CTA Button */}
            <button
              onClick={() => setShowCreatePost(true)}
              className="mt-6 px-6 py-2 bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold rounded-lg text-sm transition-colors"
            >
              Create your first post
            </button>
          </div>
        ) : (
          <>
            {/* Posts List */}
            <div className="divide-y divide-gray-200">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>

            {/* Load More Trigger */}
            <div
              ref={loadMoreRef}
              className="h-16 sm:h-20 flex items-center justify-center"
            >
              {isLoading && (
                <div className="flex flex-col items-center gap-2">
                  <Loader />
                  <p className="text-xs text-gray-500">Loading more posts...</p>
                </div>
              )}
            </div>

            {/* End of Feed */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center px-4 py-8 sm:py-12">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl">🎉</span>
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                  You're all caught up!
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  You've seen all new posts from the last 3 days
                </p>
              </div>
            )}
          </>
        )}

        {/* ==================== FOOTER SUGGESTIONS (Instagram Style) ==================== */}
        {posts.length > 0 && (
          <div className="px-4 py-6 sm:py-8">
            <div className="text-center space-y-3">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs text-gray-500">
                <a href="#" className="hover:underline">About</a>
                <span>·</span>
                <a href="#" className="hover:underline">Help</a>
                <span>·</span>
                <a href="#" className="hover:underline">Press</a>
                <span>·</span>
                <a href="#" className="hover:underline">API</a>
                <span>·</span>
                <a href="#" className="hover:underline">Privacy</a>
                <span>·</span>
                <a href="#" className="hover:underline">Terms</a>
              </div>
              <p className="text-xs text-gray-400">© 2026 PrepX from Your Team</p>
            </div>
          </div>
        )}
      </div>

      {/* ==================== CREATE POST MODAL ==================== */}
      {showCreatePost && (
        <CreatePost onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  );
};
