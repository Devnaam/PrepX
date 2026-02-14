import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { Loader } from '@/components/common/Loader';
import {
  Check,
  X,
  Search,
  Filter,
  CheckSquare,
  Trash2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

export const QuestionManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

  const status = searchParams.get('status') || 'all';
  const subject = searchParams.get('subject') || '';
  const difficulty = searchParams.get('difficulty') || '';

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ['admin-questions', status, subject, difficulty, searchQuery],
    queryFn: () =>
      adminService.getAllQuestions({
        status,
        subject,
        difficulty,
        search: searchQuery,
        limit: 50,
      }),
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: adminService.approveQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Question approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve question');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: adminService.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Question deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete question');
    },
  });

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: adminService.bulkApproveQuestions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setSelectedQuestions([]);
      toast.success('Questions approved successfully');
    },
    onError: () => {
      toast.error('Failed to approve questions');
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setSearchParams({ status: newStatus });
  };

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleBulkApprove = () => {
    if (selectedQuestions.length === 0) {
      toast.error('Please select questions to approve');
      return;
    }
    bulkApproveMutation.mutate(selectedQuestions);
  };

  const questions = questionsData?.questions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Question Management
          </h1>
          <p className="text-gray-600 mt-1">
            Approve, edit, or delete questions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        {/* Status Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['all', 'pending', 'approved'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleStatusChange(tab)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
                status === tab
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="input w-full pl-10"
          />
        </div>

        {/* Bulk Actions */}
        {selectedQuestions.length > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
            <p className="text-sm font-medium text-primary-900">
              {selectedQuestions.length} question(s) selected
            </p>
            <button
              onClick={handleBulkApprove}
              disabled={bulkApproveMutation.isPending}
              className="btn-primary btn-sm"
            >
              <CheckSquare className="w-4 h-4" />
              Approve All
            </button>
            <button
              onClick={() => setSelectedQuestions([])}
              className="btn-secondary btn-sm"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader size="lg" />
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No questions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question: any) => (
            <div
              key={question._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Question Header */}
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                {!question.isApproved && (
                  <input
                    type="checkbox"
                    checked={selectedQuestions.includes(question._id)}
                    onChange={() => handleSelectQuestion(question._id)}
                    className="mt-1 w-5 h-5 text-primary-600 rounded"
                  />
                )}

                <div className="flex-1">
                  {/* Question Text */}
                  <p className="text-lg font-medium text-gray-900 mb-3">
                    {question.questionText}
                  </p>

                  {/* Options */}
                  <div className="space-y-2 mb-4">
                    {question.options.map((option: any, index: number) => (
                      <div
                        key={index}
                        className={cn(
                          'p-3 rounded-lg border',
                          option.isCorrect
                            ? 'bg-green-50 border-green-300'
                            : 'bg-gray-50 border-gray-200'
                        )}
                      >
                        <span className="font-medium">
                          {String.fromCharCode(65 + index)}.
                        </span>{' '}
                        {option.optionText}
                        {option.isCorrect && (
                          <span className="ml-2 text-green-600 text-sm">
                            ✓ Correct
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Explanation:</span>{' '}
                      {question.explanation}
                    </p>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {question.subject}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                      {question.topic}
                    </span>
                    <span
                      className={cn(
                        'px-3 py-1 text-xs font-medium rounded-full',
                        question.difficulty === 'EASY' &&
                          'bg-green-100 text-green-800',
                        question.difficulty === 'MEDIUM' &&
                          'bg-yellow-100 text-yellow-800',
                        question.difficulty === 'HARD' &&
                          'bg-red-100 text-red-800'
                      )}
                    >
                      {question.difficulty}
                    </span>
                    {question.isApproved && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        ✓ Approved
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      By: {question.createdBy?.fullName || 'Unknown'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!question.isApproved && (
                    <button
                      onClick={() => approveMutation.mutate(question._id)}
                      disabled={approveMutation.isPending}
                      className="btn-success btn-sm"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Are you sure you want to delete this question?'
                        )
                      ) {
                        deleteMutation.mutate(question._id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="btn-danger btn-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
