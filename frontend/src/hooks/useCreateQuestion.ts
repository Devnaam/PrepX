import { useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService, CreateQuestionData } from '@/services/question.service';
import toast from 'react-hot-toast';

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuestionData) =>
      questionService.createQuestion(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      toast.success(response.message || 'Question submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.error?.message || 'Failed to create question');
    },
  });
};
