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

      setAnsweredQuestions((prev) => new Set(prev).add(question._id));

      if (response.isCorrect) {
        toast.success(
          `Correct! 🎉 Streak: ${response.userStats.currentStreak}`,
          { duration: 2000 }
        );
      } else {
        toast.error('Keep learning! 💪', { duration: 2000 });
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
      <div className="flex items-center justify-center h-full snap-start">
        <Loader size="lg" />
      </div>
    );
  }

  if (!isLoading && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 snap-start">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-lg text-gray-600 mb-2">No questions found</p>
        <p className="text-sm text-gray-500">
          Try adjusting your filters or check back later
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {questions.map((question) => (
        <div
          key={question._id}
          className="
            min-h-full
            snap-start
            flex
            items-center
            justify-center
            px-4
            py-6
          "
        >
          <div className="w-full max-w-md md:max-w-2xl">
            <MCQCard
              question={question}
              onAnswer={(selectedIndex, timeTaken) =>
                handleAnswer(question, selectedIndex, timeTaken)
              }
              isSubmitting={submitAnswer.isPending}
            />
          </div>
        </div>
      ))}

      <div
        ref={loadMoreRef}
        className="h-24 flex items-center justify-center snap-start"
      >
        {isLoading && <Loader />}
      </div>

      {!hasMore && questions.length > 0 && (
        <div className="min-h-full snap-start flex flex-col items-center justify-center text-gray-500 text-center px-6">
          <p className="text-lg font-semibold">
            🎉 You've reached the end!
          </p>
          <p className="text-sm mt-2">
            Great job practicing! Come back tomorrow for more.
          </p>
        </div>
      )}
    </div>
  );
};
