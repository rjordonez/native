import React from 'react';
import { Trophy } from 'lucide-react';

interface ProgressStatsProps {
  xp: number;
  streak: number;
}

export function ProgressStats({ xp, streak }: ProgressStatsProps) {
  return (
    <div className="mb-8 animate-slideIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Your Progress</h2>
        <Trophy className="w-6 h-6 text-orange-500" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-gray-600 text-sm">Daily XP</p>
          <p className="text-2xl font-bold text-orange-500">{xp}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <p className="text-gray-600 text-sm">Day Streak</p>
          <p className="text-2xl font-bold text-orange-500">{streak} days</p>
        </div>
      </div>
    </div>
  );
}