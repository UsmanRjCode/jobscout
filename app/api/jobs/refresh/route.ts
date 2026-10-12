import { NextRequest, NextResponse } from "next/server";
import { findJobs } from "@/lib/jobSearch";
import { getSearchFilters, replaceSearchJobs } from "@/lib/database";

/**
 * Re-runs an earlier search (same filters) to get the latest jobs.
 * Body: { searchId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const searchId = typeof body.searchId === "string" ? body.searchId : "";

    if (!searchId) {
      return NextResponse.json(
        { success: false, error: "searchId is required" },
        { status: 400 }
      );
    }

    const filters = await getSearchFilters(searchId);

    if (!filters) {
      return NextResponse.json(
        { success: false, error: "That search was not found" },
        { status: 404 }
      );
    }

    const jobs = await findJobs(filters);
    await replaceSearchJobs(searchId, jobs);

    return NextResponse.json({
      success: true,
      searchId,
      jobs,
    });
  } catch (error) {
    console.error("Refresh route error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while refreshing",
      },
      { status: 500 }
    );
  }
}
