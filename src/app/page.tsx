import { supabase, Repository } from "@/lib/supabase";
import { TrendingHeader } from "@/components/trending-header";
import { HomeClient } from "@/components/home-client";

const ITEMS_PER_PAGE = 12;

async function getInitialData(): Promise<{
 repositories: Repository[];
 popularRepos: Repository[];
 recommendedRepos: Repository[];
 totalCount: number;
}> {
 try {
  // Get total count of repositories
  const { count: totalCount, error: countError } = await supabase
   .from("repositories")
   .select("*", { count: "exact", head: true })
   .eq("archived", false)
   .eq("disabled", false);

  if (countError) throw countError;

  // Get most popular repositories (top 6 by stars)
  const { data: popularData, error: popularError } = await supabase
   .from("repositories")
   .select("*")
   .eq("archived", false)
   .eq("disabled", false)
   .order("stars", { ascending: false })
   .limit(6);

  if (popularError) throw popularError;
  const popularRepos = popularData || [];

  // Get recommended repositories (high stars + recent activity, excluding popular ones)
  const popularIds = popularRepos.map((repo) => repo.id);
  const { data: recommendedData, error: recommendedError } = await supabase
   .from("repositories")
   .select("*")
   .eq("archived", false)
   .eq("disabled", false)
   .not("id", "in", `(${popularIds.join(",")})`)
   .gte("stars", 100) // At least 100 stars
   .order("forks", { ascending: false }) // Order by forks for diversity
   .limit(6);

  if (recommendedError) throw recommendedError;
  const recommendedRepos = recommendedData || [];

  // Get initial repositories for infinite scroll (excluding featured ones)
  const featuredIds = [
   ...popularIds,
   ...recommendedRepos.map((repo) => repo.id),
  ];
  const { data: initialData, error: initialError } = await supabase
   .from("repositories")
   .select("*")
   .eq("archived", false)
   .eq("disabled", false)
   .not("id", "in", `(${featuredIds.join(",")})`)
   .order("stars", { ascending: false })
   .limit(ITEMS_PER_PAGE);

  if (initialError) throw initialError;
  const repositories = initialData || [];

  return {
   repositories,
   popularRepos,
   recommendedRepos,
   totalCount: totalCount || 0,
  };
 } catch (err) {
  console.error("Error fetching initial data:", err);
  return {
   repositories: [],
   popularRepos: [],
   recommendedRepos: [],
   totalCount: 0,
  };
 }
}

export default async function Home() {
 const { repositories, popularRepos, recommendedRepos, totalCount } =
  await getInitialData();

 return (
  <div className="min-h-screen bg-gray-50">
   {/* Container with consistent max width */}
   <div className="max-w-7xl mx-auto bg-white shadow-sm">
    {/* Header Section */}
    <TrendingHeader />

    {/* Main Content */}
    <HomeClient
     initialRepositories={repositories}
     popularRepos={popularRepos}
     recommendedRepos={recommendedRepos}
     initialTotalCount={totalCount}
    />
   </div>
  </div>
 );
}
