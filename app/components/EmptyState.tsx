import { SearchX, Sparkles } from "lucide-react";

export default function EmptyState({ searched }: { searched: boolean }) {
  const Icon = searched ? SearchX : Sparkles;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-8 ring-brand-50/50">
        <Icon className="h-6 w-6" />
      </span>

      <h3 className="mt-5 text-base font-semibold text-ink">
        {searched ? "No matching jobs found" : "Your job results will appear here"}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm text-ink-muted">
        {searched
          ? "Try a broader role, a different location, or fewer keywords."
          : "Tell us what you're looking for above and we'll rank the best opportunities for you."}
      </p>
    </div>
  );
}
