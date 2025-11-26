/**
 * Public Booking Hooks
 * React hooks for public booking functionality (form submission, availability)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  createBooking,
  getAvailableSlots,
  getBlackoutDates,
  isSlotAvailable,
  BookingServiceError
} from '@/services/bookingService';
import {
  validateBookingForm,
  sanitizeBookingFormData,
  hasValidationErrors
} from '@/lib/booking-validation';
import type {
  Booking,
  BookingFormData,
  BookingFormErrors,
  AvailableSlot,
  BookingBlackoutDate,
  BookingSlotDisplay
} from '@/types/booking';

// Hook return types
interface UseCreateBookingReturn {
  createBooking: (data: BookingFormData) => Promise<boolean>;
  booking: Booking | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

interface UseAvailableSlotsReturn {
  slots: AvailableSlot[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isLoading: boolean;
}

interface UseBlackoutDatesReturn {
  blackoutDates: BookingBlackoutDate[];
  loading: boolean;
  error: string | null;
  isDateBlackedOut: (date: string) => boolean;
  getBlackoutReason: (date: string) => string | null;
}

interface UseBookingFormReturn {
  formData: BookingFormData;
  errors: BookingFormErrors;
  isValid: boolean;
  isSubmitting: boolean;
  updateField: (field: keyof BookingFormData, value: any) => void;
  updateMultipleFields: (updates: Partial<BookingFormData>) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  submitForm: () => Promise<boolean>;
}

interface UseSlotAvailabilityReturn {
  checkAvailability: (date: string, timeSlot: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

// Default form data
const defaultFormData: BookingFormData = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  business_name: '',
  business_type: 'Other',
  business_location: '',
  current_marketing: [],
  biggest_challenge: '',
  monthly_revenue_range: '$0 - $5,000',
  preferred_date: '',
  preferred_time_slot: '',
  additional_notes: ''
};

/**
 * Hook for creating new bookings
 */
export const useCreateBooking = (): UseCreateBookingReturn => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createBookingData = useCallback(async (data: BookingFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Sanitize input data
      const sanitizedData = sanitizeBookingFormData(data);

      // Create booking
      const newBooking = await createBooking(sanitizedData);
      setBooking(newBooking);
      setSuccess(true);

      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to create booking. Please try again.';
      setError(errorMessage);
      console.error('Error creating booking:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setBooking(null);
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, []);

  return {
    createBooking: createBookingData,
    booking,
    loading,
    error,
    success,
    reset
  };
};

/**
 * Hook for fetching available time slots
 * @param startDate - Start date for availability check
 * @param endDate - End date for availability check
 */
export const useAvailableSlots = (
  startDate: string,
  endDate: string
): UseAvailableSlotsReturn => {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSlots = useCallback(async () => {
    console.log('useAvailableSlots: fetchSlots called with', { startDate, endDate });
    if (!startDate || !endDate) {
      console.log('useAvailableSlots: Missing dates, returning empty');
      setSlots([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getAvailableSlots(startDate, endDate);
      console.log('useAvailableSlots: Received slots:', data?.length, 'slots');
      setSlots(data);
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to load available time slots';
      setError(errorMessage);
      setSlots([]);
      console.error('useAvailableSlots: Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const refetch = useCallback(async () => {
    await fetchSlots();
  }, [fetchSlots]);

  return {
    slots,
    loading,
    error,
    refetch,
    isLoading: loading
  };
};

/**
 * Hook for managing blackout dates
 * @param startDate - Start date for blackout check
 * @param endDate - End date for blackout check
 */
export const useBlackoutDates = (
  startDate: string,
  endDate: string
): UseBlackoutDatesReturn => {
  const [blackoutDates, setBlackoutDates] = useState<BookingBlackoutDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlackoutDates = async () => {
      if (!startDate || !endDate) {
        setBlackoutDates([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getBlackoutDates(startDate, endDate);
        setBlackoutDates(data);
      } catch (err) {
        const errorMessage = err instanceof BookingServiceError
          ? err.message
          : 'Failed to load blackout dates';
        setError(errorMessage);
        setBlackoutDates([]);
        console.error('Error fetching blackout dates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlackoutDates();
  }, [startDate, endDate]);

  const isDateBlackedOut = useCallback((date: string): boolean => {
    return blackoutDates.some(blackout => blackout.date === date);
  }, [blackoutDates]);

  const getBlackoutReason = useCallback((date: string): string | null => {
    const blackout = blackoutDates.find(b => b.date === date);
    return blackout?.reason || null;
  }, [blackoutDates]);

  return {
    blackoutDates,
    loading,
    error,
    isDateBlackedOut,
    getBlackoutReason
  };
};

/**
 * Hook for comprehensive booking form management
 * @param initialData - Initial form data
 * @param availableSlots - Available time slots for validation
 * @param blackoutDates - Blackout dates for validation
 */
export const useBookingForm = (
  initialData: Partial<BookingFormData> = {},
  availableSlots: string[] = [],
  blackoutDates: BookingBlackoutDate[] = []
): UseBookingFormReturn => {
  const [formData, setFormData] = useState<BookingFormData>({
    ...defaultFormData,
    ...initialData
  });
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createBooking: submitBooking } = useCreateBooking();

  // Memoized validation
  const isValid = useMemo(() => {
    return !hasValidationErrors(errors);
  }, [errors]);

  // Update single field
  const updateField = useCallback((field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Update multiple fields
  const updateMultipleFields = useCallback((updates: Partial<BookingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));

    // Clear errors for updated fields
    const updatedFields = Object.keys(updates) as Array<keyof BookingFormData>;
    setErrors(prev => {
      const newErrors = { ...prev };
      updatedFields.forEach(field => {
        if (newErrors[field]) {
          delete newErrors[field];
        }
      });
      return newErrors;
    });
  }, []);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const validationErrors = validateBookingForm(formData, blackoutDates, availableSlots);
    setErrors(validationErrors);
    return !hasValidationErrors(validationErrors);
  }, [formData, blackoutDates, availableSlots]);

  // Submit form
  const submitForm = useCallback(async (): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      // Validate before submitting
      if (!validateForm()) {
        return false;
      }

      // Submit booking
      const success = await submitBooking(formData);
      if (success) {
        // Reset form on successful submission
        setFormData(defaultFormData);
        setErrors({});
      }

      return success;
    } catch (err) {
      console.error('Error submitting booking form:', err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, submitBooking]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
    setErrors({});
    setIsSubmitting(false);
  }, []);

  return {
    formData,
    errors,
    isValid,
    isSubmitting,
    updateField,
    updateMultipleFields,
    validateForm,
    resetForm,
    submitForm
  };
};

/**
 * Hook for checking slot availability in real-time
 */
export const useSlotAvailability = (): UseSlotAvailabilityReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async (
    date: string,
    timeSlot: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const available = await isSlotAvailable(date, timeSlot);
      return available;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to check slot availability';
      setError(errorMessage);
      console.error('Error checking slot availability:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkAvailability,
    loading,
    error
  };
};

/**
 * Hook for formatting available slots for display
 * @param slots - Raw available slots data
 */
export const useFormattedSlots = (slots: AvailableSlot[]): BookingSlotDisplay[] => {
  return useMemo(() => {
    // Group slots by date
    const slotsByDate = slots.reduce((acc, slot) => {
      if (!acc[slot.slot_date]) {
        acc[slot.slot_date] = [];
      }
      acc[slot.slot_date].push(slot);
      return acc;
    }, {} as Record<string, AvailableSlot[]>);

    // Convert to display format
    return Object.entries(slotsByDate).map(([date, dateSlots]) => {
      // Format date for display
      const dateObj = new Date(date);
      const displayDate = dateObj.toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Format time slots
      const timeSlots = dateSlots.map(slot => {
        // Convert 24h time to 12h format
        const startTime = new Date(`1970-01-01T${slot.start_time}`).toLocaleTimeString('en-AU', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        const endTime = new Date(`1970-01-01T${slot.end_time}`).toLocaleTimeString('en-AU', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        return {
          time: `${startTime} - ${endTime}`,
          value: `${slot.start_time}-${slot.end_time}`,
          available: slot.available_count > 0,
          availableCount: slot.available_count
        };
      });

      return {
        date,
        displayDate,
        timeSlots: timeSlots.sort((a, b) => a.value.localeCompare(b.value))
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [slots]);
};

/**
 * Hook for auto-saving form data to localStorage
 * @param formData - Current form data
 * @param key - Storage key (default: 'booking-form-draft')
 */
export const useFormAutoSave = (
  formData: BookingFormData,
  key: string = 'booking-form-draft'
) => {
  // Save to localStorage on form change
  useEffect(() => {
    // Only save if form has meaningful data
    const hasData = formData.customer_name || formData.customer_email || formData.business_name;
    if (hasData) {
      try {
        localStorage.setItem(key, JSON.stringify(formData));
      } catch (err) {
        console.warn('Failed to save form data to localStorage:', err);
      }
    }
  }, [formData, key]);

  // Load from localStorage
  const loadSavedData = useCallback((): Partial<BookingFormData> | null => {
    try {
      const savedData = localStorage.getItem(key);
      return savedData ? JSON.parse(savedData) : null;
    } catch (err) {
      console.warn('Failed to load form data from localStorage:', err);
      return null;
    }
  }, [key]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn('Failed to clear saved form data:', err);
    }
  }, [key]);

  return {
    loadSavedData,
    clearSavedData
  };
};

// Export all hooks
export default {
  useCreateBooking,
  useAvailableSlots,
  useBlackoutDates,
  useBookingForm,
  useSlotAvailability,
  useFormattedSlots,
  useFormAutoSave
};