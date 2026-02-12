import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Region } from '../backend';

type RegionContextValue = Region | 'all';

interface RegionContextType {
  selectedRegion: RegionContextValue;
  setSelectedRegion: (region: RegionContextValue) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

const REGION_STORAGE_KEY = 'revnation-selected-region';

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegionState] = useState<RegionContextValue>(() => {
    // Initialize from sessionStorage
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(REGION_STORAGE_KEY);
      if (stored && (stored === 'all' || ['asia', 'europe', 'usa', 'middleEast'].includes(stored))) {
        return stored as RegionContextValue;
      }
    }
    return 'all';
  });

  const setSelectedRegion = (region: RegionContextValue) => {
    setSelectedRegionState(region);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(REGION_STORAGE_KEY, region);
    }
  };

  return (
    <RegionContext.Provider value={{ selectedRegion, setSelectedRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegionContext() {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegionContext must be used within RegionProvider');
  }
  return context;
}
