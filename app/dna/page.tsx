'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dna, ChevronLeft } from 'lucide-react';
import { DNA_QUESTIONS } from '@/lib/engines/dna/questions';
import { useComputeDna } from '@/lib/client/hooks';
import { useDnaStore } from '@/store';
import { DnaHelix } from '@/components/dna/DnaHelix';
import { DnaResult } from '@/components/dna/DnaResult';
import { ErrorNotice } from '@/components/shared/ErrorNotice';

export default function ScentDnaPage() {
  const [step, setStep] = useState(0);
  const { answers, profile, setAnswer, setProfile, reset } = useDnaStore();
  const compute = useComputeDna();

  const total = DNA_QUESTIONS.length;
  const currentQuestion = DNA_QUESTIONS[step];

  // Persist the computed profile so ScentMoment and the feed can use it.
  useEffect(() => {
    if (compute.data) setProfile(compute.data);
  }, [compute.data, setProfile]);

  const handleAnswer = (answer: string) => {
    setAnswer(currentQuestion.id, answer);
    const nextAnswers = { ...answers, [currentQuestion.id]: answer };

    if (step < total - 1) {
      setStep(step + 1);
      return;
    }
    compute.mutate(nextAnswers);
  };

  const handleRetake = () => {
    reset();
    compute.reset();
    setStep(0);
  };

  if (compute.isPending) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="text-center" role="status" aria-live="polite">
          <div className="mx-auto mb-10 flex justify-center">
            <DnaHelix answers={answers} />
          </div>
          <p className="text-ink-soft font-mono text-[11px] uppercase tracking-[0.2em]">
            Computing your profile…
          </p>
        </div>
      </main>
    );
  }

  if (profile) {
    return (
      <main className="min-h-screen pt-20 pb-24 bg-obsidian">
        <div className="max-w-5xl mx-auto px-6 pt-12">
          <DnaResult profile={profile} answers={answers} onRetake={handleRetake} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 flex flex-col bg-obsidian">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl mb-16">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Dna size={16} className="text-mint" />
              <span className="font-mono text-[10px] text-ink-faint uppercase tracking-[0.2em]">
                ScentDNA™
              </span>
            </div>
            <span className="font-mono text-[10px] text-ink-faint tracking-[0.2em]">
              STEP {step + 1} OF {total}
            </span>
          </div>
          <div
            className="h-1 rounded-full overflow-hidden bg-white/5"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={total}
          >
            <motion.div
              className="h-full rounded-full bg-mint shadow-[0_0_10px_rgba(47,255,168,0.5)]"
              animate={{ width: `${((step + 1) / total) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {compute.isError && (
          <div className="w-full max-w-2xl mb-8">
            <ErrorNotice
              error={compute.error}
              onRetry={() => compute.mutate(answers)}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl"
          >
            <div className="text-center mb-12">
              <div className="text-6xl md:text-7xl mb-8">{currentQuestion.emoji}</div>
              <h2 className="text-3xl md:text-5xl text-ink font-serif font-light tracking-tight max-w-2xl mx-auto leading-tight mb-5">
                {currentQuestion.question}
              </h2>
              <p className="text-ink-faint text-[13px] max-w-xl mx-auto leading-relaxed">
                {currentQuestion.rationale}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => {
                const selected = answers[currentQuestion.id] === option;
                return (
                  <motion.button
                    key={option}
                    type="button"
                    onClick={() => handleAnswer(option)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`py-6 px-8 rounded-3xl font-serif text-xl tracking-wide text-center transition-all duration-300 border ${
                      selected
                        ? 'bg-mint/10 border-mint/40 text-mint'
                        : 'bg-white/[0.02] border-hairline text-ink-muted hover:bg-mint/5 hover:border-mint/30 hover:text-mint'
                    }`}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-3 mx-auto mt-12 text-ink-faint hover:text-ink-muted transition-colors font-mono text-[11px] uppercase tracking-[0.2em] px-6 py-2 rounded-full hover:bg-white/5"
              >
                <ChevronLeft size={14} /> Previous Step
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
