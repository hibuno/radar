import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface OSSInsightRepository {
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

export async function GET() {
	try {
		// Fetch OSS Insight trending repositories
		const response = await fetch('https://api.ossinsight.io/v1/trends/repos', {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			}
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const apiResponse = await response.json();
		const repositories: OSSInsightRepository[] = apiResponse.data.rows;

		// Check which repositories already exist in the database
		const existingRepos = await supabase
			.from('repositories')
			.select('repository')
			.in('repository', repositories.map(repo => repo.repo_name));

		const existingRepoNames = new Set(
			existingRepos.data?.map(repo => repo.repository) || []
		);

		// Add database status to each repository
		const repositoriesWithStatus = repositories.map(repo => ({
			...repo,
			existsInDB: existingRepoNames.has(repo.repo_name)
		}));

		return new Response(JSON.stringify({
			success: true,
			count: repositoriesWithStatus.filter(repo => !repo.existsInDB).length,
			repositories: repositoriesWithStatus.filter(repo => !repo.existsInDB),
			timestamp: new Date().toISOString()
		}), {
			headers: { 'Content-Type': 'application/json' }
		});

	} catch (error) {
		return NextResponse.json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
}
