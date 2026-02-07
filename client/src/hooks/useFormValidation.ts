import { useState, useCallback, useRef } from 'react';

export interface FormField {
  id: string;
  name: string;
  value: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  minLength?: number;
}

export interface ValidationError {
  [fieldId: string]: string;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationError>({});
  const fieldRefsMap = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());

  const registerField = useCallback((fieldId: string, ref: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (ref) {
      fieldRefsMap.current.set(fieldId, ref);
    } else {
      fieldRefsMap.current.delete(fieldId);
    }
  }, []);

  const validateField = useCallback((field: FormField): string | null => {
    // Check if required and empty
    if (field.required && !field.value.trim()) {
      return `${field.name} مطلوب`;
    }

    // Skip other validations if field is empty and not required
    if (!field.value.trim()) {
      return null;
    }

    // Email validation
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        return `${field.name} يجب أن يكون بريد إلكتروني صحيح`;
      }
    }

    // Phone validation
    if (field.type === 'tel') {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(field.value) || field.value.replace(/\D/g, '').length < 7) {
        return `${field.name} يجب أن يكون رقم هاتف صحيح`;
      }
    }

    // Min length validation
    if (field.minLength && field.value.trim().length < field.minLength) {
      return `${field.name} يجب أن يكون ${field.minLength} أحرف على الأقل`;
    }

    return null;
  }, []);

  const validate = useCallback((fields: FormField[]): boolean => {
    const newErrors: ValidationError = {};
    let firstInvalidFieldId: string | null = null;

    fields.forEach(field => {
      const error = validateField(field);
      if (error) {
        newErrors[field.id] = error;
        if (!firstInvalidFieldId) {
          firstInvalidFieldId = field.id;
        }
      }
    });

    setErrors(newErrors);

    // Scroll to first invalid field
    if (firstInvalidFieldId) {
      const fieldRef = fieldRefsMap.current.get(firstInvalidFieldId);
      if (fieldRef) {
        setTimeout(() => {
          fieldRef.focus();
          fieldRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }

    return Object.keys(newErrors).length === 0;
  }, [validateField]);

  const clearError = useCallback((fieldId: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validate,
    clearError,
    clearAllErrors,
    registerField,
  };
}
