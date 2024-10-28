// src/components/Header.tsx
import React from 'react';
import { LogOut, Star } from 'lucide-react';
import LightningBoltIcon from './LightningBoltIcon';

interface HeaderProps {
  xp: number;
}

const Header: React.FC<HeaderProps> = ({ xp }) => {
  return (
    <header className="bg-white border-b border-gray-200 p-4 fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800">VoiceAI Assistant</h1>
          <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
            Session #143
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-purple-600">
            <LightningBoltIcon size={20} />
            <span className="font-semibold">{Math.floor(xp)} XP</span>
          </div>
          <div className="flex items-center space-x-2 text-yellow-600">
            <Star size={20} className="fill-current" />
            <span className="font-semibold">15 Credits</span>
          </div>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 px-4 py-2 rounded-lg transition">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
