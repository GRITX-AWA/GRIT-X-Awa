
import React, { useState, useRef } from 'react';
import { useSharedState } from '../context/SharedContext';
import DashboardSection from '../DashboardSection';
import Modal from '../Modal';
import RecentActivity from '../RecentActivity';
import { PredictionResults } from '../PredictionResults';
import { apiService, type UploadResponse } from '../../services/api';

type MLModel = 'tess' | 'kepler';
type InputMode = 'file' | 'manual';

interface ManualInputRow {
  [key: string]: string | number;
}

interface Hyperparameters {
  learningRate: number;
  epochs: number;
  batchSize: number;
  dropout: number;
  optimizer: 'adam' | 'sgd' | 'rmsprop';
}

// Hyperparameter Slider Component
interface HyperparamSliderProps {
  id: string;
  label: string;
  value: number;
  min: string;
  max: string;
  step: string;
  onChange: (value: number) => void;
  isFloat?: boolean;
}

const HyperparamSlider: React.FC<HyperparamSliderProps> = ({ id, label, value, min, max, step, onChange, isFloat = false }) => (
  <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
    <div className="flex justify-between mb-2">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
        {label}
      </label>
      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{value}</span>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(isFloat ? parseFloat(e.target.value) : parseInt(e.target.value))}
      className="mt-2 w-full h-3 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb accent-purple-600"
      style={{
        background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(147 51 234) ${((parseFloat(value.toString()) - parseFloat(min)) / (parseFloat(max) - parseFloat(min))) * 100}%, rgb(209 213 219) ${((parseFloat(value.toString()) - parseFloat(min)) / (parseFloat(max) - parseFloat(min))) * 100}%, rgb(209 213 219) 100%)`
      }}
    />
    <div className="flex justify-between mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

// Model Metric Interface
interface ModelMetric {
  name: string;
  value: number;
  description: string;
}

// Required Columns Display Component
interface RequiredColumnsProps {
  columns: string[];
  modelName: string;
  optionalColumns?: string[];
  columnDescriptions: { [key: string]: string };
}

const RequiredColumns: React.FC<RequiredColumnsProps> = ({ columns, modelName, optionalColumns = [], columnDescriptions }) => {
  const [showAll, setShowAll] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const displayColumns = showAll ? columns : columns.slice(0, 10);
  const displayOptionalColumns = showOptional ? optionalColumns : optionalColumns.slice(0, 5);

  return (
    <div className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
          <i className="fas fa-check-circle text-indigo-600 dark:text-indigo-400 mr-2"></i>
          Required Columns for {modelName} Model ({columns.length} total)
        </div>
        {columns.length > 10 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg text-xs transition-colors font-medium"
          >
            {showAll ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {displayColumns.map((col) => (
          <div key={col} className="group relative">
            <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-xs rounded-lg font-medium border border-indigo-200 dark:border-indigo-800 cursor-help">
              {col}
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64">
              <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700 dark:border-gray-600">
                <div className="font-semibold mb-1 text-indigo-300">{col}</div>
                <div className="text-gray-200 dark:text-gray-300">
                  {columnDescriptions[col] || 'No description available'}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!showAll && columns.length > 10 && (
          <span className="px-2.5 py-1 text-gray-500 dark:text-gray-400 text-xs font-medium">
            +{columns.length - 10} more
          </span>
        )}
      </div>

      {/* Optional Columns Section */}
      {optionalColumns.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
              <i className="fas fa-plus-circle text-green-600 dark:text-green-400"></i>
              Optional Columns ({optionalColumns.length} available)
            </div>
            {optionalColumns.length > 5 && (
              <button
                onClick={() => setShowOptional(!showOptional)}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg text-xs transition-colors font-medium"
              >
                {showOptional ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {displayOptionalColumns.map((col) => (
              <div key={col} className="group relative">
                <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs rounded-lg border border-green-200 dark:border-green-800 cursor-help">
                  {col}
                </span>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-64">
                  <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700 dark:border-gray-600">
                    <div className="font-semibold mb-1 text-green-300">{col}</div>
                    <div className="text-gray-200 dark:text-gray-300">
                      {columnDescriptions[col] || 'No description available'}
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!showOptional && optionalColumns.length > 5 && (
              <span className="px-2.5 py-1 text-gray-500 dark:text-gray-400 text-xs font-medium">
                +{optionalColumns.length - 5} more
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
            <i className="fas fa-info-circle mr-1"></i>
            These columns can be included in your file but are not required
          </p>
        </div>
      )}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { state, updateState } = useSharedState();

  // ML Model States
  const [selectedModel, setSelectedModel] = useState<MLModel>('tess');
  const [inputMode, setInputMode] = useState<InputMode>('file');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [predictionResults, setPredictionResults] = useState<UploadResponse | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileInfoMessage, setFileInfoMessage] = useState<string | null>(null);
  const [manualData, setManualData] = useState<ManualInputRow[]>([{}]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Modal States
  const [showHyperparamsModal, setShowHyperparamsModal] = useState(false);
  const [showManualInputModal, setShowManualInputModal] = useState(false);
  const [showOptionalFieldsInManual, setShowOptionalFieldsInManual] = useState(false);
  const [isManualInputFullscreen, setIsManualInputFullscreen] = useState(false);

  // Refs
  const recentActivityRef = useRef<RecentActivityRef>(null);

  // Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    confidence: number;
    type?: string;
    confirmed: boolean | null;
    error?: string;
  } | null>(null);

  // Hyperparameter States
  const [hyperparameters, setHyperparameters] = useState<Hyperparameters>({
    learningRate: 0.001,
    epochs: 50,
    batchSize: 32,
    dropout: 0.2,
    optimizer: 'adam'
  });

  // Model Configuration
  const modelColumns = {
    tess: [
      'ra', 'dec', 'st_teff', 'st_logg', 'st_rad', 'st_dist',
      'st_pmra', 'st_pmdec', 'st_tmag', 'pl_orbper', 'pl_rade',
      'pl_trandep', 'pl_trandurh', 'pl_eqt', 'pl_insol', 'pl_tranmid'
    ],
    kepler: [
      'koi_disposition', 'koi_pdisposition', 'koi_score', 'koi_fpflag_nt', 'koi_fpflag_ss',
      'koi_fpflag_co', 'koi_fpflag_ec', 'koi_period', 'koi_impact',
      'koi_duration', 'koi_depth', 'koi_prad', 'koi_teq', 'koi_insol',
      'koi_model_snr', 'koi_tce_plnt_num', 'koi_steff',
      'koi_slogg', 'koi_srad', 'ra', 'dec', 'koi_kepmag'
    ]
  };

  const optionalColumns = {
    tess: [
      'toi', 'tid', 'tfopwg_disp', 'rastr', 'decstr',
      'st_pmraerr1', 'st_pmraerr2', 'st_pmdecerr1', 'st_pmdecerr2',
      'st_tmagerr1', 'st_tmagerr2', 'st_disterr1', 'st_disterr2',
      'st_tefferr1', 'st_tefferr2', 'st_loggerr1', 'st_loggerr2',
      'st_raderr1', 'st_raderr2', 'pl_orbpererr1', 'pl_orbpererr2',
      'pl_radeerr1', 'pl_radeerr2', 'pl_trandeperr1', 'pl_trandeperr2',
      'pl_trandurherr1', 'pl_trandurherr2', 'pl_eqterr1', 'pl_eqterr2',
      'pl_insolerr1', 'pl_insolerr2', 'pl_tranmiderr1', 'pl_tranmiderr2',
      'st_pmralim', 'st_pmdeclim', 'st_tmaglim', 'st_distlim', 'st_tefflim',
      'st_logglim', 'st_radlim', 'pl_orbperlim', 'pl_radelim', 'pl_trandeplim',
      'pl_trandurhlim', 'pl_eqtlim', 'pl_insollim', 'pl_tranmidlim',
      'toi_created', 'rowupdate'
    ],
    kepler: [
      'kepid', 'kepoi_name', 'kepler_name', 'koi_sma', 'koi_incl', 'koi_time0bk',
      'koi_period_err1', 'koi_period_err2', 'koi_time0bk_err1', 'koi_time0bk_err2',
      'koi_impact_err1', 'koi_impact_err2',
      'koi_duration_err1', 'koi_duration_err2', 'koi_depth_err1', 'koi_depth_err2',
      'koi_prad_err1', 'koi_prad_err2', 'koi_teq_err1', 'koi_teq_err2',
      'koi_insol_err1', 'koi_insol_err2', 'koi_steff_err1', 'koi_steff_err2',
      'koi_slogg_err1', 'koi_slogg_err2', 'koi_srad_err1', 'koi_srad_err2',
      'koi_tce_delivname'
    ]
  };

  const columnDisplayNames: { [key: string]: string } = {
    'ra': 'Right Ascension', 'dec': 'Declination', 'toi': 'TESS Object of Interest',
    'tid': 'TESS Input Catalog ID', 'tfopwg_disp': 'TFOPWG Disposition',
    'st_teff': 'Stellar Effective Temperature', 'st_logg': 'Stellar Surface Gravity',
    'st_rad': 'Stellar Radius', 'st_dist': 'Distance to Star',
    'st_pmra': 'Stellar Proper Motion (RA)', 'st_pmdec': 'Stellar Proper Motion (Dec)',
    'st_tmag': 'TESS Magnitude', 'pl_orbper': 'Orbital Period',
    'pl_rade': 'Planet Radius', 'pl_trandep': 'Transit Depth',
    'pl_trandurh': 'Transit Duration', 'pl_eqt': 'Equilibrium Temperature',
    'pl_insol': 'Insolation Flux', 'pl_tranmid': 'Transit Midpoint',
    'koi_disposition': 'KOI Disposition', 'koi_pdisposition': 'KOI Pipeline Disposition',
    'koi_score': 'KOI Score', 'koi_period': 'Orbital Period',
    'koi_impact': 'Impact Parameter', 'koi_duration': 'Transit Duration',
    'koi_depth': 'Transit Depth', 'koi_prad': 'Planetary Radius',
    'koi_teq': 'Equilibrium Temperature', 'koi_insol': 'Insolation Flux',
    'koi_steff': 'Stellar Effective Temperature', 'koi_slogg': 'Stellar Surface Gravity',
    'koi_srad': 'Stellar Radius', 'koi_kepmag': 'Kepler Magnitude'
  };

  const columnDescriptions: { [key: string]: string } = {
    // TESS Required Columns
    'ra': 'Sky coordinate (right ascension) in degrees for celestial positioning',
    'dec': 'Sky coordinate (declination) in degrees for celestial positioning',
    'st_teff': 'Temperature of the star in Kelvin (K)',
    'st_logg': 'Surface gravity of the star (log base 10 of cm/s²)',
    'st_rad': 'Radius of the star in solar radii',
    'st_dist': 'Distance from Earth to the star in parsecs',
    'st_pmra': 'Star\'s proper motion in RA direction (mas/year)',
    'st_pmdec': 'Star\'s proper motion in Dec direction (mas/year)',
    'st_tmag': 'TESS photometric magnitude of the host star',
    'pl_orbper': 'Time for the planet to complete one orbit (days)',
    'pl_rade': 'Radius of the planet in Earth radii',
    'pl_trandep': 'Depth of the transit (percentage decrease in brightness)',
    'pl_trandurh': 'Duration of the planetary transit in hours',
    'pl_eqt': 'Equilibrium temperature of the planet (K)',
    'pl_insol': 'Insolation flux received by the planet (Earth flux)',
    'pl_tranmid': 'Time of transit center (BJD - 2457000)',
    
    // Kepler Required Columns
    'koi_disposition': 'Archive disposition (CONFIRMED, FALSE POSITIVE, CANDIDATE)',
    'koi_pdisposition': 'Pipeline-determined disposition',
    'koi_score': 'Disposition score (0-1, higher = more likely planet)',
    'koi_fpflag_nt': 'Not transit-like false positive flag',
    'koi_fpflag_ss': 'Stellar eclipse false positive flag',
    'koi_fpflag_co': 'Centroid offset false positive flag',
    'koi_fpflag_ec': 'Ephemeris match false positive flag',
    'koi_period': 'Orbital period of the planet candidate (days)',
    'koi_impact': 'Sky-projected distance between planet and star',
    'koi_duration': 'Transit duration from first to last contact (hours)',
    'koi_depth': 'Transit depth in parts per million',
    'koi_prad': 'Planetary radius in Earth radii',
    'koi_teq': 'Equilibrium temperature of planet (K)',
    'koi_insol': 'Insolation flux (Earth flux)',
    'koi_model_snr': 'Signal-to-noise ratio of the transit',
    'koi_tce_plnt_num': 'Planet number in multi-planet system',
    'koi_steff': 'Stellar effective temperature (K)',
    'koi_slogg': 'Stellar surface gravity (log g)',
    'koi_srad': 'Stellar radius (solar radii)',
    'koi_kepmag': 'Kepler-band magnitude of the host star',
    
    // Optional TESS Columns
    'toi': 'TESS Object of Interest identifier',
    'tid': 'TESS Input Catalog identifier',
    'tfopwg_disp': 'TESS Follow-up Observing Program disposition',
    'rastr': 'Right Ascension in sexagesimal format',
    'decstr': 'Declination in sexagesimal format',
    'st_pmraerr1': 'Upper uncertainty in RA proper motion',
    'st_pmraerr2': 'Lower uncertainty in RA proper motion',
    'st_pmdecerr1': 'Upper uncertainty in Dec proper motion',
    'st_pmdecerr2': 'Lower uncertainty in Dec proper motion',
    'st_tmagerr1': 'Upper uncertainty in TESS magnitude',
    'st_tmagerr2': 'Lower uncertainty in TESS magnitude',
    'st_disterr1': 'Upper uncertainty in stellar distance',
    'st_disterr2': 'Lower uncertainty in stellar distance',
    'st_tefferr1': 'Upper uncertainty in stellar temperature',
    'st_tefferr2': 'Lower uncertainty in stellar temperature',
    'st_loggerr1': 'Upper uncertainty in surface gravity',
    'st_loggerr2': 'Lower uncertainty in surface gravity',
    'st_raderr1': 'Upper uncertainty in stellar radius',
    'st_raderr2': 'Lower uncertainty in stellar radius',
    'pl_orbpererr1': 'Upper uncertainty in orbital period',
    'pl_orbpererr2': 'Lower uncertainty in orbital period',
    'pl_radeerr1': 'Upper uncertainty in planet radius',
    'pl_radeerr2': 'Lower uncertainty in planet radius',
    'pl_trandeperr1': 'Upper uncertainty in transit depth',
    'pl_trandeperr2': 'Lower uncertainty in transit depth',
    'pl_trandurherr1': 'Upper uncertainty in transit duration',
    'pl_trandurherr2': 'Lower uncertainty in transit duration',
    'pl_eqterr1': 'Upper uncertainty in equilibrium temperature',
    'pl_eqterr2': 'Lower uncertainty in equilibrium temperature',
    'pl_insolerr1': 'Upper uncertainty in insolation flux',
    'pl_insolerr2': 'Lower uncertainty in insolation flux',
    'pl_tranmiderr1': 'Upper uncertainty in transit midpoint',
    'pl_tranmiderr2': 'Lower uncertainty in transit midpoint',
    'toi_created': 'Date when TOI was created',
    'rowupdate': 'Last update date of the record',
    
    // Optional Kepler Columns
    'kepid': 'Kepler Input Catalog identifier',
    'kepoi_name': 'KOI name in standard format',
    'kepler_name': 'Kepler planet name if confirmed',
    'koi_sma': 'Semi-major axis of orbit (AU)',
    'koi_incl': 'Orbital inclination (degrees)',
    'koi_time0bk': 'Transit epoch (BJD - 2454833)',
    'koi_period_err1': 'Upper uncertainty in orbital period',
    'koi_period_err2': 'Lower uncertainty in orbital period',
    'koi_time0bk_err1': 'Upper uncertainty in transit epoch',
    'koi_time0bk_err2': 'Lower uncertainty in transit epoch',
    'koi_impact_err1': 'Upper uncertainty in impact parameter',
    'koi_impact_err2': 'Lower uncertainty in impact parameter',
    'koi_duration_err1': 'Upper uncertainty in transit duration',
    'koi_duration_err2': 'Lower uncertainty in transit duration',
    'koi_depth_err1': 'Upper uncertainty in transit depth',
    'koi_depth_err2': 'Lower uncertainty in transit depth',
    'koi_prad_err1': 'Upper uncertainty in planetary radius',
    'koi_prad_err2': 'Lower uncertainty in planetary radius',
    'koi_teq_err1': 'Upper uncertainty in equilibrium temp',
    'koi_teq_err2': 'Lower uncertainty in equilibrium temp',
    'koi_insol_err1': 'Upper uncertainty in insolation flux',
    'koi_insol_err2': 'Lower uncertainty in insolation flux',
    'koi_steff_err1': 'Upper uncertainty in stellar temperature',
    'koi_steff_err2': 'Lower uncertainty in stellar temperature',
    'koi_slogg_err1': 'Upper uncertainty in stellar gravity',
    'koi_slogg_err2': 'Lower uncertainty in stellar gravity',
    'koi_srad_err1': 'Upper uncertainty in stellar radius',
    'koi_srad_err2': 'Lower uncertainty in stellar radius',
    'koi_tce_delivname': 'TCE delivery name from pipeline'
  };

  // Model Metrics (dummy data - would come from state in production)
  const modelMetrics: ModelMetric[] = [
    { name: "Accuracy", value: 94.2, description: "Overall correctness of model predictions" },
    { name: "Precision", value: 92.8, description: "Ratio of correct positive predictions to total positive predictions" },
    { name: "Recall", value: 91.5, description: "Ratio of correct positive predictions to all actual positives" },
    { name: "F1 Score", value: 92.1, description: "Harmonic mean of precision and recall" }
  ];

  const modelMetricsWithIcons = [
    { name: "Accuracy", value: 94.2, icon: "fa-bullseye", color: "from-blue-500 to-cyan-500" },
    { name: "Precision", value: 92.8, icon: "fa-crosshairs", color: "from-purple-500 to-pink-500" },
    { name: "Recall", value: 91.5, icon: "fa-chart-line", color: "from-green-500 to-emerald-500" },
    { name: "F1 Score", value: 92.1, icon: "fa-star", color: "from-orange-500 to-red-500" }
  ];

  // Model Change Handler
  const handleModelChange = (model: MLModel) => {
    const hadUploadedFile = uploadedFile !== null;
    
    setSelectedModel(model);
    // Clear uploaded file and errors when switching models
    setUploadedFile(null);
    setFileError(null);
    setValidationErrors([]);
    setFileInfoMessage(null);
    
    // Show info message if there was a file uploaded
    if (hadUploadedFile) {
      setFileInfoMessage(`Switched to ${model.toUpperCase()} model. Please re-upload your file for validation with the new model's requirements.`);
      // Clear the info message after 5 seconds
      setTimeout(() => {
        setFileInfoMessage(null);
      }, 5000);
    }
  };

  const handleHyperparamChange = (param: string, value: number | string) => {
    setHyperparameters(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleSaveHyperparameters = () => {
    setFileInfoMessage('✓ Hyperparameters saved successfully!');
    setShowHyperparamsModal(false);
    setTimeout(() => setFileInfoMessage(null), 3000);
  };

  // File Validation Function
  const validateAndProcessFile = (file: File) => {
    setFileError(null);
    setFileInfoMessage(null);
    setValidationErrors([]);

    // Validate file size (50MB for ML processing)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError(`File size (${(file.size / 1024 / 1024).toFixed(2)} MB) exceeds 50MB limit`);
      setUploadedFile(null);
      return;
    }

    // Validate file type
    const validExtensions = ['.csv', '.txt', '.xlsx'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
      setFileError('Invalid file type. Please upload CSV, TXT, or XLSX file.');
      setUploadedFile(null);
      return;
    }

    // For CSV/TXT: Do lightweight validation but don't block upload
    if (file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.txt')) {
      // Set uploaded file first
      setUploadedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;

          // Filter out empty lines and comments
          const allLines = text.split('\n');
          const lines = allLines.filter(line => {
            const trimmed = line.trim();
            return trimmed !== '' && !trimmed.startsWith('#');
          });

          if (lines.length === 0) {
            setFileError('File is empty or contains only comments');
            setUploadedFile(null);
            return;
          }

          if (lines.length < 2) {
            setFileError('File must contain at least a header row and one data row');
            setUploadedFile(null);
            return;
          }

          // Parse headers
          const headers = lines[0].split(',').map(h => h.trim());
          const requiredCols = modelColumns[selectedModel];

          // Check for missing required columns - but show as INFO, not error
          const missingCols = requiredCols.filter(col => !headers.includes(col));
          
          if (missingCols.length > 0) {
            // Show informational message instead of blocking
            setFileInfoMessage(
              `ℹ️ Note: This file may not match the ${selectedModel.toUpperCase()} model columns. ` +
              `The backend will auto-detect the dataset type (Kepler or TESS) when you run the analysis. ` +
              `If columns don't match either dataset, you'll get an error during processing.`
            );
          } else {
            // File looks good!
            setFileInfoMessage(`✓ File validated successfully! Found ${lines.length - 1} data rows with correct ${selectedModel.toUpperCase()} columns.`);
          }

          // No validation errors - let backend handle detailed validation
          setValidationErrors([]);

        } catch (error) {
          setFileError(`Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setUploadedFile(null);
        }
      };
      reader.onerror = () => {
        setFileError('Failed to read file');
        setUploadedFile(null);
      };
      reader.readAsText(file);
    } else {
      // For XLSX files, set immediately with warning about validation
      setUploadedFile(file);
      setFileInfoMessage('⚠️ XLSX file uploaded. Please ensure it contains all required columns for the selected model before running analysis.');
      // Note: We can't validate XLSX client-side easily, so we add a validation check in handleAnalyze
    }
  };

  // Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcessFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndProcessFile(file);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile && inputMode === 'file') return;

    // Additional check for XLSX files
    if (uploadedFile?.name.toLowerCase().endsWith('.xlsx')) {
      const confirmRun = window.confirm(
        'Warning: XLSX file validation happens server-side. Please confirm that your file contains all required columns for the ' +
        selectedModel.toUpperCase() + ' model before proceeding.'
      );
      if (!confirmRun) return;
    }

    setIsAnalyzing(true);
    setFileError(null);
    
    try {
      // Call the real API
      const results = await apiService.uploadAndPredict(uploadedFile!);
      
      // Store results and show modal
      setPredictionResults(results);
      setShowResults(true);
      
      // Set a simple success message in the analysis result
      setAnalysisResult({
        confidence: 1,
        type: `${results.dataset_type.toUpperCase()}: ${results.total_predictions} predictions`,
        confirmed: true
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Extract error message from API response
      const errorMessage = error?.data?.detail || error?.message || 'Analysis failed. Please try again.';
      
      setAnalysisResult({
        confidence: 0,
        confirmed: null,
        error: errorMessage
      });
      
      setFileError(`Upload failed: ${errorMessage}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addManualRow = () => {
    setManualData([...manualData, {}]);
  };

  const removeManualRow = (index: number) => {
    setManualData(manualData.filter((_, i) => i !== index));
  };

  const updateManualData = (index: number, field: string, value: string) => {
    const updated = [...manualData];
    updated[index][field] = value;
    setManualData(updated);
  };

  const exportManualDataToCSV = () => {
    const columns = [...modelColumns[selectedModel], ...(showOptionalFieldsInManual ? optionalColumns[selectedModel] : [])];
    const header = columns.join(',');
    const rows = manualData.map(row =>
      columns.map(col => {
        const val = row[col]?.toString() || '';
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    );

    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedModel}_model_manual_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileError(null);
    setValidationErrors([]);
    setFileInfoMessage(null);
    const fileInput = document.getElementById('ml-file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Enhanced drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging && e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  };

  // Validate manual data before submission
  const validateManualData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const requiredCols = modelColumns[selectedModel];

    if (manualData.length === 0 || (manualData.length === 1 && Object.keys(manualData[0]).length === 0)) {
      errors.push('No data entered. Please fill at least one row.');
      return { isValid: false, errors };
    }

    manualData.forEach((row, idx) => {
      const missingCols = requiredCols.filter(col => !row[col] || row[col].toString().trim() === '');
      if (missingCols.length > 0) {
        errors.push(`Row ${idx + 1}: Missing values for ${missingCols.length} required column(s)`);
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Model Metrics Overview */}
      <DashboardSection
        variant="cosmic"
        title="Model Performance"
        subtitle="Current ML model accuracy metrics"
        icon={<i className="fas fa-chart-bar"></i>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {modelMetricsWithIcons.map((metric, idx) => (
            <div key={idx} className="group relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center shadow-lg`}>
                  <i className={`fas ${metric.icon} text-white text-xl`}></i>
                </div>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">{metric.name}</span>
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{metric.value}%</p>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${metric.color} rounded-full transition-all duration-1000`} style={{ width: `${metric.value}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </DashboardSection>

      {/* ML Model Selection & Prediction */}
      <DashboardSection
        variant="nebula"
        title="ML Model Prediction"
        subtitle="Select model and upload data for exoplanet classification"
        icon={<i className="fas fa-brain"></i>}
      >
        <div className="space-y-6">
          {/* Model Selection */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <label className="text-gray-700 dark:text-gray-300 font-semibold text-sm uppercase tracking-wide">
                <i className="fas fa-satellite mr-2"></i>Select Model
              </label>
              <button
                onClick={() => setShowHyperparamsModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 rounded-xl hover:from-purple-500/30 hover:via-pink-500/30 hover:to-purple-500/30 transition-all text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
              >
                <i className="fas fa-sliders-h"></i>
                Adjust Hyperparameters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'tess' as MLModel, label: 'TESS Model', desc: 'FP, PC, KP, APC, FA, CP', icon: 'fa-rocket', color: 'from-red-500 to-orange-500', count: modelColumns.tess.length },
                { id: 'kepler' as MLModel, label: 'Kepler Model', desc: 'FP, confirmed, candidate', icon: 'fa-satellite', color: 'from-blue-500 to-cyan-500', count: modelColumns.kepler.length }
              ].map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model.id)}
                  className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden ${
                    selectedModel === model.id
                      ? 'border-purple-500 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-500/5 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-purple-500/10 shadow-2xl scale-105'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 bg-white/30 dark:bg-gray-800/30 hover:scale-102'
                  }`}
                >
                  {selectedModel === model.id && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-pink-400/5 animate-pulse"></div>
                  )}
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${model.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <i className={`fas ${model.icon} text-white text-2xl`}></i>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-base mb-1">{model.label}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{model.desc}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full font-medium">
                        {model.count} features
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Required Columns Display */}
            <RequiredColumns
              columns={modelColumns[selectedModel]}
              modelName={selectedModel.toUpperCase()}
              optionalColumns={optionalColumns[selectedModel]}
              columnDescriptions={columnDescriptions}
            />
          </div>

          {/* Input Mode Tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                {[
                  { mode: 'file' as InputMode, icon: 'fa-file-upload', label: 'File Upload' },
                  { mode: 'manual' as InputMode, icon: 'fa-keyboard', label: 'Manual Input' }
                ].map((tab) => (
                  <button
                    key={tab.mode}
                    onClick={() => setInputMode(tab.mode)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all text-sm md:text-base ${
                      inputMode === tab.mode
                        ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 text-white shadow-lg scale-105'
                        : 'bg-transparent text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <i className={`fas ${tab.icon} mr-2`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* File Upload Interface */}
              {inputMode === 'file' && (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 ${
                      isDragging
                        ? 'border-purple-500 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-blue-900/40 scale-105 shadow-2xl'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30'
                    }`}
                  >
                    {uploadedFile ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <i className="fas fa-file-csv text-white text-2xl md:text-3xl"></i>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-white text-lg mb-1">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                        <button
                          onClick={() => { setUploadedFile(null); setFileInfoMessage(null); }}
                          className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
                        >
                          <i className="fas fa-times mr-2"></i>Remove File
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce">
                          <i className="fas fa-cloud-upload-alt text-white text-2xl md:text-3xl"></i>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2 text-base md:text-lg">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          Supported formats: CSV, TXT, XLSX (max 5MB)
                        </p>
                        <input
                          type="file"
                          accept=".csv,.txt,.xlsx"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload-cosmic"
                        />
                        <label
                          htmlFor="file-upload-cosmic"
                          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-xl cursor-pointer transition-all hover:scale-105"
                        >
                          <i className="fas fa-folder-open mr-2"></i>
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>

                  {/* File Messages */}
                  {fileError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
                      <p className="text-red-700 dark:text-red-400 text-sm font-medium">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        {fileError}
                      </p>
                    </div>
                  )}

                  {fileInfoMessage && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg">
                      <p className="text-blue-700 dark:text-blue-400 text-sm font-medium">
                        <i className="fas fa-info-circle mr-2"></i>
                        {fileInfoMessage}
                      </p>
                    </div>
                  )}

                  {/* Validation Errors - Enhanced */}
                  {validationErrors.length > 0 && (
                    <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-500 rounded-xl shadow-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-exclamation-triangle text-white text-lg"></i>
                        </div>
                        <div>
                          <p className="text-red-800 dark:text-red-300 text-base font-bold mb-1">
                            File Validation Failed
                          </p>
                          <p className="text-red-700 dark:text-red-400 text-sm">
                            Your file has {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''} that must be fixed before running the ML model.
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                        <ul className="space-y-2">
                          {validationErrors.map((error, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-red-700 dark:text-red-400 text-sm">
                              <i className="fas fa-times-circle mt-0.5 flex-shrink-0"></i>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-300 dark:border-blue-700">
                        <p className="text-blue-800 dark:text-blue-300 text-xs font-medium">
                          <i className="fas fa-info-circle mr-1"></i>
                          <strong>How to fix:</strong> Ensure your CSV file includes all required columns listed above and that the column names match exactly (case-sensitive).
                        </p>
                      </div>
                    </div>
                  )}

                  {/* File Validation Status */}
                  {uploadedFile && !fileError && (
                    <div className={`p-4 rounded-xl border-2 ${
                      validationErrors.length === 0
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          validationErrors.length === 0
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}>
                          <i className={`fas ${
                            validationErrors.length === 0
                              ? 'fa-check-circle'
                              : 'fa-exclamation-triangle'
                          } text-white text-xl`}></i>
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-base ${
                            validationErrors.length === 0
                              ? 'text-green-800 dark:text-green-300'
                              : 'text-red-800 dark:text-red-300'
                          }`}>
                            {validationErrors.length === 0
                              ? 'File Validated Successfully'
                              : 'File Validation Failed'}
                          </h4>
                          <p className={`text-sm ${
                            validationErrors.length === 0
                              ? 'text-green-700 dark:text-green-400'
                              : 'text-red-700 dark:text-red-400'
                          }`}>
                            {validationErrors.length === 0
                              ? 'All required columns are present and correctly formatted'
                              : `Found ${validationErrors.length} validation error${validationErrors.length > 1 ? 's' : ''} - please fix before running ML model`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Analyze Button - Only enabled when validation passes */}
                  {uploadedFile && !fileError && (
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || validationErrors.length > 0}
                      className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                        validationErrors.length > 0
                          ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-105'
                      } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={validationErrors.length > 0 ? 'Fix validation errors before running ML analysis' : 'Run ML analysis on uploaded file'}
                    >
                      {isAnalyzing ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Analyzing Data...
                        </>
                      ) : validationErrors.length > 0 ? (
                        <>
                          <i className="fas fa-ban"></i>
                          Cannot Run - Fix Validation Errors First
                        </>
                      ) : (
                        <>
                          <i className="fas fa-rocket"></i>
                          Run ML Analysis
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Manual Input Interface */}
              {inputMode === 'manual' && (
                <div className="text-center p-8 md:p-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <i className="fas fa-keyboard text-white text-2xl md:text-3xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Manual Data Entry</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Enter exoplanet features manually in a structured table format
                  </p>
                  <button
                    onClick={() => setShowManualInputModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
                  >
                    <i className="fas fa-table mr-2"></i>
                    Open Manual Input Table
                  </button>
                </div>
              )}
        </div>
      </DashboardSection>

      {/* Analysis Results */}
      {analysisResult && (
        <DashboardSection
          variant="galaxy"
          title="Analysis Results"
          subtitle="ML model predictions and confidence scores"
          icon={<i className="fas fa-chart-pie"></i>}
        >
          {analysisResult.error ? (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl">
              <p className="text-red-700 dark:text-red-400 font-medium">
                <i className="fas fa-times-circle mr-2"></i>
                {analysisResult.error}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="fas fa-percentage text-white text-xl"></i>
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-white text-lg">Confidence Score</h3>
                </div>
                <p className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {(analysisResult.confidence * 100).toFixed(1)}%
                </p>
                <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1000"
                       style={{ width: `${analysisResult.confidence * 100}%` }}></div>
                </div>
              </div>

              {analysisResult.type && (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <i className="fas fa-tag text-white text-xl"></i>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">Classification</h3>
                  </div>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {analysisResult.type}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on {selectedModel.toUpperCase()} model analysis
                  </p>
                </div>
              )}

              {analysisResult.confirmed === null && (
                <div className="md:col-span-2">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg mb-4">
                    <p className="text-yellow-700 dark:text-yellow-400 text-sm">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Please confirm or reject this prediction
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAnalysisResult({ ...analysisResult, confirmed: true, confidence: 1.0 })}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
                    >
                      <i className="fas fa-check mr-2"></i>Confirm
                    </button>
                    <button
                      onClick={() => setAnalysisResult({ ...analysisResult, confirmed: false, confidence: 0 })}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105"
                    >
                      <i className="fas fa-times mr-2"></i>Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DashboardSection>
      )}

      {/* Recent Discoveries and Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Discoveries */}
        <div className="md:col-span-2">
          <DashboardSection
            variant="cosmic"
            title="Recent Discoveries"
            subtitle="Latest exoplanet candidates identified by ML models"
            icon={<i className="fas fa-telescope"></i>}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Object</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Confidence</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { id: 'KIC 8462852', type: 'Super-Earth', confidence: 89, date: 'Today', color: 'from-green-500 to-emerald-600' },
                    { id: 'TIC 260128333', type: 'Hot Neptune', confidence: 78, date: 'Yesterday', color: 'from-yellow-500 to-orange-600' },
                    { id: 'EPIC 249631677', type: 'Mini Neptune', confidence: 92, date: '2 days ago', color: 'from-green-500 to-emerald-600' }
                  ].map((discovery, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-4 text-sm font-medium text-gray-800 dark:text-white">{discovery.id}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{discovery.type}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[100px]">
                            <div className={`h-full bg-gradient-to-r ${discovery.color} rounded-full`} style={{ width: `${discovery.confidence}%` }}></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{discovery.confidence}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">{discovery.date}</td>
                      <td className="px-4 py-4 text-right">
                        <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium">
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardSection>
        </div>

        {/* Recent Activity */}
        <div className="md:col-span-1">
          <RecentActivity ref={recentActivityRef} />
        </div>
      </div>

      {/* Hyperparameters Modal */}
      <Modal isOpen={showHyperparamsModal} onClose={() => setShowHyperparamsModal(false)}>
        <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-4 sm:p-8 sm:pb-6">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white">
                  Adjust Hyperparameters
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedModel === 'tess' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {selectedModel.toUpperCase()} Model
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Fine-tune the {selectedModel} model by adjusting these parameters to optimize performance for your specific data.
              </p>

              {/* Model Performance Summary */}
              <div className="mt-5 grid grid-cols-2 gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                {modelMetrics.map((metric, index) => (
                  <div key={index} className="text-center p-2 bg-white dark:bg-gray-800/50 rounded-md">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{metric.name}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{metric.value}%</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-6">
                <HyperparamSlider
                  id="learningRate"
                  label="Learning Rate"
                  value={hyperparameters.learningRate}
                  min="0.0001"
                  max="0.01"
                  step="0.0001"
                  onChange={(value) => handleHyperparamChange('learningRate', value)}
                  isFloat={true}
                />

                <HyperparamSlider
                  id="epochs"
                  label="Epochs"
                  value={hyperparameters.epochs}
                  min="10"
                  max="200"
                  step="10"
                  onChange={(value) => handleHyperparamChange('epochs', value)}
                />

                <HyperparamSlider
                  id="batchSize"
                  label="Batch Size"
                  value={hyperparameters.batchSize}
                  min="8"
                  max="128"
                  step="8"
                  onChange={(value) => handleHyperparamChange('batchSize', value)}
                />

                <HyperparamSlider
                  id="dropout"
                  label="Dropout Rate"
                  value={hyperparameters.dropout}
                  min="0"
                  max="0.5"
                  step="0.05"
                  onChange={(value) => handleHyperparamChange('dropout', value)}
                  isFloat={true}
                />

                {/* Optimizer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                  <label htmlFor="optimizer" className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                    Optimizer Algorithm
                  </label>
                  <select
                    id="optimizer"
                    value={hyperparameters.optimizer}
                    onChange={(e) => handleHyperparamChange('optimizer', e.target.value)}
                    className="block w-full rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2.5 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                  >
                    <option value="adam">Adam (Adaptive Moment Estimation)</option>
                    <option value="sgd">SGD (Stochastic Gradient Descent)</option>
                    <option value="rmsprop">RMSprop (Root Mean Square Propagation)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse gap-3 border-t border-gray-200 dark:border-gray-600">
          <button 
            type="button"
            onClick={handleSaveHyperparameters}
            className="w-full inline-flex justify-center items-center gap-2 rounded-lg border border-transparent shadow-md px-6 py-3 bg-purple-600 text-base font-semibold text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:w-auto transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Changes
          </button>
          <button 
            type="button"
            onClick={() => setShowHyperparamsModal(false)}
            className="mt-3 w-full inline-flex justify-center items-center gap-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm px-6 py-3 bg-white dark:bg-gray-600 text-base font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:w-auto transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        </div>
      </Modal>

      {/* Manual Input Modal */}
      <Modal isOpen={showManualInputModal} onClose={() => { setShowManualInputModal(false); setIsManualInputFullscreen(false); }} maxWidth="6xl" flexLayout fullscreen={isManualInputFullscreen}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <i className="fas fa-table"></i>
              Manual Data Entry
            </h3>
            <p className="text-indigo-100 text-sm mt-1">Enter values for {selectedModel.toUpperCase()} model features</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsManualInputFullscreen(!isManualInputFullscreen)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
              title={isManualInputFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <i className={`fas ${isManualInputFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
              {isManualInputFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>
        </div>

        <div className="p-6 overflow-auto flex-1">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setShowOptionalFieldsInManual(!showOptionalFieldsInManual)}
              className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
            >
              <i className="fas fa-eye mr-2"></i>
              {showOptionalFieldsInManual ? 'Hide' : 'Show'} Optional Fields ({optionalColumns[selectedModel].length})
            </button>
            <div className="flex gap-2">
              <button onClick={addManualRow} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium">
                <i className="fas fa-plus mr-2"></i>Add Row
              </button>
              <button onClick={exportManualDataToCSV} className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm font-medium">
                <i className="fas fa-download mr-2"></i>Export CSV
              </button>
            </div>
          </div>

          <div className={`overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg ${isManualInputFullscreen ? 'max-h-[calc(100vh-300px)]' : 'max-h-96'}`}>
            <table className="min-w-full">
              <thead className="sticky top-0 bg-gray-100 dark:bg-gray-700 z-10">
                <tr>
                  <th className="sticky left-0 bg-gray-100 dark:bg-gray-700 px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">#</th>
                  {modelColumns[selectedModel].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 min-w-[150px]">
                      {columnDisplayNames[col] || col}
                      <span className="text-red-500 ml-1">*</span>
                    </th>
                  ))}
                  {showOptionalFieldsInManual && optionalColumns[selectedModel].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 min-w-[150px]">
                      {columnDisplayNames[col] || col}
                    </th>
                  ))}
                  <th className="sticky right-0 bg-gray-100 dark:bg-gray-700 px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {manualData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="sticky left-0 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">{index + 1}</td>
                    {modelColumns[selectedModel].map((col) => (
                      <td key={col} className="px-4 py-2">
                        <input
                          type="text"
                          value={row[col] || ''}
                          onChange={(e) => updateManualData(index, col, e.target.value)}
                          className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded text-sm"
                          placeholder={columnDisplayNames[col] || col}
                        />
                      </td>
                    ))}
                    {showOptionalFieldsInManual && optionalColumns[selectedModel].map((col) => (
                      <td key={col} className="px-4 py-2">
                        <input
                          type="text"
                          value={row[col] || ''}
                          onChange={(e) => updateManualData(index, col, e.target.value)}
                          className="w-full px-2 py-1 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded text-sm"
                          placeholder={columnDisplayNames[col] || col}
                        />
                      </td>
                    ))}
                    <td className="sticky right-0 bg-white dark:bg-gray-800 px-4 py-2 text-right">
                      {manualData.length > 1 && (
                        <button
                          onClick={() => removeManualRow(index)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={() => { setManualData([{}]); setShowManualInputModal(false); setIsManualInputFullscreen(false); }}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            Clear & Close
          </button>
          <button
            onClick={() => { setShowManualInputModal(false); setIsManualInputFullscreen(false); }}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:shadow-xl transition-all font-medium"
          >
            Done
          </button>
        </div>
      </Modal>

      {/* Prediction Results Modal */}
      {showResults && predictionResults && (
        <PredictionResults
          results={predictionResults}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
