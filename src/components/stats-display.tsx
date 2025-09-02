'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Star, Code } from 'lucide-react';

interface Stats {
  totalRepos: number;
  totalStars: number;
  totalLanguages: number;
}

export function StatsDisplay() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-4 border-b">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-muted p-4 rounded-lg animate-pulse">
            <div className="h-8 w-1/3 bg-gray-700 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-700 rounded mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null; // Don't render anything if stats fail to load
  }

  return (
    <div className="px-6 py-4 border-b bg-background">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/50 p-4 rounded-lg flex items-center">
                <div className="p-3 bg-blue-500/10 rounded-full mr-4">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold">{formatNumber(stats.totalRepos)}</p>
                    <p className="text-sm text-muted-foreground">Repositories Tracked</p>
                </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg flex items-center">
                <div className="p-3 bg-yellow-500/10 rounded-full mr-4">
                    <Star className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold">{formatNumber(stats.totalStars)}</p>
                    <p className="text-sm text-muted-foreground">Total Stars</p>
                </div>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg flex items-center">
                <div className="p-3 bg-green-500/10 rounded-full mr-4">
                    <Code className="w-6 h-6 text-green-500" />
                </div>
                <div>
                    <p className="text-2xl font-bold">{stats.totalLanguages}</p>
                    <p className="text-sm text-muted-foreground">Languages</p>
                </div>
            </div>
        </div>
    </div>
  );
}
