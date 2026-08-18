'use client';

import { useId, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ACCORD_LABELS,
  CANONICAL_ACCORDS,
  toAccordVector,
  type CanonicalAccord,
} from '@/lib/fragrance/accords';
import { inferAccordsFromNotes } from '@/lib/fragrance/note-accords';
import type { Fragrance } from '@/lib/fragrance/types';

/**
 * A fragrance's accord vector, drawn.
 *
 * The engine already reduces every fragrance to 32 accord dimensions in
 * order to score similarity — this makes that vector visible. Each spoke
 * is one accord; its reach is that accord's weight. The resulting shape is
 * the fragrance's signature, and two signatures overlaid show precisely
 * the overlap that produced a dupe score.
 *
 * This is the number the user is being asked to trust, drawn as a picture.
 */

interface AccordFingerprintProps {
  fragrance: Fragrance;
  /** Second fragrance drawn over the first, for comparison. */
  compare?: Fragrance;
  size?: number;
  /** CSS colour for the primary shape. */
  color?: string;
  /** CSS colour for the comparison shape. */
  compareColor?: string;
  /** Label the strongest accords around the rim. */
  showLabels?: boolean;
  className?: string;
}

export function AccordFingerprint({
  fragrance,
  compare,
  size = 260,
  color = 'var(--color-amber)',
  compareColor = 'var(--color-mint)',
  showLabels = true,
  className = '',
}: AccordFingerprintProps) {
  const reduceMotion = useReducedMotion();
  const gradientId = useId();
  const compareGradientId = useId();

  const center = size / 2;
  const maxRadius = center * 0.72;
  const minRadius = center * 0.14;

  const primary = useMemo(
    () => buildShape(fragrance, center, minRadius, maxRadius),
    [fragrance, center, minRadius, maxRadius],
  );

  const secondary = useMemo(
    () => (compare ? buildShape(compare, center, minRadius, maxRadius) : null),
    [compare, center, minRadius, maxRadius],
  );

  const labels = useMemo(
    () => (showLabels ? topLabels(primary.vector, center, maxRadius, 5) : []),
    [showLabels, primary.vector, center, maxRadius],
  );

  const drawTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 1.4, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      role="img"
      aria-label={`Accord signature for ${fragrance.name}${
        compare ? `, overlaid with ${compare.name}` : ''
      }. Strongest accords: ${primary.top.map((a) => a.label).join(', ')}.`}
    >
      <defs>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor={color} stopOpacity="0.42" />
          <stop offset="100%" stopColor={color} stopOpacity="0.06" />
        </radialGradient>
        <radialGradient id={compareGradientId}>
          <stop offset="0%" stopColor={compareColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={compareColor} stopOpacity="0.04" />
        </radialGradient>
      </defs>

      {/* Reference rings — quiet scale, so reach reads as magnitude. */}
      {[0.25, 0.5, 0.75, 1].map((step) => (
        <circle
          key={step}
          cx={center}
          cy={center}
          r={minRadius + (maxRadius - minRadius) * step}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth={1}
        />
      ))}

      {/* Spokes, one per accord dimension. */}
      {CANONICAL_ACCORDS.map((accord, index) => {
        const angle = (index / CANONICAL_ACCORDS.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <line
            key={accord}
            x1={center + Math.cos(angle) * minRadius}
            y1={center + Math.sin(angle) * minRadius}
            x2={center + Math.cos(angle) * maxRadius}
            y2={center + Math.sin(angle) * maxRadius}
            stroke="var(--color-hairline)"
            strokeWidth={0.5}
          />
        );
      })}

      {/* Comparison shape sits beneath, so the primary stays legible. */}
      {secondary && (
        <>
          <motion.path
            d={secondary.path}
            fill={`url(#${compareGradientId})`}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          />
          <motion.path
            d={secondary.path}
            fill="none"
            stroke={compareColor}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeDasharray="4 3"
            pathLength={1}
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ ...drawTransition, delay: 0.2 }}
          />
        </>
      )}

      <motion.path
        d={primary.path}
        fill={`url(#${gradientId})`}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ transformOrigin: `${center}px ${center}px` }}
        transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.path
        d={primary.path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        pathLength={1}
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={drawTransition}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />

      {/* Vertex dots on the accords that actually carry weight. */}
      {primary.points
        .filter((point) => point.weight > 0.18)
        .map((point) => (
          <motion.circle
            key={point.accord}
            cx={point.x}
            cy={point.y}
            r={2.5}
            fill={color}
            initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.1 + point.index * 0.02, duration: 0.3 }}
          />
        ))}

      {labels.map((label, index) => (
        <motion.text
          key={label.accord}
          x={label.x}
          y={label.y}
          textAnchor={label.anchor}
          dominantBaseline="middle"
          className="font-mono uppercase"
          fontSize={size * 0.036}
          letterSpacing="0.08em"
          fill="var(--color-ink-faint)"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 + index * 0.07, duration: 0.4 }}
        >
          {label.label}
        </motion.text>
      ))}
    </svg>
  );
}

// ─── geometry ────────────────────────────────────────────────

interface ShapePoint {
  accord: CanonicalAccord;
  index: number;
  weight: number;
  x: number;
  y: number;
}

function buildShape(
  fragrance: Fragrance,
  center: number,
  minRadius: number,
  maxRadius: number,
) {
  const accords =
    Object.keys(fragrance.accords ?? {}).length > 0
      ? fragrance.accords
      : inferAccordsFromNotes(fragrance.notes);

  const vector = toAccordVector(accords);

  // Normalise against the strongest accord so every fingerprint fills the
  // frame. Without this, a fragrance tagged with many faint accords would
  // render as a barely-visible dot next to a focused one.
  const peak = Math.max(...Array.from(vector), 0.0001);

  const points: ShapePoint[] = CANONICAL_ACCORDS.map((accord, index) => {
    const weight = vector[index] / peak;
    const angle = (index / CANONICAL_ACCORDS.length) * Math.PI * 2 - Math.PI / 2;
    const radius = minRadius + weight * (maxRadius - minRadius);

    return {
      accord,
      index,
      weight,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  });

  const top = Array.from(vector)
    .map((weight, index) => ({
      accord: CANONICAL_ACCORDS[index],
      label: ACCORD_LABELS[CANONICAL_ACCORDS[index]],
      weight,
    }))
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  return { vector, points, path: smoothClosedPath(points), top };
}

/**
 * Closed Catmull-Rom spline through the vertices, emitted as cubic Béziers.
 *
 * A plain polygon reads as spiky and makes two similar fragrances look
 * more different than they are; smoothing gives each signature an organic
 * silhouette that's easier to compare at a glance.
 */
function smoothClosedPath(points: Array<{ x: number; y: number }>): string {
  const count = points.length;
  if (count < 3) return '';

  const at = (index: number) => points[(index + count) % count];
  const segments: string[] = [`M ${at(0).x.toFixed(2)} ${at(0).y.toFixed(2)}`];

  for (let i = 0; i < count; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);

    // Tension 1/6 is the standard Catmull-Rom → Bézier conversion.
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    segments.push(
      `C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    );
  }

  return `${segments.join(' ')} Z`;
}

function topLabels(
  vector: Float64Array,
  center: number,
  maxRadius: number,
  count: number,
) {
  return Array.from(vector)
    .map((weight, index) => ({ weight, index }))
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, count)
    .map(({ index }) => {
      const accord = CANONICAL_ACCORDS[index];
      const angle =
        (index / CANONICAL_ACCORDS.length) * Math.PI * 2 - Math.PI / 2;
      const radius = maxRadius + center * 0.14;
      const x = center + Math.cos(angle) * radius;

      return {
        accord,
        label: ACCORD_LABELS[accord],
        x,
        y: center + Math.sin(angle) * radius,
        // Anchor away from the centre so labels never overlap the shape.
        anchor: (x < center - 4
          ? 'end'
          : x > center + 4
            ? 'start'
            : 'middle') as 'start' | 'middle' | 'end',
      };
    });
}
