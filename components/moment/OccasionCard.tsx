'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface OccasionCardProps {
  label: string;
  emoji: string;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Tilt-on-hover occasion tile. The tilt is decorative, so it is disabled
 * entirely under prefers-reduced-motion rather than merely shortened.
 */
export function OccasionCard({
  label,
  emoji,
  selected,
  onSelect,
}: OccasionCardProps) {
  const reduceMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setTilt({
      x: ((event.clientY - centerY) / (rect.height / 2)) * 7,
      y: ((event.clientX - centerX) / (rect.width / 2)) * -7,
    });
  };

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      onClick={onSelect}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: selected ? 1.04 : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
      className={`relative rounded-3xl overflow-hidden cursor-pointer group w-full aspect-square transition-colors duration-300 border ${
        selected
          ? 'border-rose shadow-[0_0_30px_rgba(194,98,122,0.25)]'
          : 'border-white/5 hover:border-white/15'
      }`}
    >
      <div className="absolute inset-0 bg-obsidian-2/60" />
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-rose/20 to-transparent" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-3 z-10">
        <span className="text-3xl md:text-4xl transition-transform duration-300 group-hover:scale-110">
          {emoji}
        </span>
        <span className="text-white/90 text-center font-mono uppercase leading-tight text-[10px] tracking-[0.08em]">
          {label}
        </span>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-3 right-3 w-6 h-6 rounded-full bg-rose flex items-center justify-center z-20 shadow-lg text-white text-xs"
            aria-hidden="true"
          >
            ✓
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
