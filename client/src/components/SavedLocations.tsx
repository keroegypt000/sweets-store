import React from 'react';
import { Trash2, MapPin, Home, Briefcase } from 'lucide-react';
import { SavedLocation } from '@/contexts/LocationContext';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface SavedLocationsProps {
  locations: SavedLocation[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  language: 'ar' | 'en';
}

export default function SavedLocations({
  locations,
  onSelect,
  onDelete,
  language,
}: SavedLocationsProps) {
  if (locations.length === 0) {
    return null;
  }

  const getLocationIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home') || lowerLabel.includes('منزل')) {
      return <Home className="w-4 h-4" />;
    }
    if (lowerLabel.includes('work') || lowerLabel.includes('عمل')) {
      return <Briefcase className="w-4 h-4" />;
    }
    return <MapPin className="w-4 h-4" />;
  };

  const handleDelete = (id: string, label: string) => {
    onDelete(id);
    toast.success(
      language === 'ar'
        ? `تم حذف ${label}`
        : `Deleted ${label}`
    );
  };

  return (
    <div className="space-y-3">
      <p className={`text-sm font-semibold text-gray-700 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
        {language === 'ar' ? 'عناويني المحفوظة' : 'My Saved Addresses'}
      </p>
      <div className="grid grid-cols-1 gap-2">
        {locations.map((location) => (
          <div
            key={location.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <button
              onClick={() => {
                onSelect(location.id);
                toast.success(
                  language === 'ar'
                    ? `تم تحديد ${location.label}`
                    : `Selected ${location.label}`
                );
              }}
              className="flex-1 flex items-center gap-3 text-left"
            >
              <div className="text-blue-600">
                {getLocationIcon(location.label)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-900">
                  {location.label}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {location.area}
                  {location.block && ` - ${language === 'ar' ? 'قطعة' : 'Block'} ${location.block}`}
                </p>
              </div>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(location.id, location.label)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
