import React, { useState, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { UploadResponse } from '../services/api';
import { exoplanetService } from '../services/exoplanetService';
import { PageContext } from './DashboardLayoutComponent';
import { ThemeContext } from './ThemeContext';
import { useExoplanet } from '../contexts/ExoplanetContext';
import AIChatbot from './AIChatbot';

interface PredictionResultsProps {
  results: UploadResponse;
  onClose: () => void;
  uploadedFile?: File | null;
  fileData?: string | null;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({ results, onClose, uploadedFile, fileData }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showConfidence, setShowConfidence] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const itemsPerPage = 10;
  const { setActivePage } = useContext(PageContext);
  const { darkMode } = useContext(ThemeContext);
  const { setSelectedExoplanets } = useExoplanet();

  useEffect(() => {
    setMounted(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const totalPages = Math.ceil(results.predictions.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPredictions = results.predictions.slice(startIndex, endIndex);

  // Calculate class distribution
  const classDistribution = results.predictions.reduce((acc, pred) => {
    acc[pred.predicted_class] = (acc[pred.predicted_class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average confidence per class
  const avgConfidence = results.predictions.reduce((acc, pred) => {
    const conf = pred.confidence[pred.predicted_class];
    if (!acc[pred.predicted_class]) {
      acc[pred.predicted_class] = { sum: 0, count: 0 };
    }
    acc[pred.predicted_class].sum += conf;
    acc[pred.predicted_class].count += 1;
    return acc;
  }, {} as Record<string, { sum: number; count: number }>);

  const downloadCSV = () => {
    // Create CSV header
    const header = ['Row Index', 'Predicted Class', ...Object.keys(results.predictions[0].confidence)];
    
    // Create CSV rows
    const csvRows = results.predictions.map((pred) => {
      const confidenceValues = Object.keys(pred.confidence)
        .map(className => pred.confidence[className].toFixed(4));
      return [pred.row_index, pred.predicted_class, ...confidenceValues].join(',');
    });

    // Combine header and rows
    const csvContent = [header.join(','), ...csvRows].join('\n');
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions_${results.job_id}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    const jsonContent = JSON.stringify(results, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions_${results.job_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExoplanetTable = async () => {
    try {
      setLoadingAction('download-table');
      
      // Get CSV text - either from file or from saved data
      let csvText: string | null = null;
      
      if (uploadedFile) {
        csvText = await uploadedFile.text();
      } else if (fileData) {
        csvText = fileData;
      }
      
      if (!csvText) {
        alert('No exoplanet data available to download.');
        return;
      }

      // Parse CSV and add predictions
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        alert('Invalid data format.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      
      // Create enhanced CSV with predictions
      const enhancedHeaders = [...headers, 'Predicted_Class', 'Confidence_Score', 'Prediction_Certainty'];
      const enhancedRows = [];

      for (let i = 1; i < lines.length; i++) {
        const rowIndex = i - 1; // 0-based index for predictions
        const prediction = results.predictions.find(p => p.row_index === rowIndex);
        
        if (prediction) {
          const values = lines[i].split(',').map(v => v.trim());
          const predictedClass = prediction.predicted_class;
          const confidence = (prediction.confidence[predictedClass] * 100).toFixed(2);
          
          // Calculate certainty (difference between top 2 confidences)
          const confidences = Object.values(prediction.confidence).sort((a, b) => b - a);
          const certainty = confidences.length > 1 
            ? ((confidences[0] - confidences[1]) * 100).toFixed(2)
            : '100.00';
          
          enhancedRows.push([...values, predictedClass, `${confidence}%`, `${certainty}%`].join(','));
        } else {
          enhancedRows.push(lines[i]); // Keep original if no prediction
        }
      }

      const enhancedCSV = [enhancedHeaders.join(','), ...enhancedRows].join('\n');
      
      // Download
      const blob = new Blob([enhancedCSV], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exoplanet_analysis_${results.dataset_type}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading exoplanet table:', error);
      alert('Failed to download exoplanet table. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const downloadScreenshot = () => {
    setLoadingAction('screenshot');
    
    // Use html2canvas to capture the entire modal
    import('html2canvas').then(({ default: html2canvas }) => {
      const element = document.querySelector('.prediction-results-container') as HTMLElement;
      if (!element) {
        alert('Unable to capture screenshot.');
        setLoadingAction(null);
        return;
      }

      html2canvas(element, {
        backgroundColor: darkMode ? '#111827' : '#ffffff',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      }).then(canvas => {
        canvas.toBlob(blob => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `exoplanet_predictions_${results.job_id}_${new Date().toISOString().split('T')[0]}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
          setLoadingAction(null);
        });
      }).catch(error => {
        console.error('Screenshot error:', error);
        alert('Failed to capture screenshot.');
        setLoadingAction(null);
      });
    }).catch(error => {
      console.error('Failed to load html2canvas:', error);
      alert('Screenshot feature unavailable. Please try again.');
      setLoadingAction(null);
    });
  };

  const viewAll3D = async () => {
    try {
      setLoadingAction('3d-all');
      
      // Get CSV text - either from file or from saved data
      let csvText: string | null = null;
      
      if (uploadedFile) {
        csvText = await uploadedFile.text();
      } else if (fileData) {
        csvText = fileData;
      }
      
      // Parse CSV to get exoplanet data
      if (csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim());
          const exoplanets = [];
          const datasetType = results.dataset_type as 'kepler' | 'tess';
          
          // Field mapping for different naming conventions
          // Maps CSV headers to expected field names in the 3D component
          const fieldMap: Record<string, string[]> = {
            // Kepler mappings - CSV name -> [primary name, ...aliases]
            'kepoi_name': ['kepler_name', 'kepoi_name'],
            'kepid': ['kepid'],
            'koi_period': ['koi_period'],
            'koi_prad': ['koi_prad'],
            'koi_teq': ['koi_teq'],
            'koi_insol': ['koi_insol'],
            'koi_sma': ['koi_sma'],
            'koi_depth': ['koi_depth'],
            'koi_duration': ['koi_duration'],
            'koi_steff': ['koi_steff'],
            'koi_srad': ['koi_srad'],
            'koi_disposition': ['koi_disposition'],
            
            // TESS mappings
            'tic_id': ['tid', 'tic_id'],
            'toi_id': ['toi', 'toi_id'],
            'pl_name': ['pl_name'],
            'pl_rade': ['pl_rade'],
            'pl_orbper': ['pl_orbper'],
            'pl_eqt': ['pl_eqt'],
            'pl_insol': ['pl_insol'],
            'st_rad': ['st_rad'],
            'st_teff': ['st_teff'],
            'sy_dist': ['sy_dist'],
            'st_dist': ['st_dist'],
            'pl_orbsmax': ['pl_orbsmax'],
          };
          
          // Parse each row (skip header)
          for (let i = 1; i < Math.min(lines.length, 101); i++) { // Limit to 100 exoplanets for performance
            const values = lines[i].split(',').map(v => v.trim());
            const rowData: any = {};
            
            // First pass: Store all original data with original field names
            headers.forEach((header, index) => {
              const value = values[index];
              
              // Convert numeric values
              if (value && value !== '' && !isNaN(Number(value))) {
                rowData[header] = Number(value);
              } else if (value && value !== '') {
                rowData[header] = value;
              }
            });
            
            // Second pass: Add mapped field names (aliases)
            headers.forEach((header, index) => {
              const value = values[index];
              const mappings = fieldMap[header];
              
              if (mappings) {
                mappings.forEach(mappedName => {
                  if (mappedName !== header) { // Don't duplicate if already set
                    if (value && value !== '' && !isNaN(Number(value))) {
                      rowData[mappedName] = Number(value);
                    } else if (value && value !== '') {
                      rowData[mappedName] = value;
                    }
                  }
                });
              }
            });
            
            // Generate proper ID based on dataset type
            if (datasetType === 'kepler') {
              const kepid = rowData.kepid;
              const name = rowData.kepler_name || rowData.kepoi_name;
              if (kepid) {
                rowData.id = `${kepid}-${name || 'unnamed'}`;
              } else {
                rowData.id = `kepler-${i}`;
              }
            } else {
              const tid = rowData.tid || rowData.tic_id;
              const toi = rowData.toi || rowData.toi_id;
              if (tid) {
                rowData.id = `${tid}-${toi || i}`;
              } else {
                rowData.id = `tess-${i}`;
              }
            }
            
            exoplanets.push(rowData);
          }
          
          setSelectedExoplanets(exoplanets, datasetType);
          
          console.log(`Loaded ${exoplanets.length} ${datasetType} exoplanets for 3D visualization`);
          console.log('Sample exoplanet data:', exoplanets[0]);
          console.log('All fields:', Object.keys(exoplanets[0]));
        }
      } else {
        console.warn('No file data available for 3D visualization');
        alert('Unable to load exoplanet data for 3D visualization. Please re-run the prediction.');
      }
      
      // Navigate to visualizations page - scroll to top to show 3D view first
      setActivePage('visualizations');
      
      // Small delay to ensure page loads, then scroll to top
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      
      onClose();
    } catch (error) {
      console.error('Error navigating to 3D view:', error);
      alert('Failed to navigate to 3D visualization. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };  return mounted ? createPortal(
    <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 z-50 overflow-hidden">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 dark:from-cyan-500/10 dark:via-transparent dark:to-blue-500/10 animate-pulse" />

      {/* Main content container - full page */}
      <div className="relative h-full flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 shadow-2xl">
          <div className="container mx-auto px-3 sm:px-6 md:px-8 py-4 md:py-6">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-2 md:space-y-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">Prediction Results</h2>
                  <span className="px-2 sm:px-3 md:px-4 py-1 md:py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                    {results.total_predictions} predictions
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-6 text-white/90 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="flex-shrink-0">Job ID:</span>
                    <code className="bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-md font-mono text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none" title={results.job_id}>
                      {results.job_id}
                    </code>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span className="flex-shrink-0">Dataset:</span>
                    <span className="font-semibold uppercase">{results.dataset_type}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 sm:p-3 transition-all duration-200 hover:scale-110 hover:rotate-90 backdrop-blur-sm flex-shrink-0 touch-manipulation"
                aria-label="Close"
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto prediction-results-container">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">
            
            {/* Researcher Mode: Advanced Statistics */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-700/50 p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-full" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Researcher Statistics
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {/* Total Candidates */}
                <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-purple-300 dark:border-purple-600/50">
                  <div className="text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">Total Candidates</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{results.total_predictions}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Analyzed Objects</div>
                </div>

                {/* High Confidence Count */}
                {(() => {
                  const highConfCount = results.predictions.filter(p => 
                    p.confidence[p.predicted_class] >= 0.9
                  ).length;
                  const percentage = ((highConfCount / results.total_predictions) * 100).toFixed(1);
                  return (
                    <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-green-300 dark:border-green-600/50">
                      <div className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-2">High Confidence</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">{highConfCount}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{percentage}% (≥90% confidence)</div>
                    </div>
                  );
                })()}

                {/* Average Certainty */}
                {(() => {
                  const avgCertainty = results.predictions.reduce((sum, p) => {
                    const confidences = Object.values(p.confidence).sort((a, b) => b - a);
                    const certainty = confidences.length > 1 ? (confidences[0] - confidences[1]) : 1;
                    return sum + certainty;
                  }, 0) / results.total_predictions;
                  return (
                    <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-blue-300 dark:border-blue-600/50">
                      <div className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Avg Certainty</div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">{(avgCertainty * 100).toFixed(1)}%</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Prediction Clarity</div>
                    </div>
                  );
                })()}

                {/* Unique Classes */}
                <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-cyan-300 dark:border-cyan-600/50">
                  <div className="text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">Unique Classes</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">{Object.keys(classDistribution).length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Categories Found</div>
                </div>
              </div>

              {/* Confidence Distribution Chart */}
              <div className="mt-6 bg-white/80 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-purple-300 dark:border-purple-600/50">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Confidence Score Distribution
                </h4>
                {(() => {
                  const bins = [0, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
                  const distribution = bins.slice(0, -1).map((min, i) => {
                    const max = bins[i + 1];
                    const count = results.predictions.filter(p => {
                      const conf = p.confidence[p.predicted_class];
                      return conf >= min && conf < max;
                    }).length;
                    return { range: `${(min * 100).toFixed(0)}-${(max * 100).toFixed(0)}%`, count, min, max };
                  });
                  const maxCount = Math.max(...distribution.map(d => d.count));
                  
                  return (
                    <div className="space-y-2">
                      {distribution.map((bin, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-24 text-xs font-mono text-gray-700 dark:text-gray-300">{bin.range}</div>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-900/50 rounded-full h-6 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                              style={{ width: `${(bin.count / maxCount) * 100}%` }}
                            >
                              {bin.count > 0 && (
                                <span className="text-xs font-bold text-white">{bin.count}</span>
                              )}
                            </div>
                          </div>
                          <div className="w-12 text-xs text-gray-600 dark:text-gray-400 text-right">
                            {((bin.count / results.total_predictions) * 100).toFixed(1)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Class Distribution</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
                {Object.entries(classDistribution).map(([className, count]) => {
                  const avg = avgConfidence[className];
                  const avgConf = avg ? (avg.sum / avg.count) : 0;
                  const percentage = ((count / results.total_predictions) * 100).toFixed(1);

                  return (
                    <div
                      key={className}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-gray-300 dark:border-gray-600/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
                    >
                      <div className="text-cyan-600 dark:text-cyan-400 font-bold text-[10px] sm:text-xs uppercase tracking-wider mb-2 sm:mb-3 truncate" title={className}>
                        {className}
                      </div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">{count}</div>
                      <div className="space-y-1">
                        <div className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{percentage}%</div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 dark:bg-gray-900/50 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${avgConf * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                            {(avgConf * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700/50 p-3 sm:p-4 md:p-6">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export & Visualization Tools
              </h4>
              <div className="flex flex-col gap-3">
                {/* Main action buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={viewAll3D}
                    disabled={loadingAction === '3d-all'}
                    className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 font-semibold shadow-lg hover:shadow-indigo-500/50 active:scale-95 sm:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
                  >
                    {loadingAction === '3d-all' ? (
                      <>
                        <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="whitespace-nowrap">Loading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                        <span className="whitespace-nowrap">View All in 3D</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={downloadExoplanetTable}
                    disabled={loadingAction === 'download-table'}
                    className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 font-semibold shadow-lg hover:shadow-purple-500/50 active:scale-95 sm:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
                  >
                    {loadingAction === 'download-table' ? (
                      <>
                        <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="whitespace-nowrap">Preparing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="whitespace-nowrap">Download Full Table</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={downloadScreenshot}
                    disabled={loadingAction === 'screenshot'}
                    className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 font-semibold shadow-lg hover:shadow-pink-500/50 active:scale-95 sm:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
                  >
                    {loadingAction === 'screenshot' ? (
                      <>
                        <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="whitespace-nowrap">Capturing...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="whitespace-nowrap">Screenshot</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Secondary export buttons */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={downloadCSV}
                    className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 font-semibold shadow-lg hover:shadow-green-500/50 active:scale-95 sm:hover:scale-105 text-sm sm:text-base touch-manipulation"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="whitespace-nowrap">Predictions CSV</span>
                  </button>
                  <button
                    onClick={downloadJSON}
                    className="px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 font-semibold shadow-lg hover:shadow-blue-500/50 active:scale-95 sm:hover:scale-105 text-sm sm:text-base touch-manipulation"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="whitespace-nowrap">Results JSON</span>
                  </button>
                  <label className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700/50 backdrop-blur-sm px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/70 transition-all duration-200 text-sm sm:text-base touch-manipulation flex-1">
                    <input
                      type="checkbox"
                      checked={showConfidence}
                      onChange={(e) => setShowConfidence(e.target.checked)}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-400 dark:border-gray-500 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-white dark:focus:ring-offset-gray-800 cursor-pointer"
                    />
                    <span className="font-medium whitespace-nowrap">Show Confidence Scores</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Predictions Table */}
            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full text-xs sm:text-sm text-gray-900 dark:text-white">
                  <thead className="bg-gray-100 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
                    <tr className="border-b border-gray-300 dark:border-gray-700">
                      <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider text-xs sm:text-sm">Row</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider text-xs sm:text-sm">Predicted Class</th>
                      {showConfidence && <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider text-xs sm:text-sm">Confidence Distribution</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                    {currentPredictions.map((pred, idx) => (
                      <tr
                        key={pred.row_index}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-all duration-200 group active:bg-gray-200 dark:active:bg-gray-700/50"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 font-mono text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          #{pred.row_index}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                          <span className="inline-block px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-full font-bold text-xs sm:text-sm md:text-base text-white shadow-lg group-hover:shadow-cyan-500/50 sm:group-hover:scale-105 transition-all duration-200">
                            {pred.predicted_class}
                          </span>
                        </td>
                        {showConfidence && (
                          <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                            <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5">
                              {Object.entries(pred.confidence)
                                .sort(([, a], [, b]) => b - a)
                                .map(([className, conf]) => (
                                  <div key={className} className="flex items-center gap-2 sm:gap-3">
                                    <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 w-20 sm:w-24 md:w-28 font-medium truncate" title={className}>
                                      {className}
                                    </span>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-900/50 rounded-full h-2 sm:h-2.5 md:h-3 overflow-hidden shadow-inner">
                                      <div
                                        className={`h-full transition-all duration-500 ${
                                          className === pred.predicted_class
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50'
                                            : 'bg-gray-400 dark:bg-gray-600'
                                        }`}
                                        style={{ width: `${conf * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-xs sm:text-sm font-mono w-10 sm:w-12 md:w-14 text-right font-semibold text-gray-700 dark:text-gray-300">
                                      {(conf * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700/50 p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-700 font-semibold flex items-center justify-center gap-2 active:scale-95 sm:hover:scale-105 sm:hover:shadow-lg text-sm sm:text-base touch-manipulation"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>
                  <div className="text-gray-900 dark:text-white font-semibold bg-gray-100 dark:bg-gray-700/50 backdrop-blur-sm px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl text-center text-sm sm:text-base">
                    <span className="text-cyan-600 dark:text-cyan-400 text-base sm:text-lg">{currentPage + 1}</span>
                    <span className="text-gray-500 dark:text-gray-400 mx-1 sm:mx-2">/</span>
                    <span className="text-gray-700 dark:text-gray-300">{totalPages}</span>
                    <span className="hidden sm:inline text-gray-400 dark:text-gray-500 mx-2 md:mx-3">•</span>
                    <span className="hidden md:inline text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Showing {startIndex + 1}-{Math.min(endIndex, results.predictions.length)} of {results.predictions.length}
                    </span>
                    <span className="block sm:hidden text-gray-600 dark:text-gray-400 text-xs mt-1">
                      {startIndex + 1}-{Math.min(endIndex, results.predictions.length)} of {results.predictions.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-700 font-semibold flex items-center justify-center gap-2 active:scale-95 sm:hover:scale-105 sm:hover:shadow-lg text-sm sm:text-base touch-manipulation"
                  >
                    <span>Next</span>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom spacing */}
            <div className="h-8" />
          </div>
        </div>

        {/* Floating AI Chatbot Button - Bottom Right */}
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group z-[9999] animate-pulse"
          title="Ask AI about predictions"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <i className="fas fa-robot text-2xl group-hover:rotate-12 transition-transform duration-300"></i>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
          </div>
        </button>

        {/* AI Chatbot Modal */}
        <AIChatbot
          isOpen={isChatbotOpen}
          onClose={() => setIsChatbotOpen(false)}
          csvData={results.predictions.map(pred => ({
            row_index: pred.row_index,
            predicted_class: pred.predicted_class,
            confidence: pred.confidence,
            ...pred.confidence
          }))}
          modelType={results.dataset_type as 'kepler' | 'tess'}
        />
      </div>
    </div>,
    document.body
  ) : null;
};
