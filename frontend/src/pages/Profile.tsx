import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal';
import {
  LogOut,
  Settings,
  Bookmark,
  Clock,
  Shield,
  Grid3x3,
  Award,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'stats'>('posts');

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ==================== HEADER ==================== */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">
            {user?.username}
          </h1>
          <button
            onClick={() => setShowEditProfile(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
          </button>
        </div>
      </div>

      {/* Main Content with Bottom Padding for Nav */}
      <div className="max-w-2xl mx-auto pb-24">
        {/* ==================== PROFILE INFO SECTION ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-4 py-4 sm:py-6"
        >
          {/* Profile Picture & Stats Row */}
          <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-5">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-white p-[3px]">
                  <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold">
                    {user?.fullName.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 flex justify-around text-center">
              <div className="flex flex-col items-center">
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  {user?.totalQuestionsAttempted || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">questions</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  {user?.followersCount || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">followers</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
                  {user?.followingCount || 0}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">following</p>
              </div>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mb-3 sm:mb-4">
            <p className="font-semibold text-sm text-gray-900 mb-1">
              {user?.fullName}
            </p>
            {user?.bio && (
              <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-line">
                {user.bio}
              </p>
            )}
          </div>

          {/* Target Exams Pills */}
          {user?.targetExams && user.targetExams.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
              {user.targetExams.map((exam) => (
                <span
                  key={exam}
                  className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-900 rounded-md text-xs font-medium"
                >
                  {exam.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditProfile(true)}
              className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg font-semibold text-xs sm:text-sm text-gray-900 transition-colors"
            >
              Edit profile
            </button>
            <button
              onClick={() => alert('Share profile coming soon!')}
              className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg font-semibold text-xs sm:text-sm text-gray-900 transition-colors"
            >
              Share profile
            </button>
          </div>
        </motion.div>

        {/* ==================== HIGHLIGHTS / STATS SECTION ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="px-4 py-3 sm:py-4 border-t border-b border-gray-200"
        >
          <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide">
            {/* Streak Highlight */}
            <div className="flex flex-col items-center gap-2 min-w-[60px] sm:min-w-[64px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {user?.currentStreak || 0}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500">days</p>
                </div>
              </div>
              <p className="text-xs text-gray-900 font-medium">Streak</p>
            </div>

            {/* Accuracy Highlight */}
            <div className="flex flex-col items-center gap-2 min-w-[60px] sm:min-w-[64px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    {user?.overallAccuracy || 0}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500">%</p>
                </div>
              </div>
              <p className="text-xs text-gray-900 font-medium">Accuracy</p>
            </div>

            {/* Rank Highlight */}
            <div className="flex flex-col items-center gap-2 min-w-[60px] sm:min-w-[64px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-gray-200 flex items-center justify-center bg-gray-50">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-900 font-medium">Badges</p>
            </div>
          </div>
        </motion.div>

        {/* ==================== TAB NAVIGATION ==================== */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'posts'
                ? 'border-b-2 border-gray-900'
                : 'text-gray-400'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-b-2 border-gray-900'
                : 'text-gray-400'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
          </button>
        </div>

        {/* ==================== SETTINGS MENU ==================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="divide-y divide-gray-200"
        >
          {/* Bookmarks */}
          <button
            onClick={() => navigate('/bookmarks')}
            className="w-full px-4 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Saved</p>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  View your bookmarked questions
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </button>

          {/* History */}
          <button
            onClick={() => navigate('/history')}
            className="w-full px-4 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Activity</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Your question history</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </button>

          {/* Change Password */}
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full px-4 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-medium text-gray-900">Security</p>
                <p className="text-[10px] sm:text-xs text-gray-500">Change your password</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </button>

          {/* Admin Access (if admin) */}
          {user?.isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="w-full px-4 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Admin Panel
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500">Manage platform</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center">
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-medium text-red-600">Log out</p>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  Sign out of your account
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </button>
        </motion.div>

        {/* ==================== FOOTER LINKS ==================== */}
        <div className="px-4 py-6 sm:py-8 text-center space-y-3 sm:space-y-4">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs text-gray-500">
            <a href="#" className="hover:underline">
              About
            </a>
            <a href="#" className="hover:underline">
              Help
            </a>
            <a href="#" className="hover:underline">
              API
            </a>
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <a href="#" className="hover:underline">
              Terms
            </a>
            <a href="#" className="hover:underline">
              Locations
            </a>
          </div>
          <p className="text-xs text-gray-400">© 2026 PrepX</p>
        </div>
      </div>

      {/* ==================== MODALS ==================== */}
      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};
