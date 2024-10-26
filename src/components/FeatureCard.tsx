import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  Icon: LucideIcon;
  text: string;
}

export function FeatureCard({ Icon, text }: FeatureCardProps) {
  return (
    <div className="flex items-center gap-3 text-gray-600">
      <Icon className="h-5 w-5 text-orange-500" />
      <span>{text}</span>
    </div>
  );
}