import { NextRequest, NextResponse } from "next/server";
import { findJobs, normalizeFilters } from "@/lib/jobSearch";
import { saveSearch } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const filters = normalizeFilters(body);

    const jobs = await findJobs(filters);

    // Saving is a "nice to have": if the database is down,
    // still show the user their results.
    let searchId: string | null = null;
    try {
      searchId = await saveSearch(filters, jobs);
    } catch (dbError) {
      console.error("Could not save search:", dbError);
    }

    return NextResponse.json({
      success: true,
      searchId,
      jobs,
    });
  } catch (error) {
    console.error("Search route error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while searching",
      },
      {
        status: 500,
      }
    );
  }
}
