import React, { useState } from 'react';
import { useBookmarks, useBookmarkStats } from '@/hooks/useBookmarks';
import { MCQCard } from '@/components/learn/MCQCard';
import { Loader } from '@/components/common/Loader';
import { Filter, Trash2, Bookmark as BookmarkIcon } from 'lucide-react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { bookmarkService } from '@/services/bookmark.service';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

export const Bookmarks: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({});
  const { data: bookmarksData, isLoading } = useBookmarks(filters);
  const { data: statsData } = useBookmarkStats();

  const handleClearAll = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear all bookmarks? This cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await bookmarkService.clearAllBookmarks();
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success('All bookmarks cleared');
    } catch (error: any) {
      toast.error('Failed to clear bookmarks');
    }
  };

  if (isLoading) {
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
              <p className="text-sm text-gray-500">
                {statsData?.total || 0} saved questions
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
              {statsData?.total > 0 && (
                <button
                  onClick={handleClearAll}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          {statsData && statsData.total > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {statsData.total}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {statsData.difficultyBreakdown?.EASY || 0}
                </p>
                <p className="text-xs text-gray-500">Easy</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {statsData.difficultyBreakdown?.HARD || 0}
                </p>
                <p className="text-xs text-gray-500">Hard</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {bookmarksData?.questions?.length === 0 ? (
          <div className="text-center py-20">
            <BookmarkIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No bookmarks yet</p>
            <p className="text-sm text-gray-500">
              Save questions to review them later!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarksData?.questions?.map((question: any) => (
              <MCQCard
                key={question._id}
                question={question}
                onAnswer={async () => {}}
                isSubmitting={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
