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
  isDetecting: boolean;
  error: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<Location | null>(null);
  const [isDetecting, setIsDetecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detect location on mount
  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Try to get location from localStorage first
        const savedLocation = localStorage.getItem('userLocation');
        if (savedLocation) {
          setLocationState(JSON.parse(savedLocation));
          setIsDetecting(false);
          return;
        }

        // Try GPS first
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // Reverse geocode to get address
              try {
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const data = await response.json();
                
                const newLocation: Location = {
                  latitude,
                  longitude,
                  address: data.address?.road || data.address?.village || data.address?.town || 'Detected Location',
                  city: data.address?.city || data.address?.town,
                  country: data.address?.country,
                };
                
                setLocationState(newLocation);
                localStorage.setItem('userLocation', JSON.stringify(newLocation));
              } catch (err) {
                // If reverse geocoding fails, still save the coordinates
                const newLocation: Location = {
                  latitude,
                  longitude,
                  address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                };
                setLocationState(newLocation);
                localStorage.setItem('userLocation', JSON.stringify(newLocation));
              }
              setIsDetecting(false);
            },
            (err) => {
              // GPS failed, try IP-based detection
              detectLocationByIP();
            },
            { timeout: 5000 }
          );
        } else {
          // Geolocation not supported, use IP-based detection
          detectLocationByIP();
        }
      } catch (err) {
        console.error('Location detection error:', err);
        setError('Could not detect location');
        setIsDetecting(false);
      }
    };

    const detectLocationByIP = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        const newLocation: Location = {
          latitude: data.latitude,
          longitude: data.longitude,
          address: `${data.city}, ${data.region}`,
          city: data.city,
          country: data.country_name,
        };
        
        setLocationState(newLocation);
        localStorage.setItem('userLocation', JSON.stringify(newLocation));
        setIsDetecting(false);
      } catch (err) {
        console.error('IP-based location detection failed:', err);
        setError('Could not detect location');
        setIsDetecting(false);
      }
    };

    detectLocation();
  }, []);

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
  };

  return (
    <LocationContext.Provider value={{ location, setLocation, isDetecting, error }}>
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
