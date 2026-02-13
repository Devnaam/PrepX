import api from './api';
import {
  QuestionFeedResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  Question,
} from '@/types';

interface QuestionFilters {
  limit?: number;
  skip?: number;
  subject?: string;
  topics?: string[];
  difficulty?: string;
  examTypes?: string[];
}

export const questionService = {
  // Get question feed
  getQuestionFeed: async (filters: QuestionFilters = {}) => {
    const response: any = await api.get('/questions/feed', {
      params: filters,
    });
    // Extract data from ApiResponse wrapper
    return response.data as QuestionFeedResponse;
  },

  // Submit answer
  submitAnswer: async (questionId: string, data: SubmitAnswerRequest) => {
    const response: any = await api.post(
      `/questions/${questionId}/attempt`,
      data
    );
    return response.data as SubmitAnswerResponse;
  },

  // Create question
  createQuestion: async (data: Partial<Question>) => {
    const response: any = await api.post('/questions', data);
    return response.data;
  },

  // Get question by ID
  getQuestionById: async (questionId: string) => {
    const response: any = await api.get(`/questions/${questionId}`);
    return response.data;
  },
};
