"use client";

import { RepositoryGrid } from "@/components/repository-grid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { useBookmarks } from "@/lib/bookmarks-store";

export function BookmarksClient() {
 const { bookmarks } = useBookmarks();

 // Deep clone bookmarks to make them mutable
 const mutableBookmarks = bookmarks.map((bookmark) => ({
  ...bookmark,
  images: [...bookmark.images],
 }));

 return (
  <div className="max-w-6xl mx-auto p-6 bg-background border-x border-b">
   <div className="flex items-center space-x-3 mb-8">
    <Bookmark className="w-8 h-8 text-yellow-400" />
    <h1 className="text-2xl font-bold">My Bookmarks</h1>
   </div>

   {bookmarks.length > 0 ? (
    <RepositoryGrid repositories={mutableBookmarks} />
   ) : (
    <div className="text-center py-12">
     <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
     <p className="text-muted-foreground mb-4">
      You haven&apos;t bookmarked any repositories yet.
     </p>
     <Link href="/">
      <Button variant="outline">Explore Repositories</Button>
     </Link>
    </div>
   )}
  </div>
 );
}
