"use client";

import { useState } from "react";
import { ChevronDown, Loader2, MapPin, Search, Sparkles, Briefcase } from "lucide-react";
import type { Job, SearchResponse } from "@/lib/types";

type SearchFormProps = {
  loading: boolean;
  onResults: (jobs: Job[], searchId: string | null) => void;
  onLoading: (loading: boolean) => void;
  onError: (message: string) => void;
};

const SENIORITY_OPTIONS = ["Internship", "Entry level", "Mid level", "Senior"];

const VISA_OPTIONS = [
  "Any",
  "Visa sponsorship required",
  "No sponsorship required",
];

export default function SearchForm({
  loading,
  onResults,
  onLoading,
  onError,
}: SearchFormProps) {
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [seniority, setSeniority] = useState("Internship");
  const [visaPreference, setVisaPreference] = useState("Any");
  const [keywords, setKeywords] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    onLoading(true);
    onError("");

    try {
      const response = await fetch("/api/jobs/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          location,
          seniority,
          visaPreference,
          keywords,
        }),
      });

      const data = (await response.json()) as SearchResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          ("error" in data && data.error) || "The search failed"
        );
      }

      onResults(data.jobs, data.searchId);
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      onLoading(false);
    }
  }

  const labelClass = "mb-1.5 block text-sm font-medium text-ink";
  const iconClass =
    "pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400 transition peer-focus:text-brand-600";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-zinc-200/80 bg-white p-5 shadow-card-hover sm:p-8"
      aria-label="Job search"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Role */}
        <div>
          <label htmlFor="role" className={labelClass}>
            What job are you looking for?
          </label>
          <div className="relative">
            <input
              id="role"
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Example: Software Engineer"
              className="field peer pl-11"
              required
            />
            <Briefcase className={iconClass} />
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className={labelClass}>
            Where do you want to work?
          </label>
          <div className="relative">
            <input
              id="location"
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Example: Remote, United States"
              className="field peer pl-11"
              required
            />
            <MapPin className={iconClass} />
          </div>
        </div>

        {/* Seniority: segmented control (radio buttons under the hood) */}
        <fieldset className="sm:col-span-2">
          <legend className={labelClass}>Experience level</legend>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-zinc-100/80 p-1.5 sm:grid-cols-4">
            {SENIORITY_OPTIONS.map((option) => {
              const selected = seniority === option;
              return (
                <label
                  key={option}
                  className={`relative flex cursor-pointer items-center justify-center rounded-xl px-3 py-2.5 text-sm font-medium transition duration-150 has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-600/20 ${
                    selected
                      ? "bg-white text-brand-700 shadow-sm ring-1 ring-brand-200"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="seniority"
                    value={option}
                    checked={selected}
                    onChange={(event) => setSeniority(event.target.value)}
                    className="sr-only"
                  />
                  {option}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* Visa preference */}
        <div>
          <label htmlFor="visa" className={labelClass}>
            Visa preference
          </label>
          <div className="relative">
            <select
              id="visa"
              value={visaPreference}
              onChange={(event) => setVisaPreference(event.target.value)}
              className="field cursor-pointer appearance-none pr-10"
            >
              {VISA_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-zinc-400" />
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label htmlFor="keywords" className={labelClass}>
            Skills or keywords{" "}
            <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <div className="relative">
            <input
              id="keywords"
              type="text"
              value={keywords}
              onChange={(event) => setKeywords(event.target.value)}
              placeholder="Example: Python, React, JavaScript"
              className="field peer pl-11"
            />
            <Sparkles className={iconClass} />
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="order-2 text-center text-xs text-ink-muted sm:order-1 sm:text-left">
          We search the web and rank every result by how well it fits you.
        </p>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary order-1 w-full px-7 py-3.5 text-[15px] sm:order-2 sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-[18px] w-[18px]" />
              Find jobs
            </>
          )}
        </button>
      </div>
    </form>
  );
}
