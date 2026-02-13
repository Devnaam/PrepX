import React, { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { Button } from '@/components/common/Button';
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
    <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.fullName.charAt(0).toUpperCase()}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-gray-200 hover:bg-gray-50"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  @{user?.username}
                </p>
                <p className="text-xs text-gray-500">Click to change photo</p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="input w-full"
                maxLength={100}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell us about yourself..."
                className="input w-full resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio.length} / 200
              </p>
            </div>

            {/* Target Exams */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Exams
              </label>
              <div className="flex flex-wrap gap-2">
                {EXAM_TYPES.map((exam) => (
                  <button
                    key={exam}
                    type="button"
                    onClick={() => toggleExam(exam)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                      formData.targetExams.includes(exam)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {exam.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfile.isPending}
                className="flex-1"
              >
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
