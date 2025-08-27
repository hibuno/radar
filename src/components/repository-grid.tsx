"use client";

import { Repository } from "@/lib/supabase";
import { RepositoryCard } from "./repository-card";

interface RepositoryGridProps {
 repositories: Repository[];
 variant?: "default" | "compact";
}

export function RepositoryGrid({
 repositories,
 variant = "compact",
}: RepositoryGridProps) {
 if (repositories.length === 0) {
  return (
   <div className="text-center py-12">
    <p className="text-gray-500">No repositories found.</p>
   </div>
  );
 }

 return (
  <div className="repo-grid">
   {repositories.map((repo) => (
    <RepositoryCard key={repo.id} repository={repo} variant="compact" />
   ))}
  </div>
 );
}
