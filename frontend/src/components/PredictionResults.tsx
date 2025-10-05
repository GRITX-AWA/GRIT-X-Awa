import React, { useState, useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { UploadResponse } from '../services/api';
import { exoplanetService } from '../services/exoplanetService';
import { PageContext } from './DashboardLayoutComponent';
import { ThemeContext } from './ThemeContext';

interface PredictionResultsProps {
  results: UploadResponse;
  onClose: () => void;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({ results, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showConfidence, setShowConfidence] = useState(true);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const itemsPerPage = 10;
  const { setActivePage } = useContext(PageContext);
  const { darkMode } = useContext(ThemeContext);

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

  const viewInExoplanets = async () => {
    try {
      setLoadingAction('exoplanets');
      // Navigate to exoplanets page
      setActivePage('exoplanets');
      onClose();
    } catch (error) {
      console.error('Error navigating to exoplanets:', error);
      alert('Failed to navigate to exoplanets page');
    } finally {
      setLoadingAction(null);
    }
  };

  const viewAll3D = async () => {
    try {
      setLoadingAction('3d-all');
      // Navigate to visualizations page
      setActivePage('visualizations');
      onClose();
    } catch (error) {
      console.error('Error navigating to 3D view:', error);
      alert('Failed to navigate to 3D visualization');
    } finally {
      setLoadingAction(null);
    }
  };

  return mounted ? createPortal(
    <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-900 z-50 overflow-hidden">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 dark:from-cyan-500/10 dark:via-transparent dark:to-blue-500/10 animate-pulse" />

      {/* Main content container - full page */}
      <div className="relative h-full flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 shadow-2xl">
          <div className="container mx-auto px-8 py-6">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <h2 className="text-4xl font-bold text-white tracking-tight">Prediction Results</h2>
                  <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                    {results.total_predictions} predictions
                  </span>
                </div>
                <div className="flex items-center gap-6 text-white/90">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm">Job ID:</span>
                    <code className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-md font-mono text-sm">
                      {results.job_id}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span className="text-sm">Dataset:</span>
                    <span className="font-semibold text-sm uppercase">{results.dataset_type}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-3 transition-all duration-200 hover:scale-110 hover:rotate-90 backdrop-blur-sm"
                aria-label="Close"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-8 py-8 space-y-8">
            {/* Stats Summary */}
            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Class Distribution</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Object.entries(classDistribution).map(([className, count]) => {
                  const avg = avgConfidence[className];
                  const avgConf = avg ? (avg.sum / avg.count) : 0;
                  const percentage = ((count / results.total_predictions) * 100).toFixed(1);

                  return (
                    <div
                      key={className}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-300 dark:border-gray-600/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
                    >
                      <div className="text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider mb-3 truncate" title={className}>
                        {className}
                      </div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{count}</div>
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
            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700/50 p-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={viewInExoplanets}
                    disabled={loadingAction === 'exoplanets'}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-purple-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View in Exoplanets
                  </button>
                  <button
                    onClick={viewAll3D}
                    disabled={loadingAction === '3d-all'}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-indigo-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                    View All in 3D
                  </button>
                  <button
                    onClick={downloadCSV}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-green-500/50 hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export CSV
                  </button>
                  <button
                    onClick={downloadJSON}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all duration-200 flex items-center gap-3 font-semibold shadow-lg hover:shadow-blue-500/50 hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export JSON
                  </button>
                </div>
                <label className="flex items-center gap-3 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700/50 backdrop-blur-sm px-5 py-3 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700/70 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={showConfidence}
                    onChange={(e) => setShowConfidence(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-400 dark:border-gray-500 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-white dark:focus:ring-offset-gray-800 cursor-pointer"
                  />
                  <span className="font-medium">Show Confidence Scores</span>
                </label>
              </div>
            </div>

            {/* Predictions Table */}
            <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-900 dark:text-white">
                  <thead className="bg-gray-100 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
                    <tr className="border-b border-gray-300 dark:border-gray-700">
                      <th className="px-6 py-4 text-left font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Row</th>
                      <th className="px-6 py-4 text-left font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Predicted Class</th>
                      {showConfidence && <th className="px-6 py-4 text-left font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Confidence Distribution</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700/50">
                    {currentPredictions.map((pred, idx) => (
                      <tr
                        key={pred.row_index}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700/30 transition-all duration-200 group"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <td className="px-6 py-5 font-mono text-gray-600 dark:text-gray-400 text-base group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          #{pred.row_index}
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-block px-5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-full font-bold text-base text-white shadow-lg group-hover:shadow-cyan-500/50 group-hover:scale-105 transition-all duration-200">
                            {pred.predicted_class}
                          </span>
                        </td>
                        {showConfidence && (
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-2.5">
                              {Object.entries(pred.confidence)
                                .sort(([, a], [, b]) => b - a)
                                .map(([className, conf]) => (
                                  <div key={className} className="flex items-center gap-3">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 w-28 font-medium truncate" title={className}>
                                      {className}
                                    </span>
                                    <div className="flex-1 bg-gray-200 dark:bg-gray-900/50 rounded-full h-3 overflow-hidden shadow-inner">
                                      <div
                                        className={`h-full transition-all duration-500 ${
                                          className === pred.predicted_class
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50'
                                            : 'bg-gray-400 dark:bg-gray-600'
                                        }`}
                                        style={{ width: `${conf * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-mono w-14 text-right font-semibold text-gray-700 dark:text-gray-300">
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
              <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-700 font-semibold flex items-center gap-2 hover:scale-105 hover:shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <div className="text-gray-900 dark:text-white font-semibold bg-gray-100 dark:bg-gray-700/50 backdrop-blur-sm px-6 py-3 rounded-xl">
                    <span className="text-cyan-600 dark:text-cyan-400 text-lg">{currentPage + 1}</span>
                    <span className="text-gray-500 dark:text-gray-400 mx-2">/</span>
                    <span className="text-gray-700 dark:text-gray-300">{totalPages}</span>
                    <span className="text-gray-400 dark:text-gray-500 mx-3">•</span>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Showing {startIndex + 1}-{Math.min(endIndex, results.predictions.length)} of {results.predictions.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-200 dark:disabled:hover:bg-gray-700 font-semibold flex items-center gap-2 hover:scale-105 hover:shadow-lg"
                  >
                    Next
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    </div>,
    document.body
  ) : null;
};
