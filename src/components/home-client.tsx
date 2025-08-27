"use client";

import { useEffect, useState } from "react";
import { supabase, Repository } from "@/lib/supabase";
import { RepositoryGrid } from "@/components/repository-grid";
import { InfiniteScroll } from "@/components/infinite-scroll";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, TrendingUp, Star } from "lucide-react";

const ITEMS_PER_PAGE = 12;

interface HomeClientProps {
 initialRepositories: Repository[];
 popularRepos: Repository[];
 recommendedRepos: Repository[];
 initialTotalCount: number;
}

export function HomeClient({
 initialRepositories,
 popularRepos,
 recommendedRepos,
 initialTotalCount,
}: HomeClientProps) {
 const [repositories, setRepositories] =
  useState<Repository[]>(initialRepositories);
 const [loading, setLoading] = useState(false);
 const [refreshing, setRefreshing] = useState(false);
 const [loadingMore, setLoadingMore] = useState(false);
 const [hasMore, setHasMore] = useState(
  initialRepositories.length === ITEMS_PER_PAGE
 );
 const [page, setPage] = useState(1);
 const [error, setError] = useState<string | null>(null);
 const [totalCount, setTotalCount] = useState(initialTotalCount);

 // Get IDs of repositories already shown in featured sections
 const featuredIds = new Set([
  ...popularRepos.map((repo) => repo.id),
  ...recommendedRepos.map((repo) => repo.id),
 ]);

 const fetchTotalCount = async () => {
  try {
   const { count, error } = await supabase
    .from("repositories")
    .select("*", { count: "exact", head: true })
    .eq("archived", false)
    .eq("disabled", false);

   if (error) throw error;
   setTotalCount(count || 0);
  } catch (err) {
   console.error("Error fetching total count:", err);
  }
 };

 const fetchRepositories = async (isRefresh = false, pageNum = 1) => {
  try {
   if (isRefresh) setRefreshing(true);
   else if (pageNum === 1) setLoading(true);
   else setLoadingMore(true);

   setError(null);

   const from = (pageNum - 1) * ITEMS_PER_PAGE;
   const to = from + ITEMS_PER_PAGE - 1;

   const { data, error } = await supabase
    .from("repositories")
    .select("*")
    .eq("archived", false)
    .eq("disabled", false)
    .not("id", "in", `(${Array.from(featuredIds).join(",")})`)
    .order("stars", { ascending: false })
    .range(from, to);

   if (error) throw error;

   const newData = data || [];

   if (isRefresh || pageNum === 1) {
    setRepositories(newData);
    setPage(1);
   } else {
    setRepositories((prev) => [...prev, ...newData]);
   }

   setHasMore(newData.length === ITEMS_PER_PAGE);
   if (!isRefresh && pageNum > 1) {
    setPage(pageNum);
   }

   if (isRefresh) {
    fetchTotalCount();
   }
  } catch (err) {
   setError(err instanceof Error ? err.message : "An error occurred");
  } finally {
   setLoading(false);
   setRefreshing(false);
   setLoadingMore(false);
  }
 };

 const loadMore = () => {
  if (!loadingMore && hasMore) {
   fetchRepositories(false, page + 1);
  }
 };

 const handleRefresh = () => {
  setPage(1);
  setHasMore(true);
  fetchRepositories(true);
 };

 if (error) {
  return (
   <div className="section-spacing text-center">
    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
     <RefreshCw className="w-8 h-8 text-red-600" />
    </div>
    <h2 className="text-xl font-serif font-semibold text-gray-900 mb-2">
     Connection Error
    </h2>
    <p className="text-gray-600 mb-4">
     Unable to load repositories. Please check your connection.
    </p>
    <Button
     onClick={handleRefresh}
     variant="outline"
     className="border-gray-300"
    >
     <RefreshCw className="w-4 h-4 mr-2" />
     Try Again
    </Button>
   </div>
  );
 }

 return (
  <div className="bg-white">
   {/* Most Popular Section */}
   {popularRepos.length > 0 && (
    <section className="section-spacing">
     <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
       <div className="p-2 bg-yellow-50 rounded-lg border border-yellow-200">
        <Star className="w-5 h-5 text-yellow-600" />
       </div>
       <div>
        <h2 className="text-xl font-serif font-bold text-gray-900">
         Most Popular
        </h2>
        <p className="text-sm text-gray-600">
         Repositories with the highest star count
        </p>
       </div>
      </div>
     </div>
     <RepositoryGrid repositories={popularRepos} />
    </section>
   )}

   {/* All Repositories Section */}
   <section className="section-spacing">
    <div className="flex items-center justify-between mb-6">
     <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
       <TrendingUp className="w-5 h-5 text-blue-600" />
      </div>
      <div>
       <h2 className="text-xl font-serif font-bold text-gray-900">
        All Repositories
       </h2>
       <p className="text-sm text-gray-600">
        {totalCount.toLocaleString()}+ total repositories
       </p>
      </div>
     </div>
     <Button
      onClick={handleRefresh}
      variant="outline"
      size="sm"
      disabled={refreshing}
      className="gap-2 border-gray-300"
     >
      <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
      Refresh
     </Button>
    </div>

    {loading ? (
     <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-4">
       <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
       <p className="text-gray-600">Loading repositories...</p>
      </div>
     </div>
    ) : repositories.length === 0 ? (
     <div className="text-center py-12">
      <p className="text-gray-600">
       No repositories found. Add some data to your Supabase database.
      </p>
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
   </section>
  </div>
 );
}
