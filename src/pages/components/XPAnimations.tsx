// src/components/XPAnimations.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LightningBoltIcon from './LightningBoltIcon';

interface XpAnimationsProps {
  totalBolts: number;
  onAllAnimationsComplete: () => void;
}

const XpAnimations: React.FC<XpAnimationsProps> = ({
  totalBolts,
  onAllAnimationsComplete,
}) => {
  const [bolts, setBolts] = useState<number[]>([]);
  const boltsCompleted = useRef(0);

  useEffect(() => {
    // Generate bolt IDs
    const newBolts = Array.from({ length: totalBolts }, (_, i) => i);
    setBolts(newBolts);
  }, [totalBolts]);

  const handleBoltComplete = () => {
    boltsCompleted.current += 1;
    if (boltsCompleted.current >= totalBolts) {
      onAllAnimationsComplete();
      boltsCompleted.current = 0;
    }
  };

  return (
    <AnimatePresence>
      {bolts.map((id, index) => {
        const isLeft = index % 2 === 0;
        const yPosition = (window.innerHeight / totalBolts) * index;
        const xPosition = isLeft ? -50 : window.innerWidth + 50;
        const startPosition = { x: xPosition, y: yPosition };

        // Random delay between 0 and 2 seconds
        const delay = Math.random() * 2;

        return (
          <motion.div
            key={id}
            initial={{ x: startPosition.x, y: startPosition.y, opacity: 1 }}
            animate={{ x: window.innerWidth / 2, y: window.innerHeight / 2, opacity: 0 }}
            transition={{ duration: 2, delay, ease: 'easeInOut' }}
            className="fixed left-0 top-0 z-50 pointer-events-none"
            onAnimationComplete={handleBoltComplete}
          >
            <LightningBoltIcon size={30} className="text-purple-500" />
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
};

export default XpAnimations;
