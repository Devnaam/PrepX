import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/stats.service';
import { Loader } from '@/components/common/Loader';
import { Clock, Target, CheckCircle, TrendingUp } from 'lucide-react';

export const TodayStats: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'today'],
    queryFn: () => statsService.getTodayStats(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader />
      </div>
    );
  }

  const stats = data?.data;

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.attempted || 0}</p>
              <p className="text-xs text-gray-500">Attempted</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.correct || 0}</p>
              <p className="text-xs text-gray-500">Correct</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.accuracy || 0}%</p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats?.timeSpent || 0}</p>
              <p className="text-xs text-gray-500">Minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      {stats?.subjectBreakdown && stats.subjectBreakdown.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Subject Breakdown</h3>
          <div className="space-y-2">
            {stats.subjectBreakdown.map((subject: any) => (
              <div key={subject.subject} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {subject.subject.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {subject.attempted} questions
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${subject.accuracy}%` }}
                    />
                  </div>
                </div>
                <span className="ml-3 text-sm font-semibold text-gray-900">
                  {subject.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.attempted === 0 && (
        <div className="card p-8 text-center">
          <p className="text-6xl mb-4">📚</p>
          <p className="text-gray-600 mb-2">No activity today</p>
          <p className="text-sm text-gray-500">Start practicing to see your stats!</p>
        </div>
      )}
    </div>
  );
};
