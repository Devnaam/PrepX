import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Loader } from '@/components/common/Loader';
import { TrendingUp, Users, Activity } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [userDays, setUserDays] = useState(30);
  const [engagementDays, setEngagementDays] = useState(7);

  const { data: userAnalytics, isLoading: userLoading } = useQuery({
    queryKey: ['admin-user-analytics', userDays],
    queryFn: () => adminService.getUserAnalytics(userDays),
  });

  const { data: engagementAnalytics, isLoading: engagementLoading } = useQuery({
    queryKey: ['admin-engagement-analytics', engagementDays],
    queryFn: () => adminService.getEngagementAnalytics(engagementDays),
  });

  const { data: questionAnalytics, isLoading: questionLoading } = useQuery({
    queryKey: ['admin-question-analytics'],
    queryFn: () => adminService.getQuestionAnalytics(),
  });

  const isLoading = userLoading || engagementLoading || questionLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Platform insights and metrics</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Users</p>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {userAnalytics?.stats?.totalUsers?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Active Users</p>
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {userAnalytics?.stats?.activeUsers?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Banned Users</p>
                <Users className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {userAnalytics?.stats?.bannedUsers?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Verified Users</p>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {userAnalytics?.stats?.verifiedUsers?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                User Growth
              </h2>
              <select
                value={userDays}
                onChange={(e) => setUserDays(Number(e.target.value))}
                className="input w-32"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            <div className="space-y-3">
              {userAnalytics?.userGrowth?.map((day: any) => (
                <div key={day._id} className="flex items-center gap-3">
                  <p className="text-sm text-gray-600 w-24">
                    {new Date(day._id).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full rounded-full flex items-center justify-end px-3"
                      style={{
                        width: `${Math.min((day.count / 50) * 100, 100)}%`,
                      }}
                    >
                      <span className="text-sm font-medium text-white">
                        {day.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question Attempts Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Question Attempts
              </h2>
              <select
                value={engagementDays}
                onChange={(e) => setEngagementDays(Number(e.target.value))}
                className="input w-32"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>

            <div className="space-y-3">
              {engagementAnalytics?.questionAttempts?.map((day: any) => (
                <div key={day._id} className="flex items-center gap-3">
                  <p className="text-sm text-gray-600 w-24">
                    {new Date(day._id).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full flex items-center justify-end px-2"
                          style={{
                            width: `${Math.min(
                              (day.attempts / 500) * 100,
                              100
                            )}%`,
                          }}
                        >
                          <span className="text-xs font-medium text-white">
                            {day.attempts}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 w-16">
                        {Math.round((day.correct / day.attempts) * 100)}% acc
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Subject Performance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questionAnalytics?.subjectBreakdown?.map((subject: any) => (
                <div
                  key={subject._id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {subject.subject.replace(/_/g, ' ')}
                    </h3>
                    <span className="text-sm font-medium text-primary-600">
                      {subject.accuracy}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Questions</p>
                      <p className="font-medium text-gray-900">
                        {subject.total}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Attempts</p>
                      <p className="font-medium text-gray-900">
                        {subject.totalAttempts}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Attempted Questions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Most Attempted Questions
            </h2>

            <div className="space-y-3">
              {questionAnalytics?.mostAttempted?.slice(0, 5).map((q: any) => (
                <div
                  key={q._id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <p className="text-sm text-gray-900 mb-2 line-clamp-2">
                    {q.questionText}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {q.subject}
                    </span>
                    <span>{q.totalAttempts} attempts</span>
                    <span>
                      {Math.round((q.correctAttempts / q.totalAttempts) * 100)}%
                      accuracy
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
