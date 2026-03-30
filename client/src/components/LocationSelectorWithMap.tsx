import React, { useState, useEffect, useRef } from 'react';
import L, { LeafletMouseEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
import { Location } from '../contexts/LocationContext';
import { Button } from './ui/button';
import { X, MapPin, Loader2 } from 'lucide-react';
import AddressForm from './AddressForm';

interface LocationSelectorProps {
  isOpen: boolean;
  onConfirm: (location: Location) => void;
  onClose: () => void;
  language: 'ar' | 'en';
}

export default function LocationSelectorWithMap({
  isOpen,
  onConfirm,
  onClose,
  language,
}: LocationSelectorProps) {
  const [step, setStep] = useState<'options' | 'map' | 'address'>('options');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!isOpen || step !== 'map' || !mapContainer.current) return;

    // Prevent multiple map instances
    if (map.current) return;

    // Default location (Kuwait)
    const defaultLat = 29.3759;
    const defaultLng = 47.9774;

    try {
      // Initialize map
      map.current = L.map(mapContainer.current).setView([defaultLat, defaultLng], 13);

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);

      // Add draggable marker
      marker.current = L.marker([defaultLat, defaultLng], {
        draggable: true,
      }).addTo(map.current);

      // Update location on marker drag
      marker.current.on('dragend', () => {
        if (marker.current) {
          const latLng = marker.current.getLatLng();
          reverseGeocode(latLng.lat, latLng.lng);
        }
      }) as any;

      // Allow clicking on map to place marker
      map.current.on('click', (e: LeafletMouseEvent) => {
        if (marker.current) {
          marker.current.setLatLng(e.latlng);
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        }
      });

      // Initial location
      reverseGeocode(defaultLat, defaultLng);
    } catch (err) {
      console.error('Map initialization error:', err);
      setError(language === 'ar' ? 'خطأ في تحميل الخريطة' : 'Error loading map');
    }

    return () => {
      // Cleanup map on unmount
      if (map.current) {
        map.current.remove();
        map.current = null as any;
        marker.current = null as any;
      }
    };
  }, [isOpen, step, language]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json() as any;

      const address = data.address || {};
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
        address: data.display_name || `${lat}, ${lng}`,
        area: address.suburb || address.district || '',
        city: address.city || address.town || '',
        country: address.country || '',
      });
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
        address: `${lat}, ${lng}`,
      });
    }
  };

  const handleUseCurrentLocation = async () => {
    setIsLoadingGeolocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(language === 'ar' ? 'الخدمة غير متاحة' : 'Geolocation not available');
      setIsLoadingGeolocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setStep('map');
        setIsLoadingGeolocation(false);

        // Update map and marker after step changes
        setTimeout(() => {
          if (map.current && marker.current) {
            map.current.setView([latitude, longitude], 13);
            marker.current.setLatLng([latitude, longitude]);
            reverseGeocode(latitude, longitude);
          }
        }, 100);
      },
      (err) => {
        console.error('Geolocation error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setError(
            language === 'ar'
              ? 'يرجى تفعيل خدمات الموقع من إعدادات المتصفح'
              : 'Please enable location services in browser settings'
          );
        } else {
          setError(language === 'ar' ? 'خطأ في الحصول على الموقع' : 'Error getting location');
        }
        setIsLoadingGeolocation(false);
      }
    );
  };

  const handleSelectOnMap = () => {
    setStep('map');
    setError(null);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      setStep('address');
    }
  };

  const handleSaveAddress = (location: Location) => {
    onConfirm(location);
    setStep('options');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className={`text-xl font-semibold ${language === 'ar' ? 'text-right' : ''}`}>
            {step === 'options' && (language === 'ar' ? 'اختر موقعك' : 'Choose Your Location')}
            {step === 'map' && (language === 'ar' ? 'حدد موقعك على الخريطة' : 'Select Location on Map')}
            {step === 'address' && (language === 'ar' ? 'أدخل تفاصيل العنوان' : 'Enter Address Details')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Options Step */}
          {step === 'options' && (
            <div className="space-y-4">
              <p className={`text-gray-600 ${language === 'ar' ? 'text-right' : ''}`}>
                {language === 'ar'
                  ? 'اختر طريقة لتحديد موقعك'
                  : 'Choose how to select your location'}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleUseCurrentLocation}
                  disabled={isLoadingGeolocation}
                  className="w-full bg-primary-yellow text-dark-text hover:bg-yellow-500 flex items-center justify-center gap-2"
                >
                  {isLoadingGeolocation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {language === 'ar' ? 'جاري الحصول على الموقع...' : 'Getting location...'}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      {language === 'ar'
                        ? 'استخدم موقعي الحالي'
                        : 'Use My Current Location'}
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleSelectOnMap}
                  className="w-full bg-gray-600 text-white hover:bg-gray-700 flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {language === 'ar' ? 'اختر من الخريطة' : 'Select on Map'}
                </Button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Map Step */}
          {step === 'map' && (
            <div className="space-y-4">
              <div
                ref={mapContainer}
                className="w-full h-96 rounded-lg border border-gray-300"
              />

              {selectedLocation && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className={`text-sm text-blue-900 ${language === 'ar' ? 'text-right' : ''}`}>
                    {selectedLocation.address}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep('options')}
                  className="flex-1 bg-gray-300 text-dark-text hover:bg-gray-400"
                >
                  {language === 'ar' ? 'رجوع' : 'Back'}
                </Button>
                <Button
                  onClick={handleConfirmLocation}
                  disabled={!selectedLocation}
                  className="flex-1 bg-primary-yellow text-dark-text hover:bg-yellow-500 disabled:bg-gray-300"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </Button>
              </div>
            </div>
          )}

          {/* Address Step */}
          {step === 'address' && selectedLocation && (
            <AddressForm
              location={selectedLocation}
              onSave={handleSaveAddress}
              language={language}
            />
          )}
        </div>
      </div>
    </div>
  );
}
