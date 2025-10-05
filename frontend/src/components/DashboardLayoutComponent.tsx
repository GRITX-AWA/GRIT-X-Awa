import React, { useState, useMemo, useCallback, lazy, Suspense, useEffect, startTransition } from 'react';
import SideBar from './sideBar';
import ThemeToggle from './ThemeToggle';
import FontSizeToggle from './FontSizeToggle';
import { SharedProvider } from './context/SharedContext';
import { ExoplanetProvider } from '../contexts/ExoplanetContext';
import { ThemeProvider } from './ThemeContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Exoplanets = lazy(() => import('./pages/Exoplanets'));
const Analysis = lazy(() => import('./pages/Analysis'));
const Visualizations = lazy(() => import('./pages/Visualizations'));
const HelpResources = lazy(() => import('./pages/HelpResources'));
const Settings = lazy(() => import('./pages/Settings'));

// This context will allow child components to access and update the active page
export const PageContext = React.createContext({
  activePage: 'dashboard',
  setActivePage: (page: string) => {},
});

const DashboardLayoutComponent = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayPage, setDisplayPage] = useState('dashboard');

  // Define a function to update the active page with transition
  const handleSetActivePage = useCallback((page: string) => {
    if (page !== activePage) {
      startTransition(() => {
        setIsTransitioning(true);
      });
      // Wait for fade out animation
      setTimeout(() => {
        startTransition(() => {
          setActivePage(page);
          setDisplayPage(page);
        });
        // Wait a tiny bit then fade in
        setTimeout(() => {
          startTransition(() => {
            setIsTransitioning(false);
          });
        }, 50);
      }, 200);
    }
  }, [activePage]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    activePage,
    setActivePage: handleSetActivePage,
  }), [activePage, handleSetActivePage]);

  // Render different content based on activePage state
  const renderContent = () => {
    switch (displayPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'exoplanets':
        return <Exoplanets />;
      case 'analysis':
        return <Analysis />;
      case 'visualizations':
        return <Visualizations />;
      case 'help':
        return <HelpResources />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SharedProvider>
      <ExoplanetProvider>
        <ThemeProvider>
          <PageContext.Provider value={contextValue}>
            <div className="flex h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-slate-900 dark:to-purple-950/30 transition-colors duration-200 relative overflow-hidden">
              {/* Cosmic background effects */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-pink-400/10 dark:bg-pink-500/5 rounded-full blur-3xl" />
              </div>

              {/* Sidebar container - fixed height */}
              <div className="flex-shrink-0 h-full relative z-10">
                <SideBar />
              </div>

              {/* Main content area */}
              <main className="flex-1 overflow-y-auto themed-scrollbar p-4 md:p-6 pt-16 md:pt-4 relative z-10">
                {/* Theme and Font Size toggle buttons */}
                <div className="flex justify-end mb-4 gap-2">
                  <FontSizeToggle />
                  <ThemeToggle />
                </div>
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium">Loading mission data...</p>
                    </div>
                  </div>
                }>
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isTransitioning
                        ? 'opacity-0 translate-y-4 scale-[0.98]'
                        : 'opacity-100 translate-y-0 scale-100'
                    }`}
                  >
                    {renderContent()}
                  </div>
                </Suspense>
              </main>
            </div>
          </PageContext.Provider>
        </ThemeProvider>
      </ExoplanetProvider>
    </SharedProvider>
  );
}

export default DashboardLayoutComponent;