import React from 'react';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/common/Button';
import { formatDistanceToNow } from 'date-fns';

interface AttemptModalProps {
  attempt: any;
  onClose: () => void;
  onRetry?: (questionId: string) => void;
}

export const AttemptModal: React.FC<AttemptModalProps> = ({
  attempt,
  onClose,
  onRetry,
}) => {
  const question = attempt.questionId;

  if (!question) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900">Attempt Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Result Badge */}
            <div
              className={cn(
                'p-4 rounded-xl flex items-center gap-3',
                attempt.isCorrect
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              )}
            >
              {attempt.isCorrect ? (
                <CheckCircle className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <div className="flex-1">
                <p
                  className={cn(
                    'text-lg font-bold',
                    attempt.isCorrect ? 'text-green-800' : 'text-red-800'
                  )}
                >
                  {attempt.isCorrect ? 'Correct Answer!' : 'Incorrect Answer'}
                </p>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{attempt.timeTaken} seconds</span>
                  </div>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(attempt.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Question */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {question.subject.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-gray-500">{question.topic}</span>
                <span
                  className={cn(
                    'ml-auto text-xs font-medium px-2 py-1 rounded-full',
                    question.difficulty === 'EASY' && 'bg-green-100 text-green-800',
                    question.difficulty === 'MEDIUM' &&
                      'bg-yellow-100 text-yellow-800',
                    question.difficulty === 'HARD' && 'bg-red-100 text-red-800'
                  )}
                >
                  {question.difficulty}
                </span>
              </div>
              <p className="text-lg text-gray-900 font-medium">
                {question.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option: any, index: number) => {
                const isSelected = index === attempt.selectedOptionIndex;
                const isCorrect = index === question.correctOptionIndex;

                return (
                  <div
                    key={index}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all',
                      isCorrect &&
                        'bg-green-50 border-green-500',
                      isSelected &&
                        !isCorrect &&
                        'bg-red-50 border-red-500',
                      !isCorrect && !isSelected && 'border-gray-200'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm',
                          isCorrect && 'bg-green-500 text-white',
                          isSelected && !isCorrect && 'bg-red-500 text-white',
                          !isCorrect && !isSelected && 'bg-gray-200 text-gray-700'
                        )}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{option.optionText}</p>
                        {isCorrect && (
                          <p className="text-xs text-green-600 font-medium mt-1">
                            ✓ Correct Answer
                          </p>
                        )}
                        {isSelected && !isCorrect && (
                          <p className="text-xs text-red-600 font-medium mt-1">
                            ✗ Your Answer
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Explanation
              </p>
              <p className="text-sm text-blue-800 leading-relaxed">
                {question.explanation}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              {onRetry && (
                <Button
                  onClick={() => {
                    onRetry(question._id);
                    onClose();
                  }}
                  className="flex-1"
                >
                  Retry Question
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
