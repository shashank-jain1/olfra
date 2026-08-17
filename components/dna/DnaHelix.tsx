'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Double-helix visual whose rung colours reflect the user's answers.
 *
 * Honours prefers-reduced-motion: the strands draw instantly rather than
 * animating for users who have asked the OS to limit motion.
 */
export function DnaHelix({
  answers,
  width = 120,
  height = 300,
}: {
  answers: Record<string, string | undefined>;
  width?: number;
  height?: number;
}) {
  const reduceMotion = useReducedMotion();
  const cx = width / 2;
  const steps = 30;
  const amplitude = width * 0.33;

  const left: Array<[number, number]> = [];
  const right: Array<[number, number]> = [];

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 4;
    const y = (i / steps) * (height - 20) + 10;
    left.push([cx + Math.sin(t) * amplitude, y]);
    right.push([cx + Math.sin(t + Math.PI) * amplitude, y]);
  }

  const rungColors = [
    answers.skin_type === 'Oily' ? '#2FFFA8' : '#4A90D9',
    answers.body_heat === 'I run warm' || answers.body_heat === 'I sweat easily'
      ? '#C8922A'
      : '#A8CC2C',
    answers.climate === 'Warm & humid' ? '#2FFFA8' : '#E8A83C',
    answers.diet === 'Spicy & rich' ? '#C0392B' : '#C2627A',
    '#C2627A',
    answers.longevity === '6+ hours' ? '#2FFFA8' : '#C8922A',
  ];

  const toPolyline = (points: Array<[number, number]>) =>
    points.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      {[
        { points: left, stroke: 'var(--color-mint)', delay: 0 },
        { points: right, stroke: 'var(--color-amber)', delay: 0.2 },
      ].map((strand, index) => (
        <motion.polyline
          key={index}
          points={toPolyline(strand.points)}
          fill="none"
          stroke={strand.stroke}
          strokeWidth={2}
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 1.4, delay: strand.delay, ease: 'easeOut' }
          }
        />
      ))}

      {rungColors.map((color, i) => {
        const index = Math.round((i / (rungColors.length - 1)) * steps);
        const [lx, ly] = left[index] ?? [cx - amplitude, 0];
        const [rx] = right[index] ?? [cx + amplitude, 0];

        return (
          <motion.line
            key={i}
            x1={lx}
            y1={ly}
            x2={rx}
            y2={ly}
            stroke={color}
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={reduceMotion ? false : { opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={
              reduceMotion ? { duration: 0 } : { delay: 1.4 + i * 0.1, duration: 0.4 }
            }
            style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
          />
        );
      })}
    </svg>
  );
}
