import React, { useState, useContext } from "react";
import { PageContext } from "./DashboardLayoutComponent";
import { ThemeContext } from "./ThemeContext";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  gradient?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, gradient }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-3 rounded-xl text-left transition-all duration-300 overflow-hidden touch-manipulation ${
        isActive
          ? "bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-500/30 dark:via-purple-500/30 dark:to-pink-500/30 shadow-lg shadow-purple-500/20"
          : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/10 hover:via-purple-500/10 hover:to-transparent dark:hover:from-blue-500/20 dark:hover:via-purple-500/20 active:scale-95"
      }`}
    >
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse" />
      )}
      <div className={`relative z-10 text-lg md:text-xl transition-transform duration-300 flex-shrink-0 ${isActive ? 'scale-110 text-purple-600 dark:text-purple-400' : 'group-hover:scale-105'}`}>
        {icon}
      </div>
      <span className={`relative z-10 text-sm font-medium truncate ${isActive ? 'text-purple-900 dark:text-purple-200 font-semibold' : ''}`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-l-full" />
      )}
    </button>
  );
};

export default function SideBar() {
  const { activePage, setActivePage } = useContext(PageContext);
  const { darkMode } = useContext(ThemeContext);
  const [isDatasetOpen, setIsDatasetOpen] = useState(false);
  const [isModelsOpen, setIsModelsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  console.log('SideBar rendered with activePage:', activePage);

  const handlePageChange = (page: string) => {
    console.log('Changing page to:', page);
    setActivePage(page);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50 transition-all duration-300 hover:scale-110"
      >
        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-white text-xl`}></i>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop and Mobile */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-40
        m-2 bg-gradient-to-b from-white via-purple-50/30 to-white dark:from-black dark:via-purple-950/30 dark:to-black backdrop-blur-md rounded-2xl flex flex-col h-[calc(100vh-16px)] w-64 md:w-72 shadow-2xl border border-purple-300/40 dark:border-purple-400/30 overflow-hidden transition-all duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      style={{ touchAction: 'pan-y' }}
      >
      {/* Cosmic background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Logo and title */}
      <div className="relative z-10 p-4 md:p-5 border-b border-purple-500/20 dark:border-purple-400/20 flex-shrink-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent">
        <div className="flex items-center gap-2 md:gap-3 mb-3">
          <a href="/" title="Return to landing page">
            <div className="group w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center hover:scale-110 transform transition-all duration-300 shadow-lg shadow-purple-500/50 hover:shadow-purple-400/70 hover:rotate-6">
              <i className="fa-solid fa-arrow-left text-white text-sm md:text-base group-hover:scale-110 transition-transform"></i>
            </div>
          </a>
          <div className="min-w-0">
            <h2 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-base md:text-lg truncate">
              Exoplanet Explorer
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">NASA ML Dashboard</p>
          </div>
        </div>

        {/* Team badge */}
        <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-purple-400/30 dark:border-purple-500/20">
          <i className="fas fa-users text-purple-600 dark:text-purple-400 text-xs"></i>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">GRIT-X Team</span>
          <div className="ml-auto flex -space-x-1 flex-shrink-0">
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white dark:border-slate-900"></div>
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white dark:border-slate-900"></div>
            <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white dark:border-slate-900"></div>
          </div>
        </div>
      </div>

      {/* Navigation - with overflow scrolling */}
      <div className="relative z-10 p-4 flex flex-col gap-2 flex-1 themed-scrollbar overflow-y-auto">
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
          <i className="fas fa-rocket mr-2"></i>Explore
        </div>
        <NavItem
          icon={<i className="fas fa-home"></i>}
          label="Mission Control"
          isActive={activePage === "dashboard"}
          onClick={() => handlePageChange("dashboard")}
        />
        <NavItem
          icon={<i className="fas fa-globe-americas"></i>}
          label="Exoplanets"
          isActive={activePage === "exoplanets"}
          onClick={() => handlePageChange("exoplanets")}
        />
        <NavItem
          icon={<i className="fas fa-microscope"></i>}
          label="Data Analysis"
          isActive={activePage === "analysis"}
          onClick={() => handlePageChange("analysis")}
        />
        <NavItem
          icon={<i className="fas fa-chart-area"></i>}
          label="Visualizations"
          isActive={activePage === "visualizations"}
          onClick={() => handlePageChange("visualizations")}
        />

        {/* Cosmic divider */}
        <div className="my-2 flex items-center gap-2 px-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          <i className="fas fa-star text-purple-400/50 text-xs"></i>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        </div>

        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">
          <i className="fas fa-satellite mr-2"></i>Resources
        </div>
      </div>

      {/* Footer links */}
      <div className="relative z-10 p-4 border-t border-purple-500/20 dark:border-purple-400/20 flex-shrink-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent space-y-2">
        <NavItem
          icon={<i className="fas fa-book-open"></i>}
          label="Help & Resources"
          isActive={activePage === "help"}
          onClick={() => handlePageChange("help")}
        />
        <NavItem
          icon={<i className="fas fa-sliders-h"></i>}
          label="Settings"
          isActive={activePage === "settings"}
          onClick={() => handlePageChange("settings")}
        />

        {/* NASA Attribution */}
        <div className="mt-3 pt-3 border-t border-purple-500/10">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <i className="fas fa-satellite-dish text-purple-400/50"></i>
            <span>Powered by NASA Data</span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}