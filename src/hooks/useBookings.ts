/**
 * Admin Booking Hooks
 * React hooks for managing bookings (admin functionality)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getAllBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
  BookingServiceError
} from '@/services/bookingService';
import type {
  Booking,
  BookingFilters,
  BookingStatsResponse,
  BookingStatus
} from '@/types/booking';

// Hook return types
interface UseBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  updateFilters: (filters: BookingFilters) => void;
}

interface UseBookingByIdReturn {
  booking: Booking | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseUpdateBookingReturn {
  updateBooking: (id: string, updates: Partial<Booking>) => Promise<boolean>;
  updateStatus: (id: string, status: BookingStatus) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

interface UseDeleteBookingReturn {
  deleteBooking: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

interface UseBookingStatsReturn {
  stats: BookingStatsResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing multiple bookings with filtering
 * @param initialFilters - Initial filter parameters
 */
export const useBookings = (initialFilters: BookingFilters = {}): UseBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<BookingFilters>(initialFilters);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAllBookings(filters);
      setBookings(data);
      setTotalCount(data.length);
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to load bookings';
      setError(errorMessage);
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateFilters = useCallback((newFilters: BookingFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refetch = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    totalCount,
    refetch,
    updateFilters
  };
};

/**
 * Hook for fetching a single booking by ID
 * @param id - Booking ID
 */
export const useBookingById = (id: string): UseBookingByIdReturn => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getBookingById(id);
      setBooking(data);
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to load booking';
      setError(errorMessage);
      setBooking(null);
      console.error('Error fetching booking:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const refetch = useCallback(async () => {
    await fetchBooking();
  }, [fetchBooking]);

  return {
    booking,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for updating bookings
 */
export const useUpdateBooking = (): UseUpdateBookingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBookingData = useCallback(async (
    id: string,
    updates: Partial<Booking>
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await updateBooking(id, updates);
      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to update booking';
      setError(errorMessage);
      console.error('Error updating booking:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(async (
    id: string,
    status: BookingStatus
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await updateBookingStatus(id, status);
      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to update booking status';
      setError(errorMessage);
      console.error('Error updating booking status:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateBooking: updateBookingData,
    updateStatus,
    loading,
    error
  };
};

/**
 * Hook for deleting bookings
 */
export const useDeleteBooking = (): UseDeleteBookingReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteBookingData = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await deleteBooking(id);
      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to delete booking';
      setError(errorMessage);
      console.error('Error deleting booking:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteBooking: deleteBookingData,
    loading,
    error
  };
};

/**
 * Hook for fetching booking statistics
 */
export const useBookingStats = (): UseBookingStatsReturn => {
  const [stats, setStats] = useState<BookingStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getBookingStats();
      setStats(data);
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to load booking statistics';
      setError(errorMessage);
      console.error('Error fetching booking stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refetch = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch
  };
};

/**
 * Hook for real-time booking updates (using Supabase subscriptions)
 * @param filters - Optional filters to apply to subscription
 */
export const useBookingSubscription = (filters: BookingFilters = {}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const setupSubscription = async () => {
      try {
        // Initial load
        const initialBookings = await getAllBookings(filters);
        if (mounted) {
          setBookings(initialBookings);
          setLoading(false);
        }

        // Note: Supabase real-time subscriptions would go here
        // For now, we'll use polling as a fallback
        const interval = setInterval(async () => {
          try {
            const updatedBookings = await getAllBookings(filters);
            if (mounted) {
              setBookings(updatedBookings);
            }
          } catch (err) {
            console.error('Error in booking subscription:', err);
          }
        }, 30000); // Poll every 30 seconds

        return () => {
          clearInterval(interval);
        };
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof BookingServiceError
            ? err.message
            : 'Failed to setup booking subscription';
          setError(errorMessage);
          setLoading(false);
        }
      }
    };

    const cleanup = setupSubscription();

    return () => {
      mounted = false;
      cleanup.then(cleanupFn => cleanupFn?.());
    };
  }, [filters]);

  return { bookings, loading, error };
};

/**
 * Hook for batch booking operations
 */
export const useBatchBookingOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMultipleStatuses = useCallback(async (
    bookingIds: string[],
    status: BookingStatus
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Update bookings in parallel
      const updatePromises = bookingIds.map(id => updateBookingStatus(id, status));
      await Promise.all(updatePromises);

      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to update booking statuses';
      setError(errorMessage);
      console.error('Error in batch status update:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMultiple = useCallback(async (bookingIds: string[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Delete bookings in parallel
      const deletePromises = bookingIds.map(id => deleteBooking(id));
      await Promise.all(deletePromises);

      return true;
    } catch (err) {
      const errorMessage = err instanceof BookingServiceError
        ? err.message
        : 'Failed to delete bookings';
      setError(errorMessage);
      console.error('Error in batch delete:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    updateMultipleStatuses,
    deleteMultiple,
    loading,
    error
  };
};

// Export all hooks
export default {
  useBookings,
  useBookingById,
  useUpdateBooking,
  useDeleteBooking,
  useBookingStats,
  useBookingSubscription,
  useBatchBookingOperations
};