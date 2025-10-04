import React from 'react';

interface RecentCardProps {
  commit: string;
  date: string;
  status: 'success' | 'pending' | 'error';
}

const RecentCard: React.FC<RecentCardProps> = ({ commit, date, status }) => {
  const statusConfig = {
    success: {
      icon: 'fa-check-circle',
      color: 'text-green-500 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    pending: {
      icon: 'fa-clock',
      color: 'text-yellow-500 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800'
    },
    error: {
      icon: 'fa-exclamation-circle',
      color: 'text-red-500 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${config.borderColor} ${config.bgColor} hover:shadow-md transition-all duration-200`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center`}>
        <i className={`fas ${config.icon} ${config.color} text-sm`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
          {commit}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {date}
        </p>
      </div>
    </div>
  );
};

export default RecentCard;
