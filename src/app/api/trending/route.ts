import { NextRequest, NextResponse } from "next/server";
import { withApiMiddleware, middlewareConfigs } from "@/lib/api-middleware";
import { fetchTrendingRepositories } from "@/services/trending-service";

async function trendingHandler(_request: NextRequest) {
  try {
    const repositories = await fetchTrendingRepositories();

    return new Response(
      JSON.stringify({
        success: true,
        count: repositories.filter((repo) => !repo.existsInDB).length,
        repositories: repositories.filter((repo) => !repo.existsInDB),
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
  trendingHandler,
  middlewareConfigs.scraping
);
