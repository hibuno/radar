'use client'

import { Repository } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, GitFork, Eye, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface RepositoryCardProps {
  repository: Repository
  variant?: 'default' | 'compact'
}

export function RepositoryCard({ repository, variant = 'default' }: RepositoryCardProps) {
  const languages = repository.languages?.split(',').map(lang => lang.trim()) || []
  const tags = repository.tags?.split(',').map(tag => tag.trim()) || []
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  // Extract owner/repo from repository URL or use fallback
  const getRepositoryPath = () => {
    if (repository.repository) {
      const match = repository.repository.match(/github\.com\/([^\/]+\/[^\/]+)/)
      if (match) {
        return match[1]
      }
    }
    // Fallback to ID if no valid repository URL
    return `repo/${repository.id}`
  }

  const repositoryPath = getRepositoryPath()
  if (variant === 'compact') {
    return (
      <Link href={`/${repositoryPath}`}>
        <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-white border border-gray-100">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
              {repository.title}
            </h3>
            <p className="text-xs text-gray-600 line-clamp-2">
              {repository.summary}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {formatNumber(repository.stars)}
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  {formatNumber(repository.forks)}
                </div>
              </div>
              {languages.length > 0 && (
                <Badge variant="secondary" className="text-xs py-0 px-2 h-5">
                  {languages[0]}
                </Badge>
              )}
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/${repositoryPath}`}>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white border border-gray-100 hover:border-gray-200">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                {repository.title}
              </h3>
              {repository.homepage && (
                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
              )}
            </div>
            <p className="text-gray-600 line-clamp-3 leading-relaxed">
              {repository.summary}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              {formatNumber(repository.stars)}
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-4 h-4" />
              {formatNumber(repository.forks)}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatNumber(repository.watching)}
            </div>
          </div>

          <div className="space-y-3">
            {languages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {languages.slice(0, 3).map((lang, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {lang}
                  </Badge>
                ))}
                {languages.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{languages.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}