import React, { createContext, useState, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface SharedState {
  selectedDataset?: string;
  uploadedFile?: File | null;
  objectId?: string;
  trainingInProgress?: boolean;
  modelAccuracy?: number;
  lastDiscovery?: string;
  recentDiscoveries?: Array<{
    object: string;
    type: string;
    confidence: number;
    date: string;
  }>;
  modelMetrics?: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}

interface SharedContextProps {
  state: SharedState;
  updateState: (newState: Partial<SharedState>) => void;
}

const initialState: SharedState = {
  selectedDataset: 'kepler',
  uploadedFile: null,
  objectId: '',
  trainingInProgress: false,
  modelAccuracy: 94.2,
  lastDiscovery: 'KIC 8462852',
  recentDiscoveries: [
    { object: 'KIC 8462852', type: 'Super-Earth', confidence: 89, date: 'Today' },
    { object: 'TIC 260128333', type: 'Hot Neptune', confidence: 78, date: 'Yesterday' },
    { object: 'EPIC 249631677', type: 'Mini Neptune', confidence: 92, date: '2 days ago' },
  ],
  modelMetrics: {
    accuracy: 94.2,
    precision: 92.8,
    recall: 91.5,
    f1Score: 92.1
  }
};

export const SharedContext = createContext<SharedContextProps>({
  state: initialState,
  updateState: () => {}
});

interface SharedProviderProps {
  children: ReactNode;
}

export const SharedProvider: React.FC<SharedProviderProps> = ({ children }) => {
  const [state, setState] = useState<SharedState>(initialState);
  
  const updateState = useCallback((newState: Partial<SharedState>) => {
    setState(prevState => ({
      ...prevState,
      ...newState
    }));
  }, []);
  
  return (
    <SharedContext.Provider value={{ state, updateState }}>
      {children}
    </SharedContext.Provider>
  );
};

export const useSharedState = () => useContext(SharedContext);