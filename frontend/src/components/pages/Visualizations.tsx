import React from 'react';
import DashboardSection from '../DashboardSection';

const Visualizations: React.FC = () => {
  return (
    <div className="space-y-6">
      <DashboardSection
        variant="galaxy"
        title="Data Visualizations"
        subtitle="Interactive charts and graphs of exoplanet data"
        icon={<i className="fas fa-chart-area"></i>}
      >
        <p className="text-gray-700 dark:text-gray-300">
          Visualize exoplanet characteristics, distributions, and trends with interactive charts.
        </p>
      </DashboardSection>
    </div>
  );
};

export default Visualizations;
