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

export interface SavedLocation extends Location {
  id: string;
  label: string; // Home, Work, Other, etc.
  createdAt: number;
}

interface LocationContextType {
  location: Location | null;
  setLocation: (location: Location) => void;
  savedLocations: SavedLocation[];
  addSavedLocation: (location: Location, label: string) => void;
  removeSavedLocation: (id: string) => void;
  selectSavedLocation: (id: string) => void;
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
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  // Check if location is already saved on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    const savedLocationsList = localStorage.getItem('savedLocations');
    const hasVisited = localStorage.getItem('hasVisited');

    if (savedLocationsList) {
      try {
        const parsedList = JSON.parse(savedLocationsList);
        setSavedLocations(parsedList);
      } catch (err) {
        console.error('Failed to parse saved locations:', err);
      }
    }

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

  const addSavedLocation = (newLocation: Location, label: string) => {
    const savedLocation: SavedLocation = {
      ...newLocation,
      id: Date.now().toString(),
      label,
      createdAt: Date.now(),
    };
    const updated = [...savedLocations, savedLocation];
    setSavedLocations(updated);
    localStorage.setItem('savedLocations', JSON.stringify(updated));
  };

  const removeSavedLocation = (id: string) => {
    const updated = savedLocations.filter(loc => loc.id !== id);
    setSavedLocations(updated);
    localStorage.setItem('savedLocations', JSON.stringify(updated));
  };

  const selectSavedLocation = (id: string) => {
    const selected = savedLocations.find(loc => loc.id === id);
    if (selected) {
      const { id: _, label: __, createdAt: ___, ...locationData } = selected;
      setLocation(locationData as Location);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        savedLocations,
        addSavedLocation,
        removeSavedLocation,
        selectSavedLocation,
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
