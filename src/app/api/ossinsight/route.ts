import { NextRequest, NextResponse } from "next/server";
import { withApiMiddleware, middlewareConfigs } from "@/lib/api-middleware";
import { fetchOSSInsightRepositories } from "@/services/ossinsight-service";

async function ossinsightHandler(_request: NextRequest) {
  try {
    const repositories = await fetchOSSInsightRepositories();

    return new Response(
      JSON.stringify({
        success: true,
        count: repositories.filter((repo) => !repo.existsInDB).slice(0, 50)
          .length,
        repositories: repositories
          .filter((repo) => !repo.existsInDB)
          .slice(0, 50),
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
export const GET = withApiMiddleware(
  ossinsightHandler,
  middlewareConfigs.scraping
);
