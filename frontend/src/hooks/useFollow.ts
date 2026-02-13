import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followService } from '@/services/follow.service';
import toast from 'react-hot-toast';

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => followService.followUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success(
        data.status === 'ACCEPTED' ? 'Following!' : 'Follow request sent'
      );
    },
    onError: (error: any) => {
      toast.error(error.error?.message || 'Failed to follow');
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => followService.unfollowUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Unfollowed');
    },
    onError: (error: any) => {
      toast.error(error.error?.message || 'Failed to unfollow');
    },
  });
};
