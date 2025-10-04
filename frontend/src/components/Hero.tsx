import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import SpaceScene from './SpaceScene';
import '../styles/Hero.css';

export default function Hero() {
  return (
    <div className="hero-container">
      {/* Three.js Background */}
      <div className="hero-canvas">
        <Canvas
          camera={{ position: [0, 5, 15], fov: 60 }}
          gl={{ alpha: true, antialias: true }}
        >
          <Suspense fallback={null}>
            <SpaceScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <div className="hero-text-container">
          <h1 className="hero-title">
            <span className="hero-title-main">Discover the Universe</span>
            <span className="hero-title-sub">Hunting for Exoplanets with AI</span>
          </h1>

          <p className="hero-description">
            An AI-powered tool built on NASA’s Kepler and TESS data to classify 
            and explore exoplanets—designed for both researchers and the curious.
          </p>

          <a
            href="/dashboard/"
            className="hero-cta-button"
          >
            <span className="button-text">Explore Dashboard</span>
            <i className="fa fa-rocket"></i>
          </a>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">6,000+</div>
              <div className="stat-label">Exoplanets</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">AI-Powered</div>
              <div className="stat-label">Classification</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-value">Real-time</div>
              <div className="stat-label">Analysis</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
