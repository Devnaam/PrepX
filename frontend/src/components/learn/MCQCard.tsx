import React, { useState, useEffect } from 'react';
import { Question } from '@/types';
import { cn } from '@/utils/cn';
import { Check, X } from 'lucide-react';

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
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubjectLabel = (subject: string) => {
    return subject.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 mb-6">
      {/* Question Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs font-medium text-gray-500">
            {getSubjectLabel(question.subject)}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-500">{question.topic}</span>
          <span
            className={cn(
              'ml-auto px-2 py-1 rounded-full text-xs font-medium',
              getDifficultyColor(question.difficulty)
            )}
          >
            {question.difficulty}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">
          {question.questionText}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-4">
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
                'border-2 flex items-center justify-between',
                selectedOption === null &&
                  'border-gray-200 hover:border-primary-400 hover:bg-primary-50',
                showCorrect && 'border-green-500 bg-green-50',
                showWrong && 'border-red-500 bg-red-50',
                !showCorrect &&
                  !showWrong &&
                  isSelected &&
                  'border-primary-500 bg-primary-50',
                selectedOption !== null &&
                  !isSelected &&
                  !isCorrectOption &&
                  'opacity-50'
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm',
                    showCorrect && 'bg-green-500 text-white',
                    showWrong && 'bg-red-500 text-white',
                    !showCorrect &&
                      !showWrong &&
                      'bg-gray-100 text-gray-600'
                  )}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-gray-900 font-medium">
                  {option.optionText}
                </span>
              </span>
              {showCorrect && (
                <Check className="w-6 h-6 text-green-500" strokeWidth={3} />
              )}
              {showWrong && (
                <X className="w-6 h-6 text-red-500" strokeWidth={3} />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after answer) */}
      {showResult && (
        <div
          className={cn(
            'p-4 rounded-xl mt-4 animate-slide-up',
            isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
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
                'font-semibold',
                isCorrect ? 'text-green-800' : 'text-red-800'
              )}
            >
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}

      {/* Stats */}
      {question.totalAttempts > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-gray-500">
          <span>
            {question.totalAttempts} {question.totalAttempts === 1 ? 'attempt' : 'attempts'}
          </span>
          <span>•</span>
          <span>{question.accuracyPercentage}% accuracy</span>
        </div>
      )}
    </div>
  );
};
