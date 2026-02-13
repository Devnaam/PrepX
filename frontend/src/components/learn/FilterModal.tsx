import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { SUBJECTS, DIFFICULTY_LEVELS, TOPICS_BY_SUBJECT } from '@/constants';
import { cn } from '@/utils/cn';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
  currentFilters: any;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}) => {
  const [subject, setSubject] = useState(currentFilters.subject || '');
  const [topics, setTopics] = useState<string[]>(currentFilters.topics || []);
  const [difficulty, setDifficulty] = useState(currentFilters.difficulty || '');

  if (!isOpen) return null;

  const handleApply = () => {
    onApply({
      subject: subject || undefined,
      topics: topics.length > 0 ? topics : undefined,
      difficulty: difficulty || undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setSubject('');
    setTopics([]);
    setDifficulty('');
    onApply({});
    onClose();
  };

  const toggleTopic = (topic: string) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Filter Questions</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setSubject('')}
                className={cn(
                  'w-full p-3 rounded-lg border-2 text-left transition-colors',
                  subject === ''
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                All Subjects
              </button>
              {SUBJECTS.map((sub) => (
                <button
                  key={sub.value}
                  onClick={() => {
                    setSubject(sub.value);
                    setTopics([]);
                  }}
                  className={cn(
                    'w-full p-3 rounded-lg border-2 text-left transition-colors',
                    subject === sub.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topics (only if subject selected) */}
          {subject && TOPICS_BY_SUBJECT[subject] && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics
              </label>
              <div className="flex flex-wrap gap-2">
                {TOPICS_BY_SUBJECT[subject].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => toggleTopic(topic)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      topics.includes(topic)
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDifficulty('')}
                className={cn(
                  'p-3 rounded-lg border-2 transition-colors',
                  difficulty === ''
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                All
              </button>
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setDifficulty(level.value)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-colors',
                    difficulty === level.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <Button variant="primary" onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};
