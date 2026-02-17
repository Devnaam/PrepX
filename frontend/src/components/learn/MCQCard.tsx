import React, { useState, useEffect } from 'react';
import { Question } from '@/types';
import { cn } from '@/utils/cn';
import { Check, X, Bookmark, Share2, Flag } from 'lucide-react';
import { useToggleBookmark } from '@/hooks/useBookmarks';

interface MCQCardProps {
  question: Question;
  onAnswer: (selectedIndex: number, timeTaken: number) => Promise<any>;
  isSubmitting: boolean;
}

export const MCQCard: React.FC<MCQCardProps> = ({
  question,
  onAnswer,
  isSubmitting,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  const toggleBookmark = useToggleBookmark();
  const [isBookmarked, setIsBookmarked] = useState(question.isBookmarked || false);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await toggleBookmark.mutateAsync(question._id);
      setIsBookmarked(result.isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleOptionClick = async (index: number) => {
    if (selectedOption !== null || isSubmitting) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    setSelectedOption(index);

    try {
      const result = await onAnswer(index, timeTaken);

      // Show result after getting response
      setIsCorrect(result.isCorrect);
      setCorrectIndex(result.correctOptionIndex);
      setShowResult(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
      // Reset if error
      setSelectedOption(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-700';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-700';
      case 'HARD':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getSubjectLabel = (subject: string) => {
    return subject
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="w-full h-full snap-start snap-always flex flex-col bg-white">
      {/* ==================== CONTENT CONTAINER ==================== */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:py-6">
        <div className="max-w-2xl mx-auto">
          {/* Question Header - Tags */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1 bg-[#0095f6] text-white text-xs font-semibold rounded">
              {getSubjectLabel(question.subject)}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
              {question.topic}
            </span>
            <span
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded',
                getDifficultyColor(question.difficulty)
              )}
            >
              {question.difficulty}
            </span>
          </div>

          {/* Question Text */}
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-relaxed mb-6">
            {question.questionText}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const isCorrectOption = correctIndex === index;
              const showCorrect = showResult && isCorrectOption;
              const showWrong = showResult && isSelected && !isCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  disabled={selectedOption !== null || isSubmitting}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-all duration-200',
                    'border-2 flex items-center gap-3',
                    'disabled:cursor-not-allowed',
                    // Default state
                    selectedOption === null &&
                      'border-gray-200 hover:border-gray-300 active:border-gray-400',
                    // Correct answer
                    showCorrect && 'border-green-500 bg-green-50',
                    // Wrong answer
                    showWrong && 'border-red-500 bg-red-50',
                    // Selected but not yet revealed
                    !showCorrect &&
                      !showWrong &&
                      isSelected &&
                      'border-[#0095f6] bg-blue-50',
                    // Fade out non-selected after answer
                    selectedOption !== null &&
                      !isSelected &&
                      !isCorrectOption &&
                      'opacity-40'
                  )}
                >
                  {/* Option Letter Circle */}
                  <span
                    className={cn(
                      'flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full font-bold text-sm flex-shrink-0',
                      showCorrect && 'bg-green-500 text-white',
                      showWrong && 'bg-red-500 text-white',
                      !showCorrect &&
                        !showWrong &&
                        isSelected &&
                        'bg-[#0095f6] text-white',
                      !showCorrect &&
                        !showWrong &&
                        !isSelected &&
                        'bg-gray-100 text-gray-700'
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>

                  {/* Option Text */}
                  <span className="flex-1 text-sm sm:text-base text-gray-900 font-medium">
                    {option.optionText}
                  </span>

                  {/* Check/X Icon */}
                  {showCorrect && (
                    <Check
                      className="w-6 h-6 text-green-500 flex-shrink-0"
                      strokeWidth={3}
                    />
                  )}
                  {showWrong && (
                    <X
                      className="w-6 h-6 text-red-500 flex-shrink-0"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation (shown after answer) */}
          {showResult && (
            <div
              className={cn(
                'p-4 rounded-xl animate-slide-up',
                isCorrect
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <X className="w-5 h-5 text-red-600" />
                )}
                <span
                  className={cn(
                    'font-semibold text-sm sm:text-base',
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  )}
                >
                  {isCorrect ? 'Correct! 🎉' : 'Not quite right'}
                </span>
              </div>
              <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}

          {/* Stats */}
          {question.totalAttempts > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                <span>
                  {question.totalAttempts}{' '}
                  {question.totalAttempts === 1 ? 'attempt' : 'attempts'}
                </span>
                <span>{question.accuracyPercentage}% accuracy</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== BOTTOM ACTION BAR ==================== */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Left Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBookmark}
              disabled={toggleBookmark.isPending}
              className={cn(
                'p-1 hover:opacity-60 transition-opacity disabled:opacity-40',
                isBookmarked ? 'text-yellow-500' : 'text-gray-900'
              )}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <Bookmark
                className={cn(
                  'w-6 h-6 sm:w-7 sm:h-7',
                  isBookmarked && 'fill-current'
                )}
              />
            </button>

            <button
              className="p-1 hover:opacity-60 transition-opacity text-gray-900"
              aria-label="Share"
            >
              <Share2 className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            <button
              className="p-1 hover:opacity-60 transition-opacity text-gray-900"
              aria-label="Report"
            >
              <Flag className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>

          {/* Right Info */}
          <div className="text-xs sm:text-sm text-gray-500 font-medium">
            Swipe for next →
          </div>
        </div>
      </div>
    </div>
  );
};
