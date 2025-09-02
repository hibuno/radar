"use client";

import { useState, useEffect, useCallback } from "react";
import { RepositoryGrid } from "@/components/repository-grid";
import { Repository } from "@/lib/supabase";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, BookOpen, Bookmark, Code } from "lucide-react";
import Lightning from "@/components/lightning";
import { RepositoryColumns } from "@/components/repository-columns";
import {
 SearchFilters,
 type SearchFilters as SearchFiltersType,
} from "@/components/search-filters";
import Galaxy from "@/components/galaxy";
import { StatsDisplay } from "@/components/stats-display";
import LightRays from "@/components/light-rays";

const ITEMS_PER_PAGE = 12;

interface HomeClientProps {
 initialRepositories: Repository[];
 recommendedRepos: Repository[];
 initialTotalCount: number;
}

export function HomeClient({
 initialRepositories,
 recommendedRepos,
 initialTotalCount,
}: HomeClientProps) {
 const [repositories, setRepositories] =
  useState<Repository[]>(initialRepositories);
 const [filteredRepositories, setFilteredRepositories] =
  useState<Repository[]>(initialRepositories);
 const [loading, setLoading] = useState(false);
 const [loadingMore, setLoadingMore] = useState(false);
 const [hasMore, setHasMore] = useState(
  initialRepositories.length === ITEMS_PER_PAGE
 );
 const [page, setPage] = useState(1);
 const [error, setError] = useState<string | null>(null);
 const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
 const [filters, setFilters] = useState<SearchFiltersType>({
  search: "",
  language: "",
  experience: "",
  license: "",
  sortBy: "created_at",
  sortOrder: "desc",
 });

 // Extract unique languages from all repositories
 useEffect(() => {
  const languageSet = new Set<string>();
  [...recommendedRepos, ...repositories].forEach((repo) => {
   if (repo.languages) {
    repo.languages.split(",").forEach((lang) => {
     const trimmedLang = lang.trim();
     if (trimmedLang) languageSet.add(trimmedLang);
    });
   }
  });
  setAvailableLanguages(Array.from(languageSet).sort());
 }, [recommendedRepos, repositories]);

 const fetchRepositories = useCallback(
  async (pageNum = 1, searchFilters = filters) => {
   try {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    setError(null);

    // Build query parameters
    const params = new URLSearchParams({
     page: pageNum.toString(),
     limit: ITEMS_PER_PAGE.toString(),
     sortBy: searchFilters.sortBy,
     sortOrder: searchFilters.sortOrder,
    });

    if (searchFilters.search) {
     params.append("search", searchFilters.search);
    }
    if (searchFilters.language) {
     params.append("language", searchFilters.language);
    }
    if (searchFilters.experience) {
     params.append("experience", searchFilters.experience);
    }
    if (searchFilters.license) {
     params.append("license", searchFilters.license);
    }

    // Make API call to fetch repositories
    const response = await fetch(`/api/repositories?${params.toString()}`);

    if (!response.ok) {
     throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const newData = data.repositories || [];

    if (pageNum === 1) {
     setRepositories(newData);
     setFilteredRepositories(newData);
     setPage(1);
    } else {
     setRepositories((prev) => [...prev, ...newData]);
     setFilteredRepositories((prev) => [...prev, ...newData]);
    }

    setHasMore(newData.length === ITEMS_PER_PAGE);
    if (pageNum > 1) {
     setPage(pageNum);
    }
   } catch (err) {
    setError(err instanceof Error ? err.message : "An error occurred");
   } finally {
    setLoading(false);
    setLoadingMore(false);
   }
  },
  [filters]
 );

 const loadMore = () => {
  if (!loadingMore && hasMore) {
   fetchRepositories(page + 1, filters);
  }
 };

 const handleRefresh = () => {
  setPage(1);
  setHasMore(true);
  fetchRepositories(1, filters);
 };

 const handleFiltersChange = useCallback(
  (newFilters: SearchFiltersType) => {
   setFilters(newFilters);
   setPage(1);
   setHasMore(true);
   fetchRepositories(1, newFilters);
  },
  [fetchRepositories]
 );

 if (error) {
  return (
   <div className="text-center h-screen">
    <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-destructive/20">
     <RefreshCw className="w-8 h-8 text-destructive" />
    </div>
    <h2 className="text-xl font-serif font-semibold text-foreground mb-2">
     Connection Error
    </h2>
    <p className="text-muted-foreground mb-4">
     Unable to load repositories. Please check your connection.
    </p>
    <Button onClick={handleRefresh} variant="outline" className="border-border">
     <RefreshCw className="w-4 h-4 mr-2" />
     Try Again
    </Button>
   </div>
  );
 }

 return (
  <div>
   {/* Hero Section */}
   <div className="relative bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
    <div className="absolute inset-0">
     <LightRays
      raysOrigin="top-center"
      raysColor="#00ffff"
      raysSpeed={1.5}
      lightSpread={0.8}
      rayLength={1.2}
      followMouse={true}
      mouseInfluence={0.1}
      noiseAmount={0.1}
      distortion={0.05}
      className="custom-rays"
     />
    </div>
    <div className="relative z-10 px-6 py-16 md:py-24 text-center">
     <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-6">
      Discover the Future of{" "}
      <span className="text-violet-400">Open Source</span>
     </h1>
     <p className="text-md md:text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
      Explore trending GitHub repositories, rising star projects, and
      cutting-edge research papers. Stay ahead with the latest innovations in
      AI, machine learning, and developer tools.
     </p>
     <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
      <div className="text-center">
       <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Code className="w-6 h-6 text-violet-400" />
       </div>
       <h3 className="text-lg font-semibold text-white mb-2">
        Curated Repositories
       </h3>
       <p className="text-gray-400">
        Hand-picked trending projects from GitHub&apos;s most active developers
       </p>
      </div>
      <div className="text-center">
       <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-6 h-6 text-green-400" />
       </div>
       <h3 className="text-lg font-semibold text-white mb-2">
        Research Papers
       </h3>
       <p className="text-gray-400">
        Latest breakthroughs in AI, ML, and computer science from arXiv
       </p>
      </div>
      <div className="text-center">
       <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bookmark className="w-6 h-6 text-purple-400" />
       </div>
       <h3 className="text-lg font-semibold text-white mb-2">
        Personal Bookmarks
       </h3>
       <p className="text-gray-400">
        Save and organize your favorite repositories and papers
       </p>
      </div>
     </div>
    </div>
   </div>
   <StatsDisplay />
   {/* Rising Stars Section */}
   {recommendedRepos.length > 0 && (
    <>
     <div className="flex items-center justify-between px-6 py-4 border-b relative bg-black overflow-hidden">
      <h2 className="font-serif font-bold text-foreground z-10">
       The Rising Stars
      </h2>
      <div className="absolute z-0 left-0 right-0 w-full h-full">
       <Galaxy
        mouseRepulsion={false}
        mouseInteraction={false}
        density={0.14}
        glowIntensity={0.4}
        saturation={0.8}
        hueShift={180}
       />
      </div>
      <p className="text-sm text-muted-foreground hidden md:block relative z-10">
       Those who try to reach a thousand stars
      </p>
     </div>
     <RepositoryColumns repositories={recommendedRepos} />
    </>
   )}

   {/* All Repositories Section */}
   <>
    <div className="flex items-center justify-between px-6 py-4 border-y relative bg-black overflow-hidden">
     <h2 className="font-serif font-bold text-foreground z-10">
      All Repositories
     </h2>
     <div className="absolute z-0">
      <Lightning hue={250} xOffset={1} speed={0.8} intensity={0.6} size={1} />
     </div>
     <p className="text-sm text-muted-foreground hidden md:block">
      {initialTotalCount.toLocaleString()}+ total repositories
     </p>
    </div>

    <div className="bg-background border-b px-6 py-4">
     <SearchFilters
      filters={filters}
      onFiltersChange={handleFiltersChange}
      availableLanguages={availableLanguages}
     />
    </div>

    {loading ? (
     <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
       <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
       <p className="text-muted-foreground">Loading repositories...</p>
      </div>
     </div>
    ) : repositories.length === 0 ? (
     <div className="text-center py-12">
      <p className="text-muted-foreground">
       No repositories found. Add some data to your Supabase database.
      </p>
     </div>
    ) : (
     <InfiniteScroll
      hasMore={hasMore}
      loading={loadingMore}
      onLoadMore={loadMore}
     >
      <RepositoryGrid repositories={filteredRepositories} />
      {loadingMore && (
       <div className="flex items-center justify-center py-8">
        <div className="text-center space-y-2">
         <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
         <p className="text-sm text-muted-foreground">
          Loading more repositories...
         </p>
        </div>
       </div>
      )}
     </InfiniteScroll>
    )}
   </>
  </div>
 );
}
