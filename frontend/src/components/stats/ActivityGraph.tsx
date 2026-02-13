import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/stats.service';
import { Loader } from '@/components/common/Loader';
import { cn } from '@/utils/cn';

export const ActivityGraph: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'activity'],
    queryFn: () => statsService.getActivityGraph(6),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader />
      </div>
    );
  }

  const activities = data?.data?.activities || [];
  const activeDays = data?.data?.activeDays || 0;
  const totalDays = data?.data?.totalDays || 0;

  // Group by weeks
  const weeks: any[][] = [];
  for (let i = 0; i < activities.length; i += 7) {
    weeks.push(activities.slice(i, i + 7));
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-gray-100';
      case 1:
        return 'bg-green-200';
      case 2:
        return 'bg-green-400';
      case 3:
        return 'bg-green-600';
      case 4:
        return 'bg-green-800';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Activity Graph</h3>
          <div className="text-sm text-gray-500">
            {activeDays} / {totalDays} days active
          </div>
        </div>

        {/* Activity Grid */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={cn(
                      'w-3 h-3 rounded-sm',
                      getLevelColor(day.level)
                    )}
                    title={`${day.date}: ${day.count} questions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
            <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Streak Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl mb-1">🔥</p>
          <p className="text-2xl font-bold text-orange-600">{activeDays}</p>
          <p className="text-xs text-gray-500 mt-1">Days Active</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl mb-1">⚡</p>
          <p className="text-2xl font-bold text-yellow-600">
            {Math.round((activeDays / totalDays) * 100)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Consistency</p>
        </div>
      </div>
    </div>
  );
};
