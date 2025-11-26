/**
 * Booking Validation Utilities
 * Validates booking form data, email formats, Australian phone numbers, etc.
 */

import type {
  BookingFormData,
  BookingFormErrors,
  BookingBlackoutDate,
  BUSINESS_TYPES,
  REVENUE_RANGES,
  MARKETING_CHANNELS
} from '@/types/booking';

/**
 * Email validation regex (RFC 5322 compliant)
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Australian phone number regex (supports various formats)
 * Matches: +61 4XX XXX XXX, 04XX XXX XXX, (04XX) XXX XXX, etc.
 */
const AU_PHONE_REGEX = /^(?:\+61|0)[2-478](?:[ -]?\d){8}$|^(?:\+61|0)4(?:[ -]?\d){8}$/;

/**
 * Validate email address format
 * @param email - Email address to validate
 * @returns true if email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmedEmail = email.trim();
  if (trimmedEmail.length === 0 || trimmedEmail.length > 320) {
    return false;
  }

  return EMAIL_REGEX.test(trimmedEmail);
};

/**
 * Validate Australian phone number format
 * @param phone - Phone number to validate
 * @returns true if phone number is valid Australian format
 */
export const validatePhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove all spaces, hyphens, parentheses for validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

  // Must be between 10-12 digits (including country code)
  if (cleanPhone.length < 10 || cleanPhone.length > 12) {
    return false;
  }

  return AU_PHONE_REGEX.test(phone);
};

/**
 * Format Australian phone number to standard display format
 * @param phone - Raw phone number input
 * @returns Formatted phone number or original if invalid
 */
export const formatAustralianPhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }

  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  // Handle different input formats
  let formattedPhone = cleanPhone;

  // Convert +61 to 0
  if (formattedPhone.startsWith('+61')) {
    formattedPhone = '0' + formattedPhone.slice(3);
  }

  // Ensure it starts with 0
  if (!formattedPhone.startsWith('0')) {
    formattedPhone = '0' + formattedPhone;
  }

  // Format mobile numbers (04XX XXX XXX)
  if (formattedPhone.startsWith('04') && formattedPhone.length === 10) {
    return `${formattedPhone.slice(0, 4)} ${formattedPhone.slice(4, 7)} ${formattedPhone.slice(7)}`;
  }

  // Format landline numbers (0X XXXX XXXX)
  if (formattedPhone.length === 10 && !formattedPhone.startsWith('04')) {
    return `${formattedPhone.slice(0, 2)} ${formattedPhone.slice(2, 6)} ${formattedPhone.slice(6)}`;
  }

  // Return original if can't format
  return phone;
};

/**
 * Validate a name field (customer name, business name, etc.)
 * @param name - Name to validate
 * @param fieldName - Field name for error message
 * @param minLength - Minimum length (default: 2)
 * @param maxLength - Maximum length (default: 100)
 * @returns Error message or undefined if valid
 */
export const validateName = (
  name: string,
  fieldName: string = 'Name',
  minLength: number = 2,
  maxLength: number = 100
): string | undefined => {
  if (!name || typeof name !== 'string') {
    return `${fieldName} is required`;
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return `${fieldName} is required`;
  }

  if (trimmedName.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }

  if (trimmedName.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }

  // Check for invalid characters (allow letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (!nameRegex.test(trimmedName)) {
    return `${fieldName} contains invalid characters`;
  }

  return undefined;
};

/**
 * Validate a text area field
 * @param text - Text to validate
 * @param fieldName - Field name for error message
 * @param required - Whether field is required
 * @param minLength - Minimum length
 * @param maxLength - Maximum length
 * @returns Error message or undefined if valid
 */
export const validateTextArea = (
  text: string,
  fieldName: string,
  required: boolean = true,
  minLength: number = 10,
  maxLength: number = 1000
): string | undefined => {
  if (!text || typeof text !== 'string') {
    return required ? `${fieldName} is required` : undefined;
  }

  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    return required ? `${fieldName} is required` : undefined;
  }

  if (trimmedText.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }

  if (trimmedText.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }

  return undefined;
};

/**
 * Check if a date is available (not blacked out)
 * @param date - ISO date string to check
 * @param blackoutDates - Array of blackout dates
 * @returns true if date is available, false if blacked out
 */
export const isDateAvailable = (
  date: string,
  blackoutDates: BookingBlackoutDate[]
): boolean => {
  if (!date || blackoutDates.length === 0) {
    return true;
  }

  return !blackoutDates.some(blackout => blackout.date === date);
};

/**
 * Check if a date is in the past
 * @param date - ISO date string to check
 * @returns true if date is in the past
 */
export const isPastDate = (date: string): boolean => {
  if (!date) {
    return true;
  }

  const inputDate = new Date(date);
  const today = new Date();

  // Set time to start of day for comparison
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  return inputDate < today;
};

/**
 * Check if a date is too far in the future
 * @param date - ISO date string to check
 * @param maxDaysAhead - Maximum days ahead to allow (default: 60)
 * @returns true if date is too far in the future
 */
export const isTooFarFuture = (
  date: string,
  maxDaysAhead: number = 60
): boolean => {
  if (!date) {
    return true;
  }

  const inputDate = new Date(date);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDaysAhead);

  return inputDate > maxDate;
};

/**
 * Validate a date selection
 * @param date - ISO date string to validate
 * @param blackoutDates - Array of blackout dates
 * @param maxDaysAhead - Maximum days ahead to allow
 * @returns Error message or undefined if valid
 */
export const validateDateSelection = (
  date: string,
  blackoutDates: BookingBlackoutDate[] = [],
  maxDaysAhead: number = 60
): string | undefined => {
  if (!date) {
    return 'Please select a date';
  }

  if (isPastDate(date)) {
    return 'Please select a future date';
  }

  if (isTooFarFuture(date, maxDaysAhead)) {
    return `Bookings can only be made up to ${maxDaysAhead} days in advance`;
  }

  if (!isDateAvailable(date, blackoutDates)) {
    const blackoutDate = blackoutDates.find(b => b.date === date);
    const reason = blackoutDate?.reason || 'This date is not available';
    return `${reason}`;
  }

  return undefined;
};

/**
 * Validate time slot selection
 * @param timeSlot - Time slot string to validate
 * @param availableSlots - Array of available time slots for the selected date
 * @returns Error message or undefined if valid
 */
export const validateTimeSlot = (
  timeSlot: string,
  availableSlots: string[] = []
): string | undefined => {
  if (!timeSlot) {
    return 'Please select a time slot';
  }

  if (availableSlots.length > 0 && !availableSlots.includes(timeSlot)) {
    return 'Selected time slot is no longer available. Please choose another time.';
  }

  return undefined;
};

/**
 * Validate array selection (marketing channels, etc.)
 * @param array - Array to validate
 * @param fieldName - Field name for error message
 * @param required - Whether at least one selection is required
 * @param validOptions - Array of valid options
 * @returns Error message or undefined if valid
 */
export const validateArraySelection = (
  array: string[],
  fieldName: string,
  required: boolean = false,
  validOptions: readonly string[] = []
): string | undefined => {
  if (!Array.isArray(array)) {
    return required ? `Please select at least one ${fieldName.toLowerCase()}` : undefined;
  }

  if (required && array.length === 0) {
    return `Please select at least one ${fieldName.toLowerCase()}`;
  }

  // Validate each option if validOptions provided
  if (validOptions.length > 0) {
    for (const item of array) {
      if (!validOptions.includes(item)) {
        return `Invalid ${fieldName.toLowerCase()} selection: ${item}`;
      }
    }
  }

  return undefined;
};

/**
 * Validate select field (business type, revenue range, etc.)
 * @param value - Selected value
 * @param fieldName - Field name for error message
 * @param validOptions - Array of valid options
 * @param required - Whether field is required
 * @returns Error message or undefined if valid
 */
export const validateSelect = (
  value: string,
  fieldName: string,
  validOptions: readonly string[] = [],
  required: boolean = true
): string | undefined => {
  if (!value || typeof value !== 'string') {
    return required ? `Please select a ${fieldName.toLowerCase()}` : undefined;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return required ? `Please select a ${fieldName.toLowerCase()}` : undefined;
  }

  if (validOptions.length > 0 && !validOptions.includes(trimmedValue)) {
    return `Invalid ${fieldName.toLowerCase()} selection`;
  }

  return undefined;
};

/**
 * Comprehensive booking form validation
 * @param data - Booking form data to validate
 * @param blackoutDates - Array of blackout dates
 * @param availableSlots - Available time slots for selected date
 * @returns Object containing validation errors
 */
export const validateBookingForm = (
  data: BookingFormData,
  blackoutDates: BookingBlackoutDate[] = [],
  availableSlots: string[] = []
): BookingFormErrors => {
  const errors: BookingFormErrors = {};

  // Validate customer name
  const nameError = validateName(data.customer_name, 'Customer name');
  if (nameError) errors.customer_name = nameError;

  // Validate email
  if (!data.customer_email) {
    errors.customer_email = 'Email is required';
  } else if (!validateEmail(data.customer_email)) {
    errors.customer_email = 'Please enter a valid email address';
  }

  // Validate phone
  if (!data.customer_phone) {
    errors.customer_phone = 'Phone number is required';
  } else if (!validatePhone(data.customer_phone)) {
    errors.customer_phone = 'Please enter a valid Australian phone number';
  }

  // Validate business name
  const businessNameError = validateName(data.business_name, 'Business name');
  if (businessNameError) errors.business_name = businessNameError;

  // Validate business type
  const businessTypeError = validateSelect(
    data.business_type,
    'Business type',
    Array.from({ length: 9 }, (_, i) => [
      'Trades & Services',
      'Hospitality & Food',
      'Retail',
      'Health & Fitness',
      'Professional Services',
      'Beauty & Wellness',
      'Home Services',
      'Automotive',
      'Other'
    ][i])
  );
  if (businessTypeError) errors.business_type = businessTypeError;

  // Validate business location
  const locationError = validateName(data.business_location, 'Business location', 2, 200);
  if (locationError) errors.business_location = locationError;

  // Validate marketing channels
  const marketingError = validateArraySelection(
    data.current_marketing,
    'Marketing channel',
    false,
    [
      'Social Media',
      'Google Ads',
      'Facebook/Instagram Ads',
      'SEO',
      'Email Marketing',
      'Word of Mouth',
      'Local Directories',
      'Print Media',
      'None/Just Started'
    ]
  );
  if (marketingError) errors.current_marketing = marketingError;

  // Validate biggest challenge
  const challengeError = validateTextArea(
    data.biggest_challenge,
    'Biggest challenge',
    true,
    10,
    500
  );
  if (challengeError) errors.biggest_challenge = challengeError;

  // Validate revenue range
  const revenueError = validateSelect(
    data.monthly_revenue_range,
    'Revenue range',
    [
      '$0 - $5,000',
      '$5,000 - $20,000',
      '$20,000 - $50,000',
      '$50,000 - $100,000',
      '$100,000+'
    ]
  );
  if (revenueError) errors.monthly_revenue_range = revenueError;

  // Validate preferred date
  const dateError = validateDateSelection(data.preferred_date, blackoutDates);
  if (dateError) errors.preferred_date = dateError;

  // Validate preferred time slot
  const timeSlotError = validateTimeSlot(data.preferred_time_slot, availableSlots);
  if (timeSlotError) errors.preferred_time_slot = timeSlotError;

  // Validate additional notes (optional)
  if (data.additional_notes) {
    const notesError = validateTextArea(
      data.additional_notes,
      'Additional notes',
      false,
      0,
      1000
    );
    if (notesError) errors.additional_notes = notesError;
  }

  return errors;
};

/**
 * Check if booking form has any validation errors
 * @param errors - Validation errors object
 * @returns true if there are any errors, false otherwise
 */
export const hasValidationErrors = (errors: BookingFormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Get first validation error message
 * @param errors - Validation errors object
 * @returns First error message or undefined
 */
export const getFirstValidationError = (errors: BookingFormErrors): string | undefined => {
  const firstErrorKey = Object.keys(errors)[0];
  return firstErrorKey ? errors[firstErrorKey as keyof BookingFormErrors] : undefined;
};

/**
 * Sanitize text input (remove potentially harmful characters)
 * @param input - Text input to sanitize
 * @returns Sanitized text
 */
export const sanitizeTextInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove HTML tags, script tags, and other potentially harmful content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

/**
 * Validate and sanitize all form data
 * @param data - Raw form data
 * @returns Sanitized form data
 */
export const sanitizeBookingFormData = (data: BookingFormData): BookingFormData => {
  return {
    customer_name: sanitizeTextInput(data.customer_name),
    customer_email: sanitizeTextInput(data.customer_email).toLowerCase(),
    customer_phone: sanitizeTextInput(data.customer_phone),
    business_name: sanitizeTextInput(data.business_name),
    business_type: sanitizeTextInput(data.business_type) as any,
    business_location: sanitizeTextInput(data.business_location),
    current_marketing: data.current_marketing.map(item => sanitizeTextInput(item)),
    biggest_challenge: sanitizeTextInput(data.biggest_challenge),
    monthly_revenue_range: sanitizeTextInput(data.monthly_revenue_range) as any,
    preferred_date: sanitizeTextInput(data.preferred_date),
    preferred_time_slot: sanitizeTextInput(data.preferred_time_slot),
    additional_notes: data.additional_notes ? sanitizeTextInput(data.additional_notes) : undefined,
  };
};