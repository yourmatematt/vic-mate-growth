/**
 * Time Slots Management Hooks
 * React hooks for managing available time slots (admin functionality)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  addBlackoutDate,
  removeBlackoutDate,
  getBlackoutDates,
  BookingServiceError
} from '@/services/bookingService';
import type {
  AvailableTimeSlot,
  BookingBlackoutDate,
  TimeSlotFormData,
  BlackoutDateFormData
} from '@/types/booking';

// Hook return types
interface UseTimeSlotsReturn {
  timeSlots: AvailableTimeSlot[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  groupedSlots: Record<number, AvailableTimeSlot[]>;
}

interface UseCreateTimeSlotReturn {
  createTimeSlot: (data: TimeSlotFormData) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

interface UseUpdateTimeSlotReturn {
  updateTimeSlot: (id: string, updates: Partial<AvailableTimeSlot>) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

interface UseDeleteTimeSlotReturn {
  deleteTimeSlot: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

interface UseBlackoutDatesManagementReturn {
  blackoutDates: BookingBlackoutDate[];
  loading: boolean;
  error: string | null;
  addDate: (data: BlackoutDateFormData) => Promise<boolean>;
  removeDate: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

interface UseScheduleOverviewReturn {
  weeklySchedule: Array<{
    day: number;
    dayName: string;
    slots: AvailableTimeSlot[];
    totalSlots: number;
    availableSlots: number;
  }>;
  totalWeeklySlots: number;
  loading: boolean;
  error: string | null;
}

// Day names for display
const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

/**
 * Hook for fetching and managing time slots
 */
export const useTimeSlots = (): UseTimeSlotsReturn => {
  const [timeSlots, setTimeSlots] = useState<AvailableTimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getTimeSlots();
      setTimeSlots(data);
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to load time slots';
      setError(errorMessage);
      console.error('Error fetching time slots:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeSlots();
  }, [fetchTimeSlots]);

  const refetch = useCallback(async () => {
    await fetchTimeSlots();
  }, [fetchTimeSlots]);

  // Group slots by day of week
  const groupedSlots = useMemo(() => {
    return timeSlots.reduce((acc, slot) => {
      if (!acc[slot.day_of_week]) {
        acc[slot.day_of_week] = [];
      }
      acc[slot.day_of_week].push(slot);
      return acc;
    }, {} as Record<number, AvailableTimeSlot[]>);
  }, [timeSlots]);

  return {
    timeSlots,
    loading,
    error,
    refetch,
    groupedSlots
  };
};

/**
 * Hook for creating time slots
 */
export const useCreateTimeSlot = (): UseCreateTimeSlotReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTimeSlotData = useCallback(async (data: TimeSlotFormData): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await createTimeSlot(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to create time slot';
      setError(errorMessage);
      console.error('Error creating time slot:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createTimeSlot: createTimeSlotData,
    loading,
    error
  };
};

/**
 * Hook for updating time slots
 */
export const useUpdateTimeSlot = (): UseUpdateTimeSlotReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTimeSlotData = useCallback(async (
    id: string,
    updates: Partial<AvailableTimeSlot>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await updateTimeSlot(id, updates);
      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to update time slot';
      setError(errorMessage);
      console.error('Error updating time slot:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateTimeSlot: updateTimeSlotData,
    loading,
    error
  };
};

/**
 * Hook for deleting time slots
 */
export const useDeleteTimeSlot = (): UseDeleteTimeSlotReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTimeSlotData = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await deleteTimeSlot(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to delete time slot';
      setError(errorMessage);
      console.error('Error deleting time slot:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteTimeSlot: deleteTimeSlotData,
    loading,
    error
  };
};

/**
 * Hook for managing blackout dates
 * @param year - Year to fetch blackout dates for
 */
export const useBlackoutDatesManagement = (year?: number): UseBlackoutDatesManagementReturn => {
  const [blackoutDates, setBlackoutDates] = useState<BookingBlackoutDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate date range for the year
  const startDate = year ? `${year}-01-01` : `${new Date().getFullYear()}-01-01`;
  const endDate = year ? `${year}-12-31` : `${new Date().getFullYear() + 1}-12-31`;

  const fetchBlackoutDates = useCallback(async () => {
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
      console.error('Error fetching blackout dates:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchBlackoutDates();
  }, [fetchBlackoutDates]);

  const addDate = useCallback(async (data: BlackoutDateFormData): Promise<boolean> => {
    try {
      setError(null);

      await addBlackoutDate(data.date, data.reason);
      // Refetch to update the list
      await fetchBlackoutDates();
      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to add blackout date';
      setError(errorMessage);
      console.error('Error adding blackout date:', err);
      return false;
    }
  }, [fetchBlackoutDates]);

  const removeDate = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);

      await removeBlackoutDate(id);
      // Refetch to update the list
      await fetchBlackoutDates();
      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to remove blackout date';
      setError(errorMessage);
      console.error('Error removing blackout date:', err);
      return false;
    }
  }, [fetchBlackoutDates]);

  const refetch = useCallback(async () => {
    await fetchBlackoutDates();
  }, [fetchBlackoutDates]);

  return {
    blackoutDates,
    loading,
    error,
    addDate,
    removeDate,
    refetch
  };
};

/**
 * Hook for getting schedule overview
 */
export const useScheduleOverview = (): UseScheduleOverviewReturn => {
  const { timeSlots, loading, error } = useTimeSlots();

  const weeklySchedule = useMemo(() => {
    const schedule = [];

    for (let day = 0; day < 7; day++) {
      const daySlots = timeSlots.filter(slot => slot.day_of_week === day);
      const availableSlots = daySlots.filter(slot => slot.is_available);

      schedule.push({
        day,
        dayName: DAY_NAMES[day],
        slots: daySlots.sort((a, b) => a.start_time.localeCompare(b.start_time)),
        totalSlots: daySlots.length,
        availableSlots: availableSlots.length
      });
    }

    return schedule;
  }, [timeSlots]);

  const totalWeeklySlots = useMemo(() => {
    return weeklySchedule.reduce((total, day) => total + day.totalSlots, 0);
  }, [weeklySchedule]);

  return {
    weeklySchedule,
    totalWeeklySlots,
    loading,
    error
  };
};

/**
 * Hook for bulk time slot operations
 */
export const useBulkTimeSlotOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createWeeklySchedule = useCallback(async (
    schedule: Array<{
      dayOfWeek: number;
      timeSlots: Array<{
        startTime: string;
        endTime: string;
        maxBookings?: number;
      }>;
    }>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const promises = [];

      for (const day of schedule) {
        for (const slot of day.timeSlots) {
          promises.push(
            createTimeSlot({
              day_of_week: day.dayOfWeek,
              start_time: slot.startTime,
              end_time: slot.endTime,
              max_bookings_per_slot: slot.maxBookings || 1,
              is_available: true
            })
          );
        }
      }

      await Promise.all(promises);
      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to create weekly schedule';
      setError(errorMessage);
      console.error('Error creating weekly schedule:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleMultipleSlots = useCallback(async (
    slotIds: string[],
    isAvailable: boolean
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const promises = slotIds.map(id =>
        updateTimeSlot(id, { is_available: isAvailable })
      );

      await Promise.all(promises);
      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to update time slots';
      setError(errorMessage);
      console.error('Error updating multiple slots:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMultipleSlots = useCallback(async (slotIds: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const promises = slotIds.map(id => deleteTimeSlot(id));
      await Promise.all(promises);
      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to delete time slots';
      setError(errorMessage);
      console.error('Error deleting multiple slots:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createWeeklySchedule,
    toggleMultipleSlots,
    deleteMultipleSlots,
    loading,
    error
  };
};

/**
 * Hook for time slot validation
 */
export const useTimeSlotValidation = () => {
  const validateTimeSlot = useCallback((data: TimeSlotFormData): string | null => {
    // Validate day of week
    if (data.day_of_week < 0 || data.day_of_week > 6) {
      return 'Day of week must be between 0 (Sunday) and 6 (Saturday)';
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.start_time)) {
      return 'Start time must be in HH:MM format (24-hour)';
    }
    if (!timeRegex.test(data.end_time)) {
      return 'End time must be in HH:MM format (24-hour)';
    }

    // Validate time order
    if (data.start_time >= data.end_time) {
      return 'End time must be after start time';
    }

    // Validate max bookings
    if (data.max_bookings_per_slot < 1) {
      return 'Maximum bookings per slot must be at least 1';
    }

    return null;
  }, []);

  const validateTimeSlotConflict = useCallback((
    newSlot: TimeSlotFormData,
    existingSlots: AvailableTimeSlot[],
    excludeId?: string
  ): string | null => {
    const conflictingSlots = existingSlots.filter(slot => {
      // Skip the slot being edited
      if (excludeId && slot.id === excludeId) {
        return false;
      }

      // Check same day
      if (slot.day_of_week !== newSlot.day_of_week) {
        return false;
      }

      // Check time overlap
      const newStart = newSlot.start_time;
      const newEnd = newSlot.end_time;
      const existingStart = slot.start_time;
      const existingEnd = slot.end_time;

      return (
        (newStart < existingEnd && newEnd > existingStart) ||
        (existingStart < newEnd && existingEnd > newStart)
      );
    });

    if (conflictingSlots.length > 0) {
      const conflictDay = DAY_NAMES[newSlot.day_of_week];
      const conflictTime = `${conflictingSlots[0].start_time}-${conflictingSlots[0].end_time}`;
      return `Time slot conflicts with existing slot on ${conflictDay} at ${conflictTime}`;
    }

    return null;
  }, []);

  return {
    validateTimeSlot,
    validateTimeSlotConflict
  };
};

// Export all hooks
export default {
  useTimeSlots,
  useCreateTimeSlot,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
  useBlackoutDatesManagement,
  useScheduleOverview,
  useBulkTimeSlotOperations,
  useTimeSlotValidation
};