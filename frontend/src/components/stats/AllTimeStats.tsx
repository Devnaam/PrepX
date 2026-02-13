import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { statsService } from '@/services/stats.service';
import { Loader } from '@/components/common/Loader';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export const AllTimeStats: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['stats', 'all-time'],
    queryFn: () => statsService.getAllTimeStats(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader />
      </div>
    );
  }

  const stats = data?.data;

  // Prepare pie chart data
  const pieData = stats?.subjectBreakdown?.map((subject: any) => ({
    name: subject.subject.replace(/_/g, ' '),
    value: subject.attempted,
  }));

  return (
    <div className="space-y-4">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">{stats?.totalAttempted || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Total Questions</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{stats?.overallAccuracy || 0}%</p>
          <p className="text-xs text-gray-500 mt-1">Overall Accuracy</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-orange-600">{stats?.currentStreak || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Current Streak</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{stats?.longestStreak || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Longest Streak</p>
        </div>
      </div>

      {/* Subject Distribution Pie Chart */}
      {pieData && pieData.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Subject Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-xs">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject Details */}
      {stats?.subjectBreakdown && stats.subjectBreakdown.length > 0 && (
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Subject Performance</h3>
          <div className="space-y-3">
            {stats.subjectBreakdown.map((subject: any, index: number) => (
              <div key={subject.subject} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {subject.subject.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {subject.attempted} questions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${subject.accuracy}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                      {subject.accuracy}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
