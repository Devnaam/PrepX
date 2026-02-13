import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService } from '@/services/question.service';
import { Question, SubmitAnswerRequest } from '@/types';
import toast from 'react-hot-toast';

interface QuestionFilters {
  subject?: string;
  topics?: string[];
  difficulty?: string;
  examTypes?: string[];
}

export const useQuestions = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [skip, setSkip] = useState(0);
  const limit = 20;

  // Fetch questions
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['questions', filters, skip],
    queryFn: () => questionService.getQuestionFeed({ ...filters, limit, skip }),
    enabled: true,
  });

  // Add new questions to the list
  const loadQuestions = useCallback(() => {
    if (data?.questions) {
      setQuestions((prev) => [...prev, ...data.questions]);
    }
  }, [data]);

  // Load more questions (infinite scroll)
  const loadMore = useCallback(() => {
    if (data?.hasMore) {
      setSkip((prev) => prev + limit);
    }
  }, [data?.hasMore]);

  // Reset and reload
  const resetAndReload = useCallback(() => {
    setQuestions([]);
    setSkip(0);
    refetch();
  }, [refetch]);

  // Update filters
  const updateFilters = useCallback((newFilters: QuestionFilters) => {
    setFilters(newFilters);
    setQuestions([]);
    setSkip(0);
  }, []);

  return {
    questions: questions.length > 0 ? questions : data?.questions || [],
    isLoading,
    error,
    hasMore: data?.hasMore || false,
    loadMore,
    updateFilters,
    resetAndReload,
    loadQuestions,
  };
};

// Submit answer mutation
export const useSubmitAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      data,
    }: {
      questionId: string;
      data: SubmitAnswerRequest;
    }) => questionService.submitAnswer(questionId, data),
    onSuccess: (data) => {
      // Invalidate stats queries to refresh
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(error.error?.message || 'Failed to submit answer');
    },
  });
};
