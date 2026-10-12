import { PrismaClient } from "@prisma/client";
import type { Job, SearchFilters } from "./types";

// Reuse one database connection during development
// (Next.js hot-reload would otherwise open a new one on every change).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function toRows(jobs: Job[]) {
  return jobs.map((job) => ({
    title: job.title,
    url: job.url,
    snippet: job.snippet,
    source: job.source,
    score: job.score,
    reasons: JSON.stringify(job.reasons),
    agentSummary: job.agentSummary || null,
  }));
}

/** Saves a new search and its jobs. Returns the new search's id. */
export async function saveSearch(
  filters: SearchFilters,
  jobs: Job[]
): Promise<string> {
  const search = await prisma.search.create({
    data: {
      ...filters,
      jobs: { create: toRows(jobs) },
    },
  });

  return search.id;
}

/** Looks up the filters that were used for an earlier search. */
export async function getSearchFilters(
  searchId: string
): Promise<SearchFilters | null> {
  const search = await prisma.search.findUnique({ where: { id: searchId } });

  if (!search) return null;

  return {
    role: search.role,
    location: search.location,
    seniority: search.seniority,
    visaPreference: search.visaPreference,
    keywords: search.keywords,
  };
}

/** Throws away a search's old jobs and stores the fresh ones. */
export async function replaceSearchJobs(
  searchId: string,
  jobs: Job[]
): Promise<void> {
  await prisma.$transaction([
    prisma.job.deleteMany({ where: { searchId } }),
    prisma.search.update({
      where: { id: searchId },
      data: { jobs: { create: toRows(jobs) } },
    }),
  ]);
}
