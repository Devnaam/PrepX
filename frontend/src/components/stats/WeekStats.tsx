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
      <div className="flex items-center justify-center py-8">
        <Loader />
      </div>
    );
  }

  const stats = data?.data;

  // Prepare chart data
  const chartData = stats?.dailyBreakdown?.map((day: any) => ({
    day: day.dayName.slice(0, 3),
    attempted: day.attempted,
    correct: day.correct,
  }));

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{stats?.totalAttempted || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Total Attempted</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats?.totalCorrect || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Correct</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats?.overallAccuracy || 0}%</p>
          <p className="text-xs text-gray-500 mt-1">Accuracy</p>
        </div>
      </div>

      {/* Weekly Chart */}
      {chartData && chartData.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="attempted" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="correct" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Attempted</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Correct</span>
            </div>
          </div>
        </div>
      )}

      {/* Weakest Topics */}
      {stats?.weakestTopics && stats.weakestTopics.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Topics to Focus On</h3>
          <div className="space-y-2">
            {stats.weakestTopics.slice(0, 5).map((topic: any, index: number) => (
              <div
                key={topic.topic}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{topic.topic}</p>
                    <p className="text-xs text-gray-500">{topic.attempted} questions</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    topic.accuracy < 50 ? 'text-red-600' : 'text-orange-600'
                  }`}
                >
                  {topic.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
