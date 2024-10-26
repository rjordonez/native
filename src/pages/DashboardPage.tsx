import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { CoachSelector, coaches, type Coach } from '../components/CoachSelector';
import { WordOfDay } from '../components/WordOfDay';
import { ProgressStats } from '../components/ProgressStats';

function DashboardPage() {
  const [isListening, setIsListening] = useState(false);
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(3);
  const [selectedCoach, setSelectedCoach] = useState<Coach>(coaches[2]); // Default to Native (Advanced)

  const wordOfDay = {
    word: "Serendipity",
    definition: "The occurrence of finding pleasant things by chance",
    usage: "It was pure serendipity that we met at the café that day."
  };

  const practiceWords = [
    { word: "Eloquent", confidence: 65, attempts: 12 },
    { word: "Perseverance", confidence: 45, attempts: 8 },
    { word: "Ambiguous", confidence: 30, attempts: 5 }
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel - Voice Interaction */}
      <div className="w-2/3 p-8 flex flex-col">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={selectedCoach.avatar}
                alt={selectedCoach.name}
                className="w-12 h-12 rounded-full object-cover animate-fadeIn"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {selectedCoach.name} - {selectedCoach.level} Coach
                </h1>
                <p className="text-gray-600">{selectedCoach.description}</p>
              </div>
            </div>
            <CoachSelector selectedCoach={selectedCoach} onSelectCoach={setSelectedCoach} />
          </div>

          <WordOfDay {...wordOfDay} />
        </div>

        {/* Conversation Area */}
        <div className="flex-1 bg-gray-50 rounded-xl p-6 mb-6 animate-slideIn">
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-center">
              Press the microphone button to start practicing<br />
              I'm here to help you improve your English
            </p>
          </div>
        </div>

        {/* Voice Control */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsListening(!isListening)}
            className={`p-6 rounded-full transition-all transform hover:scale-105 ${
              isListening 
                ? 'bg-orange-500 shadow-lg scale-110 animate-pulse' 
                : 'bg-orange-100 hover:bg-orange-200'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-orange-500" />
            )}
          </button>
        </div>
      </div>

      {/* Right Panel - Progress & Stats */}
      <div className="w-1/3 bg-gray-50 p-8 border-l border-gray-100">
        <ProgressStats xp={xp} streak={streak} />

        {/* Practice Words */}
        <div className="animate-slideIn">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Words to Practice</h3>
          <div className="space-y-4">
            {practiceWords.map((word, index) => (
              <div 
                key={index} 
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">{word.word}</h4>
                  <span className="text-sm text-gray-500">{word.attempts} attempts</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 rounded-full h-2 transition-all duration-1000"
                    style={{ width: `${word.confidence}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
