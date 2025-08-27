import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Repository Not Found
        </h1>
        
        <p className="text-gray-600 mb-6">
          The repository you're looking for doesn't exist or hasn't been added to our database yet.
        </p>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            This could happen if:
          </p>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• The repository hasn't been indexed yet</li>
            <li>• The URL was typed incorrectly</li>
            <li>• The repository was removed from our database</li>
          </ul>
        </div>
        
        <div className="mt-8">
          <Button asChild>
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" />
              Browse Trending Projects
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}