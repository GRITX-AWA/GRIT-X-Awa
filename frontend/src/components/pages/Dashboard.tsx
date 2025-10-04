import React from 'react';
import DashboardSection from '../DashboardSection';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <DashboardSection
        variant="cosmic"
        title="Mission Control"
        subtitle="Welcome to the Exoplanet Explorer Dashboard"
        icon={<i className="fas fa-rocket"></i>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <i className="fas fa-globe-americas text-white"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Exoplanets</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">5,500+</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-purple-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <i className="fas fa-satellite text-white"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Missions Active</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">12</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-pink-500/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                <i className="fas fa-star text-white"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Habitable Zone</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">218</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardSection>

      {/* Recent Activity */}
      <DashboardSection
        variant="nebula"
        title="Recent Discoveries"
        subtitle="Latest confirmed exoplanets from NASA missions"
        icon={<i className="fas fa-telescope"></i>}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-purple-500/10 hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
              K2
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 dark:text-white">K2-415b</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Super Earth • 72 light-years</p>
            </div>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">2 days ago</span>
          </div>

          <div className="flex items-center gap-4 p-3 rounded-lg bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border border-purple-500/10 hover:border-purple-500/30 transition-colors">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
              TW
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-800 dark:text-white">TOI-1853b</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hot Neptune • 545 light-years</p>
            </div>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">5 days ago</span>
          </div>
        </div>
      </DashboardSection>

      {/* Quick Actions */}
      <DashboardSection
        variant="galaxy"
        title="Quick Actions"
        icon={<i className="fas fa-bolt"></i>}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:from-blue-500/20 hover:to-blue-600/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group">
            <i className="fas fa-search text-2xl text-blue-500 mb-2 group-hover:scale-110 transition-transform"></i>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Explore Data</p>
          </button>

          <button className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:from-purple-500/20 hover:to-purple-600/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 group">
            <i className="fas fa-chart-line text-2xl text-purple-500 mb-2 group-hover:scale-110 transition-transform"></i>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Run Analysis</p>
          </button>

          <button className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/5 hover:from-pink-500/20 hover:to-pink-600/10 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 group">
            <i className="fas fa-download text-2xl text-pink-500 mb-2 group-hover:scale-110 transition-transform"></i>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Data</p>
          </button>

          <button className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 hover:from-indigo-500/20 hover:to-indigo-600/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 group">
            <i className="fas fa-cog text-2xl text-indigo-500 mb-2 group-hover:scale-110 transition-transform"></i>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</p>
          </button>
        </div>
      </DashboardSection>
    </div>
  );
};

export default Dashboard;
