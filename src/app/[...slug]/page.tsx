import { supabase, Repository } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RepositoryGrid } from "@/components/repository-grid";
import {
 ArrowLeft,
 Star,
 GitFork,
 Eye,
 Github,
 Calendar,
 AlertCircle,
 Code,
 Zap,
 Activity,
 Award,
 Globe,
 BookOpen,
 Shield,
 Clock,
 GitBranch,
 Heart,
 Share2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
 params: {
  slug: string[];
 };
}

async function getRepository(slug: string): Promise<{
 repository: Repository | null;
 relatedRepos: Repository[];
}> {
 try {
  let repository: Repository | null = null;

  // First try GitHub format: owner/repo
  const { data: repos, error: repoError } = await supabase
   .from("repositories")
   .select("*")
   .eq("repository", slug)
   .single();

  if (!repoError) {
   repository = repos;
  } else if (repoError.code === "PGRST116") {
   // If not found by GitHub URL, try to find by title slug
   const titleSlug = slug.replace(/-/g, " ");
   const { data: titleRepos, error: titleError } = await supabase
    .from("repositories")
    .select("*")
    .ilike("title", `%${titleSlug}%`)
    .single();

   if (!titleError) {
    repository = titleRepos;
   }
  }

  if (!repository) {
   return { repository: null, relatedRepos: [] };
  }

  // Fetch related repositories based on language
  let relatedRepos: Repository[] = [];
  if (repository.languages) {
   const { data: related, error: relatedError } = await supabase
    .from("repositories")
    .select("*")
    .neq("id", repository.id)
    .eq("archived", false)
    .eq("disabled", false)
    .order("stars", { ascending: false })
    .limit(6);

   if (!relatedError) {
    relatedRepos = related || [];
   }
  }

  return { repository, relatedRepos };
 } catch (err) {
  console.error("Error fetching repository:", err);
  return { repository: null, relatedRepos: [] };
 }
}

const formatNumber = (num: number) => {
 if (num >= 1000000) {
  return `${(num / 1000000).toFixed(1)}M`;
 }
 if (num >= 1000) {
  return `${(num / 1000).toFixed(1)}k`;
 }
 return (num || 0).toString();
};

const formatDate = (date: string) => {
 return new Date(date).toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
 });
};

const getExperienceColor = (experience: string) => {
 switch (experience?.toLowerCase()) {
  case "beginner":
   return "bg-green-50 text-green-700 border-green-200";
  case "intermediate":
   return "bg-blue-50 text-blue-700 border-blue-200";
  case "advanced":
   return "bg-purple-50 text-purple-700 border-purple-200";
  default:
   return "bg-gray-50 text-gray-700 border-gray-200";
 }
};

export default async function RepositoryDetail({ params }: PageProps) {
 const resolvedParams = await params;
 const slug = resolvedParams.slug.join("/");
 const { repository, relatedRepos } = await getRepository(slug);

 if (!repository) {
  notFound();
 }

 const languages =
  repository.languages?.split(",").map((lang: string) => lang.trim()) || [];
 const tags =
  repository.tags?.split(",").map((tag: string) => tag.trim()) || [];

 // Extract owner/repo from repository URL for display
 const getOwnerRepo = () => {
  if (repository.repository) {
   const match = repository.repository.match(/github\.com\/([^\/]+\/[^\/]+)/);
   if (match) {
    return match[1];
   }
  }
  return repository.title;
 };

 const isPopular = repository.stars > 1000;
 const isTrending = repository.stars > 5000;

 return (
  <div className="min-h-screen bg-gray-100">
   {/* Header */}
   <div className="bg-white border-b border-gray-200">
    <div className="max-w-6xl mx-auto px-6 py-6">
     <div className="flex items-center justify-between mb-6">
      <Link
       href="/"
       className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
       <ArrowLeft className="w-4 h-4" />
       Back to Trending
      </Link>
      <div className="flex items-center gap-3">
       <Button variant="outline" size="sm" className="border-gray-300">
        <Share2 className="w-4 h-4 mr-2" />
        Share
       </Button>
       <Button variant="outline" size="sm" className="border-gray-300">
        <Heart className="w-4 h-4 mr-2" />
        Save
       </Button>
      </div>
     </div>

     {/* Repository Header */}
     <div className="space-y-6">
      <div className="flex items-start justify-between gap-6">
       <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4">
         <div className="p-3 bg-gray-100 rounded-xl border border-gray-200">
          <Github className="w-8 h-8 text-gray-700" />
         </div>
         <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-1">
           {getOwnerRepo()}
          </h1>
          <div className="flex items-center gap-3">
           {repository.experience && (
            <Badge
             className={`${getExperienceColor(
              repository.experience
             )} border font-medium`}
            >
             <Award className="w-3 h-3 mr-1" />
             {repository.experience}
            </Badge>
           )}
           {isTrending && (
            <Badge className="bg-orange-50 text-orange-700 border-orange-200 border font-medium">
             <Activity className="w-3 h-3 mr-1" />
             Trending
            </Badge>
           )}
           {isPopular && (
            <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 border font-medium">
             <Star className="w-3 h-3 mr-1" />
             Popular
            </Badge>
           )}
          </div>
         </div>
        </div>
        <p className="text-xl text-gray-600 leading-relaxed mb-6 max-w-3xl">
         {repository.summary}
        </p>
       </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
       <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
         <Star className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="text-2xl font-serif font-bold text-gray-900">
         {formatNumber(repository.stars)}
        </div>
        <div className="text-sm text-gray-600">Stars</div>
       </div>
       <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
         <GitFork className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-2xl font-serif font-bold text-gray-900">
         {formatNumber(repository.forks)}
        </div>
        <div className="text-sm text-gray-600">Forks</div>
       </div>
       <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
         <Eye className="w-5 h-5 text-green-500" />
        </div>
        <div className="text-2xl font-serif font-bold text-gray-900">
         {formatNumber(repository.watching)}
        </div>
        <div className="text-sm text-gray-600">Watching</div>
       </div>
       <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
         <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="text-2xl font-serif font-bold text-gray-900">
         {formatNumber(repository.open_issues)}
        </div>
        <div className="text-sm text-gray-600">Issues</div>
       </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
       <Button
        asChild
        size="lg"
        className="bg-gray-900 hover:bg-gray-800 text-white"
       >
        <Link
         href={`https://github.com/${slug}`}
         target="_blank"
         rel="noopener noreferrer"
        >
         <Github className="w-5 h-5 mr-2" />
         View on GitHub
        </Link>
       </Button>
       {repository.homepage && (
        <Button asChild variant="outline" size="lg" className="border-gray-300">
         <Link
          href={repository.homepage}
          target="_blank"
          rel="noopener noreferrer"
         >
          <Globe className="w-5 h-5 mr-2" />
          Visit Website
         </Link>
        </Button>
       )}
      </div>
     </div>
    </div>
   </div>

   {/* Main Content */}
   <div className="max-w-6xl mx-auto px-6 py-12">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
     {/* Main Content */}
     <div className="lg:col-span-2 space-y-8">
      {/* About Section */}
      {repository.content && (
       <Card className="p-8 bg-white border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
         <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
          <BookOpen className="w-5 h-5 text-blue-600" />
         </div>
         <h2 className="text-2xl font-serif font-bold text-gray-900">
          About This Project
         </h2>
        </div>
        <div className="prose max-w-none">
         <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base font-mono">
          {repository.content}
         </div>
        </div>
       </Card>
      )}

      {/* Languages & Technologies */}
      {languages.length > 0 && (
       <Card className="p-8 bg-white border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
         <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
          <Code className="w-5 h-5 text-purple-600" />
         </div>
         <h2 className="text-2xl font-serif font-bold text-gray-900">
          Languages & Technologies
         </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
         {languages.map((lang, index) => (
          <div
           key={index}
           className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
          >
           <div
            className={`w-4 h-4 rounded-full ${
             lang === "JavaScript"
              ? "bg-yellow-400"
              : lang === "TypeScript"
              ? "bg-blue-500"
              : lang === "Python"
              ? "bg-green-500"
              : lang === "Java"
              ? "bg-red-500"
              : lang === "Go"
              ? "bg-cyan-500"
              : "bg-gray-400"
            }`}
           />
           <span className="font-medium text-gray-900">{lang}</span>
          </div>
         ))}
        </div>
       </Card>
      )}

      {/* Tags */}
      {tags.length > 0 && (
       <Card className="p-8 bg-white border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
         <div className="p-2 bg-pink-50 rounded-lg border border-pink-200">
          <Zap className="w-5 h-5 text-pink-600" />
         </div>
         <h2 className="text-2xl font-serif font-bold text-gray-900">
          Tags & Categories
         </h2>
        </div>
        <div className="flex flex-wrap gap-3">
         {tags.map((tag, index) => (
          <Badge
           key={index}
           className="text-sm px-4 py-2 bg-purple-50 text-purple-700 border-purple-200 border font-medium"
          >
           #{tag}
          </Badge>
         ))}
        </div>
       </Card>
      )}
     </div>

     {/* Sidebar */}
     <div className="space-y-6">
      {/* Project Details */}
      <Card className="p-6 bg-white border border-gray-200">
       <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">
        Project Details
       </h3>
       <div className="space-y-4">
        <div className="flex items-center justify-between">
         <div className="flex items-center gap-2 text-gray-600">
          <Shield className="w-4 h-4" />
          <span className="text-sm">License</span>
         </div>
         <Badge variant="outline" className="text-xs border-gray-300">
          {repository.license || "Not specified"}
         </Badge>
        </div>
        <div className="flex items-center justify-between">
         <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Created</span>
         </div>
         <span className="text-sm text-gray-900 font-medium">
          {formatDate(repository.created_at)}
         </span>
        </div>
        <div className="flex items-center justify-between">
         <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Updated</span>
         </div>
         <span className="text-sm text-gray-900 font-medium">
          {formatDate(repository.updated_at || repository.created_at)}
         </span>
        </div>
        <div className="flex items-center justify-between">
         <div className="flex items-center gap-2 text-gray-600">
          <GitBranch className="w-4 h-4" />
          <span className="text-sm">Default Branch</span>
         </div>
         <Badge variant="outline" className="text-xs border-gray-300">
          {repository.default_branch || "main"}
         </Badge>
        </div>
       </div>
      </Card>

      {/* Repository Stats */}
      <Card className="p-6 bg-white border border-gray-200">
       <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">
        Repository Statistics
       </h3>
       <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
         <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium">Stars</span>
         </div>
         <span className="text-lg font-serif font-bold text-gray-900">
          {formatNumber(repository.stars)}
         </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
         <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium">Forks</span>
         </div>
         <span className="text-lg font-serif font-bold text-gray-900">
          {formatNumber(repository.forks)}
         </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
         <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Watchers</span>
         </div>
         <span className="text-lg font-serif font-bold text-gray-900">
          {formatNumber(repository.watching)}
         </span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
         <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium">Open Issues</span>
         </div>
         <span className="text-lg font-serif font-bold text-gray-900">
          {formatNumber(repository.open_issues)}
         </span>
        </div>
       </div>
      </Card>
     </div>
    </div>

    {/* Related Repositories */}
    {relatedRepos.length > 0 && (
     <div className="mt-16">
      <div className="text-center mb-12">
       <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
        Related Projects
       </h2>
       <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Discover more amazing projects similar to this one
       </p>
      </div>
      <RepositoryGrid repositories={relatedRepos} />
     </div>
    )}
   </div>
  </div>
 );
}
