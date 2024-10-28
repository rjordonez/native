// src/components/BottomBar.tsx
import React from 'react';
import {
  Mic,
  MicOff,
  History,
  Play,
  X,
} from 'lucide-react';

interface BottomBarProps {
  isActive: boolean;
  isRecording: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onStartSession: () => void;
  onToggleRecording: () => void;
  onEndSession: () => void;
  onShowSessions: () => void;
}

const BottomBar: React.FC<BottomBarProps> = ({
  isActive,
  isRecording,
  isMuted,
  onMuteToggle,
  onStartSession,
  onToggleRecording,
  onEndSession,
  onShowSessions,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-7xl mx-auto flex items-center">
        <button
          onClick={onShowSessions}
          className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 px-4 py-2 rounded-lg transition"
        >
          <History size={24} />
          <span>Previous Sessions</span>
        </button>

        <div className="flex-1 flex justify-center space-x-4">
          <button
            onClick={onMuteToggle}
            className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 px-4 py-2 rounded-lg transition"
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {!isActive ? (
            <button
              onClick={onStartSession}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition flex items-center space-x-2"
            >
              <Play size={24} />
              <span>Start Session</span>
            </button>
          ) : (
            <button
              onClick={onToggleRecording}
              className={`p-6 rounded-full transition-all duration-300 transform hover:scale-105 ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          )}
        </div>

        <div className="w-[140px] flex justify-end">
          {isActive && (
            <button
              onClick={onEndSession}
              className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg transition flex items-center space-x-2"
            >
              <X size={24} />
              <span>End Session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomBar;
