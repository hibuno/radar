import { NextRequest, NextResponse } from "next/server";
import { withApiMiddleware, middlewareConfigs } from "@/lib/api-middleware";
import { db } from "@/db";
import { repositoriesTable } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import {
  fetchGitHubRepository,
  fetchGitHubReadme,
  fetchGitHubLanguages,
  parseRepositoryPath,
  extractImagesFromReadme,
} from "@/services/github-service";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL =
  process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL || "gpt-5.2-nano";

/**
 * Generate AI-enhanced content and determine levels for repository
 */
async function generateAIContent(repository: any): Promise<{
  enhancedSummary: string | null;
  enhancedContent: string | null;
  experienceLevel: string | null;
  usabilityLevel: string | null;
  deploymentLevel: string | null;
}> {
  if (!OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY not set, skipping AI content generation");
    return {
      enhancedSummary: null,
      enhancedContent: null,
      experienceLevel: null,
      usabilityLevel: null,
      deploymentLevel: null,
    };
  }

  try {
    const prompt = `You are a technical writer helping developers understand GitHub repositories.

Repository: ${repository.repository}
Description: ${repository.summary || "No description"}
Languages: ${repository.languages || "Unknown"}
Stars: ${repository.stars || 0}
Topics: ${repository.tags || "None"}
Has README: ${repository.readme ? "Yes" : "No"}
Has Homepage: ${repository.homepage ? "Yes" : "No"}
README excerpt: ${
      repository.readme ? repository.readme.substring(0, 1000) : "No README"
    }

Please analyze this repository and provide:

1. **Summary** (2-3 sentences): A concise, engaging description that explains what this repository does and why it's useful.

2. **Content** (3-4 paragraphs): A detailed description covering:
   - What problem it solves
   - Key features and capabilities
   - Who should use it
   - Technical highlights

3. **Experience Level** (beginner/intermediate/advanced): Based on:
   - Programming language complexity
   - Concepts and patterns used
   - Prerequisites needed
   - Documentation quality

4. **Usability Level** (easy/intermediate/difficult): Based on:
   - Documentation quality and completeness
   - Setup and configuration complexity
   - Learning curve
   - Community support and examples

5. **Deployment Difficulty** (easy/intermediate/advanced/expert): Based on:
   - Infrastructure requirements
   - Configuration complexity
   - Dependencies and prerequisites
   - Deployment options available

Format your response as valid JSON:
{
  "summary": "your concise summary here",
  "content": "your detailed content here",
  "experience": "beginner|intermediate|advanced",
  "usability": "easy|intermediate|difficult",
  "deployment": "easy|intermediate|advanced|expert"
}`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_API_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are a helpful technical writer and software architect. Always respond with valid JSON only, no additional text.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error: ${response.status} - ${errorText}`);
      return {
        enhancedSummary: null,
        enhancedContent: null,
        experienceLevel: null,
        usabilityLevel: null,
        deploymentLevel: null,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.warn("No content in AI response");
      return {
        enhancedSummary: null,
        enhancedContent: null,
        experienceLevel: null,
        usabilityLevel: null,
        deploymentLevel: null,
      };
    }

    // Parse JSON response
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(cleanContent);

      return {
        enhancedSummary: parsed.summary || null,
        enhancedContent: parsed.content || null,
        experienceLevel: parsed.experience || null,
        usabilityLevel: parsed.usability || null,
        deploymentLevel: parsed.deployment || null,
      };
    } catch (parseError) {
      console.warn("Failed to parse AI response as JSON:", parseError);
      console.warn("Raw content:", content);
      return {
        enhancedSummary: content.substring(0, 500),
        enhancedContent: content,
        experienceLevel: null,
        usabilityLevel: null,
        deploymentLevel: null,
      };
    }
  } catch (error) {
    console.error("Error generating AI content:", error);
    return {
      enhancedSummary: null,
      enhancedContent: null,
      experienceLevel: null,
      usabilityLevel: null,
      deploymentLevel: null,
    };
  }
}

async function enrichHandler(_request: NextRequest) {
  try {
    console.log("🚀 Starting automated repository enrichment...");

    // Get repositories that need enrichment (ingested but not enriched)
    const repositoriesToEnrich = await db
      .select()
      .from(repositoriesTable)
      .where(
        sql`${repositoriesTable.ingested} = true AND ${repositoriesTable.enriched} = false`
      )
      .limit(10); // Process max 10 at a time

    if (repositoriesToEnrich.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No repositories need enrichment",
        processed: 0,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(
      `📋 Found ${repositoriesToEnrich.length} repositories to enrich`
    );

    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process repositories with rate limiting
    for (let i = 0; i < repositoriesToEnrich.length; i++) {
      const repository = repositoriesToEnrich[i];

      try {
        console.log(
          `📝 Enriching ${i + 1}/${repositoriesToEnrich.length}: ${
            repository.repository
          }`
        );

        // Generate AI-enhanced content and determine levels
        const {
          enhancedSummary,
          enhancedContent,
          experienceLevel,
          usabilityLevel,
          deploymentLevel,
        } = await generateAIContent(repository);

        // Determine if repository should be published
        // Publish if: has images OR has AI-generated content OR has good metadata
        const hasImages =
          Array.isArray(repository.images) && repository.images.length > 0;
        const hasAIContent = enhancedSummary || enhancedContent;
        const hasGoodMetadata =
          repository.summary &&
          repository.stars !== null &&
          repository.languages;
        const shouldPublish = hasImages || (hasAIContent && hasGoodMetadata);

        // Parse repository path
        const parsed = parseRepositoryPath(repository.repository || "");

        if (!parsed) {
          console.warn(
            `Could not parse repository path: ${repository.repository}`
          );
          // Mark as enriched anyway to avoid reprocessing
          await db
            .update(repositoriesTable)
            .set({
              enriched: true,
              updated_at: new Date(),
            })
            .where(eq(repositoriesTable.id, repository.id));
          processedCount++;
          continue;
        }

        const { owner, repo } = parsed;

        // Fetch GitHub data
        const [githubRepo, readme, languages] = await Promise.all([
          fetchGitHubRepository(owner, repo),
          fetchGitHubReadme(owner, repo),
          fetchGitHubLanguages(owner, repo),
        ]);

        if (!githubRepo) {
          console.warn(`GitHub repository not found: ${owner}/${repo}`);
          // Mark as enriched to avoid reprocessing
          await db
            .update(repositoriesTable)
            .set({
              enriched: true,
              updated_at: new Date(),
            })
            .where(eq(repositoriesTable.id, repository.id));
          processedCount++;
          continue;
        }

        // Extract images from README
        const images = readme ? extractImagesFromReadme(readme) : [];

        // Update repository with AI-enriched data
        await db
          .update(repositoriesTable)
          .set({
            summary: enhancedSummary || repository.summary,
            content: enhancedContent || repository.content,
            languages: languages ? languages.join(", ") : null,
            experience: experienceLevel || repository.experience,
            usability: usabilityLevel || repository.usability,
            deployment: deploymentLevel || repository.deployment,
            stars: githubRepo.stargazers_count,
            forks: githubRepo.forks_count,
            watching: githubRepo.watchers_count,
            license: githubRepo.license?.name || null,
            homepage: githubRepo.homepage || githubRepo.html_url,
            images: images.length > 0 ? images : [],
            archived: githubRepo.archived,
            disabled: githubRepo.disabled,
            open_issues: githubRepo.open_issues_count,
            default_branch: githubRepo.default_branch,
            network_count: githubRepo.network_count,
            tags: githubRepo.topics?.join(", ") || null,
            readme: readme,
            enriched: true,
            updated_at: new Date(),
            ...(shouldPublish ? { publish: true } : {}),
          })
          .where(eq(repositoriesTable.id, repository.id));

        processedCount++;
        console.log(
          `✅ Enriched: ${repository.repository} (publish: ${shouldPublish})`
        );
        if (experienceLevel) console.log(`   Experience: ${experienceLevel}`);
        if (usabilityLevel) console.log(`   Usability: ${usabilityLevel}`);
        if (deploymentLevel) console.log(`   Deployment: ${deploymentLevel}`);

        // Add delay between repositories (AI API rate limiting)
        if (i < repositoriesToEnrich.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
        }
      } catch (error) {
        errorCount++;
        const errorMessage = `${repository.repository}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        errors.push(errorMessage);
        console.error(`❌ Error enriching ${repository.repository}:`, error);

        // Continue with next repository
        continue;
      }
    }

    const result = {
      success: true,
      message: `Repository enrichment completed`,
      totalFound: repositoriesToEnrich.length,
      processed: processedCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 10), // Limit error details to first 10
      note: OPENAI_API_KEY
        ? "AI-enhanced content and levels generated. Repositories with images or good AI content auto-published."
        : "AI content generation skipped (no API key). Set OPENAI_API_KEY to enable.",
      timestamp: new Date().toISOString(),
    };

    console.log("✅ Enrichment completed:", result);
    return NextResponse.json(result);
  } catch (error) {
    console.error("💥 Enrichment automation error:", error);
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
  enrichHandler,
  middlewareConfigs.scraping
);
