import React, { useState } from 'react';
import { QuestionFeed } from '@/components/learn/QuestionFeed';
import { FilterModal } from '@/components/learn/FilterModal';
import { CreateQuestionForm } from '@/components/learn/CreateQuestionForm';
import { Filter, Plus } from 'lucide-react';

export const Learn: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateQuestion, setShowCreateQuestion] = useState(false);
  const [filters, setFilters] = useState({});

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  return (
    <div className="h-dvh flex flex-col bg-gray-50 overflow-hidden">
      
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Learn
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowCreateQuestion(true)}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {Object.keys(filters).length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span className="text-xs text-gray-500">Filters:</span>
              {Object.entries(filters).map(([key, value]: any) => (
                <span
                  key={key}
                  className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full text-xs font-medium"
                >
                  {key}: {value}
                </span>
              ))}
              <button
                onClick={() => setFilters({})}
                className="text-xs text-red-600 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reel Scroll Area (Now Safe for BottomNav) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          className="
            h-full
            overflow-y-auto
            snap-y
            snap-mandatory
            scroll-smooth
            touch-pan-y
            pb-20   /* 👈 Important: Prevent hiding behind BottomNav */
          "
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <QuestionFeed filters={filters} />
        </div>
      </div>

      {showFilters && (
        <FilterModal
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
          currentFilters={filters}
        />
      )}

      {showCreateQuestion && (
        <CreateQuestionForm
          onClose={() => setShowCreateQuestion(false)}
        />
      )}
    </div>
  );
};
