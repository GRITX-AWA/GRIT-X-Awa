import React, { useEffect, useState, useCallback } from 'react';

interface Discovery {
  id: number;
  object: string;
  Type: string;
  Confidence: number;
  Date: string;
  metadata?: {
    image_url?: string;
    details?: string;
  };
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  if (diffDays === 0) {
    return `Today at ${timeStr}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${timeStr}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago at ${timeStr}`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ` at ${timeStr}`;
  }
};

const getDiscoveryType = (confidence: number): 'success' | 'info' | 'warning' | 'error' => {
  if (confidence >= 90) return 'success';
  if (confidence >= 70) return 'info';
  if (confidence >= 50) return 'warning';
  return 'error';
};

const getIconForType = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'exoplanet':
      return 'fa-globe';
    case 'galaxy':
      return 'fa-galaxy';
    case 'nebula':
      return 'fa-cloud';
    case 'star':
      return 'fa-star';
    default:
      return 'fa-search';
  }
};

const getTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'exoplanet':
      return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
    case 'galaxy':
      return 'bg-purple-500/20 border-purple-500/30 text-purple-300';
    case 'nebula':
      return 'bg-pink-500/20 border-pink-500/30 text-pink-300';
    case 'star':
      return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
    default:
      return 'bg-gray-500/20 border-gray-500/30 text-gray-300';
  }
};

const RecentDiscoveries: React.FC = () => {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const fetchDiscoveries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/v1/discoveries');
      if (!response.ok) {
        throw new Error('Failed to fetch discoveries');
      }
      const data = await response.json();
      setDiscoveries(data);
    } catch (error) {
      console.error('Error fetching discoveries:', error);
      // Fallback to sample data if API fails
      setDiscoveries([
        {
          id: 1,
          object: 'Kepler-186f',
          Type: 'Exoplanet',
          Confidence: 92,
          Date: new Date().toISOString(),
          metadata: {
            image_url: 'https://exoplanets.nasa.gov/system/resources/detail_files/2174_kepler186f_0-1400x900.jpg',
            details: 'First Earth-size planet discovered in the habitable zone of another star.'
          }
        },
        {
          id: 2,
          object: 'Andromeda Galaxy',
          Type: 'Galaxy',
          Confidence: 95,
          Date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          metadata: {
            image_url: 'https://www.nasa.gov/sites/default/files/thumbnails/image/andromeda_galaxy_1.jpg',
            details: 'Closest spiral galaxy to the Milky Way.'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscoveries();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchDiscoveries, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchDiscoveries]);

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  const displayedDiscoveries = showAll ? discoveries : discoveries.slice(0, 5);
  const hasMore = discoveries.length > 5;
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'from-green-500 to-emerald-500';
    if (confidence >= 50) return 'from-yellow-500 to-amber-500';
    return 'from-red-500 to-rose-500';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Discoveries</h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayedDiscoveries.length > 0 ? (
          displayedDiscoveries.map((discovery) => {
            const discoveryType = getDiscoveryType(discovery.Confidence);
            const icon = getIconForType(discovery.Type);
            const typeColor = getTypeColor(discovery.Type);
            const confidenceColor = getConfidenceColor(discovery.Confidence);
            
            return (
              <div key={discovery.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${typeColor} mr-3`}>
                    <i className={`fas ${icon} text-lg`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {discovery.object}
                      </p>
                      <div className="flex items-center">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          discoveryType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          discoveryType === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          discoveryType === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {discovery.Confidence}% Confident
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {discovery.metadata?.details || 'No additional details available'}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatRelativeTime(discovery.Date)}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{discovery.Type}</span>
                    </div>
                  </div>
                </div>
                {discovery.metadata?.image_url && (
                  <div className="mt-3 rounded-md overflow-hidden">
                    <img 
                      src={discovery.metadata.image_url} 
                      alt={discovery.object}
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center">
            <i className="fas fa-search text-3xl text-gray-400 mb-2"></i>
            <p className="text-gray-500 dark:text-gray-400">No discoveries found</p>
          </div>
        )}
      </div>
      
      {hasMore && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 text-center border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleShowAll}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {showAll ? 'Show less' : `Show all ${discoveries.length} discoveries`}
          </button>
        </div>
      )}
    </div>
  );
}

export default RecentDiscoveries;
