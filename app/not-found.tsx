import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

export const metadata = { title: 'Not found' };

export default function NotFound() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center px-6 py-32">
      <div className="max-w-lg text-center stagger">
        <p className="eyebrow mb-8">Error 404</p>

        <h1 className="text-display-sm text-ink mb-6">
          This trail goes <em className="text-gradient-amber not-italic">cold</em>
        </h1>

        <p className="text-ink-soft leading-relaxed mb-12 measure-sm mx-auto">
          The page you were looking for isn&apos;t here. It may have moved, or
          the link may have been mistyped.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-ink text-obsidian font-mono text-[11px] uppercase tracking-[0.15em] hover:bg-white transition-colors"
          >
            <ArrowLeft size={14} /> Back home
          </Link>
          <Link
            href="/dupeshield"
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full glass border-hairline-strong text-ink-muted hover:text-ink font-mono text-[11px] uppercase tracking-[0.15em] transition-colors"
          >
            <Search size={14} /> Find a dupe
          </Link>
        </div>
      </div>
    </main>
  );
}
