import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postService } from '@/services/post.service';
import { Post, CreatePostData } from '@/types';
import toast from 'react-hot-toast';

export const usePosts = () => {
  const queryClient = useQueryClient();
  const [skip, setSkip] = useState(0);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', 'feed', skip],
    queryFn: () => postService.getHomeFeed(limit, skip),
  });

  const loadMore = useCallback(() => {
    if (data?.hasMore) {
      setSkip((prev) => prev + limit);
    }
  }, [data?.hasMore]);

  const reset = useCallback(() => {
    setSkip(0);
    refetch();
  }, [refetch]);

  return {
    posts: data?.posts || [],
    isLoading,
    error,
    hasMore: data?.hasMore || false,
    loadMore,
    reset,
  };
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => postService.createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      toast.success('Post created!');
    },
    onError: (error: any) => {
      toast.error(error.error?.message || 'Failed to create post');
    },
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.toggleLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      toast.error(error.error?.message || 'Failed to like post');
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postService.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post deleted');
    },
    onError: (error: any) => {
      toast.error(error.error?.message || 'Failed to delete post');
    },
  });
};
