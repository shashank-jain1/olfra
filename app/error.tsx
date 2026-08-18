'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

/**
 * Route-level error boundary. Without this file, an uncaught render error
 * anywhere in the app fell through to Next's default screen.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with your error reporter (Sentry et al.) at deploy time.
    console.error('[route-error]', error);
  }, [error]);

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-6 py-32">
      <div className="max-w-lg text-center stagger">
        <div className="w-14 h-14 rounded-full mx-auto mb-8 flex items-center justify-center bg-crimson/10 border border-crimson/25">
          <AlertTriangle size={20} className="text-crimson" />
        </div>

        <h1 className="text-title text-ink mb-5">Something broke</h1>

        <p className="text-ink-soft leading-relaxed mb-10 measure-sm mx-auto">
          An unexpected error stopped this page from rendering. Trying again
          often clears it — the details have been logged either way.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-ink text-obsidian font-mono text-[11px] uppercase tracking-[0.15em] hover:bg-white transition-colors"
          >
            <RefreshCw size={14} /> Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full glass border-hairline-strong text-ink-muted hover:text-ink font-mono text-[11px] uppercase tracking-[0.15em] transition-colors"
          >
            <Home size={14} /> Home
          </Link>
        </div>

        {error.digest && (
          <p className="font-mono text-[10px] text-ink-ghost tracking-[0.12em] uppercase">
            Reference {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
