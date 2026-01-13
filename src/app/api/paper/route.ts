import { NextRequest, NextResponse } from "next/server";
import { withApiMiddleware, middlewareConfigs } from "@/lib/api-middleware";
import { fetchPaperRepositories } from "@/services/paper-service";

async function paperHandler(_request: NextRequest) {
  try {
    const papers = await fetchPaperRepositories();

    // Get current year-month for response
    const targetYearMonth = new Date(
      Date.UTC(new Date().getFullYear(), new Date().getMonth())
    )
      .toISOString()
      .slice(0, 7);

    return new Response(
      JSON.stringify({
        success: true,
        date: targetYearMonth,
        count: papers.filter((paper) => !paper.existsInDB).length,
        totalScraped: papers.length,
        papers: papers.filter((paper) => !paper.existsInDB), // Return only new papers
        allPapers: papers, // Include all papers for debugging
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Apply security middleware - scraping endpoints require API key
export const GET = withApiMiddleware(paperHandler, middlewareConfigs.scraping);
