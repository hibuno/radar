"use client";

import { TrendingUp, Star } from "lucide-react";

export function TrendingHeader() {
 return (
  <div className="section-spacing bg-white">
   {/* Main Header */}
   <div className="flex items-center gap-4 mb-8">
    <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-sm">
     <TrendingUp className="w-6 h-6 text-white" />
    </div>
    <div>
     <h1 className="text-2xl font-serif font-bold text-gray-900">Trending</h1>
     <p className="text-gray-600">
      Discover rising stars and popular repositories
     </p>
    </div>
   </div>

   {/* Category Cards */}
   <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
     <div className="flex items-center gap-2 mb-2">
      <Star className="w-4 h-4 text-yellow-600" />
      <span className="text-sm font-semibold text-yellow-800">Hot</span>
     </div>
     <p className="text-xs text-yellow-700">Most starred this week</p>
    </div>

    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
     <div className="flex items-center gap-2 mb-2">
      <TrendingUp className="w-4 h-4 text-green-600" />
      <span className="text-sm font-semibold text-green-800">Rising</span>
     </div>
     <p className="text-xs text-green-700">Fast-growing repos</p>
    </div>

    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
     <div className="flex items-center gap-2 mb-2">
      <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
      <span className="text-sm font-semibold text-blue-800">Fresh</span>
     </div>
     <p className="text-xs text-blue-700">Recently created</p>
    </div>

    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
     <div className="flex items-center gap-2 mb-2">
      <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
      <span className="text-sm font-semibold text-purple-800">Popular</span>
     </div>
     <p className="text-xs text-purple-700">Most forked</p>
    </div>
   </div>
  </div>
 );
}
