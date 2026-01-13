import { NextRequest, NextResponse } from "next/server";
import { RepositoryFetcher } from "../../../../../scripts/ingest_repository";
import { withApiMiddleware, middlewareConfigs } from "@/lib/api-middleware";
import { fetchOSSInsightRepositories } from "@/services/ossinsight-service";
import { fetchPaperRepositories } from "@/services/paper-service";
import { fetchTrendingRepositories } from "@/services/trending-service";

async function ingestHandler(_request: NextRequest) {
  try {
    console.log("🚀 Starting automated repository ingestion...");

    const fetcher = new RepositoryFetcher();

    // Connect to database
    await fetcher.connect();

    let totalNewRepos = 0;
    let addedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const sources = [
      { name: "ossinsight", fetcher: fetchOSSInsightRepositories },
      { name: "paper", fetcher: fetchPaperRepositories },
      { name: "trending", fetcher: fetchTrendingRepositories },
    ];
    const MAX_REPOS_PER_HOUR = 20;

    // Collect all new repositories from all sources first
    const allNewRepos: any[] = [];

    // Fetch new repositories from all scraping services directly
    for (const { name: source, fetcher } of sources) {
      try {
        console.log(`📡 Fetching repositories from ${source}...`);

        // Call service directly instead of making HTTP request
        const repositories = await fetcher();

        // Handle different response formats from different services
        let newRepos = [];
        if (source === "paper") {
          // Paper service returns papers with different structure
          newRepos = repositories
            .filter((paper: any) => !paper.existsInDB)
            .map((paper: any) => ({
              href: paper.url, // Paper uses 'url' as the repository identifier
              url: paper.url,
              name: paper.url,
              title: paper.title,
              authors: paper.authors,
              thumbnail: paper.thumbnail,
              source: source,
            }));
        } else {
          // OSS Insight and Trending services return repositories array
          newRepos = repositories
            .filter((repo: any) => !repo.existsInDB)
            .map((repo: any) => ({
              ...repo,
              source: source,
            }));
        }

        console.log(
          `📋 Found ${newRepos.length} new repositories from ${source}`
        );
        totalNewRepos += newRepos.length;
        allNewRepos.push(...newRepos);

        // Add delay between different sources
        if (source !== sources[sources.length - 1].name) {
          console.log(`⏳ Waiting before fetching from next source...`);
          await new Promise((resolve) => setTimeout(resolve, 2000));
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

    // Limit to MAX_REPOS_PER_HOUR and prioritize by source
    const limitedRepos = allNewRepos.slice(0, MAX_REPOS_PER_HOUR);
    console.log(
      `🎯 Processing ${limitedRepos.length} repositories (limited from ${totalNewRepos} total)`
    );

    // Add repositories to database with minimal processing
    for (let i = 0; i < limitedRepos.length; i++) {
      const repo = limitedRepos[i];

      try {
        console.log(
          `➕ Adding ${i + 1}/${limitedRepos.length}: ${
            repo.name || repo.href
          } (from ${repo.source})`
        );

        // Create minimal repository record - just add to database without full processing
        const repoRecord = {
          id: crypto.randomUUID(),
          repository: repo.href || repo.name,
          summary: repo.description || repo.title || null,
          content: null,
          languages: null,
          experience: null,
          usability: null,
          deployment: null,
          stars: BigInt(parseInt(repo.stars) || 0),
          forks: BigInt(parseInt(repo.forks) || 0),
          watching: BigInt(0),
          license: null,
          homepage: repo.url || null,
          images: JSON.stringify([]),
          created_at: new Date(),
          updated_at: new Date(),
          archived: false,
          disabled: false,
          open_issues: BigInt(0),
          default_branch: "main",
          network_count: BigInt(0),
          tags: null,
          arxiv_url: null,
          huggingface_url: null, // Use null instead of empty string to avoid unique constraint violations
          paper_authors: repo.authors ? JSON.stringify(repo.authors) : null,
          paper_abstract: null,
          paper_scraped_at: null,
          readme: null,
          publish: false,
          ingested: false, // Mark as not ingested so process endpoint can handle it
          enriched: false, // Mark as not enriched so enrich endpoint can handle it
        };

        // Insert directly into database
        const insertQuery = `
          INSERT INTO repositories (
            id, repository, summary, content, languages, experience, usability, deployment,
            stars, forks, watching, license, homepage, images, created_at, updated_at,
            archived, disabled, open_issues, default_branch, network_count, tags,
            arxiv_url, huggingface_url, paper_authors, paper_abstract, paper_scraped_at,
            readme, publish, ingested, enriched
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
            $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
          ) ON CONFLICT (repository) DO NOTHING
        `;

        const result = await (fetcher as any).dbClient.query(insertQuery, [
          repoRecord.id,
          repoRecord.repository,
          repoRecord.summary,
          repoRecord.content,
          repoRecord.languages,
          repoRecord.experience,
          repoRecord.usability,
          repoRecord.deployment,
          repoRecord.stars,
          repoRecord.forks,
          repoRecord.watching,
          repoRecord.license,
          repoRecord.homepage,
          repoRecord.images,
          repoRecord.created_at,
          repoRecord.updated_at,
          repoRecord.archived,
          repoRecord.disabled,
          repoRecord.open_issues,
          repoRecord.default_branch,
          repoRecord.network_count,
          repoRecord.tags,
          repoRecord.arxiv_url,
          repoRecord.huggingface_url,
          repoRecord.paper_authors,
          repoRecord.paper_abstract,
          repoRecord.paper_scraped_at,
          repoRecord.readme,
          repoRecord.publish,
          repoRecord.ingested,
          repoRecord.enriched,
        ]);

        // Only count as added if a row was actually inserted
        if (result.rowCount && result.rowCount > 0) {
          addedCount++;
        }

        // Small delay between database inserts
        if (i < limitedRepos.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        errorCount++;
        const errorMessage = `${repo.name || repo.href}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        errors.push(errorMessage);
        console.error(`❌ Error adding ${repo.name || repo.href}:`, error);
        continue;
      }
    }

    await fetcher.disconnect();

    const result = {
      success: true,
      message: `Repository ingestion completed - added ${addedCount} new repositories`,
      totalFound: totalNewRepos,
      processed: addedCount,
      limited: totalNewRepos > MAX_REPOS_PER_HOUR,
      maxPerHour: MAX_REPOS_PER_HOUR,
      errors: errorCount,
      errorDetails: errors.slice(0, 10), // Limit error details to first 10
      sources: sources.map((s) => s.name),
      note: "Repositories added to database but not fully processed. Processing will be handled by separate endpoints. Using direct service calls instead of HTTP requests.",
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
