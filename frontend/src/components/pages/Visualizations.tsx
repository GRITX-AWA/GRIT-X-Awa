import React, { useState, useEffect } from 'react';
import { useExoplanet } from '../../contexts/ExoplanetContext';
import ExoplanetVisualization3D from './analysis/ExoplanetVisualization3D';

// Visualization Card Component
interface VisualizationCardProps {
  title: string;
  children: React.ReactNode;
}

const VisualizationCard: React.FC<VisualizationCardProps> = ({ title, children }) => (
  <div className="bg-gradient-to-br from-white to-purple-50/20 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-xl overflow-hidden border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm">
    <div className="p-6 border-b border-purple-200/50 dark:border-purple-700/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
      <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{title}</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{children}</p>
    </div>
  </div>
);

// Planet Size Circle Component
interface PlanetCircleProps {
  size: string;
  color: string;
  name: string;
}

const PlanetCircle: React.FC<PlanetCircleProps> = ({ size, color, name }) => (
  <div className="flex flex-col items-center group">
    <div className={`${size} rounded-full ${color} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl`}></div>
    <p className="text-xs mt-3 font-semibold text-gray-800 dark:text-gray-300">{name}</p>
  </div>
);

// Mock Chart Components
const OrbitalPeriodChart: React.FC = () => (
  <div className="h-80 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200/30 dark:border-purple-700/30">
    <div className="flex items-end justify-between h-full space-x-2">
      {[
        { height: '25%', count: 342, label: '0-10d', color: 'from-blue-500 to-cyan-500' },
        { height: '60%', count: 1243, label: '10-50d', color: 'from-purple-500 to-pink-500' },
        { height: '45%', count: 856, label: '50-100d', color: 'from-indigo-500 to-purple-500' },
        { height: '30%', count: 523, label: '100-365d', color: 'from-violet-500 to-fuchsia-500' },
        { height: '15%', count: 187, label: '>365d', color: 'from-pink-500 to-rose-500' }
      ].map((bar, idx) => (
        <div key={idx} className="flex-1 flex flex-col items-center group">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden relative" style={{ height: bar.height }}>
            <div className={`absolute inset-0 bg-gradient-to-t ${bar.color} transition-all duration-500 group-hover:scale-105`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{bar.count}</span>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-300">{bar.label}</div>
        </div>
      ))}
    </div>
  </div>
);

const DiscoveryMethodChart: React.FC = () => (
  <div className="h-80 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200/30 dark:border-blue-700/30">
    <div className="space-y-4">
      {[
        { method: 'Transit', percentage: 76, count: 3821, color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
        { method: 'Radial Velocity', percentage: 15, count: 753, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
        { method: 'Imaging', percentage: 5, count: 251, color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
        { method: 'Microlensing', percentage: 3, count: 151, color: 'bg-gradient-to-r from-orange-500 to-red-500' },
        { method: 'Other', percentage: 1, count: 50, color: 'bg-gradient-to-r from-gray-500 to-gray-600' }
      ].map((item, idx) => (
        <div key={idx} className="group">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{item.method}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{item.count} planets</span>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{item.percentage}%</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className={`h-full ${item.color} transition-all duration-700 group-hover:scale-105 origin-left shadow-lg`}
              style={{ width: `${item.percentage}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StarTypeChart: React.FC = () => (
  <div className="h-80 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200/30 dark:border-amber-700/30 flex items-center justify-center">
    <div className="relative w-64 h-64">
      {/* Donut chart segments */}
      <svg viewBox="0 0 100 100" className="transform -rotate-90">
        {[
          { start: 0, percent: 45, color: '#f59e0b', label: 'G-type (Sun-like)' },
          { start: 45, percent: 30, color: '#ef4444', label: 'M-type (Red dwarf)' },
          { start: 75, percent: 15, color: '#3b82f6', label: 'K-type (Orange)' },
          { start: 90, percent: 10, color: '#8b5cf6', label: 'Other types' }
        ].map((segment, idx) => {
          const radius = 40;
          const circumference = 2 * Math.PI * radius;
          const offset = (segment.start / 100) * circumference;
          const dashArray = `${(segment.percent / 100) * circumference} ${circumference}`;

          return (
            <circle
              key={idx}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="20"
              strokeDasharray={dashArray}
              strokeDashoffset={-offset}
              className="transition-all duration-500 hover:stroke-width-[22] cursor-pointer"
            />
          );
        })}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">5,026</div>
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-1">Total Stars</div>
        </div>
      </div>
    </div>

    {/* Legend */}
    <div className="ml-8 space-y-2">
      {[
        { color: 'bg-amber-500', label: 'G-type', percent: '45%' },
        { color: 'bg-red-500', label: 'M-type', percent: '30%' },
        { color: 'bg-blue-500', label: 'K-type', percent: '15%' },
        { color: 'bg-purple-500', label: 'Other', percent: '10%' }
      ].map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div className={`w-4 h-4 rounded ${item.color} shadow-md`}></div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">({item.percent})</span>
        </div>
      ))}
    </div>
  </div>
);

const Visualizations: React.FC = () => {
  const { selectedExoplanet, selectedExoplanets, dataType, clearSelectedExoplanet, clearAllExoplanets } = useExoplanet();
  const [showExamples, setShowExamples] = useState(false);

  // Determine if we're showing multiple planets or a single planet
  const isMultipleMode = selectedExoplanets && selectedExoplanets.length > 0;
  const hasSelection = selectedExoplanet || isMultipleMode;

  // Scroll to top when exoplanets are loaded (from predictions)
  useEffect(() => {
    if (hasSelection) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hasSelection]);

  // Sample data for examples
  const sampleTessData = {
    tic_id: 307210830,
    toi_id: 700.01,
    pl_name: "TOI-700 d",
    pl_rade: 1.19,
    pl_orbper: 37.426,
    pl_eqt: 269,
    pl_orbsmax: 0.163,
    st_rad: 0.415,
    st_teff: 3480,
    sy_dist: 31.13,
  };

  const sampleKeplerData = {
    kepid: 10187017,
    kepler_name: "Kepler-186 f",
    koi_disposition: "CONFIRMED",
    koi_period: 129.944,
    koi_prad: 1.17,
    koi_teq: 188,
    koi_insol: 0.29,
    koi_sma: 0.432,
    koi_depth: 36.2,
    koi_duration: 3.82,
    koi_steff: 3788,
    koi_srad: 0.472,
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 min-h-screen transition-colors duration-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            <i className="fas fa-chart-line mr-3 text-purple-600 dark:text-purple-400"></i>Exoplanet Visualizations
          </h1>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Interactive charts and 3D visualizations of exoplanet data</p>
        </div>
        {!hasSelection && (
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 dark:hover:from-indigo-700 dark:hover:to-purple-700 transition-all duration-300 font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <i className={`fas ${showExamples ? 'fa-eye-slash' : 'fa-star'}`}></i>
            <span>{showExamples ? 'Hide Examples' : 'Show Example Exoplanets'}</span>
          </button>
        )}
      </div>

      {/* Multiple Exoplanets 3D Visualization */}
      {isMultipleMode && dataType && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-8 mb-6 border border-purple-300/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <i className="fas fa-layer-group"></i>
                  Your Selected Exoplanet Systems
                </h2>
                <p className="text-indigo-100 mt-2 text-lg font-medium">
                  <i className="fas fa-globe mr-2"></i>Comparing {selectedExoplanets.length} exoplanets in 3D
                </p>
              </div>
              <button
                type="button"
                onClick={clearAllExoplanets}
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <i className="fas fa-times-circle"></i>
                <span>Clear All</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50/20 dark:from-gray-800 dark:to-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-purple-400/50 dark:border-purple-600/50 backdrop-blur-sm">
            <ExoplanetVisualization3D
              data={selectedExoplanets[0]}
              dataType={dataType}
              multipleData={selectedExoplanets}
            />
          </div>
        </div>
      )}

      {/* Single Exoplanet 3D Visualization */}
      {selectedExoplanet && !isMultipleMode && dataType && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-8 mb-6 border border-purple-300/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <i className="fas fa-planet-ringed"></i>
                  Your Selected Exoplanet System
                </h2>
                <p className="text-indigo-100 mt-2 text-lg font-medium">
                  <i className="fas fa-star mr-2"></i>
                  {dataType === 'kepler'
                    ? selectedExoplanet.kepler_name || `KOI-${selectedExoplanet.kepid}`
                    : selectedExoplanet.pl_name || `TOI-${selectedExoplanet.toi_id}`
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={clearSelectedExoplanet}
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
              >
                <i className="fas fa-times-circle"></i>
                <span>Clear Selection</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50/20 dark:from-gray-800 dark:to-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-purple-400/50 dark:border-purple-600/50 backdrop-blur-sm">
            <ExoplanetVisualization3D data={selectedExoplanet} dataType={dataType} />
          </div>
        </div>
      )}

      {/* Example Exoplanets */}
      {showExamples && !hasSelection && (
        <div className="mb-8 space-y-6">
          <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 p-8 rounded-2xl shadow-2xl border-2 border-blue-400/50 dark:border-blue-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
                  <i className="fas fa-rocket text-blue-600 dark:text-blue-400"></i>
                  TOI-700 d - Potentially Habitable
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">TESS Mission Discovery</p>
              </div>
              <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg">
                <i className="fas fa-satellite mr-2"></i>TESS
              </span>
            </div>
            <ExoplanetVisualization3D data={sampleTessData} dataType="tess" />
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20 p-8 rounded-2xl shadow-2xl border-2 border-purple-400/50 dark:border-purple-600/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <i className="fas fa-globe text-purple-600 dark:text-purple-400"></i>
                  Kepler-186 f - First Earth-sized in Habitable Zone
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">Kepler Mission Discovery</p>
              </div>
              <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-bold shadow-lg">
                <i className="fas fa-telescope mr-2"></i>Kepler
              </span>
            </div>
            <ExoplanetVisualization3D data={sampleKeplerData} dataType="kepler" />
          </div>
        </div>
      )}

      {/* Placeholder message when no exoplanet is selected */}
      {!hasSelection && !showExamples && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-16 text-center mb-8 border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm shadow-xl">
          <div className="text-purple-400 dark:text-purple-500 mb-6">
            <i className="fas fa-rocket text-8xl"></i>
          </div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            No Exoplanet Selected
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg font-medium max-w-2xl mx-auto">
            Navigate to the <span className="text-purple-600 dark:text-purple-400 font-bold">Exoplanets</span> page to select exoplanets and visualize them in stunning 3D
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowExamples(true)}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              <i className="fas fa-star"></i>
              <span>Show Example Exoplanets</span>
            </button>
          </div>
        </div>
      )}

      {/* Planet Size Comparison */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/20 rounded-2xl shadow-xl overflow-hidden border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm">
          <div className="p-6 border-b border-green-200/50 dark:border-green-700/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
              <i className="fas fa-balance-scale text-green-600 dark:text-green-400"></i>
              Planet Size Comparison
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Compare exoplanet sizes to planets in our solar system</p>
          </div>
          <div className="p-10 bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/10">
            <div className="flex items-end justify-center h-72 gap-8">
              <PlanetCircle size="w-8 h-8" color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/50" name="Earth" />
              <PlanetCircle size="w-16 h-16" color="bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/50" name="HD 209458 b" />
              <PlanetCircle size="w-32 h-32" color="bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/50" name="WASP-17b" />
              <PlanetCircle size="w-6 h-6" color="bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-500/50" name="TRAPPIST-1e" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Orbital Period Chart */}
      <div className="bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl shadow-xl overflow-hidden border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm mb-8">
        <div className="p-6 border-b border-purple-200/50 dark:border-purple-700/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <i className="fas fa-chart-bar text-purple-600 dark:text-purple-400"></i>
            Orbital Period Distribution
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Distribution of orbital periods for confirmed exoplanets</p>
        </div>
        <div className="p-8">
          <OrbitalPeriodChart />
        </div>
      </div>
      
      {/* Discovery Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl shadow-xl overflow-hidden border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
          <div className="p-6 border-b border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              <i className="fas fa-microscope text-blue-600 dark:text-blue-400"></i>
              Discovery Methods
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Breakdown of exoplanet discovery methods</p>
          </div>
          <div className="p-8">
            <DiscoveryMethodChart />
          </div>
        </div>

        {/* Star Type Distribution */}
        <div className="bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl shadow-xl overflow-hidden border border-amber-200/50 dark:border-amber-700/50 backdrop-blur-sm">
          <div className="p-6 border-b border-amber-200/50 dark:border-amber-700/50 bg-gradient-to-r from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-2">
              <i className="fas fa-sun text-amber-600 dark:text-amber-400"></i>
              Host Star Types
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Distribution of star types hosting confirmed exoplanets</p>
          </div>
          <div className="p-8">
            <StarTypeChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;