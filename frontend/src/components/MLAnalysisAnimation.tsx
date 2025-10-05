import React, { useEffect, useState } from 'react';
import Modal from './Modal';

interface MLAnalysisAnimationProps {
  isAnalyzing: boolean;
  modelType: 'tess' | 'kepler';
}

const MLAnalysisAnimation: React.FC<MLAnalysisAnimationProps> = ({ isAnalyzing, modelType }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { icon: 'fa-upload', label: 'Reading data...', color: 'from-blue-500 to-cyan-500' },
    { icon: 'fa-search', label: 'Validating columns...', color: 'from-cyan-500 to-teal-500' },
    { icon: 'fa-brain', label: 'Loading ML models...', color: 'from-teal-500 to-green-500' },
    { icon: 'fa-cogs', label: 'Processing features...', color: 'from-green-500 to-lime-500' },
    { icon: 'fa-chart-line', label: 'Running predictions...', color: 'from-lime-500 to-yellow-500' },
    { icon: 'fa-layer-group', label: 'Ensemble voting...', color: 'from-yellow-500 to-orange-500' },
    { icon: 'fa-check-circle', label: 'Finalizing results...', color: 'from-orange-500 to-red-500' }
  ];

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    // Progress through steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    // Smooth progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 3;
      });
    }, 150);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isAnalyzing]);

  return (
    <Modal 
      isOpen={isAnalyzing} 
      onClose={() => {}} // Prevent closing during analysis
      maxWidth="2xl"
    >
      <div className="bg-gradient-to-br from-white via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/50 dark:to-gray-900 rounded-2xl p-6 sm:p-8 md:p-12 relative overflow-hidden">
          
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-0 w-48 h-48 bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }} />
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-8">
            
            {/* Header */}
            <div className="text-center space-y-3">
              <div className="inline-block">
                <div className="relative">
                  {/* Rotating Ring */}
                  <div className="w-24 h-24 mx-auto border-4 border-purple-300/50 dark:border-purple-500/30 border-t-purple-600 dark:border-t-purple-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
                  
                  {/* Center Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50 animate-pulse">
                      <i className="fas fa-brain text-white text-2xl"></i>
                    </div>
                  </div>

                  {/* Orbiting Particles */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full -translate-x-1/2 shadow-lg shadow-blue-400/50"></div>
                  </div>
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
                    <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-pink-400 rounded-full -translate-x-1/2 shadow-lg shadow-pink-400/50"></div>
                  </div>
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2.5s' }}>
                    <div className="absolute top-1/2 right-0 w-2 h-2 bg-green-400 rounded-full -translate-y-1/2 shadow-lg shadow-green-400/50"></div>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Analyzing with AI
              </h3>
              <p className="text-purple-700 dark:text-purple-300 text-sm sm:text-base font-medium">
                {modelType.toUpperCase()} Ensemble Model Processing
              </p>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 transition-all duration-500 ${
                    index <= currentStep
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-30 translate-x-4'
                  }`}
                >
                  {/* Icon */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500
                    ${index < currentStep
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 scale-100'
                      : index === currentStep
                      ? `bg-gradient-to-br ${step.color} scale-110 shadow-lg animate-pulse`
                      : 'bg-gray-300 dark:bg-gray-700 scale-90'
                    }
                  `}>
                    <i className={`fas ${
                      index < currentStep ? 'fa-check' : step.icon
                    } text-white ${index === currentStep ? 'text-lg' : 'text-sm'}`}></i>
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate transition-colors duration-500 ${
                      index === currentStep
                        ? 'text-gray-900 dark:text-white text-lg'
                        : index < currentStep
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>

                  {/* Status Icon */}
                  {index === currentStep && (
                    <div className="flex-shrink-0">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-purple-700 dark:text-purple-300 font-medium">
                <span>Processing</span>
                <span className="font-mono font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                       style={{ 
                         backgroundSize: '200% 100%',
                         animation: 'shimmer 2s infinite'
                       }} />
                </div>
              </div>
            </div>

            {/* Model Info */}
            <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-purple-300/40 dark:border-purple-500/20">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-300/50 dark:border-white/10 shadow-sm">
                <i className="fas fa-fire text-orange-400"></i>
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">XGBoost</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-300/50 dark:border-white/10 shadow-sm">
                <i className="fas fa-bolt text-green-400"></i>
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">LightGBM</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-lg border border-gray-300/50 dark:border-white/10 shadow-sm">
                <i className="fas fa-cat text-blue-400"></i>
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">CatBoost</span>
              </div>
            </div>

            {/* Fun Fact */}
            <div className="text-center">
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70 italic font-medium">
                ✨ Processing multiple algorithms simultaneously for best accuracy
              </p>
            </div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-purple-500/60 dark:bg-purple-400/60 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>

          <style>{`
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }

            @keyframes float {
              0%, 100% {
                transform: translateY(0) translateX(0);
                opacity: 0;
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                transform: translateY(-100vh) translateX(20px);
                opacity: 0;
              }
            }

            .animate-float {
              animation: float linear infinite;
            }

            .animate-shimmer {
              animation: shimmer 2s infinite;
            }
          `}</style>
        </div>
    </Modal>
  );
};

export default MLAnalysisAnimation;
