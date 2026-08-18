'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { ApiError } from '@/lib/client/api';

interface ErrorNoticeProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

/**
 * Shows what actually went wrong.
 *
 * User-caused failures (a fragrance we don't have, a bad input) get the
 * server's specific message. Server-side failures get a generic line — the
 * detail is in the server log, not the user's face — and a retry.
 */
export function ErrorNotice({ error, onRetry, className = '' }: ErrorNoticeProps) {
  const apiError = error instanceof ApiError ? error : null;
  const isUserFacing = apiError?.isUserFacing ?? false;

  const message = isUserFacing
    ? apiError!.message
    : 'Something went wrong on our side. Please try again in a moment.';

  const retryable = !isUserFacing || apiError?.code === 'rate_limited';

  return (
    <div
      role="alert"
      className={`glass p-8 rounded-3xl border-rose/20 flex items-start gap-4 ${className}`}
    >
      <AlertTriangle size={20} className="shrink-0 text-rose mt-1" />
      <div className="flex-1">
        <p className="text-ink-muted font-serif text-lg leading-relaxed mb-1">
          {message}
        </p>
        {apiError?.code === 'fragrance_not_found' && (
          <p className="text-ink-faint text-[13px] leading-relaxed">
            Try the full name including the house, e.g. “Parfums de Marly Layton”.
          </p>
        )}
        {onRetry && retryable && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-mono uppercase tracking-[0.15em] text-ink-soft border border-white/10 hover:bg-white/5 hover:text-ink transition-all"
          >
            <RefreshCw size={12} /> Try again
          </button>
        )}
      </div>
    </div>
  );
}
