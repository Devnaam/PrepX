import React from 'react';
import { CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatDistanceToNow } from 'date-fns';

interface HistoryCardProps {
  attempt: any;
  onClick?: () => void;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ attempt, onClick }) => {
  const question = attempt.questionId;

  if (!question) return null;

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

  return (
    <div
      onClick={onClick}
      className={cn(
        'card p-4 cursor-pointer transition-all hover:shadow-md',
        attempt.isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500">
              {question.subject.replace(/_/g, ' ')}
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
          <p className="text-gray-900 line-clamp-2 mb-2">
            {question.questionText}
          </p>
        </div>
      </div>

      {/* Result */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          {attempt.isCorrect ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">Correct</span>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-600">Incorrect</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{attempt.timeTaken}s</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(attempt.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
