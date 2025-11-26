/**
 * Booking System Constants
 * Configuration values, messages, and settings for the booking system
 */

import type { BookingStatus, BusinessType, RevenueRange, MarketingChannel } from '@/types/booking';

// =============================================================================
// BOOKING CONFIGURATION
// =============================================================================

export const BOOKING_CONFIG = {
  // Date/Time constraints
  MAX_ADVANCE_DAYS: 60, // Can book up to 60 days ahead
  MIN_ADVANCE_HOURS: 24, // Must book at least 24 hours in advance
  DEFAULT_DURATION_MINUTES: 60, // Default consultation duration
  REMINDER_HOURS_BEFORE: 24, // Send reminder 24 hours before appointment

  // Business hours (Melbourne time)
  BUSINESS_HOURS: {
    START: '09:00',
    END: '17:00',
    LUNCH_START: '12:00',
    LUNCH_END: '13:00',
    TIMEZONE: 'Australia/Melbourne'
  },

  // Working days
  WORKING_DAYS: [1, 2, 3, 4, 5], // Monday to Friday (0=Sunday, 6=Saturday)

  // Booking limits
  MAX_BOOKINGS_PER_SLOT: 1, // Maximum bookings per time slot
  MAX_BOOKINGS_PER_DAY: 8, // Maximum bookings per day
  MAX_BOOKINGS_PER_CUSTOMER_PER_MONTH: 2, // Limit repeat bookings

  // Form validation
  FORM_VALIDATION: {
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
    MIN_BUSINESS_NAME_LENGTH: 2,
    MAX_BUSINESS_NAME_LENGTH: 200,
    MIN_CHALLENGE_LENGTH: 10,
    MAX_CHALLENGE_LENGTH: 500,
    MAX_NOTES_LENGTH: 1000,
    PHONE_PATTERN: /^(?:\+61|0)[2-478](?:[ -]?\d){8}$|^(?:\+61|0)4(?:[ -]?\d){8}$/,
    EMAIL_PATTERN: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  }
} as const;

// =============================================================================
// BOOKING MESSAGES
// =============================================================================

export const BOOKING_MESSAGES = {
  // Success messages
  SUCCESS: {
    BOOKING_CREATED: 'Your strategy call has been booked! Check your email for confirmation.',
    BOOKING_UPDATED: 'Booking updated successfully.',
    BOOKING_CANCELLED: 'Booking cancelled successfully.',
    BOOKING_CONFIRMED: 'Booking confirmed successfully.',
    TIME_SLOT_CREATED: 'Time slot created successfully.',
    TIME_SLOT_UPDATED: 'Time slot updated successfully.',
    TIME_SLOT_DELETED: 'Time slot deleted successfully.',
    BLACKOUT_DATE_ADDED: 'Blackout date added successfully.',
    BLACKOUT_DATE_REMOVED: 'Blackout date removed successfully.',
  },

  // Error messages
  ERROR: {
    GENERIC: 'Something went wrong. Please try again or call us at +61 478 101 521.',
    NETWORK: 'Network error. Please check your connection and try again.',
    SLOT_TAKEN: 'This time slot was just booked. Please select another time.',
    SLOT_UNAVAILABLE: 'Selected time slot is no longer available.',
    PAST_DATE: 'Please select a future date.',
    TOO_FAR_AHEAD: 'Bookings can only be made up to 60 days in advance.',
    BLACKOUT_DATE: 'This date is not available for bookings.',
    OUTSIDE_BUSINESS_HOURS: 'Selected time is outside business hours.',
    WEEKEND_NOT_ALLOWED: 'Weekend bookings are not currently available.',
    BOOKING_NOT_FOUND: 'Booking not found.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    VALIDATION_ERROR: 'Please fix the errors below.',
    DUPLICATE_BOOKING: 'You already have a booking for this date.',
    MAX_BOOKINGS_EXCEEDED: 'Maximum number of bookings reached for this period.',
  },

  // Validation messages
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PHONE: 'Please enter a valid Australian phone number.',
    NAME_TOO_SHORT: 'Name must be at least 2 characters long.',
    NAME_TOO_LONG: 'Name must be no more than 100 characters long.',
    BUSINESS_NAME_TOO_SHORT: 'Business name must be at least 2 characters long.',
    BUSINESS_NAME_TOO_LONG: 'Business name must be no more than 200 characters long.',
    CHALLENGE_TOO_SHORT: 'Please provide at least 10 characters describing your challenge.',
    CHALLENGE_TOO_LONG: 'Challenge description must be no more than 500 characters.',
    NOTES_TOO_LONG: 'Additional notes must be no more than 1000 characters.',
    INVALID_PHONE_FORMAT: 'Phone number must be in Australian format (e.g., 0412 345 678).',
    INVALID_DATE_FORMAT: 'Please select a valid date.',
    INVALID_TIME_FORMAT: 'Please select a valid time slot.',
  },

  // Confirmation messages
  CONFIRMATION: {
    DELETE_BOOKING: 'Are you sure you want to delete this booking? This action cannot be undone.',
    CANCEL_BOOKING: 'Are you sure you want to cancel this booking?',
    DELETE_TIME_SLOT: 'Are you sure you want to delete this time slot?',
    REMOVE_BLACKOUT_DATE: 'Are you sure you want to remove this blackout date?',
    BULK_DELETE: 'Are you sure you want to delete {count} selected items?',
    UPDATE_STATUS: 'Are you sure you want to update the status of this booking?',
  },

  // Info messages
  INFO: {
    NO_BOOKINGS: 'No bookings found.',
    NO_TIME_SLOTS: 'No time slots configured.',
    NO_BLACKOUT_DATES: 'No blackout dates set.',
    LOADING: 'Loading...',
    SAVING: 'Saving...',
    FORM_AUTO_SAVED: 'Form data automatically saved.',
    CALL_DURATION: 'Strategy calls typically last 60 minutes.',
    TIMEZONE_INFO: 'All times shown are in Melbourne, Australia timezone (AEST/AEDT).',
    BUSINESS_HOURS_INFO: 'We are available Monday to Friday, 9:00 AM to 5:00 PM (Melbourne time).',
  },

  // Status labels
  STATUS_LABELS: {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    'no-show': 'No Show',
  }
} as const;

// =============================================================================
// BOOKING STATUS CONFIGURATIONS
// =============================================================================

export const BOOKING_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-200',
    description: 'Awaiting confirmation'
  },
  confirmed: {
    label: 'Confirmed',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    description: 'Booking confirmed'
  },
  completed: {
    label: 'Completed',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    description: 'Call completed'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    description: 'Booking cancelled'
  },
  'no-show': {
    label: 'No Show',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-200',
    description: 'Customer did not attend'
  }
} as const;

// =============================================================================
// BUSINESS DATA CONSTANTS
// =============================================================================

export const BUSINESS_TYPES_CONFIG = [
  { value: 'Trades & Services', label: 'Trades & Services', icon: '🔧' },
  { value: 'Hospitality & Food', label: 'Hospitality & Food', icon: '🍽️' },
  { value: 'Retail', label: 'Retail', icon: '🏪' },
  { value: 'Health & Fitness', label: 'Health & Fitness', icon: '💪' },
  { value: 'Professional Services', label: 'Professional Services', icon: '💼' },
  { value: 'Beauty & Wellness', label: 'Beauty & Wellness', icon: '💆' },
  { value: 'Home Services', label: 'Home Services', icon: '🏠' },
  { value: 'Automotive', label: 'Automotive', icon: '🚗' },
  { value: 'Other', label: 'Other', icon: '📋' },
] as const;

export const REVENUE_RANGES_CONFIG = [
  { value: '$0 - $5,000', label: '$0 - $5,000', description: 'Just starting out' },
  { value: '$5,000 - $20,000', label: '$5,000 - $20,000', description: 'Growing business' },
  { value: '$20,000 - $50,000', label: '$20,000 - $50,000', description: 'Established business' },
  { value: '$50,000 - $100,000', label: '$50,000 - $100,000', description: 'Thriving business' },
  { value: '$100,000+', label: '$100,000+', description: 'High-growth business' },
] as const;

export const MARKETING_CHANNELS_CONFIG = [
  { value: 'Social Media', label: 'Social Media', icon: '📱', popular: true },
  { value: 'Google Ads', label: 'Google Ads', icon: '🔍', popular: true },
  { value: 'Facebook/Instagram Ads', label: 'Facebook/Instagram Ads', icon: '📘', popular: true },
  { value: 'SEO', label: 'SEO', icon: '🎯', popular: true },
  { value: 'Email Marketing', label: 'Email Marketing', icon: '📧', popular: false },
  { value: 'Word of Mouth', label: 'Word of Mouth', icon: '👥', popular: true },
  { value: 'Local Directories', label: 'Local Directories', icon: '📍', popular: false },
  { value: 'Print Media', label: 'Print Media', icon: '📰', popular: false },
  { value: 'None/Just Started', label: 'None/Just Started', icon: '🚀', popular: false },
] as const;

// =============================================================================
// TIME AND DATE CONSTANTS
// =============================================================================

export const TIME_CONFIG = {
  // Day names
  DAYS_OF_WEEK: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ] as const,

  // Short day names
  DAYS_SHORT: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const,

  // Month names
  MONTHS: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ] as const,

  // Short month names
  MONTHS_SHORT: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ] as const,

  // Time zones
  TIMEZONES: {
    MELBOURNE: 'Australia/Melbourne',
    SYDNEY: 'Australia/Sydney',
    BRISBANE: 'Australia/Brisbane',
    ADELAIDE: 'Australia/Adelaide',
    PERTH: 'Australia/Perth',
    DARWIN: 'Australia/Darwin'
  } as const,

  // Default time slots (24-hour format)
  DEFAULT_TIME_SLOTS: [
    { start: '09:00', end: '10:00', label: '9:00 AM - 10:00 AM' },
    { start: '10:00', end: '11:00', label: '10:00 AM - 11:00 AM' },
    { start: '11:00', end: '12:00', label: '11:00 AM - 12:00 PM' },
    { start: '13:00', end: '14:00', label: '1:00 PM - 2:00 PM' },
    { start: '14:00', end: '15:00', label: '2:00 PM - 3:00 PM' },
    { start: '15:00', end: '16:00', label: '3:00 PM - 4:00 PM' },
    { start: '16:00', end: '17:00', label: '4:00 PM - 5:00 PM' },
  ] as const
} as const;

// =============================================================================
// CONTACT INFORMATION
// =============================================================================

export const CONTACT_INFO = {
  BUSINESS_NAME: 'Your Mate Agency',
  PHONE: '+61 478 101 521',
  EMAIL: 'matt@yourmateagency.com.au',
  WEBSITE: 'https://yourmateagency.com.au',
  ADDRESS: {
    STREET: '',
    CITY: 'Melbourne',
    STATE: 'Victoria',
    POSTCODE: '',
    COUNTRY: 'Australia'
  },
  SOCIAL_MEDIA: {
    FACEBOOK: '',
    INSTAGRAM: '',
    LINKEDIN: '',
    TWITTER: ''
  }
} as const;

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const API_CONFIG = {
  // Request timeouts
  TIMEOUT: {
    DEFAULT: 10000, // 10 seconds
    UPLOAD: 30000, // 30 seconds
    DOWNLOAD: 60000 // 1 minute
  },

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
    BACKOFF_FACTOR: 2
  },

  // Rate limiting
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MINUTE: 60,
    BURST_ALLOWANCE: 10
  },

  // Cache configuration
  CACHE: {
    DEFAULT_TTL: 300000, // 5 minutes
    LONG_TTL: 3600000, // 1 hour
    SHORT_TTL: 60000 // 1 minute
  }
} as const;

// =============================================================================
// FORM FIELD CONFIGURATIONS
// =============================================================================

export const FORM_FIELDS = {
  CUSTOMER_NAME: {
    name: 'customer_name',
    label: 'Your Name',
    placeholder: 'Enter your full name',
    required: true,
    type: 'text'
  },
  CUSTOMER_EMAIL: {
    name: 'customer_email',
    label: 'Email Address',
    placeholder: 'your.email@example.com',
    required: true,
    type: 'email'
  },
  CUSTOMER_PHONE: {
    name: 'customer_phone',
    label: 'Phone Number',
    placeholder: '0412 345 678',
    required: true,
    type: 'tel'
  },
  BUSINESS_NAME: {
    name: 'business_name',
    label: 'Business Name',
    placeholder: 'Your business name',
    required: true,
    type: 'text'
  },
  BUSINESS_TYPE: {
    name: 'business_type',
    label: 'Business Type',
    required: true,
    type: 'select'
  },
  BUSINESS_LOCATION: {
    name: 'business_location',
    label: 'Business Location',
    placeholder: 'City, Suburb or Region',
    required: true,
    type: 'text'
  },
  CURRENT_MARKETING: {
    name: 'current_marketing',
    label: 'Current Marketing Activities',
    required: false,
    type: 'checkbox'
  },
  BIGGEST_CHALLENGE: {
    name: 'biggest_challenge',
    label: 'What\'s your biggest marketing challenge?',
    placeholder: 'Tell us about your main marketing pain point...',
    required: true,
    type: 'textarea'
  },
  MONTHLY_REVENUE_RANGE: {
    name: 'monthly_revenue_range',
    label: 'Monthly Revenue Range',
    required: true,
    type: 'select'
  },
  PREFERRED_DATE: {
    name: 'preferred_date',
    label: 'Preferred Date',
    required: true,
    type: 'date'
  },
  PREFERRED_TIME_SLOT: {
    name: 'preferred_time_slot',
    label: 'Preferred Time',
    required: true,
    type: 'radio'
  },
  ADDITIONAL_NOTES: {
    name: 'additional_notes',
    label: 'Additional Notes (Optional)',
    placeholder: 'Any additional information you\'d like us to know...',
    required: false,
    type: 'textarea'
  }
} as const;

// =============================================================================
// ANALYTICS AND TRACKING
// =============================================================================

export const ANALYTICS_EVENTS = {
  // Booking events
  BOOKING_FORM_STARTED: 'booking_form_started',
  BOOKING_FORM_COMPLETED: 'booking_form_completed',
  BOOKING_FORM_ABANDONED: 'booking_form_abandoned',
  BOOKING_CREATED: 'booking_created',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',

  // Navigation events
  DATE_SELECTED: 'date_selected',
  TIME_SLOT_SELECTED: 'time_slot_selected',
  BUSINESS_TYPE_SELECTED: 'business_type_selected',

  // Error events
  FORM_VALIDATION_ERROR: 'form_validation_error',
  API_ERROR: 'api_error',
  SLOT_UNAVAILABLE_ERROR: 'slot_unavailable_error'
} as const;

// =============================================================================
// FEATURE FLAGS
// =============================================================================

export const FEATURE_FLAGS = {
  ENABLE_WEEKEND_BOOKINGS: false,
  ENABLE_EVENING_BOOKINGS: false,
  ENABLE_RECURRING_BOOKINGS: false,
  ENABLE_BOOKING_REMINDERS: true,
  ENABLE_AUTO_CONFIRMATION: false,
  ENABLE_CALENDAR_INTEGRATION: true,
  ENABLE_SMS_NOTIFICATIONS: false,
  ENABLE_BOOKING_ANALYTICS: true,
  ENABLE_CUSTOMER_REVIEWS: false,
  ENABLE_BOOKING_WAITLIST: false
} as const;

// Export type for better TypeScript integration
export type BookingStatusConfigKey = keyof typeof BOOKING_STATUS_CONFIG;
export type BusinessTypeConfig = typeof BUSINESS_TYPES_CONFIG[number];
export type RevenueRangeConfig = typeof REVENUE_RANGES_CONFIG[number];
export type MarketingChannelConfig = typeof MARKETING_CHANNELS_CONFIG[number];
export type TimeSlotConfig = typeof TIME_CONFIG.DEFAULT_TIME_SLOTS[number];
export type FormFieldConfig = typeof FORM_FIELDS[keyof typeof FORM_FIELDS];