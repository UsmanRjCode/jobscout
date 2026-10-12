import type { Job, RawJob, SearchFilters } from "./types";

// Words that hint at each experience level.
const SENIORITY_HINTS: Record<string, string[]> = {
  Internship: ["intern", "internship", "co-op", "coop", "summer"],
  "Entry level": ["entry", "junior", "jr", "new grad", "graduate", "associate"],
  "Mid level": ["mid", "intermediate", " ii", " 2 "],
  Senior: ["senior", "sr", "lead", "staff", "principal"],
};

const NO_SPONSORSHIP_PHRASES = [
  "no sponsorship",
  "not sponsor",
  "unable to sponsor",
  "cannot sponsor",
  "without sponsorship",
  "must be authorized",
  "us citizens only",
];

function splitWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 1);
}

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((phrase) => text.includes(phrase));
}

function searchableText(job: RawJob): string {
  return ` ${job.title} ${job.snippet} ${job.source} ${job.url} `
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Requires every meaningful part of a requested location to be present. */
export function matchesLocation(job: RawJob, location: string): boolean {
  const requested = location
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && word !== "remote");

  if (requested.length === 0) return true;

  const text = searchableText(job);
  return requested.every((word) => text.includes(word));
}

/**
 * Gives a job a 0–100 "fit" score based on the user's search,
 * plus short reasons explaining the score.
 */
export function scoreJob(job: RawJob, filters: SearchFilters): Job {
  const title = job.title.toLowerCase();
  const text = searchableText(job);
  const reasons: string[] = [];
  let score = 0;

  // 1. Job title matches the role they asked for (up to 40 points).
  const roleWords = splitWords(filters.role);
  if (roleWords.length > 0) {
    const hits = roleWords.filter((word) => title.includes(word)).length;
    const points = Math.round((hits / roleWords.length) * 40);
    score += points;
    if (points >= 30) reasons.push("Title matches your role");
  }

  // 2. Skills / keywords show up anywhere in the posting (up to 30 points).
  const keywordList = splitWords(filters.keywords);
  if (keywordList.length > 0) {
    const matched = keywordList.filter((word) => text.includes(word));
    score += Math.round((matched.length / keywordList.length) * 30);
    if (matched.length > 0) reasons.push(`Mentions ${matched.join(", ")}`);
  } else {
    score += 15; // No keywords given, so don't punish any job.
  }

  // 3. Location matches (20 points). Non-matching locations are filtered
  // before ranking in findJobs, so this is an explanation as well as a score.
  if (matchesLocation(job, filters.location)) {
    score += 20;
    reasons.push("Location matches");
  }

  // 4. Experience level matches (15 points).
  const hints = SENIORITY_HINTS[filters.seniority] ?? [];
  if (includesAny(text, hints)) {
    score += 15;
    reasons.push(`Looks like ${filters.seniority.toLowerCase()}`);
  }

  // 5. Visa sponsorship (bonus or penalty).
  if (filters.visaPreference === "Visa sponsorship required") {
    if (includesAny(text, NO_SPONSORSHIP_PHRASES)) {
      score -= 30;
      reasons.push("May not sponsor visas");
    } else if (text.includes("sponsor")) {
      score += 10;
      reasons.push("Mentions visa sponsorship");
    }
  }

  return {
    ...job,
    score: Math.max(0, Math.min(100, score)),
    reasons,
  };
}

/** Scores every job and puts the best matches first. */
export function rankJobs(jobs: RawJob[], filters: SearchFilters): Job[] {
  return jobs
    .map((job) => scoreJob(job, filters))
    .sort((a, b) => b.score - a.score);
}
