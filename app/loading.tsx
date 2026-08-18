/**
 * Route-level loading state.
 *
 * Deliberately a skeleton rather than a spinner: it reserves the shape of
 * the content that's coming, so the page doesn't reflow when it arrives.
 */
export default function Loading() {
  return (
    <main className="min-h-[85vh] pt-32 px-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>

      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="h-3 w-28 rounded-full bg-white/[0.06] mb-10 animate-breathe" />

        <div className="space-y-4 mb-16">
          <div className="h-12 md:h-16 w-3/4 rounded-2xl bg-white/[0.05] animate-breathe" />
          <div
            className="h-12 md:h-16 w-1/2 rounded-2xl bg-white/[0.04] animate-breathe"
            style={{ animationDelay: '160ms' }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-40 rounded-2xl bg-white/[0.03] border border-hairline animate-breathe"
              style={{ animationDelay: `${index * 130}ms` }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
