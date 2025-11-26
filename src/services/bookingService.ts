/**
 * Booking Service
 * API layer for booking system operations
 * Handles CRUD operations for bookings, time slots, and availability
 */

import { supabase } from '@/lib/supabase';
import type {
  Booking,
  BookingFormData,
  BookingFilters,
  BookingStatsResponse,
  AvailableSlot,
  AvailableTimeSlot,
  BookingBlackoutDate,
  TimeSlotFormData,
  BlackoutDateFormData,
  AvailableSlotsResponse,
  BookingAPIResponse,
  BookingError,
  APIError
} from '@/types/booking';
import { googleCalendarService, CalendarError } from '@/services/googleCalendarService';
import { sendConfirmationEmail, sendAdminNotificationEmail } from '@/services/emailService';

/**
 * Custom error class for booking operations
 */
class BookingServiceError extends Error {
  public code: string;
  public field?: string;
  public details?: any;

  constructor(message: string, code: string, field?: string, details?: any) {
    super(message);
    this.name = 'BookingServiceError';
    this.code = code;
    this.field = field;
    this.details = details;
  }
}

/**
 * Handle Supabase errors and convert to BookingError
 */
const handleSupabaseError = (error: any, operation: string): never => {
  console.error(`Booking Service ${operation} Error:`, error);

  let errorMessage = 'An unexpected error occurred';
  let errorCode = 'UNKNOWN_ERROR';

  if (error.message) {
    errorMessage = error.message;
  }

  if (error.code) {
    errorCode = error.code;
  }

  // Handle specific error cases
  if (error.message?.includes('duplicate key value')) {
    errorCode = 'DUPLICATE_ENTRY';
    errorMessage = 'This booking slot is already taken. Please select another time.';
  }

  if (error.message?.includes('violates foreign key constraint')) {
    errorCode = 'INVALID_REFERENCE';
    errorMessage = 'Invalid data provided. Please check your selection and try again.';
  }

  if (error.message?.includes('violates check constraint')) {
    errorCode = 'VALIDATION_ERROR';
    errorMessage = 'Invalid data provided. Please check your input.';
  }

  throw new BookingServiceError(errorMessage, errorCode, undefined, error);
};

// =============================================================================
// PUBLIC API - No authentication required
// =============================================================================

/**
 * Create a new booking (public form submission)
 */
export const createBooking = async (data: BookingFormData): Promise<Booking> => {
  try {
    // 1. Create booking in database
    const bookingData = {
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      business_name: data.business_name,
      business_type: data.business_type,
      business_location: data.business_location,
      business_website: data.business_website,
      current_revenue: data.current_revenue,
      current_marketing: data.current_marketing,
      primary_goals: data.primary_goals,
      marketing_budget: data.marketing_budget,
      biggest_challenge: data.biggest_challenge,
      datetime: data.datetime,
      additional_notes: data.additional_notes || null,
      status: 'pending' as const,
      calendar_sync_status: 'pending' as const,
    };

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'createBooking');
    }

    // 2. Attempt to create Google Calendar event
    let calendarEventCreated = false;
    let meetLink: string | undefined;

    try {
      // Initialize calendar service if needed
      if (googleCalendarService.isConfigured()) {
        await googleCalendarService.initialize();

        if (googleCalendarService.isAuthenticated()) {
          const calendarResponse = await googleCalendarService.createCalendarEvent(booking);
          meetLink = calendarResponse.meetLink;
          calendarEventCreated = true;

          console.log('✅ Google Calendar event created successfully:', calendarResponse.eventId);
        } else {
          console.warn('⚠️ Google Calendar not authenticated. Skipping calendar event creation.');
        }
      } else {
        console.warn('⚠️ Google Calendar not configured. Skipping calendar event creation.');
      }
    } catch (calendarError) {
      console.error('❌ Failed to create calendar event:', calendarError);

      // Don't fail the entire booking creation, but log the error
      const errorMessage = calendarError instanceof CalendarError
        ? calendarError.message
        : 'Unknown calendar error';

      // Update booking with calendar error
      await supabase
        .from('bookings')
        .update({
          calendar_sync_status: 'failed',
          calendar_sync_error: errorMessage
        })
        .eq('id', booking.id);
    }

    // 3. Send confirmation email (with or without Meet link)
    try {
      const bookingWithMeetLink = meetLink ? { ...booking, google_meet_link: meetLink } : booking;
      await sendConfirmationEmail(bookingWithMeetLink);
      console.log('✅ Confirmation email sent to customer');
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError);
      // Continue - don't fail booking creation for email issues
    }

    // 4. Send admin notification
    try {
      const bookingWithMeetLink = meetLink ? { ...booking, google_meet_link: meetLink } : booking;
      await sendAdminNotificationEmail(bookingWithMeetLink);
      console.log('✅ Admin notification email sent');
    } catch (emailError) {
      console.error('❌ Failed to send admin notification:', emailError);
      // Continue - don't fail booking creation for email issues
    }

    // 5. Update booking status to confirmed if calendar event was created
    if (calendarEventCreated) {
      const { data: updatedBooking, error: updateError } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id)
        .select()
        .single();

      if (!updateError) {
        return updatedBooking;
      }
    }

    return booking;
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'createBooking');
  }
};

/**
 * Get available time slots for a date range
 */
export const getAvailableSlots = async (
  startDate: string,
  endDate: string
): Promise<AvailableSlot[]> => {
  try {
    console.log('bookingService: Fetching available slots for', startDate, 'to', endDate);
    const { data, error } = await supabase.rpc('get_available_slots', {
      date_start: startDate,
      date_end: endDate,
    });

    console.log('bookingService: get_available_slots result:', { data, error, count: data?.length });

    if (error) {
      console.error('bookingService: RPC error:', error);
      handleSupabaseError(error, 'getAvailableSlots');
    }

    if (!data || data.length === 0) {
      console.warn('bookingService: No slots returned from database. Check if get_available_slots function exists and available_time_slots table has data.');
    }

    return data || [];
  } catch (error) {
    console.error('bookingService: getAvailableSlots exception:', error);
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'getAvailableSlots');
  }
};

/**
 * Get blackout dates for a date range
 */
export const getBlackoutDates = async (
  startDate: string,
  endDate: string
): Promise<BookingBlackoutDate[]> => {
  try {
    const { data, error } = await supabase
      .from('booking_blackout_dates')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'getBlackoutDates');
    }

    return data || [];
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'getBlackoutDates');
  }
};

// =============================================================================
// ADMIN API - Requires authentication
// =============================================================================

/**
 * Get all bookings with optional filtering
 */
export const getAllBookings = async (filters?: BookingFilters): Promise<Booking[]> => {
  try {
    let query = supabase.from('bookings').select('*');

    // Apply filters
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters?.date_from) {
      query = query.gte('preferred_date', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('preferred_date', filters.date_to);
    }

    if (filters?.business_type) {
      query = query.eq('business_type', filters.business_type);
    }

    if (filters?.search) {
      query = query.or(
        `customer_name.ilike.%${filters.search}%,customer_email.ilike.%${filters.search}%,business_name.ilike.%${filters.search}%`
      );
    }

    // Apply sorting
    const sortBy = filters?.sort_by || 'created_at';
    const sortOrder = filters?.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      handleSupabaseError(error, 'getAllBookings');
    }

    return data || [];
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'getAllBookings');
  }
};

/**
 * Get booking by ID
 */
export const getBookingById = async (id: string): Promise<Booking> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new BookingServiceError('Booking not found', 'BOOKING_NOT_FOUND');
      }
      handleSupabaseError(error, 'getBookingById');
    }

    return data;
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'getBookingById');
  }
};

/**
 * Update booking
 */
export const updateBooking = async (
  id: string,
  updates: Partial<Booking>
): Promise<Booking> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'updateBooking');
    }

    return data;
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'updateBooking');
  }
};

/**
 * Update booking status (convenience method)
 */
export const updateBookingStatus = async (
  id: string,
  status: Booking['status']
): Promise<Booking> => {
  return updateBooking(id, { status });
};

/**
 * Delete booking
 */
export const deleteBooking = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('bookings').delete().eq('id', id);

    if (error) {
      handleSupabaseError(error, 'deleteBooking');
    }
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'deleteBooking');
  }
};

/**
 * Get booking statistics
 */
export const getBookingStats = async (): Promise<BookingStatsResponse> => {
  try {
    // Get all bookings for analysis
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'getBookingStats');
    }

    if (!bookings) {
      return {
        total_bookings: 0,
        pending_count: 0,
        confirmed_count: 0,
        completed_count: 0,
        cancelled_count: 0,
        no_show_count: 0,
        this_week_count: 0,
        this_month_count: 0,
        average_booking_lead_time_days: 0,
        most_popular_time_slots: [],
        business_types_breakdown: [],
      };
    }

    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Calculate stats
    const stats = {
      total_bookings: bookings.length,
      pending_count: bookings.filter(b => b.status === 'pending').length,
      confirmed_count: bookings.filter(b => b.status === 'confirmed').length,
      completed_count: bookings.filter(b => b.status === 'completed').length,
      cancelled_count: bookings.filter(b => b.status === 'cancelled').length,
      no_show_count: bookings.filter(b => b.status === 'no-show').length,
      this_week_count: bookings.filter(
        b => new Date(b.created_at) >= startOfWeek
      ).length,
      this_month_count: bookings.filter(
        b => new Date(b.created_at) >= startOfMonth
      ).length,
      average_booking_lead_time_days: 0,
      most_popular_time_slots: [] as Array<{ time_slot: string; booking_count: number }>,
      business_types_breakdown: [] as Array<{ business_type: string; count: number }>,
    };

    // Calculate average lead time
    if (bookings.length > 0) {
      const totalLeadTime = bookings.reduce((sum, booking) => {
        const bookingDate = new Date(booking.preferred_date);
        const createdDate = new Date(booking.created_at);
        const leadTime = Math.max(0, (bookingDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + leadTime;
      }, 0);
      stats.average_booking_lead_time_days = Math.round(totalLeadTime / bookings.length);
    }

    // Calculate most popular time slots
    const timeSlotCounts = bookings.reduce((acc, booking) => {
      acc[booking.preferred_time_slot] = (acc[booking.preferred_time_slot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    stats.most_popular_time_slots = Object.entries(timeSlotCounts)
      .map(([time_slot, booking_count]) => ({ time_slot, booking_count }))
      .sort((a, b) => b.booking_count - a.booking_count)
      .slice(0, 5);

    // Calculate business types breakdown
    const businessTypeCounts = bookings.reduce((acc, booking) => {
      const type = booking.business_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    stats.business_types_breakdown = Object.entries(businessTypeCounts)
      .map(([business_type, count]) => ({ business_type, count }))
      .sort((a, b) => b.count - a.count);

    return stats;
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'getBookingStats');
  }
};

// =============================================================================
// TIME SLOT MANAGEMENT (Admin only)
// =============================================================================

/**
 * Get all time slots
 */
export const getTimeSlots = async (): Promise<AvailableTimeSlot[]> => {
  try {
    const { data, error } = await supabase
      .from('available_time_slots')
      .select('*')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'getTimeSlots');
    }

    return data || [];
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'getTimeSlots');
  }
};

/**
 * Create time slot
 */
export const createTimeSlot = async (
  data: TimeSlotFormData
): Promise<AvailableTimeSlot> => {
  try {
    const { data: timeSlot, error } = await supabase
      .from('available_time_slots')
      .insert(data)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'createTimeSlot');
    }

    return timeSlot;
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'createTimeSlot');
  }
};

/**
 * Update time slot
 */
export const updateTimeSlot = async (
  id: string,
  updates: Partial<AvailableTimeSlot>
): Promise<AvailableTimeSlot> => {
  try {
    const { data, error } = await supabase
      .from('available_time_slots')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'updateTimeSlot');
    }

    return data;
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'updateTimeSlot');
  }
};

/**
 * Delete time slot
 */
export const deleteTimeSlot = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('available_time_slots')
      .delete()
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'deleteTimeSlot');
    }
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'deleteTimeSlot');
  }
};

// =============================================================================
// BLACKOUT DATES MANAGEMENT (Admin only)
// =============================================================================

/**
 * Add blackout date
 */
export const addBlackoutDate = async (
  date: string,
  reason?: string
): Promise<BookingBlackoutDate> => {
  try {
    const { data, error } = await supabase
      .from('booking_blackout_dates')
      .insert({
        date,
        reason: reason || null,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'addBlackoutDate');
    }

    return data;
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'addBlackoutDate');
  }
};

/**
 * Remove blackout date
 */
export const removeBlackoutDate = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('booking_blackout_dates')
      .delete()
      .eq('id', id);

    if (error) {
      handleSupabaseError(error, 'removeBlackoutDate');
    }
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'removeBlackoutDate');
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Check if a specific date and time slot is available
 */
export const isSlotAvailable = async (
  date: string,
  timeSlot: string
): Promise<boolean> => {
  try {
    // Check for blackout dates
    const { data: blackoutDates, error: blackoutError } = await supabase
      .from('booking_blackout_dates')
      .select('id')
      .eq('date', date)
      .limit(1);

    if (blackoutError) {
      handleSupabaseError(blackoutError, 'isSlotAvailable');
    }

    if (blackoutDates && blackoutDates.length > 0) {
      return false;
    }

    // Check available slots for this date
    const slots = await getAvailableSlots(date, date);
    const targetSlot = slots.find(slot =>
      slot.slot_date === date &&
      `${slot.start_time}-${slot.end_time}` === timeSlot
    );

    return targetSlot ? targetSlot.available_count > 0 : false;
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'isSlotAvailable');
  }
};

/**
 * Get bookings for a specific date (admin)
 */
export const getBookingsForDate = async (date: string): Promise<Booking[]> => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('preferred_date', date)
      .in('status', ['pending', 'confirmed'])
      .order('preferred_time_slot', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'getBookingsForDate');
    }

    return data || [];
  } catch (error) {
    if (error instanceof BookingServiceError) {
      throw error;
    }
    handleSupabaseError(error, 'getBookingsForDate');
  }
};

// Export error class for external use
export { BookingServiceError };