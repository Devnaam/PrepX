import React, { useState } from 'react';
import { Search, TrendingUp, Users, BookOpen, Hash } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/services/search.service';
import { Loader } from '@/components/common/Loader';
import { cn } from '@/utils/cn';

export const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'subjects' | 'users'>(
    'trending'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'users' | 'questions'>('users');

  // Fetch trending topics
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-topics'],
    queryFn: () => searchService.getTrendingTopics(20),
    enabled: activeTab === 'trending',
  });

  // Fetch subjects
  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => searchService.getSubjects(),
    enabled: activeTab === 'subjects',
  });

  // Fetch suggested users
  const { data: suggestedUsersData, isLoading: suggestedUsersLoading } = useQuery({
    queryKey: ['suggested-users'],
    queryFn: () => searchService.getSuggestedUsers(20),
    enabled: activeTab === 'users',
  });

  // Search
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search', searchType, searchQuery],
    queryFn: () =>
      searchType === 'users'
        ? searchService.searchUsers(searchQuery)
        : searchService.searchQuestions(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  const tabs = [
    { id: 'trending' as const, label: 'Trending', icon: TrendingUp },
    { id: 'subjects' as const, label: 'Subjects', icon: BookOpen },
    { id: 'users' as const, label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Explore</h1>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${searchType}...`}
              className="input w-full pl-10 pr-4"
            />
            {searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  onClick={() => setSearchType('users')}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    searchType === 'users'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  Users
                </button>
                <button
                  onClick={() => setSearchType('questions')}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                    searchType === 'questions'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  Questions
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          {!searchQuery && (
            <div className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search Results */}
        {searchQuery && searchQuery.length >= 2 && (
          <div>
            {searchLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : searchResults?.users?.length > 0 ||
              searchResults?.questions?.length > 0 ? (
              <div className="space-y-4">
                {searchType === 'users' &&
                  searchResults.users?.map((user: any) => (
                    <UserCard key={user._id} user={user} />
                  ))}
                {searchType === 'questions' &&
                  searchResults.questions?.map((question: any) => (
                    <QuestionSearchCard key={question._id} question={question} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-6xl mb-4">🔍</p>
                <p className="text-gray-600">No results found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try different keywords
                </p>
              </div>
            )}
          </div>
        )}

        {/* Trending Topics */}
        {!searchQuery && activeTab === 'trending' && (
          <div>
            {trendingLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : (
              <div className="space-y-3">
                {trendingData?.topics?.map((topic: any, index: number) => (
                  <div
                    key={index}
                    className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <p className="font-semibold text-gray-900">
                            {topic.topic}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          {topic.subject.replace(/_/g, ' ')} •{' '}
                          {topic.questions} questions • {topic.attempts} attempts
                        </p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subjects */}
        {!searchQuery && activeTab === 'subjects' && (
          <div>
            {subjectsLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {subjectsData?.subjects?.map((subject: any) => (
                  <div
                    key={subject.subject}
                    className="card p-6 hover:shadow-md transition-shadow cursor-pointer text-center"
                  >
                    <div className="text-4xl mb-3">📚</div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {subject.subject.replace(/_/g, ' ')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {subject.questionCount} questions
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {subject.totalAttempts} attempts
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Suggested Users */}
        {!searchQuery && activeTab === 'users' && (
          <div>
            {suggestedUsersLoading ? (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            ) : (
              <div className="space-y-4">
                {suggestedUsersData?.users?.map((user: any) => (
                  <UserCard key={user._id} user={user} showFollowButton />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// User Card Component
const UserCard: React.FC<{ user: any; showFollowButton?: boolean }> = ({
  user,
  showFollowButton = false,
}) => {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-lg">
          {user.fullName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{user.fullName}</p>
          <p className="text-sm text-gray-500">@{user.username}</p>
          {user.bio && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{user.bio}</p>
          )}
        </div>
        {showFollowButton && (
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            Follow
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 text-center">
        <div>
          <p className="text-lg font-bold text-gray-900">{user.followersCount}</p>
          <p className="text-xs text-gray-500">Followers</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">
            {user.totalQuestionsAttempted}
          </p>
          <p className="text-xs text-gray-500">Questions</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{user.overallAccuracy}%</p>
          <p className="text-xs text-gray-500">Accuracy</p>
        </div>
      </div>
    </div>
  );
};

// Question Search Card Component
const QuestionSearchCard: React.FC<{ question: any }> = ({ question }) => {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
          {question.subject.replace(/_/g, ' ')}
        </span>
        <span className="text-xs text-gray-500">{question.topic}</span>
        <span
          className={cn(
            'ml-auto text-xs font-medium px-2 py-1 rounded-full',
            question.difficulty === 'EASY' && 'bg-green-100 text-green-800',
            question.difficulty === 'MEDIUM' && 'bg-yellow-100 text-yellow-800',
            question.difficulty === 'HARD' && 'bg-red-100 text-red-800'
          )}
        >
          {question.difficulty}
        </span>
      </div>
      <p className="text-gray-900 line-clamp-2 mb-2">{question.questionText}</p>
      <p className="text-xs text-gray-500">
        {question.totalAttempts} attempts • {question.accuracyPercentage}% accuracy
      </p>
    </div>
  );
};
