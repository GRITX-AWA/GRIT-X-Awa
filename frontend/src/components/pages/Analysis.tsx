import React from 'react';
import DashboardSection from '../DashboardSection';

const Analysis: React.FC = () => {
  return (
    <div className="space-y-6">
      <DashboardSection
        variant="nebula"
        title="Data Analysis"
        subtitle="Advanced analytics for exoplanet datasets"
        icon={<i className="fas fa-microscope"></i>}
      >
        <p className="text-gray-700 dark:text-gray-300">
          Use machine learning tools to analyze patterns and discover insights from exoplanet data.
        </p>
      </DashboardSection>
    </div>
  );
};

export default Analysis;