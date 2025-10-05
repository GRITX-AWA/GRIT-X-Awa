import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ExoplanetData {
  // Unique identifier
  id?: string | number;
  
  // Kepler format
  kepid?: number;
  kepler_name?: string;
  koi_disposition?: string;
  koi_period?: number;
  koi_prad?: number;
  koi_teq?: number;
  koi_insol?: number;
  koi_sma?: number;
  koi_depth?: number;
  koi_duration?: number;
  koi_steff?: number;
  koi_srad?: number;

  // TESS format
  tid?: number;        // TIC ID (TESS Input Catalog ID)
  toi?: number;        // TOI (TESS Object of Interest)
  tic_id?: number;     // Alternative naming
  toi_id?: number;     // Alternative naming
  pl_name?: string;
  pl_rade?: number;
  pl_orbper?: number;
  pl_eqt?: number;
  pl_insol?: number;
  pl_orbsmax?: number;
  st_rad?: number;
  st_teff?: number;
  sy_dist?: number;  // Legacy Kepler field
  st_dist?: number;  // TESS field for stellar/system distance
}

interface ExoplanetContextType {
  selectedExoplanet: ExoplanetData | null;
  selectedExoplanets: ExoplanetData[];
  dataType: 'kepler' | 'tess' | null;
  setSelectedExoplanet: (data: ExoplanetData | null, type: 'kepler' | 'tess') => void;
  setSelectedExoplanets: (data: ExoplanetData[], type: 'kepler' | 'tess') => void;
  addExoplanet: (data: ExoplanetData, type: 'kepler' | 'tess') => void;
  removeExoplanet: (data: ExoplanetData) => void;
  clearSelectedExoplanet: () => void;
  clearAllExoplanets: () => void;
}

const ExoplanetContext = createContext<ExoplanetContextType | undefined>(undefined);

export const ExoplanetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedExoplanet, setSelectedExoplanetState] = useState<ExoplanetData | null>(null);
  const [selectedExoplanets, setSelectedExoplanetsState] = useState<ExoplanetData[]>([]);
  const [dataType, setDataType] = useState<'kepler' | 'tess' | null>(null);

  const setSelectedExoplanet = (data: ExoplanetData | null, type: 'kepler' | 'tess') => {
    setSelectedExoplanetState(data);
    setDataType(type);
  };

  const setSelectedExoplanets = (data: ExoplanetData[], type: 'kepler' | 'tess') => {
    setSelectedExoplanetsState(data);
    setDataType(type);
  };

  const addExoplanet = (data: ExoplanetData, type: 'kepler' | 'tess') => {
    setSelectedExoplanetsState(prev => [...prev, data]);
    setDataType(type);
  };

  const removeExoplanet = (data: ExoplanetData) => {
    setSelectedExoplanetsState(prev =>
      prev.filter(planet => {
        // Compare by unique identifier - prioritize 'id' field
        if (planet.id && data.id) return planet.id !== data.id;
        if (planet.kepid && data.kepid) return planet.kepid !== data.kepid;
        if (planet.tid && data.tid) return planet.tid !== data.tid;
        if (planet.tic_id && data.tic_id) return planet.tic_id !== data.tic_id;
        return true;
      })
    );
  };

  const clearSelectedExoplanet = () => {
    setSelectedExoplanetState(null);
    setDataType(null);
  };

  const clearAllExoplanets = () => {
    setSelectedExoplanetsState([]);
    setDataType(null);
  };

  return (
    <ExoplanetContext.Provider
      value={{
        selectedExoplanet,
        selectedExoplanets,
        dataType,
        setSelectedExoplanet,
        setSelectedExoplanets,
        addExoplanet,
        removeExoplanet,
        clearSelectedExoplanet,
        clearAllExoplanets,
      }}
    >
      {children}
    </ExoplanetContext.Provider>
  );
};

export const useExoplanet = () => {
  const context = useContext(ExoplanetContext);
  if (context === undefined) {
    throw new Error('useExoplanet must be used within an ExoplanetProvider');
  }
  return context;
};
