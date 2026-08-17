'use client';

/**
 * Circular score indicator. Extracted from the DupeShield page, where the
 * same SVG was inlined — it is now shared by dupes, layering and DNA.
 */

interface ScoreRingProps {
  /** 0..100. */
  score: number;
  size?: number;
  label?: string;
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'var(--color-mint)';
  if (score >= 60) return 'var(--color-amber)';
  if (score >= 40) return 'var(--color-amber-light)';
  return 'var(--color-rose)';
}

export function scoreTextClass(score: number): string {
  if (score >= 80) return 'text-mint';
  if (score >= 60) return 'text-amber';
  if (score >= 40) return 'text-amber-light';
  return 'text-rose';
}

export function ScoreRing({ score, size = 72, label }: ScoreRingProps) {
  const radius = size * 0.39;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, score));
  const color = scoreColor(clamped);

  return (
    <div
      className="relative"
      role="img"
      aria-label={label ?? `Match score ${clamped} out of 100`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={size * 0.083}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.083}
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * circumference} ${circumference}`}
          // Rotate so the arc starts at 12 o'clock rather than 3 o'clock.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-mono font-medium ${scoreTextClass(clamped)}`}
          style={{ fontSize: size * 0.21 }}
        >
          {clamped}%
        </span>
      </div>
    </div>
  );
}
