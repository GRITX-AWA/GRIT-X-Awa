import React, { useState } from 'react';
import type { UploadResponse } from '../services/api';

interface PredictionResultsProps {
  results: UploadResponse;
  onClose: () => void;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({ results, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showConfidence, setShowConfidence] = useState(true);
  const itemsPerPage = 10;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-cyan-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Prediction Results</h2>
              <p className="text-sm opacity-90">
                Job ID: <code className="bg-white bg-opacity-20 px-2 py-1 rounded">{results.job_id}</code>
              </p>
              <p className="text-sm opacity-90 mt-1">
                Dataset: <span className="font-semibold">{results.dataset_type.toUpperCase()}</span> | 
                Total Predictions: <span className="font-semibold">{results.total_predictions}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="p-6 bg-gray-800 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Class Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(classDistribution).map(([className, count]) => {
              const avg = avgConfidence[className];
              const avgConf = avg ? (avg.sum / avg.count) : 0;
              const percentage = ((count / results.total_predictions) * 100).toFixed(1);
              
              return (
                <div key={className} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="text-cyan-400 font-semibold text-sm mb-1">{className}</div>
                  <div className="text-2xl font-bold text-white mb-1">{count}</div>
                  <div className="text-xs text-gray-400">
                    {percentage}% | Avg Conf: {(avgConf * 100).toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={downloadJSON}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export JSON
            </button>
          </div>
          <label className="flex items-center gap-2 text-white">
            <input
              type="checkbox"
              checked={showConfidence}
              onChange={(e) => setShowConfidence(e.target.checked)}
              className="form-checkbox"
            />
            <span className="text-sm">Show Confidence Scores</span>
          </label>
        </div>

        {/* Predictions Table */}
        <div className="overflow-auto max-h-96 p-6">
          <table className="w-full text-sm text-white">
            <thead className="bg-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">Row</th>
                <th className="px-4 py-3 text-left">Predicted Class</th>
                {showConfidence && <th className="px-4 py-3 text-left">Confidence</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {currentPredictions.map((pred) => (
                <tr key={pred.row_index} className="hover:bg-gray-800 transition">
                  <td className="px-4 py-3 font-mono text-gray-400">#{pred.row_index}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-3 py-1 bg-cyan-600 rounded-full font-semibold">
                      {pred.predicted_class}
                    </span>
                  </td>
                  {showConfidence && (
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {Object.entries(pred.confidence)
                          .sort(([, a], [, b]) => b - a)
                          .map(([className, conf]) => (
                            <div key={className} className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-20">{className}:</span>
                              <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full ${className === pred.predicted_class ? 'bg-cyan-500' : 'bg-gray-500'}`}
                                  style={{ width: `${conf * 100}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono w-12 text-right">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-800 border-t border-gray-700 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-white text-sm">
              Page {currentPage + 1} of {totalPages} ({startIndex + 1}-{Math.min(endIndex, results.predictions.length)} of {results.predictions.length})
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
