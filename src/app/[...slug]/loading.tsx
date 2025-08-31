import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
 return (
  <div className="w-full max-w-6xl mx-auto border-x">
   {/* Header Skeleton */}
   <div className="flex flex-wrap gap-2 items-center justify-between px-6 py-2 sticky top-[93px] z-50 bg-background border-b">
    <Skeleton className="h-8 w-32" />
    <div className="flex flex-wrap items-center gap-2">
     <Skeleton className="h-8 w-20" />
     <Skeleton className="h-8 w-24" />
     <Skeleton className="h-8 w-16" />
    </div>
   </div>

   {/* Main Content Skeleton */}
   <div className="relative bg-background border-b p-6">
    <div className="flex items-start justify-between gap-4">
     <div className="flex items-start gap-3 flex-1 min-w-0">
      <div className="flex-1 min-w-0">
       <Skeleton className="h-6 w-3/4 mb-2" />
       <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-18" />
       </div>
       <Skeleton className="h-4 w-full mb-1" />
       <Skeleton className="h-4 w-2/3" />
      </div>
     </div>
    </div>
   </div>

   {/* Content Grid Skeleton */}
   <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-[1px] bg-border">
     {/* Main Content */}
     <div className="lg:col-span-2 divide-y bg-background">
      <div className="p-4 bg-background">
       <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-5 w-24" />
       </div>
       <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
       </div>
      </div>
     </div>

     {/* Sidebar */}
     <div className="divide-y bg-background">
      <div className="p-4 bg-background">
       <Skeleton className="h-5 w-20 mb-3" />
       <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
       </div>
      </div>
      <div className="p-4 bg-background">
       <Skeleton className="h-5 w-24 mb-3" />
       <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
       </div>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
}
