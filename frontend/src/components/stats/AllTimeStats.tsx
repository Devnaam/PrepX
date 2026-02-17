import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/stats.service';
import { Loader } from '@/components/common/Loader';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const COLORS = ['#0095f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export const AllTimeStats: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'all-time'],
    queryFn: () => statsService.getAllTimeStats(),
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

  // Prepare subject distribution data for pie chart
  const subjectData =
    stats.subjectWiseAccuracy?.map((subject: any) => ({
      name: subject.subject.replace(/_/g, ' '),
      value: subject.attempted,
    })) || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {stats.totalAttempted || 0}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Total Questions
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
          <p className="text-2xl sm:text-3xl font-bold text-[#0095f6] mb-1">
            {stats.overallAccuracy || 0}%
          </p>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Overall Accuracy
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
          <p className="text-2xl sm:text-3xl font-bold text-orange-600 mb-1">
            {stats.currentStreak || 0}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Current Streak
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
          <p className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">
            {stats.longestStreak || 0}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Longest Streak
          </p>
        </div>
      </div>

      {/* Subject Distribution Pie Chart */}
      {subjectData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Subject Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {subjectData.map((_: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject-wise Performance */}
      {stats.subjectWiseAccuracy && stats.subjectWiseAccuracy.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Subject Performance
          </h3>
          <div className="space-y-3">
            {stats.subjectWiseAccuracy.map((subject: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {subject.subject.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {subject.accuracy}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0095f6] rounded-full transition-all duration-300"
                    style={{ width: `${subject.accuracy}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {subject.attempted} questions • {subject.correct} correct
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Performance */}
      {stats.difficultyWiseAccuracy &&
        stats.difficultyWiseAccuracy.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Difficulty Performance
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {stats.difficultyWiseAccuracy.map(
                (difficulty: any, index: number) => (
                  <div
                    key={index}
                    className="text-center p-3 bg-gray-50 rounded-lg"
                  >
                    <p className="text-lg font-bold text-gray-900 mb-1">
                      {difficulty.accuracy}%
                    </p>
                    <p className="text-xs text-gray-600 font-medium mb-1">
                      {difficulty.difficulty}
                    </p>
                    <p className="text-xs text-gray-500">
                      {difficulty.attempted} qs
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
};
