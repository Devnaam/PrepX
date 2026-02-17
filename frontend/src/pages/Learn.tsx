import React, { useState } from 'react';
import { QuestionFeed } from '@/components/learn/QuestionFeed';
import { FilterModal } from '@/components/learn/FilterModal';
import { CreateQuestionForm } from '@/components/learn/CreateQuestionForm';
import { SlidersHorizontal, Plus, X } from 'lucide-react';

export const Learn: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [filters, setFilters] = useState<any>({});

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="h-dvh flex flex-col bg-white overflow-hidden">
      {/* ==================== TOP HEADER ==================== */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              Questions
            </h1>
            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Filters"
              >
                <SlidersHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0095f6] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Create Question Button */}
              <button
                onClick={() => setShowCreateQuestion(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Create question"
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              </button>
            </div>
          </div>

          {/* Active Filters Chips */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mt-3 pb-1">
              {Object.entries(filters).map(([key, value]: any) => (
                <div
                  key={key}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full"
                >
                  <span className="text-xs font-medium text-gray-900">
                    {key}: {value}
                  </span>
                  <button
                    onClick={() => {
                      const newFilters = { ...filters };
                      delete newFilters[key];
                      setFilters(newFilters);
                    }}
                    className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${key} filter`}
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setFilters({})}
                className="flex-shrink-0 text-xs font-semibold text-[#0095f6] hover:text-[#1877f2] px-2"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ==================== QUESTION FEED - REEL STYLE ==================== */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth touch-pan-y pb-24 scrollbar-hide"
          style={{ 
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <QuestionFeed filters={filters} />
        </div>
      </div>

      {/* ==================== MODALS ==================== */}
      {showFilters && (
        <FilterModal
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          currentFilters={filters}
        />
      )}

      {showCreateQuestion && (
        <CreateQuestionForm onClose={() => setShowCreateQuestion(false)} />
      )}
    </div>
  );
};
