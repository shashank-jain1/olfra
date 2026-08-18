'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Shield,
  Globe,
  Sparkles,
  Dna,
  ArrowRight,
  ArrowDown,
  Layers,
  Camera,
} from 'lucide-react';
import { DiffusionField } from '@/components/viz/DiffusionField';
import { ProofPanel } from '@/components/home/ProofPanel';

const PILLARS = [
  {
    icon: Shield,
    name: 'DupeShield',
    desc: 'Similarity scored from accord structure and drydown overlap, not marketing copy.',
    href: '/dupeshield',
    hue: 'var(--color-rose)',
    variant: 'glass-card--rose',
  },
  {
    icon: Dna,
    name: 'ScentDNA',
    desc: 'How fragrance behaves on your skin — sebum, temperature, climate.',
    href: '/dna',
    hue: 'var(--color-mint)',
    variant: 'glass-card--mint',
  },
  {
    icon: Sparkles,
    name: 'ScentMoment',
    desc: 'Occasion, mood, weather and longevity blended into one accord target.',
    href: '/moment',
    hue: 'var(--color-amber)',
    variant: 'glass-card--amber',
  },
  {
    icon: Layers,
    name: 'ScentLayer',
    desc: 'Whether two fragrances combine — or quietly cancel each other out.',
    href: '/layer',
    hue: 'var(--color-lime)',
    variant: 'glass-card--lime',
  },
] as const;

const SECONDARY = [
  { icon: Camera, name: 'ScentSnap', desc: 'Identify a bottle', href: '/snap' },
  { icon: Globe, name: 'ScentCulture', desc: 'What the world wears', href: '/culture' },
] as const;

/** Real, checkable properties — no invented accuracy figures. */
const FACTS = [
  { value: '32', label: 'Accord dimensions scored' },
  { value: '4', label: 'Deterministic engines' },
  { value: '0', label: 'API keys to get started' },
  { value: '100%', label: 'Reproducible results' },
  { value: '4', label: 'Signals per match' },
] as const;

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="bg-obsidian">
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20">
        <DiffusionField className="opacity-90" />

        {/* Vignette keeps the headline legible over a moving field. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 45%, transparent 0%, rgba(6,8,10,0.55) 65%, rgba(6,8,10,0.92) 100%)',
          }}
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-12 bg-amber/[0.07] border border-amber/25 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-breathe" />
            <span className="font-mono text-[10px] text-amber tracking-[0.2em] uppercase">
              Deterministic scoring · No account needed
            </span>
          </motion.div>

          <h1 className="text-display text-ink mb-9 leading-[0.88] tracking-tighter">
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={reduceMotion ? false : { y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                The intelligence
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={reduceMotion ? false : { y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                of{' '}
                <em className="text-gradient-amber font-serif italic">scent</em>
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-ink-soft mb-14 measure-sm mx-auto font-light leading-relaxed"
          >
            Fragrance analysis built on measurable chemistry. Every score is
            computed from note and accord data — explainable, reproducible, and
            identical every time you ask.
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.66, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/dupeshield"
              className="group flex items-center justify-center gap-3 px-8 py-4 min-w-[230px] rounded-full bg-gradient-to-tr from-amber to-amber-light text-obsidian font-mono text-[12px] uppercase tracking-[0.15em] font-medium shadow-glow-amber hover:-translate-y-0.5 transition-transform duration-300"
            >
              Find a dupe
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </Link>

            <Link
              href="/dna"
              className="flex items-center justify-center gap-3 px-8 py-4 min-w-[230px] rounded-full glass border-hairline-strong text-ink-muted hover:text-ink hover:bg-white/[0.05] font-mono text-[12px] uppercase tracking-[0.15em] transition-all duration-300"
            >
              Profile your skin
              <Dna size={14} />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-ink-ghost">
            See it work
          </span>
          <motion.span
            animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-amber/50"
          >
            <ArrowDown size={15} />
          </motion.span>
        </motion.div>
      </section>

      <FactsMarquee />

      <ProofPanel />

      {/* ─── Pillars ──────────────────────────────────────── */}
      <section className="py-28 md:py-36 px-6 bg-obsidian relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 max-w-2xl"
          >
            <p className="eyebrow mb-6">Four engines</p>
            <h2 className="text-title text-ink mb-5">
              Intelligence in every dimension
            </h2>
            <p className="text-ink-soft leading-relaxed">
              Each runs on the same accord model, so a profile built in one
              module sharpens the answers in the others.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PILLARS.map((pillar, index) => (
              <motion.div
                key={pillar.name}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.65,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Link href={pillar.href} className="block h-full group">
                  <article
                    className={`glass-card ${pillar.variant} p-7 h-full flex flex-col gap-6 rounded-2xl relative overflow-hidden`}
                  >
                    <pillar.icon
                      size={30}
                      strokeWidth={1.15}
                      style={{ color: pillar.hue }}
                      className="opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                    />

                    <div className="flex-1">
                      <h3 className="text-xl text-ink mb-2.5 font-serif tracking-wide">
                        {pillar.name}
                      </h3>
                      <p className="text-ink-soft text-[14px] leading-relaxed">
                        {pillar.desc}
                      </p>
                    </div>

                    <span
                      className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.15em] opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300"
                      style={{ color: pillar.hue }}
                    >
                      Open <ArrowRight size={12} />
                    </span>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            {SECONDARY.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.6 }}
              >
                <Link
                  href={item.href}
                  className="glass-card p-6 rounded-2xl flex items-center gap-5 group"
                >
                  <item.icon
                    size={22}
                    strokeWidth={1.3}
                    className="text-ink-faint group-hover:text-amber transition-colors duration-300"
                  />
                  <div className="flex-1">
                    <h3 className="text-ink font-serif text-lg">{item.name}</h3>
                    <p className="text-ink-faint text-[13px]">{item.desc}</p>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-ink-ghost group-hover:text-amber group-hover:translate-x-1 transition-all duration-300"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Method ───────────────────────────────────────── */}
      <section className="py-28 md:py-36 px-6 border-t border-hairline bg-obsidian-2 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="mb-16 max-w-2xl"
          >
            <p className="eyebrow mb-6">Why it can be trusted</p>
            <h2 className="text-title text-ink">
              A score that doesn&apos;t change its mind
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Grounded in real data',
                body: 'Scores come from published note pyramids and accord profiles. The engine cannot invent a fragrance, a note, or a price it has never seen.',
              },
              {
                n: '02',
                title: 'Identical every time',
                body: 'The same query returns the same number today, tomorrow, and on someone else’s screen. Nothing about the result drifts between sessions.',
              },
              {
                n: '03',
                title: 'Shows its working',
                body: 'Open any match to see the four measurements behind it and how each was weighted. No result asks to be taken on faith.',
              },
            ].map((item, index) => (
              <motion.article
                key={item.n}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="glass p-8 rounded-2xl border-hairline"
              >
                <span className="font-mono text-[10px] text-amber/60 tracking-[0.2em] block mb-6">
                  {item.n}
                </span>
                <h3 className="text-ink font-serif text-xl mb-3">{item.title}</h3>
                <p className="text-ink-soft text-[14px] leading-relaxed">
                  {item.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="py-32 md:py-44 px-6 text-center border-t border-hairline bg-gradient-to-b from-obsidian to-obsidian-2 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-display-sm text-ink mb-7">
            Your scent.{' '}
            <em className="text-gradient-amber font-serif italic">Decoded.</em>
          </h2>
          <p className="text-ink-soft mb-12 text-lg font-light measure-sm mx-auto">
            Start with a skin profile — six questions, about a minute, and it
            sharpens every recommendation that follows.
          </p>
          <Link
            href="/dna"
            className="group inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-tr from-amber to-amber-light text-obsidian font-mono text-[13px] uppercase tracking-[0.18em] font-medium shadow-glow-amber hover:-translate-y-1 transition-transform duration-300"
          >
            Begin
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1.5 transition-transform duration-300"
            />
          </Link>
        </motion.div>
      </section>

      <footer className="py-14 px-6 border-t border-hairline bg-obsidian-2 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="font-mono text-[10px] text-ink-ghost tracking-[0.15em] uppercase">
            OLFRA™ · Fragrance intelligence
          </p>
          <nav className="flex items-center gap-6" aria-label="Footer">
            {[
              { href: '/dupeshield', label: 'DupeShield' },
              { href: '/dna', label: 'ScentDNA' },
              { href: '/wardrobe', label: 'Wardrobe' },
              { href: '/settings', label: 'Status' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint hover:text-amber transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </main>
  );
}

/**
 * Seamless marquee.
 *
 * The previous version animated a fixed `x: [0, -1200]`, which only lined
 * up at one viewport width and visibly jumped at every other. This
 * translates by exactly -50% of a duplicated track, so the loop closes
 * cleanly at any width — and collapses to a static row under
 * prefers-reduced-motion rather than scrolling regardless.
 */
function FactsMarquee() {
  const reduceMotion = useReducedMotion();
  const track = [...FACTS, ...FACTS];

  if (reduceMotion) {
    return (
      <div className="border-y border-hairline py-8 px-6 bg-obsidian relative z-10">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-x-12 gap-y-6">
          {FACTS.map((fact) => (
            <Fact key={fact.label} {...fact} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="border-y border-hairline py-8 overflow-hidden bg-obsidian relative z-10">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
        style={{
          background:
            'linear-gradient(to right, var(--color-obsidian), transparent)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
        style={{
          background:
            'linear-gradient(to left, var(--color-obsidian), transparent)',
        }}
      />

      <motion.div
        className="flex gap-16 w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
      >
        {track.map((fact, index) => (
          <Fact key={`${fact.label}-${index}`} {...fact} />
        ))}
      </motion.div>
    </div>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-5 shrink-0">
      <span className="font-mono text-[22px] font-light text-amber tabular">
        {value}
      </span>
      <span className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.14em] whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
