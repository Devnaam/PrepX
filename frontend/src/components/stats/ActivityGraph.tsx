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
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  const activityData = data?.data?.activityMap || [];
  const monthsData = data?.data?.months || [];

  // Calculate activity stats
  const totalDays = activityData.length;
  const activeDays = activityData.filter((day: any) => day.count > 0).length;
  const maxCount = Math.max(...activityData.map((d: any) => d.count), 1);

  const getActivityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    const intensity = Math.ceil((count / maxCount) * 4);
    const colors = [
      'bg-blue-100',
      'bg-blue-300',
      'bg-blue-500',
      'bg-blue-700',
    ];
    return colors[intensity - 1] || colors[3];
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {activeDays}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Days Active
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-[#0095f6] mb-1">
            {Math.round((activeDays / totalDays) * 100)}%
          </p>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Consistency
          </p>
        </div>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Activity in last 6 months
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-100"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-300"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
              <div className="w-3 h-3 rounded-sm bg-blue-700"></div>
            </div>
            <span className="text-xs text-gray-500">More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="inline-flex flex-col gap-1 min-w-full">
            {/* Month labels */}
            <div className="flex gap-1 mb-2">
              {monthsData.map((month: any, idx: number) => (
                <div
                  key={idx}
                  className="text-xs text-gray-500 font-medium"
                  style={{ width: `${month.weeks * 14}px` }}
                >
                  {month.name}
                </div>
              ))}
            </div>

            {/* Week rows */}
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div key={dayIndex} className="flex gap-1">
                  {activityData
                    .filter((_: any, i: number) => i % 7 === dayIndex)
                    .map((day: any, weekIndex: number) => (
                      <div
                        key={`${dayIndex}-${weekIndex}`}
                        className={cn(
                          'w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm cursor-pointer hover:ring-2 hover:ring-[#0095f6] hover:ring-offset-1 transition-all',
                          getActivityColor(day.count)
                        )}
                        title={`${day.date}: ${day.count} questions`}
                      />
                    ))}
                </div>
              ))}
            </div>

            {/* Day labels */}
            <div className="flex mt-2 text-xs text-gray-500">
              <div className="w-14">Mon</div>
              <div className="w-14">Wed</div>
              <div className="w-14">Fri</div>
            </div>
          </div>
        </div>

        {/* Total contributions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900">
              {activityData.reduce((sum: number, day: any) => sum + day.count, 0)}
            </span>{' '}
            questions in the last 6 months
          </p>
        </div>
      </div>
    </div>
  );
};
