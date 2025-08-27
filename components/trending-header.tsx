'use client'

import { TrendingUp, Star } from 'lucide-react'

export function TrendingHeader() {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trending</h1>
          <p className="text-gray-600 text-sm">Discover rising stars and popular repositories</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-100">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Hot</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">Most starred this week</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Rising</span>
          </div>
          <p className="text-xs text-green-700 mt-1">Fast-growing repos</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span className="text-sm font-medium text-blue-800">Fresh</span>
          </div>
          <p className="text-xs text-blue-700 mt-1">Recently created</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
            <span className="text-sm font-medium text-purple-800">Popular</span>
          </div>
          <p className="text-xs text-purple-700 mt-1">Most forked</p>
        </div>
      </div>
    </div>
  )
}