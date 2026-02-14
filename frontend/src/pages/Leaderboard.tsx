import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaderboardService } from '@/services/leaderboard.service';
import { LeaderboardCard } from '@/components/leaderboard/LeaderboardCard';
import { Loader } from '@/components/common/Loader';
import { Trophy, TrendingUp, Users, BookOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAppSelector } from '@/hooks/useRedux';

type TabType = 'global' | 'weekly' | 'friends' | 'subject';

const SUBJECTS = [
  { value: 'MATHEMATICS', label: 'Mathematics', icon: '🔢' },
  { value: 'GENERAL_KNOWLEDGE', label: 'GK', icon: '🌍' },
  { value: 'REASONING', label: 'Reasoning', icon: '🧩' },
  { value: 'ENGLISH', label: 'English', icon: '📚' },
  { value: 'GENERAL_SCIENCE', label: 'Science', icon: '🔬' },
];

export const Leaderboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [selectedSubject, setSelectedSubject] = useState('MATHEMATICS');

  // Global leaderboard
  const { data: globalData, isLoading: globalLoading } = useQuery({
    queryKey: ['leaderboard', 'global'],
    queryFn: () => leaderboardService.getGlobalLeaderboard(),
    enabled: activeTab === 'global',
  });

  // Weekly leaderboard
  const { data: weeklyData, isLoading: weeklyLoading } = useQuery({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: () => leaderboardService.getWeeklyLeaderboard(),
    enabled: activeTab === 'weekly',
  });

  // Friends leaderboard
  const { data: friendsData, isLoading: friendsLoading } = useQuery({
    queryKey: ['leaderboard', 'friends'],
    queryFn: () => leaderboardService.getFriendsLeaderboard(),
    enabled: activeTab === 'friends',
  });

  // Subject leaderboard
  const { data: subjectData, isLoading: subjectLoading } = useQuery({
    queryKey: ['leaderboard', 'subject', selectedSubject],
    queryFn: () => leaderboardService.getSubjectLeaderboard(selectedSubject),
    enabled: activeTab === 'subject',
  });

  const tabs = [
    { id: 'global' as const, label: 'Global', icon: Trophy },
    { id: 'weekly' as const, label: 'Weekly', icon: TrendingUp },
    { id: 'friends' as const, label: 'Friends', icon: Users },
    { id: 'subject' as const, label: 'Subject', icon: BookOpen },
  ];

  const isLoading = globalLoading || weeklyLoading || friendsLoading || subjectLoading;

  const getCurrentData = () => {
    switch (activeTab) {
      case 'global':
        return globalData;
      case 'weekly':
        return weeklyData;
      case 'friends':
        return friendsData;
      case 'subject':
        return subjectData;
      default:
        return null;
    }
  };

  const currentData = getCurrentData();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Leaderboard</h1>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
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

          {/* Subject Filter */}
          {activeTab === 'subject' && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject.value}
                  onClick={() => setSelectedSubject(subject.value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    selectedSubject === subject.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  <span>{subject.icon}</span>
                  {subject.label}
                </button>
              ))}
            </div>
          )}

          {/* Current User Rank */}
          {activeTab === 'global' && globalData?.currentUserRank && (
            <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-800">
                Your Global Rank: <span className="font-bold">#{globalData.currentUserRank}</span>
              </p>
            </div>
          )}

          {activeTab === 'weekly' && weeklyData?.currentUserWeeklyRank && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Your Weekly Rank: <span className="font-bold">#{weeklyData.currentUserWeeklyRank}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Global Tab */}
            {activeTab === 'global' &&
              globalData?.users?.map((userItem: any) => (
                <LeaderboardCard
                  key={userItem._id}
                  user={userItem}
                  rank={userItem.rank}
                  stats={{
                    accuracy: userItem.overallAccuracy,
                    totalAttempts: userItem.totalQuestionsAttempted,
                    currentStreak: userItem.currentStreak,
                  }}
                  isCurrentUser={userItem._id === user?._id}
                />
              ))}

            {/* Weekly Tab */}
            {activeTab === 'weekly' &&
              weeklyData?.leaderboard?.map((item: any) => (
                <LeaderboardCard
                  key={item.user._id}
                  user={item.user}
                  rank={item.rank}
                  stats={item.weeklyStats}
                  isCurrentUser={item.user._id === user?._id}
                  showWeeklyBadge
                />
              ))}

            {/* Friends Tab */}
            {activeTab === 'friends' &&
              friendsData?.friends?.map((friendItem: any) => (
                <LeaderboardCard
                  key={friendItem._id}
                  user={friendItem}
                  rank={friendItem.rank}
                  stats={{
                    accuracy: friendItem.overallAccuracy,
                    totalAttempts: friendItem.totalQuestionsAttempted,
                    currentStreak: friendItem.currentStreak,
                  }}
                  isCurrentUser={friendItem.isCurrentUser}
                />
              ))}

            {/* Subject Tab */}
            {activeTab === 'subject' &&
              subjectData?.leaderboard?.map((item: any) => (
                <LeaderboardCard
                  key={item.user._id}
                  user={item.user}
                  rank={item.rank}
                  stats={item.subjectStats}
                  isCurrentUser={item.user._id === user?._id}
                />
              ))}

            {/* Empty State */}
            {currentData &&
              ((activeTab === 'global' && globalData?.users?.length === 0) ||
                (activeTab === 'weekly' && weeklyData?.leaderboard?.length === 0) ||
                (activeTab === 'friends' && friendsData?.friends?.length === 0) ||
                (activeTab === 'subject' && subjectData?.leaderboard?.length === 0)) && (
                <div className="text-center py-20">
                  <Trophy className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-600 mb-2">No rankings yet</p>
                  <p className="text-sm text-gray-500">
                    Be the first to make it to the leaderboard!
                  </p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
