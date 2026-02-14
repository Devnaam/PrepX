import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Loader } from '@/components/common/Loader';
import {
  Users,
  FileQuestion,
  Activity,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminService.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  const overview = dashboardData?.overview;
  const recentUsers = dashboardData?.recentUsers;
  const userGrowth = dashboardData?.userGrowth;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to prepX Admin Panel
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {overview?.totalUsers?.toLocaleString() || 0}
              </p>
              {overview?.totalUsersToday > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  +{overview?.totalUsersToday} today
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Questions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Questions</p>
              <p className="text-3xl font-bold text-gray-900">
                {overview?.totalQuestions?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileQuestion className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Active Users Today */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Today</p>
              <p className="text-3xl font-bold text-gray-900">
                {overview?.activeUsersToday?.toLocaleString() || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Questions */}
        <Link
          to="/admin/questions?status=pending"
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
              <p className="text-3xl font-bold text-gray-900">
                {overview?.pendingQuestions?.toLocaleString() || 0}
              </p>
              {overview?.pendingQuestions > 0 && (
                <p className="text-sm text-orange-600 mt-1">Needs review</p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Users
            </h2>
            <Link
              to="/admin/users"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {recentUsers?.map((user: any) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{user.fullName}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}

            {(!recentUsers || recentUsers.length === 0) && (
              <p className="text-center text-gray-500 py-8">No recent users</p>
            )}
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              User Growth (Last 7 Days)
            </h2>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>

          <div className="space-y-2">
            {userGrowth?.map((day: any) => (
              <div key={day._id} className="flex items-center gap-3">
                <p className="text-sm text-gray-600 w-24">
                  {new Date(day._id).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-primary-600 h-full rounded-full flex items-center justify-end px-2"
                    style={{
                      width: `${Math.min((day.count / 20) * 100, 100)}%`,
                    }}
                  >
                    <span className="text-xs font-medium text-white">
                      {day.count}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {(!userGrowth || userGrowth.length === 0) && (
              <p className="text-center text-gray-500 py-8">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/questions?status=pending"
            className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
          >
            <AlertCircle className="w-8 h-8 text-orange-600" />
            <div>
              <p className="font-medium text-gray-900">Review Questions</p>
              <p className="text-sm text-gray-600">
                {overview?.pendingQuestions} pending
              </p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Manage Users</p>
              <p className="text-sm text-gray-600">
                {overview?.totalUsers} total
              </p>
            </div>
          </Link>

          <Link
            to="/admin/analytics"
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200"
          >
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Insights & trends</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Total Attempts */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-sm p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">Total Question Attempts</h2>
        <p className="text-4xl font-bold">
          {overview?.totalAttempts?.toLocaleString() || 0}
        </p>
        <p className="text-primary-100 mt-2">
          Across all users and questions
        </p>
      </div>
    </div>
  );
};
