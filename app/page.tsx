"use client";

import { useState } from "react";
import { Globe2, RefreshCw, Search, Sparkles } from "lucide-react";
import Header from "./components/Header";
import SearchForm from "./components/SearchForm";
import JobCard from "./components/JobCard";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import EmptyState from "./components/EmptyState";
import type { Job, SearchResponse } from "@/lib/types";

const STEPS = [
  {
    icon: Search,
    title: "1. Discover (TinyFish Search)",
    text: "We use multiple focused TinyFish Search queries to discover live openings across company career pages and job portals.",
  },
  {
    icon: Globe2,
    title: "2. Read (TinyFish Fetch)",
    text: "We use TinyFish Fetch to read the current text of the highest-ranked listing pages instead of relying only on search snippets.",
  },
  {
    icon: Sparkles,
    title: "3. Analyze (TinyFish Agent)",
    text: "TinyFish Agent turns those pages into concise requirement, salary, and remote-work summaries; every result is deduplicated and ranked.",
  },
];

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchId, setSearchId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  function handleResults(newJobs: Job[], newSearchId: string | null) {
    setJobs(newJobs);
    setSearchId(newSearchId);
    setHasSearched(true);
  }

  async function handleRefresh() {
    if (!searchId) return;

    setRefreshing(true);
    setError("");

    try {
      const response = await fetch("/api/jobs/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId }),
      });

      const data = (await response.json()) as SearchResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          ("error" in data && data.error) || "Refresh failed"
        );
      }

      setJobs(data.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setRefreshing(false);
    }
  }

  const busy = loading || refreshing;
  const topScore = jobs.length > 0 ? jobs[0].score : 0;

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* ---------- Hero ---------- */}
        <section className="relative isolate overflow-hidden">
          {/* Soft brand glow + faint grid, kept very subtle */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(193,30,144,0.10),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(24,24,27,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]"
          />

          <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3.5 py-1 text-xs font-medium text-brand-700 shadow-sm backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-600" />
              Smart job matching for students and professionals
            </span>

            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-6xl">
              Job<span className="text-brand-600">Scout</span>
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-lg text-ink-muted sm:text-xl">
              Find jobs and internships that match your goals.
            </p>
          </div>

          {/* ---------- Search form ---------- */}
          <div id="search" className="mx-auto max-w-4xl scroll-mt-24 px-4 pb-6 sm:px-6">
            <SearchForm
              loading={busy}
              onResults={handleResults}
              onLoading={setLoading}
              onError={setError}
            />
          </div>
        </section>

        {/* ---------- Results ---------- */}
        <section
          id="results"
          className="mx-auto max-w-4xl scroll-mt-24 px-4 py-10 sm:px-6"
          aria-labelledby="results-heading"
        >
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="results-heading" className="text-xl font-semibold tracking-tight text-ink">
                {jobs.length > 0 ? "Your matches" : "Results"}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {jobs.length > 0 && !busy
                  ? `${jobs.length} ${jobs.length === 1 ? "opportunity" : "opportunities"} found · best matches first · top match ${topScore}%`
                  : "Ranked by how well each job fits your search."}
              </p>
            </div>

            {searchId && jobs.length > 0 && (
              <button
                type="button"
                onClick={handleRefresh}
                disabled={busy}
                className="btn-secondary self-start sm:self-auto"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh results"}
              </button>
            )}
          </div>

          <div className="space-y-4">
            {error && <ErrorState message={error} onDismiss={() => setError("")} />}

            {busy && (
              <LoadingState
                message={refreshing ? "Getting the latest opportunities..." : undefined}
              />
            )}

            {!busy && !error && jobs.length === 0 && (
              <EmptyState searched={hasSearched} />
            )}

            {!busy &&
              jobs.map((job, index) => (
                <JobCard key={`${job.url}-${index}`} job={job} />
              ))}
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section
          id="how-it-works"
          className="scroll-mt-24 border-t border-zinc-200/70 bg-white"
          aria-labelledby="how-heading"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium text-brand-600">How it works</p>
              <h2 id="how-heading" className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                From search to shortlist in seconds
              </h2>
            </div>

            <ol className="mt-10 grid gap-5 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 transition duration-200 hover:border-brand-200 hover:bg-white hover:shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium text-ink-muted">
                      Step {index + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200/70 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:px-6">
          <p>
            © {new Date().getFullYear()} Job<span className="text-brand-600">Scout</span>
          </p>
          <p>Find jobs and internships that match your goals.</p>
        </div>
      </footer>
    </div>
  );
}
