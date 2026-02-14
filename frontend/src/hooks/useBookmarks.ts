import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { bookmarkService } from '@/services/bookmark.service';
import toast from 'react-hot-toast';

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) =>
      bookmarkService.toggleBookmark(questionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
      toast.success(
        data.isBookmarked ? 'Question bookmarked!' : 'Bookmark removed'
      );
    },
    onError: (error: any) => {
      toast.error(error.error?.message || 'Failed to bookmark');
    },
  });
};

export const useBookmarks = (filters?: any) => {
  return useQuery({
    queryKey: ['bookmarks', filters],
    queryFn: () => bookmarkService.getBookmarks(filters),
  });
};

export const useBookmarkStats = () => {
  return useQuery({
    queryKey: ['bookmark-stats'],
    queryFn: () => bookmarkService.getBookmarkStats(),
  });
};
