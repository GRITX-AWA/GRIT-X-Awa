import React from 'react';
import DashboardSection from '../DashboardSection';

const Exoplanets: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Exoplanet Database</h1>
      
      <DashboardSection
        variant="cosmic"
        title="Exoplanet Explorer"
        subtitle="Explore confirmed exoplanets discovered by NASA missions"
        icon={<i className="fas fa-globe-americas"></i>}
      >
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fas fa-globe-americas text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Exoplanet Database</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Browse through thousands of confirmed exoplanets detected by missions like Kepler, TESS, and more.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Coming soon...
          </p>
        </div>
      </DashboardSection>
    </div>
  );
};

export default Exoplanets;
