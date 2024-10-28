// src/components/LightningBoltIcon.tsx
import React from 'react';

interface LightningBoltIconProps {
  size: number;
  className?: string;
}

const LightningBoltIcon: React.FC<LightningBoltIconProps> = ({ size, className }) => {
  return (
    <svg
      className={className}
      fill="currentColor"
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <path d="M13 2L3 14h7v8l11-12h-7l-1-8z" />
    </svg>
  );
};

export default LightningBoltIcon;
