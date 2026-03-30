import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  country?: string;
}

interface LocationContextType {
  location: Location | null;
  setLocation: (location: Location) => void;
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if location is already saved on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        setLocationState(JSON.parse(savedLocation));
        setShowLocationModal(false);
      } catch (err) {
        console.error('Failed to parse saved location:', err);
        setShowLocationModal(true);
      }
    } else {
      // No saved location, show modal
      setShowLocationModal(true);
    }
  }, []);

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
    setShowLocationModal(false);
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, showLocationModal, setShowLocationModal, error }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}
