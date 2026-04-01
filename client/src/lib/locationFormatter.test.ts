import { describe, it, expect } from 'vitest';
import {
  formatLocationSingleLine,
  formatLocationMultiLine,
  formatLocationFullAddress,
  type LocationData,
} from './locationFormatter';

describe('Location Formatter Utility', () => {
  describe('formatLocationSingleLine', () => {
    it('should format complete location as single line', () => {
      const location: LocationData = {
        area: 'Mishrif',
        block: '4',
        street: 'Street 12',
        avenue: 'Avenue A',
        houseNumber: '5',
        additionalDetails: 'Apt 5B',
      };

      const result = formatLocationSingleLine(location, 'en');
      expect(result).toContain('📍');
      expect(result).toContain('Mishrif');
      expect(result).toContain('4');
      expect(result).toContain('Street 12');
    });

    it('should handle partial location data', () => {
      const location: LocationData = {
        area: 'Mishrif',
        block: '4',
      };

      const result = formatLocationSingleLine(location, 'en');
      expect(result).toContain('📍');
      expect(result).toContain('Mishrif');
      expect(result).toContain('4');
    });

    it('should return default message for null location', () => {
      const result = formatLocationSingleLine(null, 'en');
      expect(result).toBe('Location not selected');
    });

    it('should return Arabic default message for null location', () => {
      const result = formatLocationSingleLine(null, 'ar');
      expect(result).toBe('لم يتم تحديد موقع');
    });

    it('should return default message for empty location', () => {
      const location: LocationData = {};
      const result = formatLocationSingleLine(location, 'en');
      expect(result).toBe('Location not selected');
    });

    it('should format location in Arabic', () => {
      const location: LocationData = {
        area: 'المنطقة',
        block: '4',
      };

      const result = formatLocationSingleLine(location, 'ar');
      expect(result).toContain('📍');
      expect(result).toContain('المنطقة');
    });
  });

  describe('formatLocationMultiLine', () => {
    it('should format location as array of labeled lines', () => {
      const location: LocationData = {
        area: 'Mishrif',
        block: '4',
        street: 'Street 12',
      };

      const result = formatLocationMultiLine(location, 'en');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ label: 'Area', value: 'Mishrif' });
      expect(result[1]).toEqual({ label: 'Block', value: '4' });
      expect(result[2]).toEqual({ label: 'Street', value: 'Street 12' });
    });

    it('should return empty array for null location', () => {
      const result = formatLocationMultiLine(null, 'en');
      expect(result).toEqual([]);
    });

    it('should include all address fields when present', () => {
      const location: LocationData = {
        area: 'Mishrif',
        block: '4',
        street: 'Street 12',
        avenue: 'Avenue A',
        houseNumber: '5',
        additionalDetails: 'Apt 5B',
      };

      const result = formatLocationMultiLine(location, 'en');
      expect(result).toHaveLength(6);
      expect(result.map(r => r.label)).toEqual([
        'Area',
        'Block',
        'Street',
        'Avenue',
        'House Number',
        'Additional Details',
      ]);
    });

    it('should format labels in Arabic', () => {
      const location: LocationData = {
        area: 'المنطقة',
        block: '4',
      };

      const result = formatLocationMultiLine(location, 'ar');
      expect(result[0].label).toBe('المنطقة');
      expect(result[1].label).toBe('القطعة');
    });
  });

  describe('formatLocationFullAddress', () => {
    it('should format complete address as full text', () => {
      const location: LocationData = {
        area: 'Mishrif',
        block: '4',
        street: 'Street 12',
        avenue: 'Avenue A',
        houseNumber: '5',
        additionalDetails: 'Apt 5B',
      };

      const result = formatLocationFullAddress(location, 'en');
      expect(result).toContain('Mishrif');
      expect(result).toContain('Block 4');
      expect(result).toContain('Street 12');
      expect(result).toContain('Avenue A');
      expect(result).toContain('# 5');
      expect(result).toContain('Apt 5B');
    });

    it('should handle partial location data', () => {
      const location: LocationData = {
        area: 'Mishrif',
        block: '4',
      };

      const result = formatLocationFullAddress(location, 'en');
      expect(result).toContain('Mishrif');
      expect(result).toContain('Block 4');
    });

    it('should return default message for null location', () => {
      const result = formatLocationFullAddress(null, 'en');
      expect(result).toBe('Location not selected');
    });

    it('should format in Arabic with Arabic labels', () => {
      const location: LocationData = {
        area: 'المنطقة',
        houseNumber: '5',
      };

      const result = formatLocationFullAddress(location, 'ar');
      expect(result).toContain('المنطقة');
      expect(result).toContain('رقم 5');
    });
  });
});
