export default function LoadingState({
  message = "Finding matching opportunities...",
}: {
  message?: string;
}) {
  return (
    <div className="space-y-4" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-card">
        {/* Subtle brand-colored spinner */}
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-[3px] border-brand-100" />
          <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-brand-600" />
        </span>

        <div>
          <p className="text-sm font-semibold text-ink">{message}</p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Searching the web and scoring each result against your goals.
          </p>
        </div>
      </div>

      {/* Placeholder cards so the layout doesn't jump when results arrive. */}
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 shadow-card"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-100" />
              <div>
                <div className="h-3 w-24 rounded-full bg-zinc-100" />
                <div className="mt-2.5 h-4 w-56 rounded-full bg-zinc-200/80" />
              </div>
            </div>
            <div className="h-7 w-20 rounded-full bg-brand-50" />
          </div>
          <div className="mt-5 h-3 w-full rounded-full bg-zinc-100" />
          <div className="mt-2.5 h-3 w-4/5 rounded-full bg-zinc-100" />
          <div className="mt-5 flex gap-2">
            <div className="h-6 w-20 rounded-full bg-zinc-100" />
            <div className="h-6 w-24 rounded-full bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
