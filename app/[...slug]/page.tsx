'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, Repository } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RepositoryGrid } from '@/components/repository-grid'
import { 
  ArrowLeft, 
  Star, 
  GitFork, 
  Eye, 
  ExternalLink, 
  Github,
  Calendar,
  AlertCircle,
  Loader2,
  Code,
  Users,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default function RepositoryDetail() {
  const params = useParams()
  const router = useRouter()
  const [repository, setRepository] = useState<Repository | null>(null)
  const [relatedRepos, setRelatedRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.slug) {
      fetchRepository()
    }
  }, [params.slug])

  const fetchRepository = async () => {
    try {
      setLoading(true)
      setError(null)

      const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug
      
      // Handle both formats: owner/repo and repo/id
      let repository: Repository | null = null
      
      if (slug.startsWith('repo/')) {
        // Legacy format: repo/uuid
        const id = slug.replace('repo/', '')
        const { data: repo, error: repoError } = await supabase
          .from('repositories')
          .select('*')
          .eq('id', id)
          .single()

        if (repoError && repoError.code !== 'PGRST116') throw repoError
        repository = repo
      } else {
        // GitHub format: owner/repo
        const githubUrl = `https://github.com/${slug}`
        const { data: repos, error: repoError } = await supabase
          .from('repositories')
          .select('*')
          .eq('repository', githubUrl)

        if (repoError) throw repoError
        repository = repos?.[0] || null
      }

      if (!repository) {
        notFound()
        return
      }

      setRepository(repository)

      // Fetch related repositories based on language
      if (repository.languages) {
        const languages = repository.languages.split(',').map(lang => lang.trim())
        const { data: related, error: relatedError } = await supabase
          .from('repositories')
          .select('*')
          .neq('id', repository.id)
          .eq('archived', false)
          .eq('disabled', false)
          .order('stars', { ascending: false })
          .limit(6)

        if (relatedError) throw relatedError
        setRelatedRepos(related || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-600">Loading repository details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !repository) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button 
            onClick={() => router.back()} 
            variant="ghost" 
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Repository Not Found</h2>
            <p className="text-gray-600">The repository you're looking for doesn't exist or hasn't been added to our database yet.</p>
            <div className="mt-6 space-y-2">
              <p className="text-sm text-gray-500">Looking for a specific repository?</p>
              <Button asChild variant="outline">
                <Link href="/">Browse Trending Projects</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const languages = repository.languages?.split(',').map(lang => lang.trim()) || []
  const tags = repository.tags?.split(',').map(tag => tag.trim()) || []

  // Extract owner/repo from repository URL for display
  const getOwnerRepo = () => {
    if (repository.repository) {
      const match = repository.repository.match(/github\.com\/([^\/]+\/[^\/]+)/)
      if (match) {
        return match[1]
      }
    }
    return repository.title
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={() => router.back()} 
            variant="ghost" 
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trending
          </Button>
        </div>

        {/* Repository Header - GitHub Style */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Github className="w-6 h-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {getOwnerRepo()}
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            {repository.summary}
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{formatNumber(repository.stars)}</span>
              <span>stars</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-4 h-4" />
              <span className="font-medium">{formatNumber(repository.forks)}</span>
              <span>forks</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{formatNumber(repository.watching)}</span>
              <span>watching</span>
            </div>
          </div>
        </div>

        {/* Main Repository Info */}
        <Card className="p-8 mb-8 bg-white border border-gray-100">
          <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Stars</span>
                </div>
                <p className="text-xl font-bold text-yellow-900">
                  {formatNumber(repository.stars)}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <GitFork className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Forks</span>
                </div>
                <p className="text-xl font-bold text-blue-900">
                  {formatNumber(repository.forks)}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Watching</span>
                </div>
                <p className="text-xl font-bold text-green-900">
                  {formatNumber(repository.watching)}
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Issues</span>
                </div>
                <p className="text-xl font-bold text-red-900">
                  {formatNumber(repository.open_issues)}
                </p>
              </div>
            </div>

            {/* Languages and Tags */}
            <div className="space-y-4">
              {languages.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {repository.repository && (
                <Button asChild className="gap-2">
                  <Link href={repository.repository} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                    View on GitHub
                  </Link>
                </Button>
              )}
              {repository.homepage && (
                <Button asChild variant="outline" className="gap-2">
                  <Link href={repository.homepage} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Visit Homepage
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Additional Details */}
        <Card className="p-8 mb-8 bg-white border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Project Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Experience Level</h3>
                <Badge variant={repository.experience === 'beginner' ? 'secondary' : repository.experience === 'intermediate' ? 'default' : 'destructive'}>
                  {repository.experience || 'Not specified'}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Usability</h3>
                <Badge variant="outline">
                  {repository.usability || 'Not specified'}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">License</h3>
                <Badge variant="outline">
                  {repository.license || 'Not specified'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created
                </h3>
                <p className="text-gray-600">
                  {formatDate(repository.created_at)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Default Branch</h3>
                <Badge variant="outline">
                  {repository.default_branch || 'main'}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Subscribers
                </h3>
                <p className="text-gray-600">
                  {formatNumber(repository.subscribers_count)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Content Section */}
        {repository.content && (
          <Card className="p-8 mb-8 bg-white border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">About This Project</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {repository.content}
              </p>
            </div>
          </Card>
        )}

        {/* Related Repositories */}
        {relatedRepos.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Projects</h2>
            <RepositoryGrid repositories={relatedRepos} variant="compact" />
          </div>
        )}
      </div>
    </div>
  )
}