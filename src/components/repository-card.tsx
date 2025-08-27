"use client";

import { Repository } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Star, GitFork, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

interface RepositoryCardProps {
 repository: Repository;
 variant?: "default" | "compact";
}

export function RepositoryCard({
 repository,
 variant = "compact",
}: RepositoryCardProps) {
 const [currentImageIndex, setCurrentImageIndex] = useState(0);
 const [imageError, setImageError] = useState(false);

 const languages =
  repository.languages
   ?.split(",")
   .map((lang) => lang.trim())
   .filter(Boolean) || [];

 // Parse images from repository.images field
 const getImages = () => {
  if (!repository.images) return [];

  try {
   if (typeof repository.images === "string") {
    return JSON.parse(repository.images);
   }
   return repository.images;
  } catch {
   if (typeof repository.images === "string") {
    return repository.images
     .split(",")
     .map((url) => url.trim())
     .filter(Boolean);
   }
   return [];
  }
 };

 const images = getImages();
 const hasImages = images.length > 0 && !imageError;

 const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
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

 const getLanguageColor = (language: string) => {
  const colors: { [key: string]: string } = {
   javascript: "bg-yellow-400",
   typescript: "bg-blue-500",
   python: "bg-green-500",
   java: "bg-red-500",
   go: "bg-cyan-500",
   rust: "bg-orange-600",
   cpp: "bg-blue-600",
   "c++": "bg-blue-600",
   php: "bg-purple-500",
   ruby: "bg-red-600",
   swift: "bg-orange-500",
   kotlin: "bg-purple-600",
   dart: "bg-blue-400",
   shell: "bg-gray-600",
   html: "bg-orange-400",
   css: "bg-blue-300",
  };

  return colors[language.toLowerCase()] || "bg-gray-400";
 };

 const CardContent = () => (
  <div className="repo-card">
   {/* Preview Image */}
   <div className="relative h-32 bg-gray-100 overflow-hidden">
    {hasImages ? (
     <Image
      src={images[currentImageIndex]}
      alt={`${repository.title} preview`}
      fill
      className="object-cover"
      onError={() => setImageError(true)}
     />
    ) : (
     <div className="flex items-center justify-center h-full text-gray-400">
      <ImageIcon className="w-8 h-8" />
     </div>
    )}
   </div>

   {/* Content */}
   <div className="p-4 flex-1 flex flex-col">
    {/* Header */}
    <div className="flex items-start justify-between gap-2 mb-3">
     <h3 className="font-serif font-semibold text-gray-900 line-clamp-2 leading-tight text-sm">
      {repository.title}
     </h3>
     {repository.experience && (
      <Badge
       className={`text-xs px-2 py-0.5 font-medium border flex-shrink-0 ${getExperienceColor(
        repository.experience
       )}`}
      >
       {repository.experience}
      </Badge>
     )}
    </div>

    {/* Description */}
    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-4 flex-1">
     {repository.summary || "No description available"}
    </p>

    {/* Stats */}
    <div className="flex items-center justify-between mb-3">
     <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1">
       <Star className="w-3 h-3 text-yellow-500" />
       <span className="font-medium text-gray-700">
        {formatNumber(repository.stars || 0)}
       </span>
      </div>
      <div className="flex items-center gap-1">
       <GitFork className="w-3 h-3 text-blue-500" />
       <span className="font-medium text-gray-700">
        {formatNumber(repository.forks || 0)}
       </span>
      </div>
     </div>
    </div>

    {/* Language */}
    {languages.length > 0 && (
     <div className="flex items-center gap-2">
      <div
       className={`w-3 h-3 rounded-full ${getLanguageColor(languages[0])}`}
      />
      <span className="text-xs text-gray-600 font-medium">{languages[0]}</span>
     </div>
    )}
   </div>
  </div>
 );

 return (
  <Link href={`/${repository.repository}`} className="block">
   <CardContent />
  </Link>
 );
}
