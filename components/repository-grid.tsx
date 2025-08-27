'use client'

import { Repository } from '@/lib/supabase'
import { RepositoryCard } from './repository-card'

interface RepositoryGridProps {
  repositories: Repository[]
  variant?: 'default' | 'compact'
}

export function RepositoryGrid({ repositories, variant = 'default' }: RepositoryGridProps) {
  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {repositories.map((repo) => (
          <RepositoryCard key={repo.id} repository={repo} variant="compact" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {repositories.map((repo) => (
        <RepositoryCard key={repo.id} repository={repo} />
      ))}
    </div>
  )
}