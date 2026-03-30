import React, { useState } from 'react';
import { Location } from '../contexts/LocationContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface AddressFormProps {
  location: Location;
  onSave: (location: Location) => void;
  language: 'ar' | 'en';
}

export default function AddressForm({ location, onSave, language }: AddressFormProps) {
  const [formData, setFormData] = useState<Location>(location);

  const handleChange = (field: keyof Location, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.area || !formData.block || !formData.street || !formData.houseNumber) {
      alert(language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }
    onSave(formData);
  };

  const labels = {
    area: language === 'ar' ? 'المنطقة *' : 'Area *',
    block: language === 'ar' ? 'القطعة *' : 'Block *',
    street: language === 'ar' ? 'الشارع *' : 'Street *',
    avenue: language === 'ar' ? 'الجادة' : 'Avenue',
    houseNumber: language === 'ar' ? 'رقم البيت *' : 'House Number *',
    additionalDetails: language === 'ar' ? 'تفاصيل إضافية' : 'Additional Details',
  };

  const placeholders = {
    area: language === 'ar' ? 'مثال: المنطقة 1' : 'e.g., Area 1',
    block: language === 'ar' ? 'مثال: قطعة 5' : 'e.g., Block 5',
    street: language === 'ar' ? 'مثال: شارع الخليج' : 'e.g., Gulf Street',
    avenue: language === 'ar' ? 'مثال: جادة الملك' : 'e.g., King Avenue',
    houseNumber: language === 'ar' ? 'مثال: 123' : 'e.g., 123',
    additionalDetails: language === 'ar' ? 'ملاحظات إضافية' : 'Additional notes',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h3 className={`text-lg font-semibold ${language === 'ar' ? 'text-right' : 'text-left'}`}>
        {language === 'ar' ? 'تفاصيل العنوان' : 'Address Details'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Area */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
            {labels.area}
          </label>
          <Input
            type="text"
            value={formData.area || ''}
            onChange={(e) => handleChange('area', e.target.value)}
            placeholder={placeholders.area}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            required
          />
        </div>

        {/* Block */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
            {labels.block}
          </label>
          <Input
            type="text"
            value={formData.block || ''}
            onChange={(e) => handleChange('block', e.target.value)}
            placeholder={placeholders.block}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            required
          />
        </div>

        {/* Street */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
            {labels.street}
          </label>
          <Input
            type="text"
            value={formData.street || ''}
            onChange={(e) => handleChange('street', e.target.value)}
            placeholder={placeholders.street}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            required
          />
        </div>

        {/* Avenue */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
            {labels.avenue}
          </label>
          <Input
            type="text"
            value={formData.avenue || ''}
            onChange={(e) => handleChange('avenue', e.target.value)}
            placeholder={placeholders.avenue}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
          />
        </div>

        {/* House Number */}
        <div>
          <label className={`block text-sm font-medium mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
            {labels.houseNumber}
          </label>
          <Input
            type="text"
            value={formData.houseNumber || ''}
            onChange={(e) => handleChange('houseNumber', e.target.value)}
            placeholder={placeholders.houseNumber}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            required
          />
        </div>
      </div>

      {/* Additional Details */}
      <div>
        <label className={`block text-sm font-medium mb-1 ${language === 'ar' ? 'text-right' : ''}`}>
          {labels.additionalDetails}
        </label>
        <textarea
          value={formData.additionalDetails || ''}
          onChange={(e) => handleChange('additionalDetails', e.target.value)}
          placeholder={placeholders.additionalDetails}
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-yellow"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-primary-yellow text-dark-text hover:bg-yellow-500"
      >
        {language === 'ar' ? 'حفظ العنوان' : 'Save Address'}
      </Button>
    </form>
  );
}
