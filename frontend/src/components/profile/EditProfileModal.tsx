import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, UpdateProfileData } from '@/services/user.service';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

interface EditProfileModalProps {
  onClose: () => void;
}

const EXAM_TYPES = [
  'SSC_CGL', 'SSC_CHSL', 'RAILWAYS_NTPC', 'RAILWAYS_GROUP_D',
  'IBPS_PO', 'IBPS_CLERK', 'SBI_PO', 'SBI_CLERK',
  'RRB_PO', 'RRB_CLERK', 'UPSC_PRELIMS', 'STATE_PSC',
  'DEFENSE', 'TEACHING', 'OTHERS'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose }) => {
  const { user } = useAppSelector((state) => state.auth);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    targetExams: user?.targetExams || [],
  });

  const updateProfile = useMutation({
    mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Profile updated successfully!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.error?.message || 'Failed to update profile');
    },
  });

  const toggleExam = (exam: string) => {
    const newExams = formData.targetExams.includes(exam)
      ? formData.targetExams.filter((e) => e !== exam)
      : [...formData.targetExams, exam];
    setFormData({ ...formData, targetExams: newExams });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-gray-900 hover:text-gray-600"
          >
            Cancel
          </button>
          <h2 className="text-base font-semibold text-gray-900">Edit Profile</h2>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={updateProfile.isPending}
            className="text-sm font-semibold text-[#0095f6] hover:text-[#1877f2] disabled:opacity-50"
          >
            {updateProfile.isPending ? 'Saving...' : 'Done'}
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Profile Picture Section */}
            <div className="p-6 flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white p-[3px]">
                    <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                      {user?.fullName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-4 h-4 text-gray-700" />
                </button>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-[#0095f6] hover:text-[#1877f2]"
              >
                Change profile photo
              </button>
            </div>

            {/* Username (Read-only) */}
            <div className="px-6 py-3 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 w-24">
                Username
              </label>
              <div className="flex-1 text-right">
                <p className="text-sm text-gray-500">@{user?.username}</p>
              </div>
            </div>

            {/* Full Name */}
            <div className="px-6 py-3 flex items-center justify-between gap-4">
              <label className="text-sm font-medium text-gray-900 w-24 flex-shrink-0">
                Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="flex-1 text-sm text-gray-900 bg-transparent border-none focus:outline-none text-right"
                placeholder="Full name"
                maxLength={100}
              />
            </div>

            {/* Bio */}
            <div className="px-6 py-3">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                className="w-full text-sm text-gray-900 bg-transparent border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-gray-400 resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {formData.bio.length} / 200
              </p>
            </div>

            {/* Target Exams */}
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Target Exams
              </label>
              <div className="flex flex-wrap gap-2">
                {EXAM_TYPES.map((exam) => {
                  const isSelected = formData.targetExams.includes(exam);
                  return (
                    <button
                      key={exam}
                      type="button"
                      onClick={() => toggleExam(exam)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-[#0095f6] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      {exam.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
              {formData.targetExams.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {formData.targetExams.length} exam{formData.targetExams.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Personal Information Header */}
            <div className="px-6 py-3 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Personal Information
              </p>
            </div>

            {/* Email (Read-only) */}
            <div className="px-6 py-3 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 w-24">
                Email
              </label>
              <div className="flex-1 text-right">
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* Account Stats Info */}
            <div className="px-6 py-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Current Streak</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.currentStreak || 0} days
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Accuracy</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.overallAccuracy || 0}%
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
