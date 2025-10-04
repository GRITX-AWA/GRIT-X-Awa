import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

const Predictions: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [loadingPredictions, setLoadingPredictions] = useState(true);
  const [loadingModelInfo, setLoadingModelInfo] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          sourceDataset: 'Kepler'
        },
        {
          starId: 'TIC 260128333',
          confidence: 0.89,
          predictedType: 'Neptune-like',
          sourceDataset: 'TESS'
        },
        {
          starId: 'EPIC 211945201',
          confidence: 0.78,
          predictedType: 'Gas Giant',
          sourceDataset: 'K2'
        }
      ];
      setPredictions(dummyPredictions);
      setLoadingPredictions(false);
    };

    fetchModelInfo();
    loadDummyPredictions();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Exoplanet Predictions</h1>

      <div className="mb-6">
        <p className="text-gray-300">
          Our machine learning models analyze stellar data to predict potential exoplanets that haven't been confirmed yet.
          These candidates are ranked by confidence level based on transit signatures and other detectable features.
        </p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Prediction Rankings</h2>
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
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Star ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Predicted Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Source Dataset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-gray-700">
                {predictions.map((pred, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">#{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{pred.starId || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              pred.confidence > 0.8 ? 'bg-green-600' : pred.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-600'
                            }`}
                            style={{ width: `${(pred.confidence || 0) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`ml-2 text-sm ${
                          pred.confidence > 0.8 ? 'text-green-500' : pred.confidence > 0.5 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {(pred.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{pred.predictedType || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{pred.sourceDataset || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-500 hover:text-blue-400">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Model Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300">Accuracy</span>
                <span className="text-sm text-green-500">94%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300">Precision</span>
                <span className="text-sm text-green-500">91%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300">Recall</span>
                <span className="text-sm text-green-500">88%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300">F1 Score</span>
                <span className="text-sm text-green-500">89%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Model Information</h2>
          {loadingModelInfo ? (
            <p className="text-gray-300">Loading model information...</p>
          ) : modelInfo ? (
            <dl className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-700">
                <dt className="text-gray-300">Framework</dt>
                <dd className="text-white font-medium">{modelInfo.framework}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <dt className="text-gray-300">Architecture</dt>
                <dd className="text-white font-medium">{modelInfo.architecture}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <dt className="text-gray-300">Input Shape</dt>
                <dd className="text-white font-medium">{JSON.stringify(modelInfo.input_shape)}</dd>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-700">
                <dt className="text-gray-300">Optimizer</dt>
                <dd className="text-white font-medium">{modelInfo.optimizer}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-gray-300">No model information available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Predictions;
