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
  radius?: number; // In Earth radii
}

const PlanetCircle: React.FC<PlanetCircleProps> = ({ size, color, name, radius }) => (
  <div className="flex flex-col items-center group">
    <div className={`${size} rounded-full ${color} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl`}></div>
    <p className="text-xs mt-3 font-semibold text-gray-800 dark:text-gray-300">{name}</p>
    {radius !== undefined && (
      <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{radius.toFixed(2)} R⊕</p>
    )}
  </div>
);

// Dynamic Planet Size Comparison Component
interface DynamicPlanetComparisonProps {
  planets: Array<{ name: string; radius: number; id?: string | number }>;
}

const DynamicPlanetComparison: React.FC<DynamicPlanetComparisonProps> = ({ planets }) => {
  // Sort planets by radius for better visualization
  const sortedPlanets = [...planets].sort((a, b) => a.radius - b.radius);
  
  // Calculate sizes relative to the largest planet
  const maxRadius = Math.max(...sortedPlanets.map(p => p.radius));
  const baseSize = 160; // Maximum pixel size for the largest planet
  
  // Color palette for different sizes (scientific categorization)
  const getColorByRadius = (radius: number) => {
    if (radius < 1.25) return 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/50'; // Earth-like
    if (radius < 2.0) return 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-500/50'; // Super-Earth
    if (radius < 4.0) return 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/50'; // Mini-Neptune
    if (radius < 10.0) return 'bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-500/50'; // Neptune-like
    return 'bg-gradient-to-br from-orange-400 to-red-600 shadow-orange-500/50'; // Jupiter-like
  };
  
  const getPlanetSize = (radius: number) => {
    const scaledSize = (radius / maxRadius) * baseSize;
    // Ensure minimum visible size
    const size = Math.max(scaledSize, 24);
    return `${size}px`;
  };
  
  return (
    <div className="flex flex-wrap items-end justify-center gap-8 min-h-[300px] py-8">
      {/* Always show Earth as reference */}
      <div className="flex flex-col items-center group">
        <div 
          className="rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/50 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl"
          style={{ width: getPlanetSize(1.0), height: getPlanetSize(1.0) }}
        ></div>
        <p className="text-xs mt-3 font-semibold text-gray-800 dark:text-gray-300">Earth (Reference)</p>
        <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">1.00 R⊕</p>
      </div>
      
      {/* Analyzed planets */}
      {sortedPlanets.map((planet, idx) => (
        <div key={planet.id || idx} className="flex flex-col items-center group">
          <div 
            className={`rounded-full ${getColorByRadius(planet.radius)} shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl`}
            style={{ width: getPlanetSize(planet.radius), height: getPlanetSize(planet.radius) }}
          ></div>
          <p className="text-xs mt-3 font-semibold text-gray-800 dark:text-gray-300 max-w-[120px] text-center truncate" title={planet.name}>
            {planet.name}
          </p>
          <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{planet.radius.toFixed(2)} R⊕</p>
        </div>
      ))}
    </div>
  );
};

// Color Legend Component
const PlanetSizeLegend: React.FC = () => (
  <div className="mt-6 pt-6 border-t border-green-200/50 dark:border-green-700/50">
    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 text-center">
      <i className="fas fa-palette mr-2"></i>Planet Type Classification
    </h3>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
      <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-gray-700/30 rounded-lg">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/50 shadow-md mb-2"></div>
        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Earth-like</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">&lt; 1.25 R⊕</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center">Rocky planets</p>
      </div>
      
      <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-gray-700/30 rounded-lg">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-500/50 shadow-md mb-2"></div>
        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Super-Earth</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">1.25 - 2.0 R⊕</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center">Large rocky</p>
      </div>
      
      <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-gray-700/30 rounded-lg">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/50 shadow-md mb-2"></div>
        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Mini-Neptune</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">2.0 - 4.0 R⊕</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center">Gas envelope</p>
      </div>
      
      <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-gray-700/30 rounded-lg">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-indigo-500/50 shadow-md mb-2"></div>
        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Neptune-like</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">4.0 - 10.0 R⊕</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center">Ice giant</p>
      </div>
      
      <div className="flex flex-col items-center p-3 bg-white/50 dark:bg-gray-700/30 rounded-lg">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-600 shadow-orange-500/50 shadow-md mb-2"></div>
        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">Jupiter-like</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">&gt; 10.0 R⊕</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center">Gas giant</p>
      </div>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
      <i className="fas fa-info-circle mr-1"></i>
      R⊕ = Earth Radii (1 R⊕ = 6,371 km)
    </p>
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

// Dynamic Star Type Chart Component
interface StarTypeChartProps {
  planets: Array<any>;
  dataType: 'kepler' | 'tess';
}

const StarTypeChart: React.FC<StarTypeChartProps> = ({ planets, dataType }) => {
  // Function to classify star type based on effective temperature
  const classifyStarType = (teff: number): string => {
    if (teff >= 30000) return 'O-type';
    if (teff >= 10000) return 'B-type';
    if (teff >= 7500) return 'A-type';
    if (teff >= 6000) return 'F-type';
    if (teff >= 5200) return 'G-type';
    if (teff >= 3700) return 'K-type';
    if (teff >= 2400) return 'M-type';
    return 'Unknown';
  };

  // Count star types from the planets
  const starTypeCounts: Record<string, number> = {
    'O-type': 0,
    'B-type': 0,
    'A-type': 0,
    'F-type': 0,
    'G-type': 0,
    'K-type': 0,
    'M-type': 0,
    'Unknown': 0,
  };

  planets.forEach((planet) => {
    const teff = dataType === 'tess' ? planet.st_teff : planet.koi_steff;
    if (teff) {
      const type = classifyStarType(teff);
      starTypeCounts[type]++;
    } else {
      starTypeCounts['Unknown']++;
    }
  });

  const totalStars = planets.length;

  // Filter out types with 0 count and prepare segments
  const starTypeSegments = [
    { type: 'O-type', color: '#3b82f6', label: 'O-type (Blue)', description: 'Very hot blue stars (>30,000K)' },
    { type: 'B-type', color: '#60a5fa', label: 'B-type (Blue-white)', description: 'Hot blue-white stars (10,000-30,000K)' },
    { type: 'A-type', color: '#f3f4f6', label: 'A-type (White)', description: 'White stars (7,500-10,000K)' },
    { type: 'F-type', color: '#fef3c7', label: 'F-type (Yellow-white)', description: 'Yellow-white stars (6,000-7,500K)' },
    { type: 'G-type', color: '#fbbf24', label: 'G-type (Sun-like)', description: 'Sun-like yellow stars (5,200-6,000K)' },
    { type: 'K-type', color: '#f97316', label: 'K-type (Orange)', description: 'Orange stars (3,700-5,200K)' },
    { type: 'M-type', color: '#ef4444', label: 'M-type (Red dwarf)', description: 'Cool red dwarf stars (2,400-3,700K)' },
    { type: 'Unknown', color: '#6b7280', label: 'Unknown', description: 'Unknown spectral type' },
  ]
    .map((segment) => ({
      ...segment,
      count: starTypeCounts[segment.type],
      percent: totalStars > 0 ? (starTypeCounts[segment.type] / totalStars) * 100 : 0,
    }))
    .filter((segment) => segment.count > 0);

  // Calculate cumulative start positions for donut segments
  let cumulativePercent = 0;
  const segmentsWithPositions = starTypeSegments.map((segment) => {
    const start = cumulativePercent;
    cumulativePercent += segment.percent;
    return { ...segment, start };
  });

  if (totalStars === 0) {
    return (
      <div className="h-80 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200/30 dark:border-amber-700/30 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <i className="fas fa-star text-6xl mb-4 opacity-30"></i>
          <p className="text-lg font-semibold">No star data available</p>
          <p className="text-sm mt-2">Select exoplanets to analyze their host stars</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200/30 dark:border-amber-700/30 flex items-center justify-center relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-300/30 dark:bg-amber-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-64 h-64 group">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-yellow-400/20 blur-xl animate-pulse"></div>
        
        {/* Donut chart segments with animation */}
        <svg viewBox="0 0 100 100" className="transform -rotate-90 transition-transform duration-700 group-hover:rotate-[6deg] group-hover:scale-105">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="20"
            className="text-gray-200 dark:text-gray-700 opacity-20"
          />
          
          {segmentsWithPositions.map((segment, idx) => {
            const radius = 40;
            const circumference = 2 * Math.PI * radius;
            const offset = (segment.start / 100) * circumference;
            const dashArray = `${(segment.percent / 100) * circumference} ${circumference}`;

            return (
              <g key={idx} className="animate-[fadeIn_0.5s_ease-out]" style={{ animationDelay: `${idx * 0.1}s` }}>
                <title>{`${segment.label}: ${segment.count} (${segment.percent.toFixed(1)}%)`}</title>
                {/* Segment with glow effect */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="20"
                  strokeDasharray={dashArray}
                  strokeDashoffset={-offset}
                  className="transition-all duration-500 hover:brightness-125 cursor-pointer drop-shadow-lg"
                  style={{
                    filter: 'drop-shadow(0 0 8px currentColor)',
                    opacity: 0.9,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.strokeWidth = '24';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.strokeWidth = '20';
                    e.currentTarget.style.opacity = '0.9';
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Center text with animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-[fadeIn_0.8s_ease-out]">
            <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
              {totalStars}
            </div>
            <div className="text-xs font-bold text-gray-600 dark:text-gray-400 mt-1 tracking-wider uppercase">
              {totalStars === 1 ? 'Star' : 'Stars'}
            </div>
            <div className="mt-2">
              <i className="fas fa-star text-amber-500 dark:text-amber-400 text-sm animate-spin" style={{ animationDuration: '3s' }}></i>
            </div>
          </div>
        </div>

        {/* Rotating orbit ring */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 pointer-events-none animate-spin" style={{ animationDuration: '20s' }}>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            className="text-amber-400/30 dark:text-amber-500/20"
          />
        </svg>
      </div>

      {/* Legend with animations */}
      <div className="ml-8 space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-400/30 scrollbar-track-transparent">
        {segmentsWithPositions.map((item, idx) => {
          const colorClass = item.color.startsWith('#') ? '' : item.color;
          return (
          <div 
            key={idx} 
            className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/30 transition-all duration-300 animate-[slideInRight_0.5s_ease-out]"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="relative">
              {/* Pulsing glow behind the color indicator */}
              <div
                className="absolute inset-0 rounded-full blur-sm transition-all duration-300 group-hover:blur-md group-hover:scale-150"
                style={{ backgroundColor: item.color, opacity: 0.3 }}
              ></div>
              <div
                className={`w-5 h-5 rounded-full shadow-lg transition-all duration-300 group-hover:scale-125 group-hover:rotate-[360deg] relative z-10 ${colorClass}`}
                {...(item.color.startsWith('#') && { style: { backgroundColor: item.color } })}
              >
                <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {item.type}
                </span>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-full">
                  {item.count} · {item.percent.toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                {item.description}
              </p>
            </div>
            <i className="fas fa-chevron-right text-amber-400 dark:text-amber-500 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1"></i>
          </div>
        );})}
      </div>
    </div>
  );
};

const Visualizations: React.FC = () => {
  const { selectedExoplanet, selectedExoplanets, dataType, clearSelectedExoplanet, clearAllExoplanets } = useExoplanet();
  const [showExamples, setShowExamples] = useState(false);

  // Determine if we're showing multiple planets or a single planet
  const isMultipleMode = selectedExoplanets && selectedExoplanets.length > 0;
  const hasSelection = selectedExoplanet || isMultipleMode;
  const [downloadingImage, setDownloadingImage] = useState(false);

  // Scroll to top when exoplanets are loaded (from predictions)
  useEffect(() => {
    if (hasSelection) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hasSelection]);

  // Download Planet Size Comparison as image
  const downloadPlanetSizeImage = async () => {
    try {
      setDownloadingImage(true);
      const html2canvas = (await import('html2canvas')).default;
      
      const element = document.querySelector('.planet-size-comparison-container');
      if (!element) {
        throw new Error('Comparison section not found');
      }

      const canvas = await html2canvas(element as HTMLElement, {
        backgroundColor: getComputedStyle(document.body).backgroundColor,
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const planetCount = isMultipleMode ? selectedExoplanets.length : (selectedExoplanet ? 1 : 'examples');
      link.download = `planet-size-comparison-${planetCount}-planets-${timestamp}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloadingImage(false);
    }
  };

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

          <div className="bg-gradient-to-br from-white to-purple-50/20 dark:from-gray-800 dark:to-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-purple-400/50 dark:border-purple-600/50 backdrop-blur-sm cursor-move">
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

          <div className="bg-gradient-to-br from-white to-purple-50/20 dark:from-gray-800 dark:to-gray-800/50 p-8 rounded-2xl shadow-2xl border-2 border-purple-400/50 dark:border-purple-600/50 backdrop-blur-sm cursor-move">
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
            <div className="cursor-move">
              <ExoplanetVisualization3D data={sampleTessData} dataType="tess" />
            </div>
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
            <div className="cursor-move">
              <ExoplanetVisualization3D data={sampleKeplerData} dataType="kepler" />
            </div>
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
        <div className="bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/20 rounded-2xl shadow-xl overflow-hidden border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm planet-size-comparison-container">
          <div className="p-6 border-b border-green-200/50 dark:border-green-700/50 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
                  <i className="fas fa-balance-scale text-green-600 dark:text-green-400"></i>
                  Planet Size Comparison
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {hasSelection 
                    ? 'Compare your analyzed exoplanet sizes to Earth' 
                    : 'Compare exoplanet sizes to planets in our solar system'}
                </p>
              </div>
              <button
                onClick={downloadPlanetSizeImage}
                disabled={downloadingImage}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm"
                title="Download as PNG image"
              >
                {downloadingImage ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-download"></i>
                    <span>Download Image</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="p-10 bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/10">
            {hasSelection ? (
              // Dynamic comparison with analyzed planets
              <>
                <DynamicPlanetComparison 
                  planets={
                    isMultipleMode 
                      ? selectedExoplanets.map(planet => ({
                          name: dataType === 'kepler' 
                            ? (planet.kepler_name || planet.kepoi_name || `KOI-${planet.kepid}`)
                            : (planet.pl_name || `TOI-${planet.toi_id || planet.toi}`),
                          radius: dataType === 'kepler' 
                            ? (planet.koi_prad || 0)
                            : (planet.pl_rade || 0),
                          id: planet.id
                        })).filter(p => p.radius > 0) // Only show planets with valid radius data
                      : selectedExoplanet 
                        ? [{
                            name: dataType === 'kepler' 
                              ? (selectedExoplanet.kepler_name || selectedExoplanet.kepoi_name || `KOI-${selectedExoplanet.kepid}`)
                              : (selectedExoplanet.pl_name || `TOI-${selectedExoplanet.toi_id || selectedExoplanet.toi}`),
                            radius: dataType === 'kepler' 
                              ? (selectedExoplanet.koi_prad || 0)
                              : (selectedExoplanet.pl_rade || 0),
                            id: selectedExoplanet.id
                          }].filter(p => p.radius > 0)
                        : []
                  }
                />
                <PlanetSizeLegend />
              </>
            ) : (
              // Static examples when no planets selected
              <>
                <div className="flex items-end justify-center h-72 gap-8">
                  <PlanetCircle size="w-8 h-8" color="bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/50" name="Earth" radius={1.0} />
                  <PlanetCircle size="w-16 h-16" color="bg-gradient-to-br from-orange-400 to-orange-600 shadow-orange-500/50" name="HD 209458 b" radius={1.38} />
                  <PlanetCircle size="w-32 h-32" color="bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/50" name="WASP-17b" radius={1.99} />
                  <PlanetCircle size="w-6 h-6" color="bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-500/50" name="TRAPPIST-1e" radius={0.92} />
                </div>
                <PlanetSizeLegend />
              </>
            )}
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {hasSelection 
                ? 'Star type classification of your selected exoplanets' 
                : 'Distribution of star types hosting confirmed exoplanets'}
            </p>
          </div>
          <div className="p-8">
            {hasSelection && dataType ? (
              <StarTypeChart 
                planets={
                  isMultipleMode 
                    ? selectedExoplanets 
                    : (selectedExoplanet ? [selectedExoplanet] : [])
                }
                dataType={dataType}
              />
            ) : (
              <div className="h-80 bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200/30 dark:border-amber-700/30 flex items-center justify-center">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <i className="fas fa-star text-6xl mb-4 opacity-30"></i>
                  <p className="text-lg font-semibold">No star data available</p>
                  <p className="text-sm mt-2">Select exoplanets from the Exoplanets page to analyze their host stars</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visualizations;