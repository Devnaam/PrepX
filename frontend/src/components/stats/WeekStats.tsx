import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/stats.service';
import { Loader } from '@/components/common/Loader';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const WeekStats: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'week'],
    queryFn: () => statsService.getWeekStats(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  const stats = data?.data;

  if (!stats) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {stats.totalAttempted || 0}
          </p>
          <p className="text-xs text-gray-500 font-medium">Attempted</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
            {stats.totalCorrect || 0}
          </p>
          <p className="text-xs text-gray-500 font-medium">Correct</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
            {stats.overallAccuracy || 0}%
          </p>
          <p className="text-xs text-gray-500 font-medium">Accuracy</p>
        </div>
      </div>

      {/* Daily Activity Chart */}
      {stats.dailyActivity && stats.dailyActivity.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Daily Activity
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#e5e7eb"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                stroke="#e5e7eb"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="attempted" fill="#0095f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Topics */}
      {stats.topTopics && stats.topTopics.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Top Topics
          </h3>
          <div className="space-y-2">
            {stats.topTopics.slice(0, 5).map((topic: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0095f6] text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-900 font-medium truncate">
                    {topic.topic}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium ml-2">
                  {topic.attempted} questions
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
