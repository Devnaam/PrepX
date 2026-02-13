import React from 'react';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Home Feed</h1>
        <div className="text-center py-20 text-gray-500">
          <p className="text-6xl mb-4">🏠</p>
          <p className="text-xl">Coming Soon!</p>
          <p className="text-sm mt-2">Social feed will be available here</p>
        </div>
      </div>
    </div>
  );
};
