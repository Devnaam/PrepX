import React, { useState } from 'react';
import { X, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useCreateQuestion } from '@/hooks/useCreateQuestion';
import { cn } from '@/utils/cn';

interface CreateQuestionFormProps {
  onClose: () => void;
}

const SUBJECTS = [
  { value: 'MATHEMATICS', label: 'Mathematics' },
  { value: 'GENERAL_KNOWLEDGE', label: 'General Knowledge' },
  { value: 'REASONING', label: 'Reasoning' },
  { value: 'ENGLISH', label: 'English' },
  { value: 'GENERAL_SCIENCE', label: 'General Science' },
  { value: 'CURRENT_AFFAIRS', label: 'Current Affairs' },
  { value: 'COMPUTER', label: 'Computer' },
  { value: 'HISTORY', label: 'History' },
  { value: 'GEOGRAPHY', label: 'Geography' },
  { value: 'ECONOMICS', label: 'Economics' },
];

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

const EXAM_TYPES = [
  'SSC_CGL',
  'SSC_CHSL',
  'RAILWAYS_NTPC',
  'RAILWAYS_GROUP_D',
  'IBPS_PO',
  'IBPS_CLERK',
  'SBI_PO',
  'SBI_CLERK',
  'RRB_PO',
  'RRB_CLERK',
  'UPSC_PRELIMS',
  'STATE_PSC',
  'DEFENSE',
  'TEACHING',
  'OTHERS',
];

export const CreateQuestionForm: React.FC<CreateQuestionFormProps> = ({
  onClose,
}) => {
  const createQuestion = useCreateQuestion();

  const [formData, setFormData] = useState({
    questionText: '',
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ],
    correctOptionIndex: -1,
    explanation: '',
    subject: '',
    topic: '',
    difficulty: '',
    examTypes: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index].optionText = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectOptionChange = (index: number) => {
    const newOptions = formData.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setFormData({
      ...formData,
      options: newOptions,
      correctOptionIndex: index,
    });
  };

  const toggleExamType = (examType: string) => {
    const newExamTypes = formData.examTypes.includes(examType)
      ? formData.examTypes.filter((et) => et !== examType)
      : [...formData.examTypes, examType];
    setFormData({ ...formData, examTypes: newExamTypes });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.questionText.trim() || formData.questionText.length < 10) {
      newErrors.questionText = 'Question must be at least 10 characters';
    }

    formData.options.forEach((opt, i) => {
      if (!opt.optionText.trim()) {
        newErrors[`option${i}`] = 'Option cannot be empty';
      }
    });

    if (formData.correctOptionIndex === -1) {
      newErrors.correctOption = 'Please select the correct answer';
    }

    if (!formData.explanation.trim() || formData.explanation.length < 20) {
      newErrors.explanation = 'Explanation must be at least 20 characters';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Please select difficulty level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await createQuestion.mutateAsync(formData);
      onClose();
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900">
              Create Question
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Question Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <textarea
                value={formData.questionText}
                onChange={(e) =>
                  setFormData({ ...formData, questionText: e.target.value })
                }
                placeholder="Enter your question here..."
                className={cn(
                  'input w-full resize-none',
                  errors.questionText && 'border-red-500'
                )}
                rows={3}
                maxLength={500}
              />
              {errors.questionText && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.questionText}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.questionText.length} / 500
              </p>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options * (Select the correct answer)
              </label>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleCorrectOptionChange(index)}
                      className={cn(
                        'mt-3 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        option.isCorrect
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-green-500'
                      )}
                    >
                      {option.isCorrect && (
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      )}
                    </button>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={option.optionText}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                        className={cn(
                          'input w-full',
                          errors[`option${index}`] && 'border-red-500'
                        )}
                        maxLength={200}
                      />
                      {errors[`option${index}`] && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors[`option${index}`]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {errors.correctOption && (
                <p className="text-xs text-red-500 mt-2">
                  {errors.correctOption}
                </p>
              )}
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explanation *
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) =>
                  setFormData({ ...formData, explanation: e.target.value })
                }
                placeholder="Explain why the answer is correct..."
                className={cn(
                  'input w-full resize-none',
                  errors.explanation && 'border-red-500'
                )}
                rows={3}
                maxLength={1000}
              />
              {errors.explanation && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.explanation}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.explanation.length} / 1000
              </p>
            </div>

            {/* Subject & Topic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className={cn(
                    'input w-full',
                    errors.subject && 'border-red-500'
                  )}
                >
                  <option value="">Select Subject</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject.value} value={subject.value}>
                      {subject.label}
                    </option>
                  ))}
                </select>
                {errors.subject && (
                  <p className="text-xs text-red-500 mt-1">{errors.subject}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  placeholder="e.g., Algebra, Polity"
                  className="input w-full"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty *
              </label>
              <div className="flex gap-3">
                {DIFFICULTIES.map((diff) => (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, difficulty: diff.value })
                    }
                    className={cn(
                      'px-6 py-2 rounded-lg font-medium transition-colors',
                      formData.difficulty === diff.value
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {diff.label}
                  </button>
                ))}
              </div>
              {errors.difficulty && (
                <p className="text-xs text-red-500 mt-2">
                  {errors.difficulty}
                </p>
              )}
            </div>

            {/* Exam Types */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Exams (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {EXAM_TYPES.map((exam) => (
                  <button
                    key={exam}
                    type="button"
                    onClick={() => toggleExamType(exam)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium transition-colors',
                      formData.examTypes.includes(exam)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {exam.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createQuestion.isPending}
                className="flex-1"
              >
                {createQuestion.isPending ? 'Submitting...' : 'Submit Question'}
              </Button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your question will be reviewed by our
                team before being published. You'll be notified once it's
                approved!
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
