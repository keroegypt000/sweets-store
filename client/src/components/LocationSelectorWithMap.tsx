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

interface LocationSelectorWithMapProps {
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
}: LocationSelectorWithMapProps) {
  const [step, setStep] = useState<'initial' | 'map' | 'address'>('initial');
  const [selectedLocation, setSelectedLocation] = useState<Partial<Location> | null>(null);
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!isOpen || step !== 'map' || !mapContainer.current) return;

    try {
      const defaultLat = selectedLocation?.latitude || 29.3759;
      const defaultLng = selectedLocation?.longitude || 47.9774;

      if (map.current) {
        map.current.remove();
      }

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
      console.error('[Map] Error loading map:', err);
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
      // Try Google Geocoding API first if key exists
      const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      let geocodeData: any = null;

      if (googleApiKey) {
        try {
          const googleResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`
          );
          const googleData = await googleResponse.json() as any;
          if (googleData.results && googleData.results.length > 0) {
            geocodeData = googleData.results[0];
            console.log('[Geocoding] Google API response:', geocodeData);
          }
        } catch (err) {
          console.warn('[Geocoding] Google API failed, falling back to Nominatim:', err);
        }
      }

      // Fallback to OpenStreetMap Nominatim
      if (!geocodeData) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        );
        geocodeData = await response.json() as any;
        console.log('[Geocoding] Nominatim response:', geocodeData);
      }

      // Extract address components
      let area = '';
      let block = '';
      let street = '';
      let avenue = '';
      let houseNumber = '';
      let displayName = '';

      if (geocodeData.address_components) {
        // Google Geocoding API format
        geocodeData.address_components.forEach((component: any) => {
          const types = component.types || [];
          const longName = component.long_name || '';

          if (types.includes('administrative_area_level_1')) area = longName;
          if (types.includes('administrative_area_level_2')) area = area || longName;
          if (types.includes('administrative_area_level_3')) block = block || longName;
          if (types.includes('locality')) area = area || longName;
          if (types.includes('sublocality')) avenue = avenue || longName;
          if (types.includes('sublocality_level_1')) avenue = avenue || longName;
          if (types.includes('route')) street = longName;
          if (types.includes('street_number')) houseNumber = longName;
        });
        displayName = geocodeData.formatted_address || '';
      } else if (geocodeData.address) {
        // OpenStreetMap Nominatim format
        const addr = geocodeData.address;
        area = addr.state || addr.province || addr.county || addr.district || addr.suburb || '';
        block = addr.postcode || addr.hamlet || '';
        street = addr.road || addr.street || '';
        avenue = addr.neighbourhood || addr.suburb || addr.village || '';
        houseNumber = addr.house_number || '';
        displayName = geocodeData.display_name || '';
      }

      console.log('[Geocoding] Extracted fields:', { area, block, street, avenue, houseNumber });

      setSelectedLocation({
        latitude: lat,
        longitude: lng,
        address: displayName || `${lat}, ${lng}`,
        area: area.trim(),
        block: block.trim(),
        street: street.trim(),
        avenue: avenue.trim(),
        houseNumber: houseNumber.trim(),
        city: area.trim(),
        country: geocodeData.address?.country || '',
      });
    } catch (err) {
      console.error('[Geocoding] Error:', err);
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
        console.log('[Geolocation] Got position:', { latitude, longitude });
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
        console.error('[Geolocation] Error:', err);
        if (err.code === err.PERMISSION_DENIED) {
          setError(
            language === 'ar'
              ? 'يرجى تفعيل خدمات الموقع من إعدادات المتصفح'
              : 'Please enable location services in your browser settings'
          );
        } else {
          setError(language === 'ar' ? 'خطأ في الحصول على الموقع' : 'Error getting location');
        }
        setIsLoadingGeolocation(false);
      }
    );
  };

  const handleSelectOnMap = () => {
    console.log('[Location] Select on map clicked');
    setStep('map');
    setSelectedLocation({
      latitude: 29.3759,
      longitude: 47.9774,
    });
    reverseGeocode(29.3759, 47.9774);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
      console.log('[Location] Confirming location:', selectedLocation);
      onConfirm(selectedLocation as Location);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className={`text-lg font-bold ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {language === 'ar' ? 'اختر موقعك' : 'Choose your location'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'initial' && (
            <div className="space-y-4">
              <p className={`text-sm text-gray-600 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'اختر طريقة تحديد موقعك' : 'Choose how to set your location'}
              </p>

              <button
                onClick={handleUseCurrentLocation}
                disabled={isLoadingGeolocation}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {isLoadingGeolocation && <Loader2 className="w-4 h-4 animate-spin" />}
                <MapPin className="w-4 h-4" />
                {language === 'ar' ? 'استخدم موقعي الحالي' : 'Use my current location'}
              </button>

              <button
                onClick={handleSelectOnMap}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                {language === 'ar' ? 'اختر من الخريطة' : 'Select on map'}
              </button>

              {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === 'map' && (
            <div className="space-y-4">
              <div
                ref={mapContainer}
                className="w-full h-80 rounded-lg border border-gray-300"
              />

              {selectedLocation && (
                <div className="space-y-4">
                  <AddressForm
                    location={selectedLocation as Location}
                    onSave={(location) => {
                      setSelectedLocation(location);
                      handleConfirmLocation();
                    }}
                    language={language}
                  />

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setStep('initial')}
                      variant="outline"
                      className="flex-1"
                    >
                      {language === 'ar' ? 'رجوع' : 'Back'}
                    </Button>
                    <Button
                      onClick={handleConfirmLocation}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {language === 'ar' ? 'تأكيد' : 'Confirm'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
