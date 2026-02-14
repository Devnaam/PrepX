import React from 'react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LeaderboardCardProps {
  user: any;
  rank: number;
  stats: {
    totalAttempts?: number;
    correctAnswers?: number;
    accuracy: number;
    currentStreak?: number;
  };
  isCurrentUser?: boolean;
  showWeeklyBadge?: boolean;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  user,
  rank,
  stats,
  isCurrentUser = false,
  showWeeklyBadge = false,
}) => {
  const getRankIcon = () => {
    if (rank === 1)
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2)
      return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3)
      return <Award className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankColor = () => {
    if (rank === 1) return 'text-yellow-600 bg-yellow-50';
    if (rank === 2) return 'text-gray-600 bg-gray-50';
    if (rank === 3) return 'text-orange-600 bg-orange-50';
    return 'text-gray-700 bg-gray-50';
  };

  return (
    <div
      className={cn(
        'card p-4 transition-all hover:shadow-md',
        isCurrentUser && 'ring-2 ring-primary-500 bg-primary-50',
        rank <= 3 && 'border-2',
        rank === 1 && 'border-yellow-400',
        rank === 2 && 'border-gray-400',
        rank === 3 && 'border-orange-400'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg',
            getRankColor()
          )}
        >
          {rank <= 3 ? getRankIcon() : `#${rank}`}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900 truncate">
              {user?.fullName || 'Unknown User'}
            </p>
            {isCurrentUser && (
              <span className="px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded-full">
                You
              </span>
            )}
            {showWeeklyBadge && rank === 1 && (
              <TrendingUp className="w-4 h-4 text-green-500" />
            )}
          </div>
          <p className="text-sm text-gray-500">@{user?.username || 'unknown'}</p>
        </div>

        {/* Stats */}
        <div className="text-right">
          <p className="text-2xl font-bold text-primary-600">
            {stats.accuracy}%
          </p>
          <p className="text-xs text-gray-500">
            {stats.totalAttempts || stats.correctAnswers || 0} questions
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      {(stats.currentStreak !== undefined || stats.correctAnswers !== undefined) && (
        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
          {stats.correctAnswers !== undefined && (
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">
                {stats.correctAnswers}
              </p>
              <p className="text-xs text-gray-500">Correct</p>
            </div>
          )}
          {stats.currentStreak !== undefined && (
            <div className="text-center">
              <p className="text-lg font-bold text-orange-600">
                {stats.currentStreak}
              </p>
              <p className="text-xs text-gray-500">Streak</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
