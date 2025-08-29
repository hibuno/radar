"use client";

import { Repository } from "@/lib/supabase";
import { RepositoryCard } from "./repository-card";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";

interface RepositoryColumnsProps {
 repositories: Repository[];
}

export function RepositoryColumns({ repositories }: RepositoryColumnsProps) {
 if (repositories.length === 0) {
  return (
   <div className="text-center py-12">
    <p className="text-gray-500">No repositories found.</p>
   </div>
  );
 }

 return (
  <ScrollArea>
   <div className="flex gap-[1px] bg-border">
    {repositories.map((repo) => (
     <RepositoryCard
      key={repo.id}
      repository={repo}
      className="min-w-[250px] md:min-w-[382px]"
     />
    ))}
   </div>
   <ScrollBar orientation="horizontal" />
  </ScrollArea>
 );
}
