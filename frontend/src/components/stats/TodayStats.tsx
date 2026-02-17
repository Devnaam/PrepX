import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/stats.service';
import { Loader } from '@/components/common/Loader';
import { Target, CheckCircle, TrendingUp, Clock } from 'lucide-react';

export const TodayStats: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'today'],
    queryFn: () => statsService.getTodayStats(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  const stats = data?.data;

  if (!stats || stats.attempted === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Target className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          No activity today
        </h3>
        <p className="text-sm text-gray-500">
          Start practicing to see your stats!
        </p>
      </div>
    );
  }

  const statCards = [
    {
      icon: Target,
      value: stats.attempted || 0,
      label: 'Attempted',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: CheckCircle,
      value: stats.correct || 0,
      label: 'Correct',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: TrendingUp,
      value: `${stats.accuracy || 0}%`,
      label: 'Accuracy',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Clock,
      value: stats.timeSpent || 0,
      label: 'Minutes',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${stat.bgColor} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              {stat.value}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Performance Message */}
      {stats.accuracy >= 80 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
            <span className="text-lg">🎉</span>
            Great job today! Keep up the excellent work!
          </p>
        </div>
      )}

      {stats.accuracy < 50 && stats.attempted >= 5 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
            <span className="text-lg">💪</span>
            Keep practicing! You're building your skills!
          </p>
        </div>
      )}
    </div>
  );
};
