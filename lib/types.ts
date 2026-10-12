// Shared shapes used by both the server (API routes) and the browser (UI).

export type SearchFilters = {
  role: string;
  location: string;
  seniority: string;
  visaPreference: string;
  keywords: string;
};

// A raw result as it comes back from TinyFish (after cleanup).
export type RawJob = {
  title: string;
  url: string;
  snippet: string;
  source: string;
  agentSummary?: string | null;
};

// A job after we've scored how well it fits the user's search.
export type Job = RawJob & {
  score: number; // 0 to 100
  reasons: string[]; // short, human-readable reasons for the score
};

export type SearchResponse =
  | { success: true; searchId: string | null; jobs: Job[] }
  | { success: false; error: string };
