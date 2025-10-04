import React from 'react';
import DashboardSection from '../DashboardSection';

const HelpResources: React.FC = () => {
  return (
    <div className="space-y-6">
      <DashboardSection
        variant="cosmic"
        title="Help & Resources"
        subtitle="Documentation and learning materials"
        icon={<i className="fas fa-book-open"></i>}
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Access tutorials, documentation, and resources to help you make the most of the Exoplanet Explorer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <a
              href="https://exoplanets.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 border border-blue-500/20 hover:border-blue-500/40 transition-all"
            >
              <i className="fas fa-external-link-alt text-blue-500 mb-2"></i>
              <h3 className="font-semibold text-gray-800 dark:text-white">NASA Exoplanets</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Official NASA resource</p>
            </a>
            <a
              href="https://www.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              <i className="fas fa-satellite text-purple-500 mb-2"></i>
              <h3 className="font-semibold text-gray-800 dark:text-white">NASA.gov</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Main NASA website</p>
            </a>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
};

export default HelpResources;
