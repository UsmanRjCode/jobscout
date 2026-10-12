import { searchTinyFish, fetchTinyFish, agentTinyFish } from "./tinyfish";
import { matchesLocation, rankJobs } from "./matching";
import type { Job, SearchFilters } from "./types";

function clean(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/** Turns whatever the browser sent into a complete set of filters. */
export function normalizeFilters(body: Record<string, unknown>): SearchFilters {
  return {
    role: clean(body.role, "Software Engineer"),
    location: clean(body.location, "Remote"),
    seniority: clean(body.seniority, "Internship"),
    visaPreference: clean(body.visaPreference, "Any"),
    keywords: clean(body.keywords, ""),
  };
}

function canonicalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^(utm_|trk|source|ref)/i.test(key)) {
        parsed.searchParams.delete(key);
      }
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.trim();
  }
}

/** Builds several focused searches, asks TinyFish, then ranks the results. */
export async function findJobs(filters: SearchFilters): Promise<Job[]> {
  const commonQuery = [
    `${filters.role} ${filters.seniority}`,
    `in "${filters.location}"`,
    filters.keywords,
    filters.visaPreference !== "Any" ? filters.visaPreference : "",
  ]
    .filter(Boolean)
    .join(" ");

  const queries = [
    `${commonQuery} careers apply`,
    `${commonQuery} site:boards.greenhouse.io OR site:jobs.lever.co apply`,
    `${commonQuery} company career pages job opening`,
  ];

  // 1. Discover using TinyFish Search
  const searchResults = await Promise.allSettled(
    queries.map((query) => searchTinyFish(query))
  );
  const failedSearches = searchResults.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected"
  );
  if (failedSearches.length === searchResults.length) {
    const details = failedSearches
      .map((failure) =>
        failure.reason instanceof Error
          ? failure.reason.message
          : String(failure.reason)
      )
      .join(" | ");
    console.error("All TinyFish Search queries failed:", details);
    throw new Error("TinyFish Search could not retrieve live job listings");
  }
  for (const failedSearch of failedSearches) {
    console.warn("One TinyFish Search query failed:", failedSearch.reason);
  }
  const rawJobs = searchResults.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  // Deduplicate equivalent listing URLs across search providers and queries.
  const uniqueJobs = Array.from(
    new Map(
      rawJobs.map((job) => [canonicalizeUrl(job.url), { ...job, url: canonicalizeUrl(job.url) }])
    ).values()
  );

  // Do not show attractive but geographically incorrect results. The search
  // provider can return broad portal pages, so enforce the user's location
  // against each title, snippet, source, and URL before ranking.
  const locationJobs = uniqueJobs.filter((job) =>
    matchesLocation(job, filters.location)
  );
  const rankedJobs = rankJobs(locationJobs, filters);

  // 2. Read & 3. Analyze the best live listings with TinyFish Fetch and Agent.
  const topJobs = rankedJobs.slice(0, 5);
  
  await Promise.all(
    topJobs.map(async (job) => {
      // Fetch the actual job page
      const pageContent = await fetchTinyFish(job.url);
      
      if (pageContent) {
        // Use the Agent to extract specific insights
        const insights = await agentTinyFish(pageContent, job.title);
        if (insights) {
          job.agentSummary = insights;
        }
      }
    })
  );

  return rankedJobs;
}
