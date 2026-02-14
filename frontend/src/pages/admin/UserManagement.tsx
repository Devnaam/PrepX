import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Loader } from '@/components/common/Loader';
import { Search, Ban, UserCheck, Eye } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export const UserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('all'); // 'all', 'active', 'banned'
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', searchQuery, status],
    queryFn: () =>
      adminService.getAllUsers({
        search: searchQuery,
        status,
        limit: 50,
      }),
  });

  // Get user details
  const { data: userDetails, isLoading: detailsLoading } = useQuery({
    queryKey: ['admin-user-details', selectedUser?._id],
    queryFn: () => adminService.getUserDetails(selectedUser._id),
    enabled: !!selectedUser,
  });

  // Ban mutation
  const banMutation = useMutation({
    mutationFn: (userId: string) => adminService.banUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User banned successfully');
      setSelectedUser(null);
    },
    onError: () => {
      toast.error('Failed to ban user');
    },
  });

  // Unban mutation
  const unbanMutation = useMutation({
    mutationFn: (userId: string) => adminService.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User unbanned successfully');
      setSelectedUser(null);
    },
    onError: () => {
      toast.error('Failed to unban user');
    },
  });

  const users = usersData?.users || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage and moderate users</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        {/* Status Tabs */}
        <div className="flex gap-2 mb-4">
          {['all', 'active', 'banned'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                status === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name, username, or email..."
            className="input w-full pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">
            {usersData?.total || 0}
          </p>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user: any) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {user.fullName}
                          </p>
                          <p className="text-sm text-gray-500">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{user.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <p className="text-gray-900">
                          {user.totalQuestionsAttempted} questions
                        </p>
                        <p className="text-gray-500">
                          {user.overallAccuracy}% accuracy
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isBanned ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Banned
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      )}
                      {user.isAdmin && (
                        <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          Admin
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {!user.isAdmin && (
                          <>
                            {user.isBanned ? (
                              <button
                                onClick={() => unbanMutation.mutate(user._id)}
                                disabled={unbanMutation.isPending}
                                className="text-green-600 hover:text-green-800"
                              >
                                <UserCheck className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Ban user ${user.fullName}?`
                                    )
                                  ) {
                                    banMutation.mutate(user._id);
                                  }
                                }}
                                disabled={banMutation.isPending}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Ban className="w-5 h-5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {users.map((user: any) => (
              <div key={user._id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                  {user.isBanned ? (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                      Banned
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">
                    {user.totalQuestionsAttempted} questions •{' '}
                    {user.overallAccuracy}% accuracy
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="btn-secondary btn-sm flex-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  {!user.isAdmin && (
                    <>
                      {user.isBanned ? (
                        <button
                          onClick={() => unbanMutation.mutate(user._id)}
                          className="btn-success btn-sm flex-1"
                        >
                          <UserCheck className="w-4 h-4" />
                          Unban
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (window.confirm(`Ban user ${user.fullName}?`)) {
                              banMutation.mutate(user._id);
                            }
                          }}
                          className="btn-danger btn-sm flex-1"
                        >
                          <Ban className="w-4 h-4" />
                          Ban
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                User Details
              </h2>
            </div>

            {detailsLoading ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-2xl">
                    {userDetails?.user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {userDetails?.user.fullName}
                    </h3>
                    <p className="text-gray-600">
                      @{userDetails?.user.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {userDetails?.user.email}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Questions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userDetails?.user.totalQuestionsAttempted}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Accuracy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userDetails?.user.overallAccuracy}%
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Streak</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userDetails?.user.currentStreak} days
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Posts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {userDetails?.postCount || 0}
                    </p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Recent Activity
                  </h4>
                  {userDetails?.recentAttempts?.length > 0 ? (
                    <div className="space-y-2">
                      {userDetails.recentAttempts.slice(0, 5).map((attempt: any) => (
                        <div
                          key={attempt._id}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <p className="text-sm text-gray-900 line-clamp-1">
                            {attempt.questionId?.questionText || 'Question'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded-full',
                                attempt.isCorrect
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              )}
                            >
                              {attempt.isCorrect ? 'Correct' : 'Wrong'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(attempt.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="btn-secondary flex-1"
                  >
                    Close
                  </button>
                  {!userDetails?.user.isAdmin && (
                    <>
                      {userDetails?.user.isBanned ? (
                        <button
                          onClick={() => {
                            unbanMutation.mutate(userDetails.user._id);
                          }}
                          className="btn-success flex-1"
                        >
                          Unban User
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                `Ban user ${userDetails?.user.fullName}?`
                              )
                            ) {
                              banMutation.mutate(userDetails.user._id);
                            }
                          }}
                          className="btn-danger flex-1"
                        >
                          Ban User
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
