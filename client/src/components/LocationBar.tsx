import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Location } from '../contexts/LocationContext';

interface LocationBarProps {
  location: Location | null;
  onChangeClick: () => void;
  language: 'ar' | 'en';
}

export default function LocationBar({
  location,
  onChangeClick,
  language,
}: LocationBarProps) {
  // Format location display
  const getLocationLine1 = () => {
    if (!location) return '';
    const area = location.area || '';
    const block = location.block || '';
    
    if (area && block) {
      return `${area} - ${block}`;
    }
    return area || block || '';
  };

  const getLocationLine2 = () => {
    if (!location) return '';
    const street = location.street || '';
    const avenue = location.avenue || '';
    const houseNumber = location.houseNumber || '';
    
    const parts = [street, avenue, houseNumber].filter(Boolean);
    return parts.join(', ') || location.city || '';
  };

  const line1 = getLocationLine1();
  const line2 = getLocationLine2();

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 cursor-pointer ${
        language === 'ar' ? 'text-right' : 'text-left'
      }`}
      onClick={onChangeClick}
    >
      <div className="flex items-start gap-3">
        {/* Location Icon */}
        <div className="flex-shrink-0 mt-1">
          <MapPin className="w-5 h-5 text-red-500" />
        </div>

        {/* Location Content */}
        <div className="flex-1 min-w-0">
          {location ? (
            <>
              {/* Line 1: Area - Block */}
              <div className="text-sm font-semibold text-gray-900 truncate">
                {line1}
              </div>

              {/* Line 2: Street/Avenue/House Number */}
              {line2 && (
                <div className="text-xs text-gray-600 truncate mt-1">
                  {line2}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm font-medium text-gray-600">
              {language === 'ar' ? 'اختر موقعك' : 'Choose your location'}
            </div>
          )}
        </div>

        {/* Change Button/Dropdown Icon */}
        <div className="flex-shrink-0 flex items-center gap-1 ml-2">
          <span className="text-xs font-medium text-blue-600 hidden sm:inline">
            {language === 'ar' ? 'تغيير' : 'Change'}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
