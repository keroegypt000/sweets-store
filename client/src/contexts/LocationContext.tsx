import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
  area?: string; // منطقة
  block?: string; // قطعة
  street?: string; // شارع
  avenue?: string; // جادة
  houseNumber?: string; // رقم البيت
  additionalDetails?: string;
  city?: string;
  country?: string;
}

interface LocationContextType {
  location: Location | null;
  setLocation: (location: Location) => void;
  showLocationModal: boolean;
  setShowLocationModal: (show: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isFirstVisit: boolean;
  setIsFirstVisit: (isFirst: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Check if location is already saved on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    const hasVisited = localStorage.getItem('hasVisited');

    if (savedLocation) {
      try {
        const parsedLocation = JSON.parse(savedLocation);
        setLocationState(parsedLocation);
        setShowLocationModal(false);
        setIsFirstVisit(false);
      } catch (err) {
        console.error('Failed to parse saved location:', err);
        setShowLocationModal(true);
        setIsFirstVisit(true);
      }
    } else {
      // No saved location, show modal on first visit
      setShowLocationModal(true);
      setIsFirstVisit(true);
    }

    if (hasVisited) {
      setIsFirstVisit(false);
    }
  }, []);

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
    localStorage.setItem('hasVisited', 'true');
    setShowLocationModal(false);
    setIsFirstVisit(false);
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        showLocationModal,
        setShowLocationModal,
        error,
        setError,
        isFirstVisit,
        setIsFirstVisit,
      }}
    >
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
