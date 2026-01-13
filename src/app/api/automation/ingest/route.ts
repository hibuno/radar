import { NextRequest, NextResponse } from "next/server";
import { RepositoryFetcher } from "../../../../../scripts/ingest_repository";
import { withApiMiddleware, middlewareConfigs } from "@/lib/api-middleware";

async function ingestHandler(_request: NextRequest) {
  try {
    console.log("🚀 Starting automated repository ingestion...");

    const fetcher = new RepositoryFetcher();

    // Connect to database
    await fetcher.connect();

    let totalNewRepos = 0;
    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const sources = ["ossinsight", "paper", "trending"];

    // Fetch new repositories from all scraping endpoints
    for (const source of sources) {
      try {
        console.log(`📡 Fetching repositories from ${source}...`);

        // Make internal API call to scraping endpoint
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/api/${source}`,
          {
            headers: {
              "X-API-Key": process.env.API_SECRET_KEY || "",
              "User-Agent": "Spy-Automation/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`${source} API returned ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            `${source} API failed: ${data.error || "Unknown error"}`
          );
        }

        // Handle different response formats from different endpoints
        let newRepos = [];
        if (source === "paper") {
          // Paper endpoint returns 'papers' array with different structure
          newRepos = (data.papers || []).map((paper: any) => ({
            href: paper.url, // Paper uses 'url' as the repository identifier
            url: paper.url,
            name: paper.url,
            title: paper.title,
            authors: paper.authors,
            thumbnail: paper.thumbnail,
          }));
        } else {
          // OSS Insight and Trending endpoints return 'repositories' array
          newRepos = data.repositories || [];
        }
        console.log(
          `📋 Found ${newRepos.length} new repositories from ${source}`
        );
        totalNewRepos += newRepos.length;

        // Process each new repository
        for (let i = 0; i < newRepos.length; i++) {
          const repo = newRepos[i];

          try {
            console.log(
              `📦 Processing ${i + 1}/${newRepos.length} from ${source}: ${
                repo.name || repo.href
              }`
            );

            // Create repository object in the format expected by RepositoryFetcher
            const repoToProcess = {
              repository: repo.href || repo.name,
              url: repo.url,
              // Add any other fields that might be available
              ...(repo.description && { description: repo.description }),
              ...(repo.stars && { stars: parseInt(repo.stars) || 0 }),
              ...(repo.forks && { forks: parseInt(repo.forks) || 0 }),
            };

            await fetcher.processRepository(repoToProcess);
            processedCount++;

            // Add delay between repositories (GitHub rate limit: 60 req/min)
            if (i < newRepos.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }
          } catch (error) {
            errorCount++;
            const errorMessage = `${repo.name || repo.href}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`;
            errors.push(errorMessage);
            console.error(
              `❌ Error processing ${repo.name || repo.href}:`,
              error
            );
            continue;
          }
        }

        // Add delay between different sources
        if (source !== sources[sources.length - 1]) {
          console.log(`⏳ Waiting before fetching from next source...`);
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error(`❌ Error fetching from ${source}:`, error);
        errors.push(
          `${source}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        continue;
      }
    }

    await fetcher.disconnect();

    const result = {
      success: true,
      message: `Repository ingestion completed`,
      totalFound: totalNewRepos,
      processed: processedCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 10), // Limit error details to first 10
      sources: sources,
      timestamp: new Date().toISOString(),
    };

    console.log("✅ Ingestion completed:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("💥 Ingestion automation error:", error);
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

// Apply security middleware - require API key for automation endpoints
export const POST = withApiMiddleware(
  ingestHandler,
  middlewareConfigs.scraping
);
