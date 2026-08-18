'use client';

import { motion } from 'framer-motion';
import {
  Settings,
  Database,
  Cpu,
  Sparkles,
  Check,
  Minus,
  Trash2,
} from 'lucide-react';
import { useCapabilities } from '@/lib/client/hooks';
import { useWardrobeStore, useDnaStore } from '@/store';
import { useHydrated } from '@/lib/client/use-hydrated';

/**
 * System status, not credential entry.
 *
 * The previous version asked users for their own Anthropic/OpenAI keys and
 * stored them in localStorage — a secret in the browser, and a signup wall
 * in front of a fragrance app. Keys now live in server environment
 * variables only. This page reports what that configuration enables.
 */
export default function SettingsPage() {
  const { data, isLoading } = useCapabilities();
  const hydrated = useHydrated();

  const bottles = useWardrobeStore((state) => state.bottles);
  const clearWardrobe = useWardrobeStore((state) => state.clear);
  const dnaProfile = useDnaStore((state) => state.profile);
  const resetDna = useDnaStore((state) => state.reset);

  return (
    <main className="min-h-screen pt-20 pb-24 bg-obsidian">
      <div className="max-w-3xl mx-auto px-6 pt-16">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-3 mb-6">
            <Settings size={16} className="text-ink-faint" />
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              System Status
            </span>
          </div>
          <h1 className="text-5xl font-serif font-light text-ink tracking-tight mb-4">
            What&apos;s running
          </h1>
          <p className="text-ink-faint text-lg font-light leading-relaxed">
            OLFRA works with no configuration at all — the scoring engines are
            deterministic and run locally. Connecting services widens the
            catalogue and unlocks the two features that need a vision model.
          </p>
        </motion.header>

        <section className="space-y-4 mb-14">
          <CapabilityRow
            icon={Cpu}
            title="Scoring engines"
            status="always-on"
            detail="DupeShield, ScentDNA, ScentMoment and ScentLayer. Pure computation — no API key, no network call, no per-request cost."
          />
          <CapabilityRow
            icon={Database}
            title="Fragrance catalogue"
            status={isLoading ? 'loading' : data?.capabilities.database ? 'on' : 'seed'}
            detail={
              data?.catalogue.seedOnly
                ? 'Running on the built-in seed catalogue. Connect a database to search the full set and let gap-fill cache new records.'
                : `Connected via the ${data?.catalogue.adapter ?? 'configured'} adapter.`
            }
          />
          <CapabilityRow
            icon={Sparkles}
            title="Photo identification & editorial"
            status={isLoading ? 'loading' : data?.capabilities.generativeAi ? 'on' : 'off'}
            detail={
              data?.capabilities.generativeAi
                ? `Enabled via ${data.ai.provider}. Used only for reading bottles from photos and writing the weekly column.`
                : 'Not configured. Bottle lookup falls back to catalogue search, which needs no key. Everything else is unaffected.'
            }
          />
        </section>

        <section className="glass p-8 rounded-3xl border-white/5 mb-8">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-6">
            Your local data
          </h2>
          <p className="text-ink-faint text-[13px] leading-relaxed mb-6">
            Your wardrobe and ScentDNA profile are stored in this browser only.
            Nothing is sent anywhere, and clearing them here is permanent.
          </p>

          <div className="space-y-3">
            <LocalDataRow
              label="Wardrobe"
              value={
                !hydrated
                  ? '…'
                  : `${bottles.length} bottle${bottles.length === 1 ? '' : 's'}`
              }
              onClear={clearWardrobe}
              disabled={!hydrated || bottles.length === 0}
            />
            <LocalDataRow
              label="ScentDNA profile"
              value={!hydrated ? '…' : dnaProfile ? 'Saved' : 'Not taken'}
              onClear={resetDna}
              disabled={!hydrated || !dnaProfile}
            />
          </div>
        </section>

        <section className="glass p-8 rounded-3xl border-white/5">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-faint mb-6">
            How credentials are handled
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[13px]">
            {[
              {
                step: '01',
                title: 'Server-side only',
                desc: 'API keys live in server environment variables. They are never sent to the browser and never stored in localStorage.',
              },
              {
                step: '02',
                title: 'Nothing to enter',
                desc: 'There is no key field here on purpose. Asking users to paste a vendor key into a web page is a pattern worth avoiding.',
              },
              {
                step: '03',
                title: 'Rate limited',
                desc: 'Public routes are capped per client, so a configured key cannot be drained by traffic to this site.',
              },
            ].map((item) => (
              <div key={item.step}>
                <span className="font-mono text-[10px] text-ink-ghost tracking-[0.2em] mb-3 block">
                  {item.step}
                </span>
                <h3 className="text-ink-muted font-serif text-base mb-2">{item.title}</h3>
                <p className="text-ink-faint leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

type CapabilityStatus = 'on' | 'off' | 'seed' | 'always-on' | 'loading';

const STATUS_STYLES: Record<CapabilityStatus, { label: string; className: string }> = {
  on: { label: 'Connected', className: 'bg-mint/10 text-mint border-mint/20' },
  'always-on': { label: 'Always on', className: 'bg-mint/10 text-mint border-mint/20' },
  seed: { label: 'Seed data', className: 'bg-amber/10 text-amber border-amber/20' },
  off: { label: 'Not configured', className: 'bg-white/5 text-ink-faint border-white/10' },
  loading: { label: 'Checking…', className: 'bg-white/5 text-ink-faint border-white/10' },
};

function CapabilityRow({
  icon: Icon,
  title,
  status,
  detail,
}: {
  icon: typeof Cpu;
  title: string;
  status: CapabilityStatus;
  detail: string;
}) {
  const style = STATUS_STYLES[status];
  const active = status === 'on' || status === 'always-on';

  return (
    <div className="glass p-6 rounded-3xl border-white/5 flex items-start gap-5">
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${
          active ? 'bg-mint/10 border-mint/25' : 'bg-white/5 border-white/10'
        }`}
      >
        <Icon size={17} className={active ? 'text-mint' : 'text-ink-faint'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h3 className="text-ink font-serif text-lg">{title}</h3>
          <span
            className={`text-[9px] font-mono px-2.5 py-1 rounded-full uppercase tracking-widest border inline-flex items-center gap-1.5 ${style.className}`}
          >
            {active ? <Check size={9} /> : <Minus size={9} />}
            {style.label}
          </span>
        </div>
        <p className="text-ink-faint text-[13px] leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

function LocalDataRow({
  label,
  value,
  onClear,
  disabled,
}: {
  label: string;
  value: string;
  onClear: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
      <div>
        <p className="text-ink-muted text-sm">{label}</p>
        <p className="text-ink-faint font-mono text-xs mt-0.5">{value}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-mono uppercase tracking-widest border border-white/10 text-ink-faint hover:text-crimson hover:border-crimson/30 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
      >
        <Trash2 size={11} /> Clear
      </button>
    </div>
  );
}
