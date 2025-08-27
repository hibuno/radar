'use client'

import { useEffect, useRef, useCallback } from 'react'

interface InfiniteScrollProps {
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  children: React.ReactNode
  threshold?: number
}

export function InfiniteScroll({ 
  hasMore, 
  loading, 
  onLoadMore, 
  children, 
  threshold = 100 
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries
    if (target.isIntersecting && hasMore && !loading) {
      onLoadMore()
    }
  }, [hasMore, loading, onLoadMore])

  useEffect(() => {
    const element = loadingRef.current
    if (!element) return

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: `${threshold}px`
    })

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element)
      }
    }
  }, [handleObserver, threshold])

  return (
    <div>
      {children}
      <div ref={loadingRef} className="h-10" />
    </div>
  )
}