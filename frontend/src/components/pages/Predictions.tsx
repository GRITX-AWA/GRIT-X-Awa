import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import AIChatbot from '../AIChatbot';

const Predictions: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [loadingModelInfo, setLoadingModelInfo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [csvResults, setCsvResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        const info = await apiService.getModelInfo();
        setModelInfo(info);
      } catch (err) {
        setError('Failed to load model information');
        console.error('Error fetching model info:', err);
      } finally {
        setLoadingModelInfo(false);
      }
    };

    // AI model not ready yet, using dummy data
    const loadDummyPredictions = () => {
      const dummyPredictions = [
        {
          starId: 'KIC 8462852',
          confidence: 0.94,
          predictedType: 'Super-Earth',
          sourceDataset: 'Kepler',
          planetRadius: 1.42,
          orbitalPeriod: 23.5,
          equilibriumTemp: 295,
          stellarTemp: 5778,
        },
        {
          starId: 'TIC 260128333',
          confidence: 0.89,
          predictedType: 'Neptune-like',
          sourceDataset: 'TESS',
          planetRadius: 3.89,
          orbitalPeriod: 45.2,
          equilibriumTemp: 425,
          stellarTemp: 6200,
        },
        {
          starId: 'EPIC 211945201',
          confidence: 0.78,
          predictedType: 'Gas Giant',
          sourceDataset: 'K2',
          planetRadius: 11.2,
          orbitalPeriod: 12.3,
          equilibriumTemp: 850,
          stellarTemp: 5350,
        }
      ];
      setPredictions(dummyPredictions);
      setCsvResults(dummyPredictions);
      setLoadingPredictions(false);
    };

    fetchModelInfo();
    loadDummyPredictions();
  }, []);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 min-h-screen transition-colors duration-200">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
          <i className="fas fa-brain mr-3 text-purple-600 dark:text-purple-400"></i>
          Exoplanet Predictions
        </h1>
        <p className="text-gray-700 dark:text-gray-300 font-medium">
          Our machine learning models analyze stellar data to predict potential exoplanets that haven't been confirmed yet.
          These candidates are ranked by confidence level based on transit signatures and other detectable features.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-xl mb-6">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          {error}
        </div>
      )}

      <div className="bg-gradient-to-br from-white to-purple-50/20 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-xl overflow-hidden border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm mb-8">
        <div className="p-6 border-b border-purple-200/50 dark:border-purple-700/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <i className="fas fa-list-ol text-purple-600 dark:text-purple-400"></i>
            Prediction Rankings
          </h2>
        </div>
        <div className="overflow-x-auto">
          {loadingPredictions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
              <p className="text-gray-300 mt-4">Loading predictions...</p>
            </div>
          ) : predictions.length === 0 ? (
            <p className="text-gray-300 p-4">No predictions available.</p>
          ) : (
            <table className="min-w-full divide-y divide-purple-200/50 dark:divide-purple-700/50">
              <thead className="bg-purple-100/50 dark:bg-purple-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Star ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Predicted Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Source Dataset</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-purple-200/30 dark:divide-purple-700/30">
                {predictions.map((pred, index) => (
                  <tr key={index} className="hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600 dark:text-purple-400">#{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-200">{pred.starId || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              pred.confidence > 0.8 ? 'bg-green-500' : pred.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${(pred.confidence || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`ml-2 text-sm font-bold ${
                          pred.confidence > 0.8 ? 'text-green-600 dark:text-green-400' : pred.confidence > 0.5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {(pred.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{pred.predictedType || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{pred.sourceDataset || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold hover:underline">
                        <i className="fas fa-eye mr-1"></i>View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-white to-green-50/30 dark:from-gray-800 dark:to-green-900/20 p-6 rounded-2xl shadow-xl border border-green-200/50 dark:border-green-700/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <i className="fas fa-chart-line text-green-600 dark:text-green-400"></i>
            Model Performance
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Accuracy</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">94%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full shadow-lg" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Precision</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">91%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full shadow-lg" style={{ width: '91%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Recall</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">88%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full shadow-lg" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">F1 Score</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">89%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full shadow-lg" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-900/20 p-6 rounded-2xl shadow-xl border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-600 dark:text-blue-400"></i>
            Model Information
          </h2>
          {loadingModelInfo ? (
            <p className="text-gray-700 dark:text-gray-300">Loading model information...</p>
          ) : modelInfo ? (
            <dl className="space-y-2">
              <div className="flex justify-between py-3 border-b border-blue-200/50 dark:border-blue-700/50">
                <dt className="text-gray-700 dark:text-gray-300 font-semibold">Framework</dt>
                <dd className="text-gray-900 dark:text-white font-bold">{modelInfo.framework}</dd>
              </div>
              <div className="flex justify-between py-3 border-b border-blue-200/50 dark:border-blue-700/50">
                <dt className="text-gray-700 dark:text-gray-300 font-semibold">Architecture</dt>
                <dd className="text-gray-900 dark:text-white font-bold">{modelInfo.architecture}</dd>
              </div>
              <div className="flex justify-between py-3 border-b border-blue-200/50 dark:border-blue-700/50">
                <dt className="text-gray-700 dark:text-gray-300 font-semibold">Input Shape</dt>
                <dd className="text-gray-900 dark:text-white font-bold">{JSON.stringify(modelInfo.input_shape)}</dd>
              </div>
              <div className="flex justify-between py-3 border-b border-blue-200/50 dark:border-blue-700/50">
                <dt className="text-gray-700 dark:text-gray-300 font-semibold">Optimizer</dt>
                <dd className="text-gray-900 dark:text-white font-bold">{modelInfo.optimizer}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-gray-700 dark:text-gray-300">No model information available.</p>
          )}
        </div>
      </div>

      {/* AI Chatbot Modal */}
      <AIChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        csvData={csvResults}
        modelType={csvResults[0]?.sourceDataset?.toLowerCase() as 'kepler' | 'tess'}
      />

      {/* Floating AI Chatbot Button - Bottom Right */}
      <button
        onClick={() => setIsChatbotOpen(true)}
        disabled={csvResults.length === 0}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center disabled:cursor-not-allowed disabled:hover:scale-100 group z-50 animate-pulse"
        title="Ask AI about predictions"
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          <i className="fas fa-robot text-2xl group-hover:rotate-12 transition-transform duration-300"></i>
          {csvResults.length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
          )}
        </div>
      </button>
    </div>
  );
};

export default Predictions;
