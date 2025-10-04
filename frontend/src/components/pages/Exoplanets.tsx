import React from 'react';
import DashboardSection from '../DashboardSection';

const Exoplanets: React.FC = () => {
  return (
    <div className="space-y-6">
      <DashboardSection
        variant="cosmic"
        title="Exoplanet Database"
        subtitle="Explore confirmed exoplanets discovered by NASA missions"
        icon={<i className="fas fa-globe-americas"></i>}
      >
        <p className="text-gray-700 dark:text-gray-300">
          Browse through thousands of confirmed exoplanets detected by missions like Kepler, TESS, and more.
        </p>
      </DashboardSection>
    </div>
  );
};

export default Exoplanets;
