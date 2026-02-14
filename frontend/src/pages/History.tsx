import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { historyService, HistoryFilters } from '@/services/history.service';
import { HistoryCard } from '@/components/history/HistoryCard';
import { AttemptModal } from '@/components/history/AttemptModal';
import { Loader } from '@/components/common/Loader';
import { Filter, Trash2, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<HistoryFilters>({ result: 'all' });
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [showAttemptModal, setShowAttemptModal] = useState(false);

  const { data: historyData, isLoading, refetch } = useQuery({
    queryKey: ['history', filters],
    queryFn: () => historyService.getHistory(filters),
  });

  const { data: statsData } = useQuery({
    queryKey: ['history-stats'],
    queryFn: () => historyService.getHistoryStats(),
  });

  const handleViewAttempt = async (attempt: any) => {
    try {
      const response = await historyService.getAttemptDetails(attempt._id);
      setSelectedAttempt(response.attempt);
      setShowAttemptModal(true);
    } catch (error) {
      toast.error('Failed to load attempt details');
    }
  };

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        'Are you sure you want to clear your history? This cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await historyService.clearHistory(filters.result);
      refetch();
      toast.success('History cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  const handleRetry = (questionId: string) => {
    navigate(`/learn?question=${questionId}`);
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
              <h1 className="text-2xl font-bold text-gray-900">History</h1>
              <p className="text-sm text-gray-500">
                {statsData?.totalAttempts || 0} total attempts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
              {statsData?.totalAttempts > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'correct', label: 'Correct' },
              { id: 'incorrect', label: 'Incorrect' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilters({ ...filters, result: tab.id as any })}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                  filters.result === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stats Summary */}
          {statsData && statsData.totalAttempts > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {statsData.correctAttempts}
                </p>
                <p className="text-xs text-gray-500">Correct</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold text-red-600">
                  {statsData.incorrectAttempts}
                </p>
                <p className="text-xs text-gray-500">Incorrect</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-2xl font-bold text-primary-600">
                  {statsData.overallAccuracy}%
                </p>
                <p className="text-xs text-gray-500">Accuracy</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {historyData?.attempts?.length === 0 ? (
          <div className="text-center py-20">
            <Clock className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">No history yet</p>
            <p className="text-sm text-gray-500">
              Start practicing to build your history!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyData?.attempts?.map((attempt: any) => (
              <HistoryCard
                key={attempt._id}
                attempt={attempt}
                onClick={() => handleViewAttempt(attempt)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Attempt Modal */}
      {showAttemptModal && selectedAttempt && (
        <AttemptModal
          attempt={selectedAttempt}
          onClose={() => {
            setShowAttemptModal(false);
            setSelectedAttempt(null);
          }}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
};
