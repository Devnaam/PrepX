import React, { useState } from 'react';
import { MCQCard } from './MCQCard';
import { useQuestions, useSubmitAnswer } from '@/hooks/useQuestions';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { Loader } from '@/components/common/Loader';
import { Question } from '@/types';
import toast from 'react-hot-toast';

interface QuestionFeedProps {
  filters: any;
}

export const QuestionFeed: React.FC<QuestionFeedProps> = ({ filters }) => {
  const { questions, isLoading, hasMore, loadMore } = useQuestions();
  const submitAnswer = useSubmitAnswer();
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set()
  );
  
  const loadMoreRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  const handleAnswer = async (
    question: Question,
    selectedIndex: number,
    timeTaken: number
  ) => {
    try {
      const response = await submitAnswer.mutateAsync({
        questionId: question._id,
        data: { selectedOptionIndex: selectedIndex, timeTaken },
      });

      // Mark as answered
      setAnsweredQuestions((prev) => new Set(prev).add(question._id));

      // Show toast feedback
      if (response.isCorrect) {
        toast.success(`Correct! 🎉 Streak: ${response.userStats.currentStreak}`, {
          duration: 2000,
        });
      } else {
        toast.error('Keep learning! 💪', {
          duration: 2000,
        });
      }

      return response;
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
      throw error;
    }
  };

  if (isLoading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isLoading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-xl text-gray-600 mb-2">No questions found</p>
        <p className="text-sm text-gray-500">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {questions.map((question) => (
        <MCQCard
          key={question._id}
          question={question}
          onAnswer={(selectedIndex, timeTaken) =>
            handleAnswer(question, selectedIndex, timeTaken)
          }
          isSubmitting={submitAnswer.isPending}
        />
      ))}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
        {isLoading && <Loader />}
      </div>

      {!hasMore && questions.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg font-semibold">🎉 You've reached the end!</p>
          <p className="text-sm mt-2">Great job practicing! Come back tomorrow for more.</p>
        </div>
      )}
    </div>
  );
};
