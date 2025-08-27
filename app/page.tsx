'use client'

import { useEffect, useState } from 'react'
import { supabase, Repository } from '@/lib/supabase'
import { TrendingHeader } from '@/components/trending-header'
import { RepositoryGrid } from '@/components/repository-grid'
import { InfiniteScroll } from '@/components/infinite-scroll'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw } from 'lucide-react'

const ITEMS_PER_PAGE = 12
export default function Home() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const fetchRepositories = async (isRefresh = false, pageNum = 0) => {
    try {
      if (isRefresh) setRefreshing(true)
      else if (pageNum === 0) setLoading(true)
      else setLoadingMore(true)
      
      setError(null)

      const from = pageNum * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, error } = await supabase
        .from('repositories')
        .select('*')
        .eq('archived', false)
        .eq('disabled', false)
        .order('stars', { ascending: false })
        .range(from, to)

      if (error) throw error

      const newData = data || []
      
      if (isRefresh || pageNum === 0) {
        setRepositories(newData)
        setPage(0)
      } else {
        setRepositories(prev => [...prev, ...newData])
      }
      
      setHasMore(newData.length === ITEMS_PER_PAGE)
      if (!isRefresh && pageNum > 0) {
        setPage(pageNum)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchRepositories(false, page + 1)
    }
  }
  useEffect(() => {
    fetchRepositories()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-600">Loading trending repositories...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <RefreshCw className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Connection Error</h2>
              <p className="text-gray-600">
                Unable to load repositories. Please check your Supabase connection.
              </p>
              <Button 
                onClick={() => fetchRepositories()} 
                variant="outline"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <TrendingHeader />
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {repositories.length}+ Trending Repositories
          </h2>
          <Button
            onClick={() => {
              setPage(0)
              setHasMore(true)
              fetchRepositories(true)
            }}
            variant="outline"
            size="sm"
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {repositories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No repositories found. Add some data to your Supabase database.</p>
          </div>
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            loading={loadingMore}
            onLoadMore={loadMore}
          >
            <RepositoryGrid repositories={repositories} />
            {loadingMore && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500">Loading more repositories...</p>
                </div>
              </div>
            )}
          </InfiniteScroll>
        )}
      </div>
    </div>
  )
}