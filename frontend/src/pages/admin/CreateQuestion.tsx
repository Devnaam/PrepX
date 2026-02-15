import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

const SUBJECTS = [
  'GENERAL_KNOWLEDGE',
  'GENERAL_SCIENCE',
  'MATHEMATICS',
  'REASONING',
  'ENGLISH',
  'CURRENT_AFFAIRS',
];

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];

const EXAM_TYPES = [
  'SSC_CGL',
  'SSC_CHSL',
  'BANK_PO',
  'BANK_CLERK',
  'RAILWAY_NTPC',
  'UPSC',
];

interface Option {
  optionText: string;
  isCorrect: boolean;
}

export const CreateQuestion: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    questionText: '',
    options: [
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ],
    explanation: '',
    subject: 'GENERAL_KNOWLEDGE',
    topic: '',
    difficulty: 'MEDIUM',
    examTypes: [] as string[],
  });

  const [errors, setErrors] = useState<any>({});

  // Create mutation
  const createMutation = useMutation({
    mutationFn: adminService.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Question created successfully!');
      navigate('/admin/questions');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create question');
    },
  });

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
    setFormData({ ...formData, options: newOptions });
  };

  const handleExamTypeToggle = (examType: string) => {
    const newExamTypes = formData.examTypes.includes(examType)
      ? formData.examTypes.filter((et) => et !== examType)
      : [...formData.examTypes, examType];
    setFormData({ ...formData, examTypes: newExamTypes });
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    }

    formData.options.forEach((opt, index) => {
      if (!opt.optionText.trim()) {
        newErrors[`option${index}`] = `Option ${index + 1} is required`;
      }
    });

    const hasCorrectAnswer = formData.options.some((opt) => opt.isCorrect);
    if (!hasCorrectAnswer) {
      newErrors.correctAnswer = 'Please select the correct answer';
    }

    if (!formData.explanation.trim()) {
      newErrors.explanation = 'Explanation is required';
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required';
    }

    if (formData.examTypes.length === 0) {
      newErrors.examTypes = 'Select at least one exam type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix all errors');
      return;
    }

    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/questions')}
          className="btn-secondary btn-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Question</h1>
          <p className="text-gray-600 mt-1">Add a new question to the database</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text *
          </label>
          <textarea
            value={formData.questionText}
            onChange={(e) =>
              setFormData({ ...formData, questionText: e.target.value })
            }
            rows={4}
            className={cn(
              'input w-full',
              errors.questionText && 'border-red-500'
            )}
            placeholder="Enter the question..."
          />
          {errors.questionText && (
            <p className="text-red-500 text-sm mt-1">{errors.questionText}</p>
          )}
        </div>

        {/* Options */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Answer Options * (Select the correct one)
          </h3>

          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-start gap-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={option.isCorrect}
                  onChange={() => handleCorrectOptionChange(index)}
                  className="mt-3"
                />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Option {String.fromCharCode(65 + index)}
                  </label>
                  <input
                    type="text"
                    value={option.optionText}
                    onChange={(e) =>
                      handleOptionChange(index, e.target.value)
                    }
                    className={cn(
                      'input w-full',
                      errors[`option${index}`] && 'border-red-500'
                    )}
                    placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                  />
                  {errors[`option${index}`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`option${index}`]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {errors.correctAnswer && (
            <p className="text-red-500 text-sm mt-3">{errors.correctAnswer}</p>
          )}
        </div>

        {/* Explanation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation *
          </label>
          <textarea
            value={formData.explanation}
            onChange={(e) =>
              setFormData({ ...formData, explanation: e.target.value })
            }
            rows={3}
            className={cn(
              'input w-full',
              errors.explanation && 'border-red-500'
            )}
            placeholder="Explain why this is the correct answer..."
          />
          {errors.explanation && (
            <p className="text-red-500 text-sm mt-1">{errors.explanation}</p>
          )}
        </div>

        {/* Subject & Topic */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                className="input w-full"
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic *
              </label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                className={cn('input w-full', errors.topic && 'border-red-500')}
                placeholder="e.g., Geography, Physics, etc."
              />
              {errors.topic && (
                <p className="text-red-500 text-sm mt-1">{errors.topic}</p>
              )}
            </div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Difficulty Level *
          </label>
          <div className="flex gap-3">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setFormData({ ...formData, difficulty: diff })}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  formData.difficulty === diff
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Exam Types * (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {EXAM_TYPES.map((examType) => (
              <button
                key={examType}
                type="button"
                onClick={() => handleExamTypeToggle(examType)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  formData.examTypes.includes(examType)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {examType.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          {errors.examTypes && (
            <p className="text-red-500 text-sm mt-2">{errors.examTypes}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/questions')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary"
          >
            {createMutation.isPending ? 'Creating...' : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
};
