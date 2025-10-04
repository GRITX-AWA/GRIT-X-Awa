import React from 'react';
import DashboardSection from '../DashboardSection';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <DashboardSection
        variant="default"
        title="Settings"
        subtitle="Customize your dashboard experience"
        icon={<i className="fas fa-sliders-h"></i>}
      >
        <p className="text-gray-700 dark:text-gray-300">
          Configure your preferences, notifications, and dashboard layout.
        </p>
      </DashboardSection>
    </div>
  );
};

export default Settings;
