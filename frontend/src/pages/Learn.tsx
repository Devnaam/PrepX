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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Learn</h1>
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

          {/* Active Filters Display */}
          {Object.keys(filters).length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
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

      {/* Question Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <QuestionFeed filters={filters} />
      </div>

      {/* Modals */}
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
