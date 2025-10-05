import React, { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

interface Activity {
  id: number;
  message: string;
  created_at: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface RecentActivityRef {
  addOptimisticActivity: (activity: Activity) => void;
  refreshActivities: (keepExisting: boolean) => void;
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

const getActivityType = (message: string): 'success' | 'info' | 'warning' | 'error' => {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('error') || lowerMessage.includes('failed')) return 'error';
  if (lowerMessage.includes('warning') || lowerMessage.includes('experiment')) return 'warning';
  if (lowerMessage.includes('detected') || lowerMessage.includes('retrained') || lowerMessage.includes('imported')) return 'success';
  return 'info';
};

const getActivityIcon = (type: 'success' | 'info' | 'warning' | 'error'): string => {
  switch (type) {
    case 'success': return 'fa-check-circle';
    case 'warning': return 'fa-exclamation-circle';
    case 'error': return 'fa-times-circle';
    default: return 'fa-info-circle';
  }
};

const getActivityColor = (type: 'success' | 'info' | 'warning' | 'error'): string => {
  switch (type) {
    case 'success': return 'bg-green-500/20 border-green-500/30 text-green-300';
    case 'warning': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
    case 'error': return 'bg-red-500/20 border-red-500/30 text-red-300';
    default: return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
  }
};

const getIconColor = (type: 'success' | 'info' | 'warning' | 'error'): string => {
  switch (type) {
    case 'success': return 'text-green-400';
    case 'warning': return 'text-yellow-400';
    case 'error': return 'text-red-400';
    default: return 'text-blue-400';
  }
};

const RecentActivity = forwardRef<RecentActivityRef>((props, ref) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [allActivities, setAllActivities] = useState<Activity[]>([]);

  const fetchActivities = useCallback((keepExisting = false) => {
    if (!keepExisting) {
      setLoading(true);
    }
    fetch('http://localhost:8000/api/v1/logs/all')
      .then(res => res.json())
      .then(data => {
        const activitiesWithType = data.map((log: any) => ({
          ...log,
          type: getActivityType(log.message)
        }));
        setAllActivities(activitiesWithType);
        setActivities(activitiesWithType.slice(0, showAll ? 8 : 4));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching activities:', err);
        setLoading(false);
      });
  }, [showAll]);

  const toggleShowAll = () => {
    if (showAll) {
      setActivities(allActivities.slice(0, 4));
    } else {
      setActivities(allActivities.slice(0, 8));
    }
    setShowAll(!showAll);
  };

  useEffect(() => {
    // Add CSS for fade-in animation (client-side only)
    if (typeof document !== 'undefined') {
      const styleId = 'recent-activity-animations';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.4s ease-out forwards;
          }
        `;
        document.head.appendChild(style);
      }
    }

    fetchActivities();
    // Refresh every 30 seconds
    const interval = setInterval(() => fetchActivities(true), 30000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  // Expose methods for external use
  useImperativeHandle(ref, () => ({
    addOptimisticActivity: (activity: Activity) => {
      setActivities(prev => [activity, ...prev].slice(0, showAll ? 8 : 4));
    },
    refreshActivities: (keepExisting: boolean) => {
      fetchActivities(keepExisting);
    }
  }));

  return (
    <div className="bg-gradient-to-br from-purple-900/40 via-pink-900/30 to-purple-900/40 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <i className="fas fa-history text-purple-300 text-lg"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          <p className="text-sm text-purple-200/70">Latest system events and updates</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] animate-fadeIn ${getActivityColor(activity.type)}`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(activity.type)}`}>
                  <i className={`fas ${getActivityIcon(activity.type)}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm leading-relaxed">{activity.message}</p>
                  <p className="text-xs text-gray-300/70 mt-1">
                    {formatRelativeTime(activity.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <i className="fas fa-inbox text-purple-300/30 text-4xl mb-3"></i>
          <p className="text-purple-200/50 text-sm">No recent activity</p>
        </div>
      )}

      <button
        onClick={toggleShowAll}
        className="w-full mt-6 py-3 px-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-200 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
      >
        <i className={`fas ${showAll ? 'fa-chevron-up' : 'fa-list'}`}></i>
        {showAll ? 'Show Less' : 'View All Activity'}
      </button>
    </div>
  );
});

RecentActivity.displayName = 'RecentActivity';

export default RecentActivity;
