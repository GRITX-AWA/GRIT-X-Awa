import React from 'react';
import DashboardSection from '../DashboardSection';

const HelpResources: React.FC = () => {
  return (
    <div className="space-y-6">
      <DashboardSection
        variant="cosmic"
        title="Help & Resources"
        subtitle="Data sources, documentation, and learning materials"
        icon={<i className="fas fa-book-open"></i>}
      >
        <div className="space-y-6">
          {/* Introduction */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-700/50">
            <p className="text-gray-700 dark:text-gray-300">
              This platform uses official NASA exoplanet data and state-of-the-art machine learning models 
              to classify and analyze exoplanet candidates from the Kepler and TESS missions.
            </p>
          </div>

          {/* Data Sources */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-database text-blue-500"></i>
              Data Sources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=cumulative"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-green-500/20 hover:border-green-500/60 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <i className="fas fa-database text-green-500 text-2xl mb-3 block"></i>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1">Kepler Objects of Interest (KOI)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Primary data source for Kepler exoplanet candidates
                </p>
                <span className="text-xs text-green-500 group-hover:underline">
                  exoplanetarchive.ipac.caltech.edu →
                </span>
              </a>

              <a
                href="https://exoplanetarchive.ipac.caltech.edu/cgi-bin/TblView/nph-tblView?app=ExoTbls&config=TOI"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-green-500/20 hover:border-green-500/60 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <i className="fas fa-database text-green-500 text-2xl mb-3 block"></i>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1">TESS Objects of Interest (TOI)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Primary data source for TESS exoplanet candidates
                </p>
                <span className="text-xs text-green-500 group-hover:underline">
                  exoplanetarchive.ipac.caltech.edu →
                </span>
              </a>

              <a
                href="https://www.nasa.gov/mission_pages/kepler/overview/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-yellow-500/20 hover:border-yellow-500/60 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <i className="fas fa-satellite text-yellow-500 text-2xl mb-3 block"></i>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1">Kepler Space Telescope Mission</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Discover 9,564+ exoplanets with transit photometry data
                </p>
                <span className="text-xs text-yellow-500 group-hover:underline">
                  nasa.gov/kepler →
                </span>
              </a>

              <a
                href="https://tess.mit.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-yellow-500/20 hover:border-yellow-500/60 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <i className="fas fa-satellite-dish text-yellow-500 text-2xl mb-3 block"></i>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1">Transiting Exoplanet Survey Satellite (TESS)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  All-sky survey satellite discovering nearby exoplanets
                </p>
                <span className="text-xs text-yellow-500 group-hover:underline">
                  tess.mit.edu →
                </span>
              </a>
            </div>
          </div>

          {/* Technologies Used */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-cogs text-green-500"></i>
              Technologies & Frameworks
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/50 dark:border-orange-700/50">
                <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <i className="fas fa-rocket text-orange-500"></i>
                  Frontend
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Astro 5.14.1 - Static site generation</li>
                  <li>• React 18.3.1 - UI components</li>
                  <li>• TypeScript - Type safety</li>
                  <li>• Tailwind CSS - Styling</li>
                  <li>• Three.js - 3D visualizations</li>
                  <li>• Plotly.js - Interactive charts</li>
                  <li>• TensorFlow.js - Client-side ML</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-200/50 dark:border-green-700/50">
                <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <i className="fas fa-server text-green-500"></i>
                  Backend
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• FastAPI - Web framework</li>
                  <li>• Python 3.11 - Language</li>
                  <li>• Uvicorn - ASGI server</li>
                  <li>• SQLAlchemy - ORM</li>
                  <li>• Supabase - Database & Storage</li>
                  <li>• OpenAI GPT-3.5-Turbo - AI Chatbot</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50">
                <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                  <i className="fas fa-brain text-blue-500"></i>
                  Machine Learning
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• CatBoost (40% weight)</li>
                  <li>• XGBoost (35% weight)</li>
                  <li>• LightGBM (25% weight)</li>
                  <li>• TensorFlow & Keras</li>
                  <li>• Scikit-learn</li>
                  <li>• NASA Exoplanet Archive</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ML Model Information */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-robot text-purple-500"></i>
              ML Models & Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <i className="fas fa-chart-line text-blue-500 text-2xl"></i>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">Kepler Ensemble Model</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">9,564 exoplanets analyzed</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">93.94%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Features:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">21 parameters</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Classes:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">3 (Candidate, Confirmed, False Positive)</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <i className="fas fa-chart-bar text-purple-500 text-2xl"></i>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">TESS Ensemble Model</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">All-sky survey data</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">92.20%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Features:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">28 parameters</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Classes:</span>
                    <span className="font-semibold text-gray-800 dark:text-white">6 (APC, CP, FA, FP, KP, PC)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documentation & APIs */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-code text-yellow-500"></i>
              Documentation & APIs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://grit-x-awa-1035421252747.europe-west1.run.app/api/v1/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-emerald-500/20 hover:border-emerald-500/60 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <i className="fas fa-file-code text-emerald-500 text-2xl mb-3 block"></i>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1">API Documentation (Swagger)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Interactive API documentation with live testing
                </p>
                <span className="text-xs text-emerald-500 group-hover:underline">
                  View API Docs →
                </span>
              </a>

              <a
                href="https://github.com/GRITX-AWA/GRIT-X-Awa"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-500/20 hover:border-gray-500/60 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <i className="fab fa-github text-gray-700 dark:text-gray-300 text-2xl mb-3 block"></i>
                <h4 className="font-bold text-gray-800 dark:text-white mb-1">GitHub Repository</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Full source code, documentation, and contribution guidelines
                </p>
                <span className="text-xs text-gray-500 group-hover:underline">
                  github.com/GRITX-AWA →
                </span>
              </a>
            </div>
          </div>

          {/* Learning Resources */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-graduation-cap text-red-500"></i>
              Learning Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href="https://exoplanets.nasa.gov/alien-worlds/ways-to-find-a-planet/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 border border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg"
              >
                <i className="fas fa-search text-blue-500 mb-2 text-xl block"></i>
                <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">Detection Methods</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Learn how exoplanets are discovered</p>
              </a>

              <a
                href="https://exoplanets.nasa.gov/faq/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg"
              >
                <i className="fas fa-question-circle text-purple-500 mb-2 text-xl block"></i>
                <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">Exoplanet FAQ</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Common questions answered</p>
              </a>

              <a
                href="https://www.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg bg-white/30 dark:bg-gray-800/30 border border-red-500/20 hover:border-red-500/40 transition-all hover:shadow-lg"
              >
                <i className="fas fa-rocket text-red-500 mb-2 text-xl block"></i>
                <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-1">NASA.gov</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">Official NASA homepage</p>
              </a>
            </div>
          </div>

          {/* Technologies Used */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-cogs text-green-500"></i>
              Technologies Used
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Frontend Stack */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50">
                <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-desktop text-sm"></i>
                  Frontend
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <i className="fab fa-react text-cyan-500"></i>
                    <span><strong>React</strong> - UI Components</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-star text-orange-500"></i>
                    <span><strong>Astro</strong> - SSR Framework</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-code text-blue-600"></i>
                    <span><strong>TypeScript</strong> - Type Safety</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-wind text-teal-500"></i>
                    <span><strong>Tailwind CSS</strong> - Styling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-cube text-purple-500"></i>
                    <span><strong>Three.js</strong> - 3D Graphics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-chart-line text-pink-500"></i>
                    <span><strong>Plotly.js</strong> - Visualizations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-brain text-orange-500"></i>
                    <span><strong>TensorFlow.js</strong> - Client ML</span>
                  </div>
                </div>
              </div>

              {/* Backend Stack */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50">
                <h4 className="font-bold text-green-700 dark:text-green-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-server text-sm"></i>
                  Backend & APIs
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <i className="fab fa-python text-blue-500"></i>
                    <span><strong>Python</strong> 3.11 - Core Language</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-rocket text-teal-500"></i>
                    <span><strong>FastAPI</strong> - Web Framework</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-database text-green-600"></i>
                    <span><strong>SQLAlchemy</strong> - ORM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-database text-green-500"></i>
                    <span><strong>Supabase</strong> - PostgreSQL DB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-robot text-purple-500"></i>
                    <span><strong>OpenAI GPT-4</strong> - AI Chatbot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-satellite text-blue-500"></i>
                    <span><strong>NASA API</strong> - Exoplanet Data</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-table text-orange-500"></i>
                    <span><strong>Pandas</strong> - Data Processing</span>
                  </div>
                </div>
              </div>

              {/* ML Stack */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-700/50">
                <h4 className="font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-brain text-sm"></i>
                  Machine Learning
                </h4>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-network-wired text-orange-500"></i>
                    <span><strong>TensorFlow</strong> - Deep Learning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-flask text-blue-500"></i>
                    <span><strong>Scikit-learn</strong> - ML Utilities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-chart-bar text-red-500"></i>
                    <span><strong>XGBoost</strong> - Gradient Boosting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-chart-bar text-yellow-500"></i>
                    <span><strong>LightGBM</strong> - Gradient Boosting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-chart-bar text-green-500"></i>
                    <span><strong>CatBoost</strong> - Gradient Boosting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fas fa-layer-group text-purple-500"></i>
                    <span><strong>Ensemble</strong> - Weighted Voting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Development Tools & Infrastructure */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <i className="fas fa-tools text-gray-400 text-sm"></i>
              <span className="text-sm">Development Tools & Infrastructure</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <a
                href="https://cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 border border-gray-300/30 dark:border-gray-700/30 hover:border-blue-400/50 transition-all text-center"
                title="Google Cloud Platform"
              >
                <i className="fab fa-google text-blue-500 text-lg mb-1 block"></i>
                <span className="text-xs text-gray-600 dark:text-gray-400">Google Cloud</span>
              </a>

              <a
                href="https://supabase.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 border border-gray-300/30 dark:border-gray-700/30 hover:border-green-400/50 transition-all text-center"
                title="Supabase"
              >
                <i className="fas fa-database text-green-500 text-lg mb-1 block"></i>
                <span className="text-xs text-gray-600 dark:text-gray-400">Supabase</span>
              </a>

              <a
                href="https://vercel.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 border border-gray-300/30 dark:border-gray-700/30 hover:border-gray-900/50 dark:hover:border-gray-100/50 transition-all text-center"
                title="Vercel"
              >
                <i className="fas fa-bolt text-gray-900 dark:text-white text-lg mb-1 block"></i>
                <span className="text-xs text-gray-600 dark:text-gray-400">Vercel</span>
              </a>

              <a
                href="https://www.docker.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 border border-gray-300/30 dark:border-gray-700/30 hover:border-blue-500/50 transition-all text-center"
                title="Docker"
              >
                <i className="fab fa-docker text-blue-500 text-lg mb-1 block"></i>
                <span className="text-xs text-gray-600 dark:text-gray-400">Docker</span>
              </a>

              <a
                href="https://github.com/features/copilot"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 border border-gray-300/30 dark:border-gray-700/30 hover:border-purple-400/50 transition-all text-center"
                title="GitHub Copilot"
              >
                <i className="fab fa-github text-gray-700 dark:text-gray-300 text-lg mb-1 block"></i>
                <span className="text-xs text-gray-600 dark:text-gray-400">Copilot</span>
              </a>

              <a
                href="https://www.anthropic.com/claude"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 border border-gray-300/30 dark:border-gray-700/30 hover:border-orange-400/50 transition-all text-center"
                title="Claude AI"
              >
                <i className="fas fa-robot text-orange-500 text-lg mb-1 block"></i>
                <span className="text-xs text-gray-600 dark:text-gray-400">Claude</span>
              </a>

              <a
                href="https://openai.com/chatgpt"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg bg-white/40 dark:bg-gray-800/40 border border-gray-300/30 dark:border-gray-700/30 hover:border-teal-400/50 transition-all text-center"
                title="ChatGPT"
              >
                <i className="fas fa-comments text-teal-500 text-lg mb-1 block"></i>
                <span className="text-xs text-gray-600 dark:text-gray-400">ChatGPT</span>
              </a>
            </div>
          </div>

          {/* Data Attribution */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-300/50 dark:border-gray-700/50">
            <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
              <i className="fas fa-info-circle text-gray-500"></i>
              Data Attribution
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              This research has made use of the NASA Exoplanet Archive, which is operated by the California Institute 
              of Technology, under contract with the National Aeronautics and Space Administration under the Exoplanet 
              Exploration Program. All exoplanet data is publicly available and sourced from official NASA missions.
            </p>
          </div>
        </div>
      </DashboardSection>
    </div>
  );
};

export default HelpResources;
