import React, { useState, useEffect, useContext } from 'react';
import type { SpaceData } from '../../services/api';
import { ThemeContext } from '../ThemeContext';
import { useExoplanet } from '../../contexts/ExoplanetContext';
import { PageContext } from '../DashboardLayoutComponent';
import { dataLoader } from '../../services/dataLoader';

interface ColumnConfig {
  key: keyof SpaceData;
  label: string;
  visible?: boolean;
  essential: boolean;
  requiredForModel?: boolean;
  type: 'text' | 'number' | 'badge';
  unit?: string;
  description?: string;
}

// Statistics Card Component
interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  gradientClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass, gradientClass }) => (
  <div className="group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-3xl font-bold ${colorClass} mb-1`}>{value}</p>
      </div>
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
  </div>
);

// Pagination Controls Component
interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, totalItems, onPreviousPage, onNextPage }) => (
  <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm font-medium border-2 border-purple-300 dark:border-purple-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all text-purple-700 dark:text-purple-300 shadow-sm hover:shadow-md"
        >
          <i className="fas fa-chevron-left mr-2"></i>Previous
        </button>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm font-medium border-2 border-purple-300 dark:border-purple-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all text-purple-700 dark:text-purple-300 shadow-sm hover:shadow-md"
        >
          Next<i className="fas fa-chevron-right ml-2"></i>
        </button>
      </div>
      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600">
        <i className="fas fa-globe mr-2"></i>Total: {totalItems} exoplanets
      </div>
    </div>
  </div>
);

// Column Setting Item Component
interface ColumnSettingItemProps {
  column: ColumnConfig;
  onToggle: (key: keyof SpaceData) => void;
}

const ColumnSettingItem: React.FC<ColumnSettingItemProps> = ({ column, onToggle }) => (
  <div className="flex items-start space-x-3">
    <input
      type="checkbox"
      id={column.key}
      checked={column.visible}
      onChange={() => onToggle(column.key)}
      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
    />
    <div className="flex-1">
      <label htmlFor={column.key} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer flex items-center gap-2">
        {column.label}
        {column.essential && <span className="text-blue-600 dark:text-blue-400" title="Essential column">*</span>}
        {column.requiredForModel && <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium" title="Required for 3D visualization">3D</span>}
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{column.description}</p>
    </div>
  </div>
);

export default function Exoplanets() {
  const { darkMode } = useContext(ThemeContext);
  const { setSelectedExoplanet, selectedExoplanets, setSelectedExoplanets } = useExoplanet();
  const { setActivePage } = useContext(PageContext);
  const [datasets, setDatasets] = useState<SpaceData[]>([]);
  const [filteredData, setFilteredData] = useState<SpaceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dispositionFilter, setDispositionFilter] = useState('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: keyof SpaceData; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [view3D, setView3D] = useState(false);
  const [selectedPlanets, setSelectedPlanets] = useState<Set<number>>(new Set());
  const [datasetType, setDatasetType] = useState<'kepler' | 'tess'>('kepler');
  
  // Selection limit to prevent performance issues
  const MAX_SELECTION_LIMIT = 100;

  // Kepler Column configuration (based on actual CSV columns)
  const keplerColumns: ColumnConfig[] = [
    { key: 'kepid', label: 'Kepler ID', visible: true, essential: true, requiredForModel: false, type: 'number', description: 'Unique Kepler identifier' },
    { key: 'kepler_name', label: 'Planet Name', visible: true, essential: true, requiredForModel: false, type: 'text', description: 'Official Kepler planet designation' },
    { key: 'koi_disposition', label: 'Archive Disposition', visible: true, essential: true, requiredForModel: false, type: 'badge', description: 'Exoplanet Archive Disposition' },
    { key: 'koi_pdisposition', label: 'Kepler Disposition', visible: false, essential: false, requiredForModel: false, type: 'badge', description: 'Disposition Using Kepler Data' },
    { key: 'koi_score', label: 'Disposition Score', visible: false, essential: false, requiredForModel: false, type: 'number', description: 'Disposition Score' },
    { key: 'koi_fpflag_nt', label: 'FP: Not Transit', visible: false, essential: false, requiredForModel: false, type: 'number', description: 'Not Transit-Like False Positive Flag' },
    { key: 'koi_fpflag_ss', label: 'FP: Stellar Eclipse', visible: false, essential: false, requiredForModel: false, type: 'number', description: 'Stellar Eclipse False Positive Flag' },
    { key: 'koi_fpflag_co', label: 'FP: Centroid Offset', visible: false, essential: false, requiredForModel: false, type: 'number', description: 'Centroid Offset False Positive Flag' },
    { key: 'koi_fpflag_ec', label: 'FP: Ephemeris', visible: false, essential: false, requiredForModel: false, type: 'number', description: 'Ephemeris Match False Positive Flag' },
    { key: 'koi_period', label: 'Orbital Period', visible: true, essential: false, requiredForModel: true, type: 'number', unit: 'days', description: 'Orbital Period (Required for 3D model)' },
    { key: 'koi_impact', label: 'Impact Parameter', visible: false, essential: false, requiredForModel: false, type: 'number', description: 'Impact Parameter' },
    { key: 'koi_duration', label: 'Transit Duration', visible: false, essential: false, requiredForModel: false, type: 'number', unit: 'hrs', description: 'Transit Duration' },
    { key: 'koi_depth', label: 'Transit Depth', visible: false, essential: false, requiredForModel: false, type: 'number', unit: 'ppm', description: 'Transit Depth' },
    { key: 'koi_prad', label: 'Planet Radius', visible: true, essential: false, requiredForModel: true, type: 'number', unit: 'R⊕', description: 'Planetary Radius (Required for 3D model)' },
    { key: 'koi_teq', label: 'Equilibrium Temp', visible: true, essential: false, requiredForModel: true, type: 'number', unit: 'K', description: 'Equilibrium Temperature (Required for 3D model)' },
    { key: 'koi_insol', label: 'Insolation Flux', visible: true, essential: false, requiredForModel: false, type: 'number', unit: 'S⊕', description: 'Insolation Flux' },
    { key: 'koi_model_snr', label: 'Transit SNR', visible: false, essential: false, requiredForModel: false, type: 'number', description: 'Transit Signal-to-Noise' },
    { key: 'koi_tce_plnt_num', label: 'TCE Planet #', visible: false, essential: false, requiredForModel: false, type: 'number', description: 'TCE Planet Number' },
    { key: 'koi_steff', label: 'Stellar Temp', visible: true, essential: false, requiredForModel: false, type: 'number', unit: 'K', description: 'Stellar Effective Temperature' },
    { key: 'koi_slogg', label: 'Surface Gravity', visible: false, essential: false, requiredForModel: false, type: 'number', unit: 'log10(cm/s²)', description: 'Stellar Surface Gravity' },
    { key: 'koi_srad', label: 'Stellar Radius', visible: true, essential: false, requiredForModel: false, type: 'number', unit: 'R☉', description: 'Stellar Radius' },
    { key: 'ra', label: 'Right Ascension', visible: false, essential: false, requiredForModel: false, type: 'number', unit: '°', description: 'Right Ascension' },
    { key: 'dec', label: 'Declination', visible: false, essential: false, requiredForModel: false, type: 'number', unit: '°', description: 'Declination' },
    { key: 'koi_kepmag', label: 'Kepler Magnitude', visible: false, essential: false, requiredForModel: false, type: 'number', unit: 'mag', description: 'Kepler-band Magnitude' },
  ];

  // TESS Column configuration (based on actual TESS TOI CSV structure)
  const tessColumns: ColumnConfig[] = [
    { key: 'toi', label: 'TOI', visible: true, essential: true, requiredForModel: false, type: 'number', description: 'TESS Object of Interest number' },
    { key: 'tid', label: 'TIC ID', visible: true, essential: true, requiredForModel: false, type: 'number', description: 'TESS Input Catalog ID' },
    { key: 'tfopwg_disp', label: 'Disposition', visible: true, essential: true, requiredForModel: false, type: 'badge', description: 'TFOPWG disposition (CP=Community Planet, KP=Known Planet, FP=False Positive)' },
    { key: 'rastr', label: 'RA (sexagesimal)', visible: true, essential: false, requiredForModel: false, type: 'text', description: 'Right ascension in sexagesimal format' },
    { key: 'decstr', label: 'Dec (sexagesimal)', visible: true, essential: false, requiredForModel: false, type: 'text', description: 'Declination in sexagesimal format' },
    { key: 'ra', label: 'Right Ascension', visible: true, essential: false, requiredForModel: false, type: 'number', unit: '°', description: 'Right ascension coordinate' },
    { key: 'dec', label: 'Declination', visible: true, essential: false, requiredForModel: false, type: 'number', unit: '°', description: 'Declination coordinate' },
    { key: 'pl_orbper', label: 'Orbital Period', visible: true, essential: false, requiredForModel: true, type: 'number', unit: 'days', description: 'Planet orbital period (Required for 3D model)' },
    { key: 'pl_rade', label: 'Planet Radius', visible: true, essential: false, requiredForModel: true, type: 'number', unit: 'R⊕', description: 'Planet radius in Earth radii (Required for 3D model)' },
    { key: 'pl_eqt', label: 'Equilibrium Temp', visible: true, essential: false, requiredForModel: true, type: 'number', unit: 'K', description: 'Planet equilibrium temperature (Required for 3D model)' },
    { key: 'pl_insol', label: 'Insolation Flux', visible: true, essential: false, requiredForModel: false, type: 'number', unit: 'S⊕', description: 'Stellar flux received by planet' },
    { key: 'pl_trandep', label: 'Transit Depth', visible: true, essential: false, requiredForModel: false, type: 'number', unit: 'ppm', description: 'Transit depth in parts per million' },
    { key: 'pl_trandurh', label: 'Transit Duration', visible: true, essential: false, requiredForModel: false, type: 'number', unit: 'hrs', description: 'Transit duration in hours' },
    { key: 'st_rad', label: 'Stellar Radius', visible: true, essential: false, requiredForModel: true, type: 'number', unit: 'R☉', description: 'Stellar radius in solar radii (Required for 3D model)' },
    { key: 'st_teff', label: 'Stellar Temp', visible: true, essential: false, requiredForModel: true, type: 'number', unit: 'K', description: 'Stellar effective temperature (Required for 3D model)' },
    { key: 'st_logg', label: 'Stellar log(g)', visible: false, essential: false, requiredForModel: false, type: 'number', unit: 'log10(cm/s²)', description: 'Stellar surface gravity' },
    { key: 'st_dist', label: 'Distance', visible: true, essential: false, requiredForModel: false, type: 'number', unit: 'pc', description: 'Distance to system in parsecs' },
    { key: 'st_tmag', label: 'TESS Magnitude', visible: false, essential: false, requiredForModel: false, type: 'number', description: 'TESS bandpass magnitude' },
    { key: 'toi_created', label: 'TOI Created', visible: false, essential: false, requiredForModel: false, type: 'text', description: 'Date TOI was created' },
    { key: 'rowupdate', label: 'Last Update', visible: false, essential: false, requiredForModel: false, type: 'text', description: 'Date of last row update' },
  ];

  // Column configuration
  const [columns, setColumns] = useState<ColumnConfig[]>(keplerColumns);

  useEffect(() => {
    fetchData();
    // Reset disposition filter when dataset type changes
    setDispositionFilter('ALL');
  }, [datasetType]);

  useEffect(() => {
    filterAndSortData();
  }, [datasets, searchTerm, dispositionFilter, sortConfig]);

  useEffect(() => {
    // Switch columns when dataset type changes
    setColumns(datasetType === 'kepler' ? keplerColumns : tessColumns);
  }, [datasetType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🚀 Loading ${datasetType.toUpperCase()} data with progressive strategy...`);

      // Use progressive loading for instant UI
      const initialData = await dataLoader.loadProgressively(datasetType, (progress) => {
        console.log(
          `📊 Progress: ${progress.loaded}/${progress.total} chunks (${progress.percentage}%) ${progress.fromCache ? '💾 cached' : '📥 downloading'}`
        );
      });

      // Add unique IDs to each entry if not present
      const dataWithIds = initialData.map((item: any, index: number) => ({
        ...item,
        id: item.id || item.kepid || item.toi || item.tid || index
      }));

      setDatasets(dataWithIds as SpaceData[]);
      setLoading(false);

      console.log(`✅ UI ready with ${dataWithIds.length} ${datasetType.toUpperCase()} exoplanets`);
      console.log(`⏳ Remaining data loading in background...`);

      // Background loading happens automatically in loadProgressively()
      // Wait for it to complete and update the dataset
      setTimeout(async () => {
        const allData = await dataLoader.loadAllData(datasetType);
        const allDataWithIds = allData.map((item: any, index: number) => ({
          ...item,
          id: item.id || item.kepid || item.toi || item.tid || index
        }));
        setDatasets(allDataWithIds as SpaceData[]);
        console.log(`✅ Full dataset loaded: ${allDataWithIds.length} total exoplanets`);
      }, 500);

    } catch (err) {
      console.error('Error loading dataset:', err);
      setError(`Failed to load ${datasetType.toUpperCase()} dataset. Check network connection.`);
      setDatasets([]);
      setLoading(false);
    }
  };

  const filterAndSortData = () => {
    let filtered = datasets.filter(item => {
      // For TESS data, filter out entries without essential data (TOI, TIC ID, or DISPOSITION)
      if (datasetType === 'tess') {
        const hasEssentialData = item.toi || item.tid || item.tfopwg_disp;
        if (!hasEssentialData) {
          return false;
        }
      }

      // Search functionality - adapt for both Kepler and TESS data
      let matchesSearch = false;
      if (!searchTerm) {
        matchesSearch = true;
      } else {
        const searchLower = searchTerm.toLowerCase();
        if (datasetType === 'kepler') {
          matchesSearch = Boolean((item.kepler_name && item.kepler_name.toLowerCase().includes(searchLower)) ||
                                 (item.kepid && item.kepid.toString().includes(searchTerm)));
        } else {
          // For TESS data, search by coordinates, stellar properties, or description
          matchesSearch = Boolean((item.ra && item.ra.toString().includes(searchTerm)) ||
                                 (item.dec && item.dec.toString().includes(searchTerm)) ||
                                 (item.st_teff && item.st_teff.toString().includes(searchTerm)) ||
                                 (item.description && item.description.toLowerCase().includes(searchLower)));
        }
      }

      // Filter by disposition - for both Kepler and TESS data
      let matchesDisposition = true;
      if (dispositionFilter !== 'ALL') {
        if (datasetType === 'kepler') {
          matchesDisposition = item.koi_disposition === dispositionFilter;
        } else {
          // For TESS data, use tfopwg_disp field
          matchesDisposition = item.tfopwg_disp === dispositionFilter;
        }
      }

      return matchesSearch && matchesDisposition;
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // Special handling for orbital period to use logarithmic grouping
        // This keeps planets with similar orbital periods together
        const isOrbitalPeriod = sortConfig.key === 'koi_period' || sortConfig.key === 'pl_orbper';

        let comparison;
        if (isOrbitalPeriod && typeof aVal === 'number' && typeof bVal === 'number') {
          // Use logarithmic scale for better grouping of orbital periods
          // This prevents planets with 5 days from being next to 150 days
          const aLog = Math.log10(Math.max(aVal, 0.1));
          const bLog = Math.log10(Math.max(bVal, 0.1));
          comparison = aLog < bLog ? -1 : aLog > bLog ? 1 : 0;
        } else {
          // Standard comparison for other fields
          comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }

        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  const handleSort = (key: keyof SpaceData) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleColumnVisibility = (key: keyof SpaceData) => {
    setColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  const showEssentialOnly = () => {
    setColumns(prev => prev.map(col => ({ ...col, visible: col.essential })));
  };

  const showAllColumns = () => {
    setColumns(prev => prev.map(col => ({ ...col, visible: true })));
  };

  const showModelRequired = () => {
    setColumns(prev => prev.map(col => ({ ...col, visible: col.essential || col.requiredForModel })));
  };

  const handleView3D = (exoplanet: SpaceData) => {
    setSelectedExoplanet(exoplanet, datasetType);
    setActivePage('visualizations');
  };

  const handleToggleSelect = (planet: SpaceData) => {
    setSelectedPlanets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planet.id)) {
        // Always allow deselection
        newSet.delete(planet.id);
      } else {
        // Check limit before adding
        if (newSet.size >= MAX_SELECTION_LIMIT) {
          alert(`⚠️ Selection limit reached! You can select up to ${MAX_SELECTION_LIMIT} planets for optimal performance.`);
          return prev;
        }
        newSet.add(planet.id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedPlanets.size === paginatedData.length) {
      // Deselect all
      setSelectedPlanets(new Set());
    } else {
      // Select all on current page, respecting the limit
      const planetsToAdd = paginatedData.map(p => p.id);
      const newSet = new Set(selectedPlanets);
      
      let added = 0;
      for (const id of planetsToAdd) {
        if (!newSet.has(id)) {
          if (newSet.size >= MAX_SELECTION_LIMIT) {
            alert(`⚠️ Selection limit reached! You can select up to ${MAX_SELECTION_LIMIT} planets. ${added} planets were added.`);
            break;
          }
          newSet.add(id);
          added++;
        }
      }
      
      setSelectedPlanets(newSet);
    }
  };

  const handleViewMultiple3D = () => {
    const selected = datasets.filter(planet => selectedPlanets.has(planet.id));
    setSelectedExoplanets(selected, datasetType);
    setActivePage('visualizations');
  };

  const renderBadge = (disposition: string) => {
    const badgeClasses = {
      // Kepler dispositions
      'CONFIRMED': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'CANDIDATE': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'FALSE POSITIVE': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
      // TESS dispositions
      'CP': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200', // Community Planet
      'KP': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',     // Known Planet
      'FP': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'          // False Positive
    };
    
    const badgeLabels = {
      'CP': 'Community Planet',
      'KP': 'Known Planet',
      'FP': 'False Positive'
    };
    
    const displayLabel = badgeLabels[disposition as keyof typeof badgeLabels] || disposition;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        badgeClasses[disposition as keyof typeof badgeClasses] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
      }`}>
        {displayLabel}
      </span>
    );
  };

  const formatValue = (value: any, column: ColumnConfig) => {
    if (value == null) return 'N/A';
    
    if (column.type === 'badge') {
      return renderBadge(value);
    }
    
    if (column.type === 'number' && typeof value === 'number') {
      const formatted = value.toFixed(value < 1 ? 4 : 2);
      return column.unit ? `${formatted} ${column.unit}` : formatted;
    }
    
    return value;
  };

  const visibleColumns = columns.filter(col => col.visible);
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              <i className="fas fa-rocket mr-3 text-purple-600 dark:text-purple-400"></i>Exoplanets Explorer
            </h1>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Explore and analyze confirmed and candidate exoplanets from {datasetType === 'kepler' ? 'Kepler' : 'TESS'} mission</p>
            {error && error.includes('demo data') && (
              <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
                📊 Currently showing demo data - start the backend server to access real dataset
              </div>
            )}
            {/* Dataset Selector */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Dataset:</span>
              <div className="flex gap-3">
                <button
                  onClick={() => setDatasetType('kepler')}
                  className={`group px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    datasetType === 'kepler'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <i className="fas fa-satellite text-lg"></i>
                  <span>Kepler</span>
                </button>
                <button
                  onClick={() => setDatasetType('tess')}
                  className={`group px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                    datasetType === 'tess'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <i className="fas fa-rocket text-lg"></i>
                  <span>TESS</span>
                </button>
              </div>
            </div>
            {/* Multi-select hint with selection limit warnings */}
            {selectedPlanets.size >= MAX_SELECTION_LIMIT ? (
              // At limit - show error message
              <div className="mt-3 flex items-center gap-2 text-sm bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 px-4 py-2 rounded-lg border border-red-300 dark:border-red-700">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-red-700 dark:text-red-300 font-medium">
                  ⚠️ Maximum limit reached! You have selected {selectedPlanets.size}/{MAX_SELECTION_LIMIT} planets. Deselect some to add more.
                </span>
              </div>
            ) : selectedPlanets.size >= 80 ? (
              // Approaching limit - show warning
              <div className="mt-3 flex items-center gap-2 text-sm bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-4 py-2 rounded-lg border border-yellow-300 dark:border-yellow-700">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-yellow-700 dark:text-yellow-300 font-medium">
                  ⚡ Approaching limit: {selectedPlanets.size}/{MAX_SELECTION_LIMIT} planets selected. Consider selecting fewer for optimal performance.
                </span>
              </div>
            ) : (
              // Normal tip message
              <div className="mt-3 flex items-center gap-2 text-sm bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-700">
                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-indigo-700 dark:text-indigo-300 font-medium">
                  💡 Tip: Select multiple exoplanets using checkboxes to compare them all in 3D! (Up to {MAX_SELECTION_LIMIT} for best performance)
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {selectedPlanets.size > 0 && (
              <button
                onClick={handleViewMultiple3D}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-500 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 dark:hover:from-indigo-600 dark:hover:to-purple-600 transition-all duration-300 font-bold flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                </svg>
                <span className="text-lg">View {selectedPlanets.size} {selectedPlanets.size === 1 ? 'Planet' : 'Planets'} in 3D</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setShowColumnSettings(!showColumnSettings)}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-indigo-600 dark:to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 dark:hover:from-indigo-700 dark:hover:to-purple-700 transition-all duration-300 font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <i className="fas fa-columns text-lg"></i>
              <span>Column Settings</span>
            </button>
          </div>
        </div>
        {/* Column Settings Panel */}
        {showColumnSettings && (
          <div className="mb-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-xl border border-purple-200/50 dark:border-purple-700/50 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                <i className="fas fa-sliders-h mr-2 text-purple-600 dark:text-purple-400"></i>Column Settings
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={showEssentialOnly}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={showModelRequired}
                  className="px-3 py-1 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1"
                  title="Show columns required for 3D visualization"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                  3D Model Columns
                </button>
                <button
                  onClick={showAllColumns}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Show All
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {columns.map(column => (
                <ColumnSettingItem key={column.key} column={column} onToggle={toggleColumnVisibility} />
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-xl border border-blue-200/50 dark:border-blue-700/50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={datasetType === 'kepler' ? "Search by name or Kepler ID..." : "Search by coordinates, temperature, or description..."}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status Filter
              </label>
              <select
                value={dispositionFilter}
                onChange={(e) => setDispositionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Filter by status"
              >
                {datasetType === 'kepler' ? (
                  <>
                    <option value="ALL">All Status</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANDIDATE">Candidate</option>
                    <option value="FALSE POSITIVE">False Positive</option>
                  </>
                ) : (
                  <>
                    <option value="ALL">All Status</option>
                    <option value="CP">Community Planet (CP)</option>
                    <option value="KP">Known Planet (KP)</option>
                    <option value="FP">False Positive (FP)</option>
                    <option value="APC">Ambiguous Planet Candidate (APC)</option>
                    <option value="PC">Planet Candidate (PC)</option>
                    <option value="FA">False Alarm (FA)</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortConfig?.key || ''}
                onChange={(e) => {
                  if (e.target.value) {
                    handleSort(e.target.value as keyof SpaceData);
                  } else {
                    setSortConfig(null);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Sort by column"
              >
                <option value="">No Sorting</option>
                {visibleColumns.map(col => (
                  <option key={col.key} value={col.key}>{col.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort Direction
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => sortConfig && setSortConfig({ ...sortConfig, direction: 'asc' })}
                  disabled={!sortConfig}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    sortConfig?.direction === 'asc'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Sort ascending"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Asc
                </button>
                <button
                  onClick={() => sortConfig && setSortConfig({ ...sortConfig, direction: 'desc' })}
                  disabled={!sortConfig}
                  className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    sortConfig?.direction === 'desc'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Sort descending"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Desc
                </button>
              </div>
            </div>
          </div>
          {sortConfig && (
            <div className="mt-4 flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-700">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span className="text-blue-700 dark:text-blue-300">
                Sorted by <strong>{visibleColumns.find(c => c.key === sortConfig.key)?.label}</strong> ({sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'})
              </span>
              <button
                onClick={() => setSortConfig(null)}
                className="ml-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
              >
                Clear Sort
              </button>
            </div>
          )}
        </div>
        {/* Main Data Table */}
        <div className="bg-gradient-to-br from-white to-purple-50/20 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-2xl border border-purple-200/50 dark:border-purple-700/50 overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-purple-200/50 dark:border-purple-700/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                  <i className="fas fa-table text-purple-600 dark:text-purple-400"></i>
                  {datasetType === 'kepler' ? 'Kepler' : 'TESS'} Exoplanets Dataset
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} entries
                  {datasets.length !== filteredData.length && ` (filtered from ${datasets.length} total)`}
                </p>
              </div>
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading exoplanet data...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedPlanets.size === paginatedData.length && paginatedData.length > 0}
                          onChange={handleSelectAll}
                          className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 rounded-md cursor-pointer transition-all hover:scale-110"
                          title="Select all on this page"
                          aria-label="Select all exoplanets on this page"
                        />
                      </th>
                      {visibleColumns.map(column => (
                        <th
                          key={column.key}
                          onClick={() => handleSort(column.key)}
                          className={`px-6 py-4 text-left text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                            sortConfig?.key === column.key
                              ? 'bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800/50 dark:to-pink-800/50 text-purple-800 dark:text-purple-200'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                          }`}
                        >
                          <div className="flex items-center space-x-2 group">
                            <span>{column.label}</span>
                            {sortConfig?.key === column.key ? (
                              <svg className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform ${sortConfig.direction === 'asc' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm divide-y divide-purple-200/30 dark:divide-purple-700/30">
                    {paginatedData.map((item) => (
                      <tr key={item.id} className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 ${selectedPlanets.has(item.id) ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-inner' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedPlanets.has(item.id)}
                            onChange={() => handleToggleSelect(item)}
                            disabled={!selectedPlanets.has(item.id) && selectedPlanets.size >= MAX_SELECTION_LIMIT}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label={`Select exoplanet ${item.kepler_name || item.id}`}
                            title={!selectedPlanets.has(item.id) && selectedPlanets.size >= MAX_SELECTION_LIMIT ? `Selection limit reached (${MAX_SELECTION_LIMIT} max)` : 'Toggle selection'}
                          />
                        </td>
                        {visibleColumns.map(column => (
                          <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatValue(item[column.key], column)}
                            </div>
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleView3D(item)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                            title="View in 3D"
                          >
                            <i className="fas fa-cube"></i>
                            <span>3D View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredData.length}
                  onPreviousPage={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  onNextPage={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                />
              )}
            </>
          )}
        </div>
        
        {/* Statistics Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="Total Exoplanets"
            value={datasets.length.toLocaleString()}
            icon={
              <i className="fas fa-globe text-white text-2xl"></i>
            }
            colorClass="text-gray-900 dark:text-white"
            gradientClass="from-gray-500 to-gray-700"
          />

          {datasetType === 'kepler' ? (
            <>
              <StatCard
                label="Confirmed"
                value={datasets.filter(d => d.koi_disposition === 'CONFIRMED').length.toLocaleString()}
                icon={
                  <i className="fas fa-check-circle text-white text-2xl"></i>
                }
                colorClass="text-green-600 dark:text-green-400"
                gradientClass="from-green-500 to-emerald-600"
              />

              <StatCard
                label="Candidates"
                value={datasets.filter(d => d.koi_disposition === 'CANDIDATE').length.toLocaleString()}
                icon={
                  <i className="fas fa-question-circle text-white text-2xl"></i>
                }
                colorClass="text-yellow-600 dark:text-yellow-400"
                gradientClass="from-yellow-500 to-orange-600"
              />

              <StatCard
                label="False Positives"
                value={datasets.filter(d => d.koi_disposition === 'FALSE POSITIVE').length.toLocaleString()}
                icon={
                  <i className="fas fa-times-circle text-white text-2xl"></i>
                }
                colorClass="text-red-600 dark:text-red-400"
                gradientClass="from-red-500 to-rose-600"
              />
            </>
          ) : (
            <>
              <StatCard
                label="Known Planets (KP)"
                value={datasets.filter(d => d.tfopwg_disp === 'KP').length.toLocaleString()}
                icon={
                  <i className="fas fa-check-double text-white text-2xl"></i>
                }
                colorClass="text-blue-600 dark:text-blue-400"
                gradientClass="from-blue-500 to-cyan-600"
              />

              <StatCard
                label="Community Planets (CP)"
                value={datasets.filter(d => d.tfopwg_disp === 'CP').length.toLocaleString()}
                icon={
                  <i className="fas fa-users text-white text-2xl"></i>
                }
                colorClass="text-green-600 dark:text-green-400"
                gradientClass="from-green-500 to-emerald-600"
              />

              <StatCard
                label="False Positives (FP)"
                value={datasets.filter(d => d.tfopwg_disp === 'FP').length.toLocaleString()}
                icon={
                  <i className="fas fa-ban text-white text-2xl"></i>
                }
                colorClass="text-red-600 dark:text-red-400"
                gradientClass="from-red-500 to-rose-600"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}