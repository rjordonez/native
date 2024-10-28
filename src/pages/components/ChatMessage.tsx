// src/components/ChatMessage.tsx
import React from 'react';

interface ChatMessageProps {
  message: string;
  isAI: boolean;
  timestamp: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isAI, timestamp }) => {
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[80%] ${
          isAI ? 'bg-gray-100' : 'bg-orange-500 text-white'
        } rounded-2xl px-4 py-3`}
      >
        <p className="text-sm">{message}</p>
        <span className="text-xs opacity-70 mt-1 block">{timestamp}</span>
      </div>
    </div>
  );
};

export default ChatMessage;
