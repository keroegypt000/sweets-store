import { useState, useCallback, useRef } from 'react';

export interface FormField {
  name: string;
  value: string;
  required?: boolean;
  type?: 'text' | 'email' | 'tel' | 'textarea';
  minLength?: number;
}

export interface ValidationError {
  [fieldName: string]: string;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationError>({});
  const fieldRefsMap = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());

  const registerField = useCallback((fieldName: string, ref: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (ref) {
      fieldRefsMap.current.set(fieldName, ref);
    } else {
      fieldRefsMap.current.delete(fieldName);
    }
  }, []);

  const validateField = useCallback((field: FormField): string | null => {
    if (field.required && !field.value.trim()) {
      return `${field.name} is required`;
    }

    if (field.type === 'email' && field.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        return `${field.name} must be a valid email`;
      }
    }

    if (field.type === 'tel' && field.value.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(field.value) || field.value.replace(/\D/g, '').length < 7) {
        return `${field.name} must be a valid phone number`;
      }
    }

    if (field.minLength && field.value.trim().length < field.minLength) {
      return `${field.name} must be at least ${field.minLength} characters`;
    }

    return null;
  }, []);

  const validate = useCallback((fields: FormField[]): boolean => {
    const newErrors: ValidationError = {};
    let firstInvalidFieldName: string | null = null;

    fields.forEach(field => {
      const error = validateField(field);
      if (error) {
        newErrors[field.name] = error;
        if (!firstInvalidFieldName) {
          firstInvalidFieldName = field.name;
        }
      }
    });

    setErrors(newErrors);

    // Scroll to first invalid field
    if (firstInvalidFieldName) {
      const fieldRef = fieldRefsMap.current.get(firstInvalidFieldName);
      if (fieldRef) {
        setTimeout(() => {
          fieldRef.focus();
          fieldRef.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }

    return Object.keys(newErrors).length === 0;
  }, [validateField]);

  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
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
