import React from 'react';

interface FloatingCardProps {
  title: string;
  content: string;
}

export function FloatingCard({ title, content }: FloatingCardProps) {
  return (
    <div className="bg-white/90 border-orange-200 border p-4 rounded-lg backdrop-blur-sm">
      <p className="text-orange-500 text-sm font-semibold">{title}</p>
      <p className="text-gray-900 text-lg">
        {content}
      </p>
    </div>
  );
}