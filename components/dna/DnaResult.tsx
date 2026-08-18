'use client';

import { motion } from 'framer-motion';
import { Dna, Info } from 'lucide-react';
import type { DnaProfile } from '@/lib/engines/dna';
import { DNA_QUESTIONS } from '@/lib/engines/dna/questions';
import { DnaHelix } from './DnaHelix';
import { ScoreRing } from '@/components/shared/ScoreRing';

interface DnaResultProps {
  profile: DnaProfile;
  answers: Record<string, string | undefined>;
  onRetake: () => void;
}

export function DnaResult({ profile, answers, onRetake }: DnaResultProps) {
  return (
    <div className="animate-fade-in">
      <header className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Dna size={18} className="text-mint" />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-mint">
            Your ScentDNA™
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl text-ink mb-6 font-serif font-light tracking-tight max-w-4xl mx-auto leading-tight">
          {profile.headline}
        </h1>
        <p className="text-ink-soft text-base max-w-2xl mx-auto leading-relaxed font-serif">
          {profile.skinInsight}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-14 items-center">
        <div className="flex justify-center lg:justify-start lg:pl-10">
          <div className="relative">
            <div className="absolute inset-0 bg-mint/5 blur-3xl rounded-full scale-150" />
            <DnaHelix answers={answers} />
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-8 rounded-3xl flex items-center gap-6 border-white/5 col-span-1 md:col-span-2">
            <ScoreRing
              score={profile.skinChemistryScore}
              size={96}
              label={`Skin chemistry score ${profile.skinChemistryScore} out of 100`}
            />
            <div>
              <p className="text-ink font-serif text-2xl mb-2">
                Skin Chemistry Profile
              </p>
              <p className="text-sm text-ink-soft leading-relaxed">
                How favourable your reported skin and climate are for fragrance
                performance overall.
              </p>
            </div>
          </div>

          <StatCard
            label="Longevity"
            value={profile.longevityModifier}
            explanation={profile.longevityExplanation}
            accent="text-mint"
          />
          <StatCard
            label="Projection"
            value={profile.projectionProfile}
            explanation={profile.projectionExplanation}
            accent="text-amber"
            serif
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="glass p-10 rounded-3xl border-white/5">
          <p className="text-[11px] font-mono text-ink-faint uppercase tracking-[0.2em] mb-8">
            Accords That Excel On You
          </p>
          <div className="space-y-6">
            {profile.bestFamilies.map((family, index) => (
              <motion.div
                key={family.accord}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex items-start gap-5"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-mint/10 border border-mint/20">
                  <span className="text-[13px] font-mono text-mint">{index + 1}</span>
                </div>
                <div className="pt-1">
                  <h3 className="text-ink text-xl font-serif mb-2">
                    {family.label}
                  </h3>
                  <p className="text-ink-faint text-[13px] leading-relaxed">
                    {family.reason}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass p-10 rounded-3xl border-white/5 flex-grow">
            <p className="text-[11px] font-mono text-ink-faint uppercase tracking-[0.2em] mb-8">
              Signature Accords
            </p>
            <div className="flex flex-wrap gap-3">
              {profile.signatureAccords.map((accord) => (
                <span
                  key={accord}
                  className="px-5 py-2.5 rounded-full font-mono text-[11px] uppercase tracking-widest bg-mint/10 border border-mint/30 text-mint"
                >
                  {accord}
                </span>
              ))}
            </div>
          </div>

          {profile.worstFamilies.length > 0 && (
            <div className="glass p-10 rounded-3xl border-white/5">
              <p className="text-[11px] font-mono text-ink-faint uppercase tracking-[0.2em] mb-6">
                Accords That Underperform
              </p>
              <div className="flex flex-wrap gap-3">
                {profile.worstFamilies.map((family) => (
                  <span
                    key={family.accord}
                    title={family.reason}
                    className="px-5 py-2.5 rounded-full text-[11px] font-mono uppercase tracking-widest bg-white/5 text-ink-faint border border-white/10"
                  >
                    {family.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass p-10 md:p-12 mb-10 rounded-3xl border-mint/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-mint/5 to-transparent opacity-50 pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <p className="text-[11px] font-mono text-mint/70 uppercase tracking-[0.2em] mb-4">
            Your Application Blueprint
          </p>
          <p className="text-ink-muted font-serif text-xl md:text-2xl leading-relaxed">
            {profile.applicationTip}
          </p>
        </div>
      </div>

      <MethodologyDisclosure profile={profile} />

      <div className="flex justify-center mt-12">
        <button
          type="button"
          onClick={onRetake}
          className="px-10 py-4 w-full md:w-auto rounded-full font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint border border-white/10 hover:bg-white/5 hover:text-ink-muted transition-all duration-300"
        >
          Retake Analysis
        </button>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  explanation,
  accent,
  serif = false,
}: {
  label: string;
  value: string;
  explanation: string;
  accent: string;
  serif?: boolean;
}) {
  return (
    <div className="glass p-8 rounded-3xl border-white/5">
      <p className="text-[11px] font-mono text-ink-faint uppercase tracking-[0.2em] mb-4">
        {label}
      </p>
      <div
        className={`mb-4 ${accent} ${
          serif ? 'text-4xl font-serif font-light' : 'text-5xl font-mono font-light tracking-tighter'
        }`}
      >
        {value}
      </div>
      <p className="text-[13px] text-ink-soft leading-relaxed">{explanation}</p>
    </div>
  );
}

/**
 * States plainly what the score is based on — and what it isn't.
 *
 * A questionnaire that returns a confident-looking number owes the reader
 * this. Skin tone is collected but carries zero weight, and saying so is
 * more useful than quietly dropping the question.
 */
function MethodologyDisclosure({ profile }: { profile: DnaProfile }) {
  const anecdotal = DNA_QUESTIONS.filter((q) => q.evidence === 'anecdotal');

  return (
    <details className="glass rounded-3xl border-white/5 overflow-hidden group">
      <summary className="flex items-center gap-3 p-6 cursor-pointer list-none hover:bg-white/[0.02] transition-colors">
        <Info size={16} className="text-ink-faint" />
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-soft">
          How this profile was calculated
        </span>
      </summary>

      <div className="px-6 pb-8 pt-2 space-y-5 text-[13px] leading-relaxed text-ink-soft max-w-3xl">
        <p>
          This is a deterministic profile, not a measurement. Your answers are run
          through a fixed rule table — the same answers always produce the same
          result, and you can retake it without the numbers drifting.
        </p>

        <div>
          <p className="text-ink-muted mb-2 font-mono text-[11px] uppercase tracking-wider">
            Weighted factors
          </p>
          <ul className="space-y-1.5 list-disc list-inside">
            {profile.methodology.weightedFactors.map((factor) => (
              <li key={factor}>{factor}</li>
            ))}
          </ul>
        </div>

        {anecdotal.length > 0 && (
          <div>
            <p className="text-ink-muted mb-2 font-mono text-[11px] uppercase tracking-wider">
              Collected but not weighted
            </p>
            {anecdotal.map((question) => (
              <p key={question.id}>
                <span className="text-ink-soft">{question.question}</span> —{' '}
                {question.rationale}
              </p>
            ))}
          </div>
        )}

        <p className="text-ink-faint italic">
          Sebum content, skin temperature and humidity have well-established effects
          on how fragrance evaporates and how long it lasts. Nothing here diagnoses
          anything or replaces trying a fragrance on your own skin.
        </p>
      </div>
    </details>
  );
}
