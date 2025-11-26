/**
 * Booking System TypeScript Types
 * Matches database schema created in migration 20251119122057_create_booking_system.sql
 */

// Enums
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show'
}

// Business type constants
export const BUSINESS_TYPES = [
  'Trades & Services',
  'Hospitality & Food',
  'Retail',
  'Health & Fitness',
  'Professional Services',
  'Beauty & Wellness',
  'Home Services',
  'Automotive',
  'Other'
] as const;

export const REVENUE_RANGES = [
  '$0 - $5,000',
  '$5,000 - $20,000',
  '$20,000 - $50,000',
  '$50,000 - $100,000',
  '$100,000+'
] as const;

export const MARKETING_CHANNELS = [
  'Social Media',
  'Google Ads',
  'Facebook/Instagram Ads',
  'SEO',
  'Email Marketing',
  'Word of Mouth',
  'Local Directories',
  'Print Media',
  'None/Just Started'
] as const;


// API Response Types
export interface BookingAPIResponse {
  booking: Booking;
  message: string;
}

export interface AvailableSlotsResponse {
  slots: AvailableSlot[];
  total: number;
}

export interface BookingStatsResponse {
  total_bookings: number;
  pending_count: number;
  confirmed_count: number;
  completed_count: number;
  cancelled_count: number;
  no_show_count: number;
  this_week_count: number;
  this_month_count: number;
  average_booking_lead_time_days: number;
  most_popular_time_slots: Array<{
    time_slot: string;
    booking_count: number;
  }>;
  business_types_breakdown: Array<{
    business_type: string;
    count: number;
  }>;
}

// Filter Types
export interface BookingFilters {
  status?: BookingStatus | BookingStatus[];
  date_from?: string; // ISO date string
  date_to?: string; // ISO date string
  business_type?: BusinessType;
  search?: string; // Search in customer name, email, business name
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'preferred_date' | 'customer_name' | 'business_name';
  sort_order?: 'asc' | 'desc';
}

// Time Slot Types
export interface BookingTimeSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_bookings_per_slot: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Time Slot Form Types
export interface TimeSlotFormData {
  day_of_week: number;
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  max_bookings_per_slot: number;
  is_available: boolean;
}

export interface TimeSlotFormErrors {
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  max_bookings_per_slot?: string;
}

// Blackout Date Form Types
export interface BlackoutDateFormData {
  date: string; // ISO date string
  reason?: string;
}

export interface BlackoutDateFormErrors {
  date?: string;
  reason?: string;
}

// Calendar Integration Types
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description: string;
  start: {
    dateTime: string; // ISO datetime string
    timeZone: string;
  };
  end: {
    dateTime: string; // ISO datetime string
    timeZone: string;
  };
  conferenceData?: {
    conferenceSolution: {
      key: {
        type: string;
      };
    };
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: string;
      };
    };
  };
  attendees: Array<{
    email: string;
    displayName: string;
  }>;
}

// Notification Types
export interface EmailNotificationData {
  booking: Booking;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'reschedule';
  template_data: {
    customer_name: string;
    business_name: string;
    appointment_date: string;
    appointment_time: string;
    meet_link?: string;
    cancellation_reason?: string;
  };
}

// Utility Types
export interface BookingSlotDisplay {
  date: string; // ISO date string
  displayDate: string; // "Monday, 25 November 2025"
  timeSlots: Array<{
    time: string; // "9:00 AM - 10:00 AM"
    value: string; // "09:00-10:00"
    available: boolean;
    availableCount: number;
  }>;
}

export interface BookingAnalytics {
  conversion_rate: number; // Percentage of form views to bookings
  popular_times: Array<{
    time_slot: string;
    percentage: number;
  }>;
  business_distribution: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  revenue_distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  geographical_distribution: Array<{
    location: string;
    count: number;
  }>;
  monthly_trends: Array<{
    month: string;
    booking_count: number;
    completion_rate: number;
  }>;
}

// Error Types
export interface BookingError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface APIError {
  error: BookingError;
  timestamp: string;
}

// Export all types for easy importing
export type {
  Booking,
  AvailableTimeSlot,
  BookingBlackoutDate,
  AvailableSlot,
  BookingFormData,
  BookingFormErrors,
  BookingAPIResponse,
  AvailableSlotsResponse,
  BookingStatsResponse,
  BookingFilters,
  TimeSlotFormData,
  TimeSlotFormErrors,
  BlackoutDateFormData,
  BlackoutDateFormErrors,
  GoogleCalendarEvent,
  EmailNotificationData,
  BookingSlotDisplay,
  BookingAnalytics,
  BookingError,
  APIError
};