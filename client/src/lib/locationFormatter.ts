/**
 * Location Formatter Utility
 * Provides consistent formatting for address display across the application
 */

export interface LocationData {
  area?: string | null;
  block?: string | null;
  street?: string | null;
  avenue?: string | null;
  houseNumber?: string | null;
  additionalDetails?: string | null;
}

/**
 * Format location as a single-line summary
 * Example: "📍 Mishrif - Block 4, Street 12, Apt 5"
 */
export function formatLocationSingleLine(location: LocationData | null | undefined, language: 'ar' | 'en' = 'en'): string {
  if (!location) {
    return language === 'ar' ? 'لم يتم تحديد موقع' : 'Location not selected';
  }

  const parts: string[] = [];

  // Add area and block together
  if (location.area || location.block) {
    const areaBlock = [location.area, location.block].filter(Boolean).join(' - ');
    if (areaBlock) parts.push(areaBlock);
  }

  // Add street
  if (location.street) {
    parts.push(location.street);
  }

  // Add avenue
  if (location.avenue) {
    parts.push(location.avenue);
  }

  // Add house number
  if (location.houseNumber) {
    parts.push(location.houseNumber);
  }

  // Add additional details if present
  if (location.additionalDetails) {
    parts.push(location.additionalDetails);
  }

  if (parts.length === 0) {
    return language === 'ar' ? 'لم يتم تحديد موقع' : 'Location not selected';
  }

  return `📍 ${parts.join(', ')}`;
}

/**
 * Format location as multi-line breakdown
 * Returns an array of formatted lines for display
 */
export function formatLocationMultiLine(location: LocationData | null | undefined, language: 'ar' | 'en' = 'en'): Array<{ label: string; value: string }> {
  if (!location) {
    return [];
  }

  const lines: Array<{ label: string; value: string }> = [];

  if (location.area) {
    lines.push({
      label: language === 'ar' ? 'المنطقة' : 'Area',
      value: location.area,
    });
  }

  if (location.block) {
    lines.push({
      label: language === 'ar' ? 'القطعة' : 'Block',
      value: location.block,
    });
  }

  if (location.street) {
    lines.push({
      label: language === 'ar' ? 'الشارع' : 'Street',
      value: location.street,
    });
  }

  if (location.avenue) {
    lines.push({
      label: language === 'ar' ? 'الجادة' : 'Avenue',
      value: location.avenue,
    });
  }

  if (location.houseNumber) {
    lines.push({
      label: language === 'ar' ? 'رقم البيت' : 'House Number',
      value: location.houseNumber,
    });
  }

  if (location.additionalDetails) {
    lines.push({
      label: language === 'ar' ? 'تفاصيل إضافية' : 'Additional Details',
      value: location.additionalDetails,
    });
  }

  return lines;
}

/**
 * Format location as full address text
 * Useful for PDF and print formats
 */
export function formatLocationFullAddress(location: LocationData | null | undefined, language: 'ar' | 'en' = 'en'): string {
  if (!location) {
    return language === 'ar' ? 'لم يتم تحديد موقع' : 'Location not selected';
  }

  const parts: string[] = [];

  if (location.area) parts.push(location.area);
  if (location.block) parts.push(`${language === 'ar' ? 'القطعة' : 'Block'} ${location.block}`);
  if (location.street) parts.push(location.street);
  if (location.avenue) parts.push(location.avenue);
  if (location.houseNumber) parts.push(`${language === 'ar' ? 'رقم' : '#'} ${location.houseNumber}`);
  if (location.additionalDetails) parts.push(location.additionalDetails);

  return parts.join(', ');
}
