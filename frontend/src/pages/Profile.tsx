import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal';
import { LogOut, Settings, Edit, Lock, Shield } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-2xl font-bold">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.fullName}
              </h2>
              <p className="text-gray-500">@{user?.username}</p>
              {user?.bio && (
                <p className="text-sm text-gray-600 mt-2">{user.bio}</p>
              )}
            </div>
          </div>

          {/* Target Exams */}
          {user?.targetExams && user.targetExams.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Target Exams
              </p>
              <div className="flex flex-wrap gap-2">
                {user.targetExams.map((exam) => (
                  <span
                    key={exam}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                  >
                    {exam.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {user?.currentStreak}
              </p>
              <p className="text-xs text-gray-500">Streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {user?.followersCount}
              </p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {user?.totalQuestionsAttempted}
              </p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {user?.overallAccuracy}%
              </p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-2xl overflow-hidden mb-4">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Account Settings</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <button
              onClick={() => setShowEditProfile(true)}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <Edit className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Edit Profile</p>
                <p className="text-xs text-gray-500">
                  Update your name, bio, and target exams
                </p>
              </div>
            </button>

            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <Lock className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-xs text-gray-500">
                  Update your account password
                </p>
              </div>
            </button>

            <button
              onClick={() => alert('Privacy settings coming soon!')}
              className="w-full px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
            >
              <Shield className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Privacy Settings</p>
                <p className="text-xs text-gray-500">
                  Manage who can see your activity
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="secondary"
          className="w-full justify-start text-red-600 hover:bg-red-50 bg-white"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>

      {/* Modals */}
      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};
