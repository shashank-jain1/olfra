'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, Thermometer, Timer, ChevronRight } from 'lucide-react';
import { OCCASIONS, MOODS, TIMES_OF_DAY, WEATHERS } from '@/lib/engines/moment/occasions';
import { useMomentRecommendation } from '@/lib/client/hooks';
import { useDnaStore } from '@/store';
import { OccasionCard } from '@/components/moment/OccasionCard';
import { MomentResultView } from '@/components/moment/MomentResult';
import { ErrorNotice } from '@/components/shared/ErrorNotice';
import { CatalogueNotice } from '@/components/shared/CatalogueNotice';

const MOOD_OPTIONS = Object.keys(MOODS);
const TIME_OPTIONS = Object.keys(TIMES_OF_DAY);
const WEATHER_OPTIONS = Object.keys(WEATHERS);

export default function ScentMomentPage() {
  const [occasionId, setOccasionId] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);
  const [longevityHours, setLongevityHours] = useState(6);

  const dnaProfile = useDnaStore((state) => state.profile);
  const recommend = useMomentRecommendation();

  const ready = Boolean(occasionId && mood && time && weather);

  const submit = () => {
    if (!ready) return;
    recommend.mutate({
      occasionId: occasionId!,
      mood: mood!,
      time: time!,
      weather: weather!,
      longevityHours,
      // Personalises ranking when the user has taken ScentDNA.
      dna: dnaProfile ?? undefined,
    });
  };

  const reset = () => {
    recommend.reset();
    setOccasionId(null);
    setMood(null);
    setTime(null);
    setWeather(null);
  };

  if (recommend.isPending) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center bg-obsidian">
        <div className="text-center" role="status" aria-live="polite">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full border border-white/5 border-t-rose border-r-rose/30 mx-auto mb-8"
          />
          <p className="text-white/50 font-mono text-[11px] uppercase tracking-[0.2em]">
            Matching your moment…
          </p>
        </div>
      </main>
    );
  }

  if (recommend.data) {
    const occasionLabel =
      OCCASIONS.find((occasion) => occasion.id === occasionId)?.label ?? '';

    return (
      <main className="min-h-screen pt-20 pb-16 bg-obsidian">
        <div className="max-w-3xl mx-auto px-6 pt-12">
          <MomentResultView
            result={recommend.data}
            context={`${occasionLabel} · ${mood} · ${time} · ${weather}`}
            personalised={Boolean(dnaProfile)}
            onReset={reset}
          />
          <div className="mt-6">
            <CatalogueNotice />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-24 bg-obsidian">
      <div className="text-center pt-16 pb-12 px-6 bg-gradient-to-b from-rose/5 to-transparent">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles size={18} className="text-rose" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose">
              ScentMoment™
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl text-white/90 mb-4 font-serif font-light tracking-tight">
            The right scent for{' '}
            <em className="text-rose italic pr-1">this moment</em>
          </h1>
          <p className="text-white/40 text-lg font-light tracking-wide max-w-xl mx-auto leading-relaxed">
            Occasion, mood, time and weather combine into one accord target.
            Every candidate is scored against it.
          </p>
          {dnaProfile && (
            <p className="text-mint/60 font-mono text-[10px] uppercase tracking-[0.15em] mt-4">
              Your ScentDNA profile will personalise the ranking
            </p>
          )}
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {recommend.isError && (
          <ErrorNotice error={recommend.error} onRetry={submit} className="mb-10" />
        )}

        <Step number="1" title="Choose your occasion">
          <div
            role="radiogroup"
            aria-label="Occasion"
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
          >
            {OCCASIONS.map((occasion) => (
              <OccasionCard
                key={occasion.id}
                label={occasion.label}
                emoji={occasion.emoji}
                selected={occasionId === occasion.id}
                onSelect={() => setOccasionId(occasion.id)}
              />
            ))}
          </div>
        </Step>

        <Step number="2" title="Your mood">
          <PillGroup
            label="Mood"
            options={MOOD_OPTIONS}
            selected={mood}
            onSelect={setMood}
          />
        </Step>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-14">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Clock size={16} className="text-white/30" />
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em]">
                3. Time of day
              </p>
            </div>
            <PillGroup
              label="Time of day"
              options={TIME_OPTIONS}
              selected={time}
              onSelect={setTime}
              grid
            />
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <Thermometer size={16} className="text-white/30" />
              <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em]">
                4. Weather
              </p>
            </div>
            <PillGroup
              label="Weather"
              options={WEATHER_OPTIONS}
              selected={weather}
              onSelect={setWeather}
              grid
            />
          </section>
        </div>

        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Timer size={16} className="text-white/30" />
              <label
                htmlFor="longevity"
                className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em]"
              >
                5. Desired longevity
              </label>
            </div>
            <div className="px-4 py-1.5 rounded-full border border-rose/20 bg-rose/5">
              <span className="font-mono text-[13px] text-rose tracking-wider tabular-nums">
                {longevityHours}{' '}
                <span className="text-rose/50 text-[10px] uppercase">hours</span>
              </span>
            </div>
          </div>

          <input
            id="longevity"
            type="range"
            min={2}
            max={12}
            step={1}
            value={longevityHours}
            onChange={(event) => setLongevityHours(Number(event.target.value))}
            className="w-full accent-rose cursor-pointer"
          />

          <div className="flex justify-between mt-4">
            {[2, 4, 6, 8, 10, 12].map((hour) => (
              <span
                key={hour}
                className="font-mono text-[10px] text-white/30 tabular-nums"
              >
                {hour}h
              </span>
            ))}
          </div>
        </section>

        <motion.button
          type="button"
          onClick={submit}
          disabled={!ready}
          whileHover={ready ? { scale: 1.01 } : undefined}
          whileTap={ready ? { scale: 0.99 } : undefined}
          className={`w-full py-5 rounded-full font-mono text-[13px] uppercase tracking-[0.2em] transition-all duration-500 group ${
            ready
              ? 'bg-white text-obsidian shadow-[0_0_40px_rgba(255,255,255,0.15)]'
              : 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
          }`}
        >
          <span className="flex items-center justify-center gap-3">
            {ready ? 'Find my ScentMoment' : 'Complete all five steps'}
            <ChevronRight
              size={16}
              className={`transition-transform duration-300 ${ready ? 'group-hover:translate-x-1.5' : ''}`}
            />
          </span>
        </motion.button>

        <div className="mt-10">
          <CatalogueNotice />
        </div>
      </div>
    </main>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-8 h-px bg-white/20" />
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.2em]">
          {number}. {title}
        </p>
        <div className="flex-1 h-px bg-white/5" />
      </div>
      {children}
    </section>
  );
}

function PillGroup({
  label,
  options,
  selected,
  onSelect,
  grid = false,
}: {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  grid?: boolean;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={grid ? 'grid grid-cols-2 gap-3' : 'flex flex-wrap gap-3'}
    >
      {options.map((option) => {
        const active = selected === option;
        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(option)}
            className={`${
              grid ? 'py-4 px-4 rounded-2xl text-[13px]' : 'px-6 py-3 rounded-full text-sm'
            } font-mono tracking-wide transition-all duration-300 border ${
              active
                ? 'bg-rose/10 text-rose border-rose/40 shadow-[0_0_20px_rgba(194,98,122,0.15)]'
                : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white/80 hover:border-white/15'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
