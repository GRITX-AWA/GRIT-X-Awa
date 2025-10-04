import React from 'react';
import type { ReactNode } from 'react';

interface DashboardSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'default' | 'cosmic' | 'nebula' | 'galaxy';
  className?: string;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'cosmic':
        return {
          container: 'bg-gradient-to-br from-blue-50/90 via-purple-50/80 to-white/90 dark:from-slate-950/60 dark:via-blue-950/40 dark:to-purple-950/50 border-blue-300/30 dark:border-blue-500/20',
          glow: 'from-blue-400/10 via-purple-400/10 to-transparent',
          orb1: 'bg-blue-400/20 dark:bg-blue-500/20',
          orb2: 'bg-purple-400/15 dark:bg-purple-500/15',
        };
      case 'nebula':
        return {
          container: 'bg-gradient-to-br from-purple-50/90 via-pink-50/80 to-white/90 dark:from-purple-950/60 dark:via-pink-950/40 dark:to-slate-950/50 border-purple-300/30 dark:border-purple-500/20',
          glow: 'from-purple-400/10 via-pink-400/10 to-transparent',
          orb1: 'bg-purple-400/20 dark:bg-purple-500/20',
          orb2: 'bg-pink-400/15 dark:bg-pink-500/15',
        };
      case 'galaxy':
        return {
          container: 'bg-gradient-to-br from-indigo-50/90 via-violet-50/80 to-white/90 dark:from-indigo-950/60 dark:via-violet-950/40 dark:to-slate-950/50 border-indigo-300/30 dark:border-indigo-500/20',
          glow: 'from-indigo-400/10 via-violet-400/10 to-transparent',
          orb1: 'bg-indigo-400/20 dark:bg-indigo-500/20',
          orb2: 'bg-violet-400/15 dark:bg-violet-500/15',
        };
      default:
        return {
          container: 'bg-white/90 dark:bg-slate-900/40 border-gray-300/50 dark:border-gray-700/50',
          glow: 'from-gray-400/5 via-gray-300/5 to-transparent',
          orb1: 'bg-gray-400/10 dark:bg-gray-500/10',
          orb2: 'bg-gray-300/10 dark:bg-gray-400/10',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`relative overflow-hidden rounded-2xl backdrop-blur-md border shadow-xl transition-all duration-300 hover:shadow-2xl ${styles.container} ${className}`}
    >
      {/* Cosmic background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-20 -right-20 w-64 h-64 ${styles.orb1} rounded-full blur-3xl opacity-50 animate-pulse`} />
        <div className={`absolute -bottom-20 -left-20 w-72 h-72 ${styles.orb2} rounded-full blur-3xl opacity-40 animate-pulse`} style={{ animationDelay: '1.5s' }} />

        {/* Animated stars */}
        {variant !== 'default' && (
          <>
            <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-purple-400/60 dark:bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-blue-400/50 dark:bg-white/30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-pink-400/70 dark:bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-indigo-400/60 dark:bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
          </>
        )}
      </div>

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.glow} opacity-50 pointer-events-none`} />

      {/* Content */}
      <div className="relative z-10">
        {(title || subtitle || icon) && (
          <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200/10 dark:border-gray-700/20 bg-gradient-to-r from-transparent via-white/5 to-transparent">
            <div className="flex items-center gap-2 md:gap-3">
              {icon && (
                <div className="text-xl md:text-2xl text-purple-600 dark:text-purple-400 flex-shrink-0">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white bg-clip-text truncate">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
