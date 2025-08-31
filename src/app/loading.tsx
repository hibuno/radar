import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
 return (
  <div className="min-h-screen bg-background max-w-6xl mx-auto border-x">
   {/* Header Skeleton */}
   <div className="flex flex-wrap gap-2 items-center justify-between px-6 py-4 z-50 bg-background border-b">
    <Skeleton className="h-6 w-32" />
    <div className="flex flex-wrap items-center gap-2">
     <Skeleton className="h-6 w-20" />
     <Skeleton className="h-6 w-24" />
     <Skeleton className="h-6 w-16" />
    </div>
   </div>
   {/* Main Content Skeleton */}
   <div className="p-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="space-y-4">
       <Skeleton className="h-48 w-full rounded-lg" />
       <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
       </div>
       <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
       </div>
      </div>
     ))}
    </div>
   </div>
  </div>
 );
}
