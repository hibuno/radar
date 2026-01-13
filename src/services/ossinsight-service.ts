import { db } from "@/db";
import { repositoriesTable } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { validateRepositoryPath } from "@/lib/utils";

export interface OSSInsightRepository {
  repo_id: string;
  repo_name: string;
  primary_language: string;
  description: string;
  stars: string;
  forks: string;
  pull_requests: string;
  pushes: string;
  total_score: string;
  contributor_logins: string;
  collection_names: string;
  existsInDB: boolean;
}

export interface ProcessedRepository {
  href: string;
  url: string;
  name: string;
  existsInDB: boolean;
}

export async function fetchOSSInsightRepositories(): Promise<
  ProcessedRepository[]
> {
  // Fetch OSS Insight trending repositories
  const response = await fetch("https://api.ossinsight.io/v1/trends/repos", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const apiResponse = await response.json();
  const repositories: OSSInsightRepository[] = apiResponse.data.rows;
  const scrapedRepos: Array<{
    href: string;
    url: string;
    name: string;
  }> = [];

  repositories.sort((a, b) => parseInt(b.stars) - parseInt(a.stars));

  repositories
    .filter(({ stars }) => parseInt(stars) > 100)
    .forEach((repo) => {
      // Validate and clean repository path
      const cleanRepoName = validateRepositoryPath(repo.repo_name);

      if (cleanRepoName) {
        scrapedRepos.push({
          href: cleanRepoName,
          url: `https://github.com/${cleanRepoName}`,
          name: cleanRepoName,
        });
      }
    });

  // Check which repositories already exist in the database
  const existingRepos = await db
    .select({ repository: repositoriesTable.repository })
    .from(repositoriesTable)
    .where(
      inArray(
        repositoriesTable.repository,
        scrapedRepos.map((repo) => repo.href)
      )
    );

  const existingHrefs = new Set(
    existingRepos.map((repo) => repo.repository).filter(Boolean)
  );

  const processedRepos: ProcessedRepository[] = [];

  // Add database status to each repository
  scrapedRepos.forEach((repo) => {
    processedRepos.push({
      ...repo,
      existsInDB: existingHrefs.has(repo.href),
    });
  });

  return processedRepos;
}
