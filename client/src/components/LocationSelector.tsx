import React, { useState, useEffect, useRef } from 'react';
import { useLocation as useLocationContext } from '@/contexts/LocationContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, Check } from 'lucide-react';
import { toast } from 'sonner';

interface LocationSelectorProps {
  onConfirm?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function LocationSelector({ onConfirm, isOpen = true, onClose }: LocationSelectorProps) {
  const { location, setLocation, error } = useLocationContext();
  const { language } = useLanguage();
  const [selectedLocation, setSelectedLocation] = useState(location);
  const [isLoadingMap, setIsLoadingMap] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (location) {
      setSelectedLocation(location);
      setManualAddress(location.address);
    }
  }, [location]);

  // Initialize Google Map
  useEffect(() => {
    if (!isOpen || !mapRef.current || !selectedLocation) return;

    const initMap = async () => {
      setIsLoadingMap(true);
      try {
        // Check if Google Maps is already loaded
        if (typeof window !== 'undefined' && !(window as any).google?.maps) {
          // Load Google Maps script
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDemoKey'}&libraries=places`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
          
          await new Promise(resolve => {
            script.onload = resolve;
          });
        }

        const google = (window as any).google;
        if (!google?.maps) {
          console.warn('Google Maps not available, using fallback');
          setIsLoadingMap(false);
          return;
        }

        const map = new google.maps.Map(mapRef.current, {
          zoom: 15,
          center: {
            lat: selectedLocation.latitude,
            lng: selectedLocation.longitude,
          },
          mapTypeControl: false,
          fullscreenControl: false,
        });

        mapInstanceRef.current = map;

        // Add marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        markerRef.current = new google.maps.Marker({
          position: {
            lat: selectedLocation.latitude,
            lng: selectedLocation.longitude,
          },
          map: map,
          draggable: true,
        });

        // Update location when marker is dragged
        markerRef.current.addListener('dragend', async () => {
          const pos = markerRef.current.getPosition();
          const newLocation = {
            ...selectedLocation,
            latitude: pos.lat(),
            longitude: pos.lng(),
          };
          setSelectedLocation(newLocation);
          
          // Try to reverse geocode
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat()}&lon=${pos.lng()}`
            );
            const data = await response.json();
            setManualAddress(data.address?.road || data.address?.village || data.address?.town || 'Selected Location');
          } catch (err) {
            console.error('Reverse geocoding failed:', err);
          }
        });

        // Click to add marker
        map.addListener('click', async (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          
          markerRef.current.setPosition({ lat, lng });
          
          const newLocation = {
            ...selectedLocation,
            latitude: lat,
            longitude: lng,
          };
          setSelectedLocation(newLocation);

          // Try to reverse geocode
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            setManualAddress(data.address?.road || data.address?.village || data.address?.town || 'Selected Location');
          } catch (err) {
            console.error('Reverse geocoding failed:', err);
          }
        });

        setIsLoadingMap(false);
      } catch (err) {
        console.error('Map initialization error:', err);
        setIsLoadingMap(false);
      }
    };

    initMap();
  }, [isOpen, selectedLocation]);

  const handleConfirm = () => {
    if (selectedLocation) {
      const updatedLocation = {
        ...selectedLocation,
        address: manualAddress || selectedLocation.address,
      };
      setLocation(updatedLocation);
      toast.success(language === 'ar' ? 'تم حفظ الموقع' : 'Location saved');
      onConfirm?.();
    }
  };

  if (!isOpen) return null;



  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto border-red-200">
        <CardContent className="py-4 text-red-600">
          {language === 'ar' ? 'فشل الكشف عن الموقع' : 'Location detection failed'}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {language === 'ar' ? 'اختر موقعك' : 'Select Your Location'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map */}
        <div
          ref={mapRef}
          className="w-full h-64 rounded-lg border border-border"
          style={{ minHeight: '300px' }}
        />

        {isLoadingMap && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>{language === 'ar' ? 'جاري تحميل الخريطة...' : 'Loading map...'}</span>
          </div>
        )}

        {/* Address Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            {language === 'ar' ? 'العنوان' : 'Address'}
          </label>
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder={language === 'ar' ? 'أدخل العنوان' : 'Enter address'}
            className="w-full px-3 py-2 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Coordinates Display */}
        {selectedLocation && (
          <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
            <p>{language === 'ar' ? 'الإحداثيات:' : 'Coordinates:'} {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-primary-yellow text-dark-text hover:bg-accent-yellow"
          >
            <Check className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'تأكيد' : 'Confirm'}
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
