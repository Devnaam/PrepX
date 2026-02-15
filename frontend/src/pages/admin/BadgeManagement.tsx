import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Loader } from '@/components/common/Loader';
import { Plus, Edit2, Trash2, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

const BADGE_ICONS = ['🏆', '⭐', '🎖️', '🥇', '🥈', '🥉', '💎', '👑', '🔥', '⚡'];

const CRITERIA_TYPES = [
  { value: 'QUESTIONS_ATTEMPTED', label: 'Questions Attempted' },
  { value: 'QUESTIONS_CORRECT', label: 'Questions Correct' },
  { value: 'STREAK_DAYS', label: 'Streak Days' },
  { value: 'ACCURACY_PERCENTAGE', label: 'Accuracy Percentage' },
  { value: 'POSTS_CREATED', label: 'Posts Created' },
  { value: 'FOLLOWERS_COUNT', label: 'Followers Count' },
];

interface BadgeFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: {
    type: string;
    value: number;
  };
}

export const BadgeManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<any>(null);
  const [formData, setFormData] = useState<BadgeFormData>({
    name: '',
    description: '',
    icon: '🏆',
    color: '#3B82F6',
    criteria: {
      type: 'QUESTIONS_ATTEMPTED',
      value: 100,
    },
  });

  // Fetch badges
  const { data: badgesData, isLoading } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: () => adminService.getAllBadges(),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: adminService.createBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] });
      toast.success('Badge created successfully!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create badge');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => adminService.updateBadge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] });
      toast.success('Badge updated successfully!');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update badge');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: adminService.deleteBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-badges'] });
      toast.success('Badge deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete badge');
    },
  });

  const openModal = (badge?: any) => {
    if (badge) {
      setEditingBadge(badge);
      setFormData({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: badge.color,
        criteria: badge.criteria,
      });
    } else {
      setEditingBadge(null);
      setFormData({
        name: '',
        description: '',
        icon: '🏆',
        color: '#3B82F6',
        criteria: {
          type: 'QUESTIONS_ATTEMPTED',
          value: 100,
        },
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBadge(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }

    if (editingBadge) {
      updateMutation.mutate({ id: editingBadge._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (badgeId: string) => {
    if (window.confirm('Are you sure you want to delete this badge?')) {
      deleteMutation.mutate(badgeId);
    }
  };

  const badges = badgesData?.badges || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Badge Management</h1>
          <p className="text-gray-600 mt-1">Create and manage achievement badges</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary">
          <Plus className="w-5 h-5" />
          Create Badge
        </button>
      </div>

      {/* Badges Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : badges.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No badges created yet</p>
          <button onClick={() => openModal()} className="btn-primary">
            Create Your First Badge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge: any) => (
            <div
              key={badge._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Badge Icon */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4"
                style={{ backgroundColor: `${badge.color}20` }}
              >
                {badge.icon}
              </div>

              {/* Badge Info */}
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {badge.name}
              </h3>
              <p className="text-sm text-gray-600 text-center mb-4">
                {badge.description}
              </p>

              {/* Criteria */}
              <div className="p-3 bg-gray-50 rounded-lg mb-4">
                <p className="text-xs text-gray-500 mb-1">Unlock Criteria:</p>
                <p className="text-sm font-medium text-gray-900">
                  {CRITERIA_TYPES.find((c) => c.value === badge.criteria.type)
                    ?.label || badge.criteria.type}{' '}
                  ≥ {badge.criteria.value}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(badge)}
                  className="btn-secondary btn-sm flex-1"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(badge._id)}
                  disabled={deleteMutation.isPending}
                  className="btn-danger btn-sm flex-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBadge ? 'Edit Badge' : 'Create Badge'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Badge Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input w-full"
                  placeholder="e.g., Century Maker"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="input w-full"
                  rows={3}
                  placeholder="What does this badge represent?"
                  required
                />
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {BADGE_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all',
                        formData.icon === icon
                          ? 'bg-primary-600 text-white scale-110'
                          : 'bg-gray-100 hover:bg-gray-200'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color *
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full h-12 rounded-lg cursor-pointer"
                />
              </div>

              {/* Criteria Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Criteria Type *
                </label>
                <select
                  value={formData.criteria.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      criteria: { ...formData.criteria, type: e.target.value },
                    })
                  }
                  className="input w-full"
                >
                  {CRITERIA_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Criteria Value */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Value *
                </label>
                <input
                  type="number"
                  value={formData.criteria.value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      criteria: {
                        ...formData.criteria,
                        value: Number(e.target.value),
                      },
                    })
                  }
                  className="input w-full"
                  min="1"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {editingBadge ? 'Update Badge' : 'Create Badge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
