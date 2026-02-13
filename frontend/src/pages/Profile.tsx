import React from 'react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { logout } from '@/features/auth/authSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { LogOut, Settings } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
              <h2 className="text-xl font-bold text-gray-900">{user?.fullName}</h2>
              <p className="text-gray-500">@{user?.username}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{user?.currentStreak}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{user?.totalQuestionsAttempted}</p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{user?.overallAccuracy}%</p>
              <p className="text-xs text-gray-500">Accuracy</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => alert('Settings coming soon!')}
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </Button>
          
          <Button
            variant="secondary"
            className="w-full justify-start text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};
