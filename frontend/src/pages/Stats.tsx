import React, { useState } from 'react';
import { TodayStats } from '@/components/stats/TodayStats';
import { WeekStats } from '@/components/stats/WeekStats';
import { ActivityGraph } from '@/components/stats/ActivityGraph';
import { AllTimeStats } from '@/components/stats/AllTimeStats';
import { cn } from '@/utils/cn';

type TabType = 'today' | 'week' | 'activity' | 'all-time';

export const Stats: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('today');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'Week' },
    { id: 'activity', label: 'Activity' },
    { id: 'all-time', label: 'All Time' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your Stats</h1>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'today' && <TodayStats />}
        {activeTab === 'week' && <WeekStats />}
        {activeTab === 'activity' && <ActivityGraph />}
        {activeTab === 'all-time' && <AllTimeStats />}
      </div>
    </div>
  );
};
