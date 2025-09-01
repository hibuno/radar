-- This migration represents the current state of the database
-- The repositories table already exists, so we only ensure indexes and policies are in place

--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_repositories_huggingface_url ON public.repositories(huggingface_url);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_repositories_arxiv_url ON public.repositories(arxiv_url);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_repositories_paper_scraped_at ON public.repositories(paper_scraped_at DESC);

--> statement-breakpoint
-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "allow_anon_update_repositories" ON public.repositories;

--> statement-breakpoint
-- Create a new, more permissive policy
CREATE POLICY "allow_anon_update_repositories"
ON public.repositories
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);