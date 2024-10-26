import React from 'react';
import { Sparkles, Volume2 } from 'lucide-react';

interface WordOfDayProps {
  word: string;
  definition: string;
  usage: string;
}

export function WordOfDay({ word, definition, usage }: WordOfDayProps) {
  return (
    <div className="bg-orange-50 rounded-xl p-6 mb-8 animate-slideIn">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Word of the Day</h2>
        <Sparkles className="w-5 h-5 text-orange-500" />
      </div>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-orange-600">{word}</h3>
          <p className="text-gray-600 mt-1">{definition}</p>
          <p className="text-gray-700 mt-2 italic">"{usage}"</p>
        </div>
        <button className="p-2 rounded-full bg-white hover:bg-orange-100 transition-colors">
          <Volume2 className="w-5 h-5 text-orange-500" />
        </button>
      </div>
    </div>
  );
}