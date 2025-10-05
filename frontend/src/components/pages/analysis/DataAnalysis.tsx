import React from 'react';

const DataAnalysis: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Data Analysis</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fas fa-chart-line text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Data Analysis Tools</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Analyze exoplanet data and discover patterns
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;
