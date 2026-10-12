import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import type { Job } from "@/lib/types";

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function matchLabel(score: number): string | null {
  if (score >= 75) return "Strong fit";
  if (score >= 50) return "Good fit";
  return null;
}

export default function JobCard({ job }: { job: Job }) {
  const domain = hostname(job.url);
  const source = job.source && job.source !== "Web result" ? job.source : domain || job.source;
  const initial = (source || "J").charAt(0).toUpperCase();
  const label = matchLabel(job.score);

  return (
    <article className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-card transition duration-200 hover:border-brand-200 hover:shadow-card-hover sm:p-6">
      {/* Top row: source + title on the left, match score on the right */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-sm font-semibold text-ink-muted transition group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-700"
            aria-hidden="true"
          >
            {initial}
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm text-ink-muted">{source}</p>
            <h3 className="mt-0.5 text-lg font-semibold leading-snug text-ink">
              {job.title}
            </h3>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
          <span
            className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-200"
            title="How well this job matches your search"
          >
            {job.score}% Match
          </span>

          {label && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Thin score bar */}
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-zinc-100" aria-hidden="true">
        <div
          className="h-full rounded-full bg-brand-600 transition-[width] duration-500"
          style={{ width: `${job.score}%` }}
        />
      </div>

      <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-zinc-600">
        {job.snippet || "No description available."}
      </p>

      {job.reasons.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
            Why it matches
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {job.reasons.map((reason) => (
              <li
                key={reason}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"
              >
                <Check className="h-3 w-3 text-brand-600" strokeWidth={3} />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {job.agentSummary && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50/50 p-3.5 shadow-sm">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p className="text-[14px] leading-relaxed text-brand-900">
            <span className="font-semibold text-brand-700">AI Analysis:</span> {job.agentSummary}
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="truncate text-xs text-zinc-400">{domain}</span>

        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary px-4 py-2.5 text-sm"
        >
          View job
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </article>
  );
}
