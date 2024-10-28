// src/components/ChatBox.tsx
import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage.tsx';

interface ChatBoxProps {
  messages: {
    id: string;
    message: string;
    isAI: boolean;
    timestamp: string;
  }[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages }) => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      id="chat-box"
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-[calc(100vh-400px)] mb-20 overflow-y-auto scrollbar-hide"
    >
      {messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg.message}
          isAI={msg.isAI}
          timestamp={msg.timestamp}
        />
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatBox;
