'use client';

import { useEffect, useRef } from 'react';

/**
 * Ambient particle field: aromatic molecules dispersing from a source.
 *
 * Replaces the previous hero canvas, which drew 800 randomly-placed 1px
 * rectangles every frame — roughly 48,000 fill operations a second — to
 * produce a static-looking grain, and did so forever, in every tab,
 * regardless of the user's motion preferences. Grain is now a single CSS
 * layer (`.grain`); this canvas does the one thing worth animating.
 *
 * The motion is the subject: particles rise and spread from warm sources,
 * accelerating as they thin out, which is diffusion — the physical process
 * behind sillage and projection.
 *
 * Three things keep it cheap:
 *   · pauses entirely when the tab is hidden or the hero scrolls away
 *   · device pixel ratio capped at 2
 *   · renders one static frame and stops under prefers-reduced-motion
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  radius: number;
  hue: number;
}

const PARTICLE_COUNT = 120;

/** Emission points, in fractions of the canvas. */
const SOURCES = [
  { x: 0.28, y: 0.72, weight: 1 },
  { x: 0.66, y: 0.8, weight: 0.8 },
  { x: 0.48, y: 0.62, weight: 0.6 },
];

/** Amber through to a cooler ember, in HSL hue degrees. */
const HUE_RANGE: [number, number] = [34, 46];

export function DiffusionField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let width = 0;
    let height = 0;
    let frameId = 0;
    let running = true;
    let time = 0;

    const particles: Particle[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      // Capping DPR at 2 avoids quadrupling the fill cost on 3x phones
      // for a blurred background nobody inspects pixel-for-pixel.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const spawn = (particle: Particle, initial = false) => {
      const source = pickSource();
      const spread = Math.min(width, height) * 0.16;

      particle.x = source.x * width + (Math.random() - 0.5) * spread;
      particle.y = source.y * height + (Math.random() - 0.5) * spread * 0.5;
      particle.vx = (Math.random() - 0.5) * 0.22;
      particle.vy = -0.14 - Math.random() * 0.3;
      particle.maxLife = 320 + Math.random() * 420;
      // Seeding mid-life on first fill avoids every particle being born
      // at once and pulsing in unison.
      particle.life = initial ? Math.random() * particle.maxLife : 0;
      particle.radius = 22 + Math.random() * 78;
      particle.hue = HUE_RANGE[0] + Math.random() * (HUE_RANGE[1] - HUE_RANGE[0]);
    };

    const seed = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = {} as Particle;
        spawn(particle, true);
        particles.push(particle);
      }
    };

    /** Cheap flow field — two sine terms, no noise library. */
    const flow = (x: number, y: number, t: number) => ({
      x: Math.sin(y * 0.0022 + t * 0.35) * 0.014,
      y: Math.cos(x * 0.0019 - t * 0.28) * 0.009,
    });

    const draw = () => {
      // Faint wash rather than a hard clear, so particles leave a trail.
      context.globalCompositeOperation = 'source-over';
      context.fillStyle = 'rgba(6, 8, 10, 0.14)';
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = 'lighter';

      for (const particle of particles) {
        const progress = particle.life / particle.maxLife;

        // Fade in over the first 15%, out across the remainder.
        const fade =
          progress < 0.15
            ? progress / 0.15
            : 1 - (progress - 0.15) / 0.85;

        const alpha = Math.max(0, fade) * 0.052;

        if (alpha > 0.001) {
          // Radius grows with age: dispersion, visualised.
          const radius = particle.radius * (0.45 + progress * 1.5);
          const gradient = context.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            radius,
          );
          gradient.addColorStop(0, `hsla(${particle.hue}, 72%, 58%, ${alpha})`);
          gradient.addColorStop(1, `hsla(${particle.hue}, 72%, 58%, 0)`);

          context.fillStyle = gradient;
          context.beginPath();
          context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
          context.fill();
        }

        const field = flow(particle.x, particle.y, time);
        particle.vx += field.x;
        particle.vy += field.y;
        // Light drag keeps velocities bounded without a hard clamp.
        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life += 1;

        const offscreen =
          particle.x < -220 ||
          particle.x > width + 220 ||
          particle.y < -220 ||
          particle.y > height + 220;

        if (particle.life >= particle.maxLife || offscreen) spawn(particle);
      }

      context.globalCompositeOperation = 'source-over';
      time += 0.01;
    };

    const loop = () => {
      if (!running) return;
      draw();
      frameId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || prefersReducedMotion) return;
      running = true;
      frameId = requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };

    resize();
    seed();

    if (prefersReducedMotion) {
      // Composite a handful of frames into one still image, then stop —
      // the atmosphere survives, the motion doesn't.
      running = false;
      context.fillStyle = '#06080A';
      context.fillRect(0, 0, width, height);
      for (let i = 0; i < 90; i++) draw();
    } else {
      frameId = requestAnimationFrame(loop);
    }

    const handleResize = () => {
      resize();
      seed();
    };

    // A background tab should not be burning frames.
    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    // Neither should a hero that has scrolled out of view.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 w-full h-full ${className}`}
    />
  );
}

function pickSource() {
  const total = SOURCES.reduce((sum, source) => sum + source.weight, 0);
  let roll = Math.random() * total;

  for (const source of SOURCES) {
    roll -= source.weight;
    if (roll <= 0) return source;
  }
  return SOURCES[0];
}
