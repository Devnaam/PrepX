import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { QuestionFeed } from '@/components/learn/QuestionFeed';
import { FilterModal } from '@/components/learn/FilterModal';
import { Button } from '@/components/common/Button';

export const Learn: React.FC = () => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({});

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary-600">PrepX</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilterModal(true)}
          >
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Question Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <QuestionFeed filters={filters} />
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
    </div>
  );
};
