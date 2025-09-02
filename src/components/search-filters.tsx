"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
 DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface SearchFilters {
 search: string;
 language: string;
 experience: string;
 license: string;
 sortBy: "stars" | "forks" | "created_at" | "updated_at";
 sortOrder: "desc" | "asc";
}

interface SearchFiltersProps {
 filters: SearchFilters;
 onFiltersChange: (filters: SearchFilters) => void;
 availableLanguages: string[];
 className?: string;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
 const [debouncedValue, setDebouncedValue] = useState<T>(value);

 useEffect(() => {
  const handler = setTimeout(() => {
   setDebouncedValue(value);
  }, delay);

  return () => {
   clearTimeout(handler);
  };
 }, [value, delay]);

 return debouncedValue;
}

const EXPERIENCE_LEVELS = [
 { value: "", label: "All Levels" },
 { value: "Beginner", label: "Beginner" },
 { value: "Intermediate", label: "Intermediate" },
 { value: "Advanced", label: "Advanced" },
 { value: "Expert", label: "Expert" },
];

const LICENSE_OPTIONS = [
 { value: "", label: "All Licenses" },
 { value: "MIT", label: "MIT" },
 { value: "GPL-3.0", label: "GPL-3.0" },
 { value: "Apache-2.0", label: "Apache-2.0" },
 { value: "BSD-3-Clause", label: "BSD-3-Clause" },
 { value: "Unlicense", label: "Unlicense" },
];

const SORT_OPTIONS = [
 { value: "stars", label: "Stars", order: "desc" as const },
 { value: "forks", label: "Forks", order: "desc" as const },
 { value: "created_at", label: "Recently Added", order: "desc" as const },
 { value: "updated_at", label: "Recently Updated", order: "desc" as const },
];

export function SearchFilters({
 filters,
 onFiltersChange,
 availableLanguages,
 className,
}: SearchFiltersProps) {
 const [searchInput, setSearchInput] = useState(filters.search);
 const debouncedSearch = useDebounce(searchInput, 300);

 // Update filters when debounced search changes
 useEffect(() => {
  if (debouncedSearch !== filters.search) {
   onFiltersChange({ ...filters, search: debouncedSearch });
  }
 }, [debouncedSearch, filters, onFiltersChange]);

 const updateFilter = useCallback(
  (key: keyof SearchFilters, value: string) => {
   onFiltersChange({ ...filters, [key]: value });
  },
  [filters, onFiltersChange]
 );

 const clearFilters = useCallback(() => {
  setSearchInput("");
  onFiltersChange({
   search: "",
   language: "",
   experience: "",
   license: "",
   sortBy: "created_at",
   sortOrder: "desc",
  });
 }, [onFiltersChange]);

 const hasActiveFilters =
  filters.language || filters.experience || filters.license || filters.search;

 return (
  <div
   className={cn(
    "w-full flex flex-wrap items-center justify-between",
    className
   )}
  >
   {/* Search Input */}
   <div className="relative w-full mb-4 md:mb-0 md:w-fit">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
    <Input
     placeholder="Search repositories ..."
     value={searchInput}
     onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
      setSearchInput(e.target.value)
     }
     className="pl-10 pr-4 w-full"
    />
   </div>

   {/* Filter Bar */}
   <div className="flex flex-wrap gap-2 items-center">
    {/* Language Filter */}
    <DropdownMenu>
     <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="h-8">
       {filters.language || "Language"}
       <ChevronDown className="ml-2 h-3 w-3" />
      </Button>
     </DropdownMenuTrigger>
     <DropdownMenuContent align="start" className="w-48">
      <DropdownMenuItem onClick={() => updateFilter("language", "")}>
       All Languages
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {availableLanguages.map((lang) => (
       <DropdownMenuItem
        key={lang}
        onClick={() => updateFilter("language", lang)}
       >
        {lang}
       </DropdownMenuItem>
      ))}
     </DropdownMenuContent>
    </DropdownMenu>

    {/* Experience Level Filter */}
    <DropdownMenu>
     <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="h-8">
       {filters.experience || "Experience"}
       <ChevronDown className="ml-2 h-3 w-3" />
      </Button>
     </DropdownMenuTrigger>
     <DropdownMenuContent align="start" className="w-40">
      {EXPERIENCE_LEVELS.map((level) => (
       <DropdownMenuItem
        key={level.value}
        onClick={() => updateFilter("experience", level.value)}
       >
        {level.label}
       </DropdownMenuItem>
      ))}
     </DropdownMenuContent>
    </DropdownMenu>

    {/* License Filter */}
    <DropdownMenu>
     <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="h-8">
       {filters.license || "License"}
       <ChevronDown className="ml-2 h-3 w-3" />
      </Button>
     </DropdownMenuTrigger>
     <DropdownMenuContent align="start" className="w-48">
      {LICENSE_OPTIONS.map((option) => (
       <DropdownMenuItem
        key={option.value}
        onClick={() => updateFilter("license", option.value)}
       >
        {option.label}
       </DropdownMenuItem>
      ))}
     </DropdownMenuContent>
    </DropdownMenu>

    {/* Sort Options */}
    <DropdownMenu>
     <DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" className="h-8">
       Sort by{" "}
       {SORT_OPTIONS.find((opt) => opt.value === filters.sortBy)?.label ||
        "Recently Added"}
       <ChevronDown className="ml-2 h-3 w-3" />
      </Button>
     </DropdownMenuTrigger>
     <DropdownMenuContent align="start" className="w-48">
      {SORT_OPTIONS.map((option) => (
       <DropdownMenuItem
        key={option.value}
        onClick={() => {
         onFiltersChange({
          ...filters,
          sortBy: option.value as "stars" | "forks" | "created_at" | "updated_at",
          sortOrder: option.order,
         });
        }}
       >
        {option.label}
       </DropdownMenuItem>
      ))}
     </DropdownMenuContent>
    </DropdownMenu>

    {/* Clear Filters */}
    {hasActiveFilters && (
     <Button
      variant="ghost"
      size="icon"
      onClick={clearFilters}
      className="h-8 px-2"
     >
      <X className="h-3 w-3" />
     </Button>
    )}
   </div>
  </div>
 );
}
