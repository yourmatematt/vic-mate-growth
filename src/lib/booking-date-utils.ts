/**
 * Booking Date & Time Utilities
 * Handles date formatting, time slot manipulation, and Australian-specific date logic
 */

import type { BookingBlackoutDate } from '@/types/booking';

/**
 * Format date for display with Australian locale
 * @param date - ISO date string or Date object
 * @param format - Format type ('full', 'short', 'medium')
 * @returns Formatted date string
 */
export const formatDateForDisplay = (
  date: string | Date,
  format: 'full' | 'short' | 'medium' = 'full'
): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Australia/Melbourne', // VIC timezone
  };

  switch (format) {
    case 'full':
      options.weekday = 'long';
      options.day = 'numeric';
      options.month = 'long';
      options.year = 'numeric';
      break;
    case 'medium':
      options.weekday = 'short';
      options.day = 'numeric';
      options.month = 'short';
      options.year = 'numeric';
      break;
    case 'short':
      options.day = 'numeric';
      options.month = 'numeric';
      options.year = 'numeric';
      break;
  }

  return dateObj.toLocaleDateString('en-AU', options);
};

/**
 * Format time slot for display
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Formatted time slot string (e.g., "9:00 AM - 10:00 AM")
 */
export const formatTimeSlot = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return '';

  try {
    // Create date objects for time formatting
    const startDate = new Date(`1970-01-01T${startTime}:00`);
    const endDate = new Date(`1970-01-01T${endTime}:00`);

    const timeFormat: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Australia/Melbourne'
    };

    const formattedStart = startDate.toLocaleTimeString('en-AU', timeFormat);
    const formattedEnd = endDate.toLocaleTimeString('en-AU', timeFormat);

    return `${formattedStart} - ${formattedEnd}`;
  } catch (error) {
    console.error('Error formatting time slot:', error);
    return `${startTime} - ${endTime}`;
  }
};

/**
 * Get array of next N days as ISO date strings
 * @param days - Number of days to generate (default: 14)
 * @param startDate - Starting date (default: today)
 * @returns Array of ISO date strings
 */
export const getNext14Days = (days: number = 14, startDate?: Date): string[] => {
  const start = startDate || new Date();
  const dates: string[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date.toISOString().split('T')[0]); // Get YYYY-MM-DD format
  }

  return dates;
};

/**
 * Get day name from date
 * @param date - ISO date string or Date object
 * @param format - Format type ('long', 'short', 'narrow')
 * @returns Day name
 */
export const getDayName = (
  date: string | Date,
  format: 'long' | 'short' | 'narrow' = 'long'
): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  return dateObj.toLocaleDateString('en-AU', {
    weekday: format,
    timeZone: 'Australia/Melbourne'
  });
};

/**
 * Check if date is weekend
 * @param date - ISO date string or Date object
 * @returns true if Saturday or Sunday
 */
export const isWeekend = (date: string | Date): boolean => {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return false;
  }

  const day = dateObj.getDay();
  return day === 0 || day === 6; // Sunday (0) or Saturday (6)
};

/**
 * Check if date is today
 * @param date - ISO date string or Date object
 * @returns true if date is today
 */
export const isToday = (date: string | Date): boolean => {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getFullYear() === today.getFullYear() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getDate() === today.getDate()
  );
};

/**
 * Check if date is tomorrow
 * @param date - ISO date string or Date object
 * @returns true if date is tomorrow
 */
export const isTomorrow = (date: string | Date): boolean => {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    dateObj.getFullYear() === tomorrow.getFullYear() &&
    dateObj.getMonth() === tomorrow.getMonth() &&
    dateObj.getDate() === tomorrow.getDate()
  );
};

/**
 * Get relative date description
 * @param date - ISO date string or Date object
 * @returns Relative description ('Today', 'Tomorrow', or formatted date)
 */
export const getRelativeDateDescription = (date: string | Date): string => {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return formatDateForDisplay(date, 'medium');
};

/**
 * Get Australian public holidays for a given year (Victoria specific)
 * @param year - Year to get holidays for
 * @returns Array of BookingBlackoutDate objects
 */
export const getAustralianHolidays = (year: number): BookingBlackoutDate[] => {
  const holidays: BookingBlackoutDate[] = [];

  // Fixed date holidays
  const fixedHolidays = [
    { date: `${year}-01-01`, reason: "New Year's Day" },
    { date: `${year}-01-26`, reason: "Australia Day" },
    { date: `${year}-04-25`, reason: "ANZAC Day" },
    { date: `${year}-12-25`, reason: "Christmas Day" },
    { date: `${year}-12-26`, reason: "Boxing Day" },
  ];

  // Calculate Easter dates
  const easter = calculateEasterDate(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  // Calculate Queen's Birthday (second Monday in June for VIC)
  const queensBirthday = getNthWeekdayOfMonth(year, 5, 1, 2); // June (5), Monday (1), 2nd

  // Calculate Melbourne Cup Day (first Tuesday in November for VIC)
  const melbourneCup = getNthWeekdayOfMonth(year, 10, 2, 1); // November (10), Tuesday (2), 1st

  // Add variable holidays
  holidays.push(
    { id: '', date: goodFriday.toISOString().split('T')[0], reason: 'Good Friday', created_at: '' },
    { id: '', date: easterMonday.toISOString().split('T')[0], reason: 'Easter Monday', created_at: '' },
    { id: '', date: queensBirthday.toISOString().split('T')[0], reason: "Queen's Birthday (VIC)", created_at: '' },
    { id: '', date: melbourneCup.toISOString().split('T')[0], reason: 'Melbourne Cup Day (VIC)', created_at: '' }
  );

  // Add fixed holidays
  fixedHolidays.forEach(holiday => {
    holidays.push({
      id: '',
      date: holiday.date,
      reason: holiday.reason,
      created_at: ''
    });
  });

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Calculate Easter date for a given year
 * @param year - Year to calculate Easter for
 * @returns Date object for Easter Sunday
 */
const calculateEasterDate = (year: number): Date => {
  // Anonymous Gregorian algorithm for Easter calculation
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
};

/**
 * Get the nth weekday of a month
 * @param year - Year
 * @param month - Month (0-11)
 * @param weekday - Day of week (0=Sunday, 1=Monday, etc.)
 * @param nth - Which occurrence (1=first, 2=second, etc.)
 * @returns Date object
 */
const getNthWeekdayOfMonth = (year: number, month: number, weekday: number, nth: number): Date => {
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay();

  // Calculate days to add to get to the first occurrence of the weekday
  let daysToAdd = weekday - firstWeekday;
  if (daysToAdd < 0) {
    daysToAdd += 7;
  }

  // Add additional weeks for nth occurrence
  daysToAdd += (nth - 1) * 7;

  return new Date(year, month, 1 + daysToAdd);
};

/**
 * Convert 12-hour time to 24-hour time
 * @param time12h - Time in 12-hour format (e.g., "9:00 AM")
 * @returns Time in 24-hour format (e.g., "09:00")
 */
export const convertTo24Hour = (time12h: string): string => {
  if (!time12h) return '';

  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');

  if (hours === '12') {
    hours = '00';
  }

  if (modifier?.toUpperCase() === 'PM') {
    hours = String(parseInt(hours, 10) + 12);
  }

  return `${hours.padStart(2, '0')}:${minutes}`;
};

/**
 * Convert 24-hour time to 12-hour time
 * @param time24h - Time in 24-hour format (e.g., "09:00")
 * @returns Time in 12-hour format (e.g., "9:00 AM")
 */
export const convertTo12Hour = (time24h: string): string => {
  if (!time24h) return '';

  try {
    const date = new Date(`1970-01-01T${time24h}:00`);
    return date.toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error converting to 12-hour format:', error);
    return time24h;
  }
};

/**
 * Get time difference in minutes
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns Duration in minutes
 */
export const getTimeDifference = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;

  try {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);

    return (end.getTime() - start.getTime()) / (1000 * 60);
  } catch (error) {
    console.error('Error calculating time difference:', error);
    return 0;
  }
};

/**
 * Add minutes to a time
 * @param time - Time in HH:MM format
 * @param minutes - Minutes to add
 * @returns New time in HH:MM format
 */
export const addMinutesToTime = (time: string, minutes: number): string => {
  if (!time) return '';

  try {
    const date = new Date(`1970-01-01T${time}:00`);
    date.setMinutes(date.getMinutes() + minutes);

    return date.toTimeString().slice(0, 5);
  } catch (error) {
    console.error('Error adding minutes to time:', error);
    return time;
  }
};

/**
 * Generate time slots for a given time range
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @param slotDuration - Duration of each slot in minutes (default: 60)
 * @returns Array of time slot objects
 */
export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  slotDuration: number = 60
): Array<{ start: string; end: string; display: string }> => {
  const slots = [];
  let current = startTime;

  while (getTimeDifference(current, endTime) >= slotDuration) {
    const slotEnd = addMinutesToTime(current, slotDuration);
    slots.push({
      start: current,
      end: slotEnd,
      display: formatTimeSlot(current, slotEnd)
    });
    current = slotEnd;
  }

  return slots;
};

/**
 * Check if time is within business hours
 * @param time - Time in HH:MM format
 * @param businessHours - Business hours object
 * @returns true if within business hours
 */
export const isWithinBusinessHours = (
  time: string,
  businessHours: { start: string; end: string } = { start: '09:00', end: '17:00' }
): boolean => {
  if (!time) return false;

  return time >= businessHours.start && time <= businessHours.end;
};

/**
 * Format duration in minutes to human-readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hour${hours === 1 ? '' : 's'}`;
  }

  return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
};

/**
 * Get timezone offset for Australia/Melbourne
 * @param date - Date to get offset for (default: now)
 * @returns Timezone offset string (e.g., "+10:00" or "+11:00")
 */
export const getMelbourneTimezoneOffset = (date: Date = new Date()): string => {
  const formatter = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    timeZoneName: 'longOffset'
  });

  const parts = formatter.formatToParts(date);
  const offset = parts.find(part => part.type === 'timeZoneName')?.value || '+10:00';

  return offset;
};

/**
 * Convert UTC date to Melbourne timezone
 * @param utcDate - UTC date string or Date object
 * @returns Date object in Melbourne timezone
 */
export const convertToMelbourneTime = (utcDate: string | Date): Date => {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;

  return new Date(date.toLocaleString('en-AU', {
    timeZone: 'Australia/Melbourne'
  }));
};

/**
 * Get business days between two dates (excluding weekends)
 * @param startDate - Start date
 * @param endDate - End date
 * @param excludeHolidays - Holiday dates to exclude
 * @returns Number of business days
 */
export const getBusinessDaysBetween = (
  startDate: Date,
  endDate: Date,
  excludeHolidays: string[] = []
): number => {
  let businessDays = 0;
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];

    // Check if it's a weekday and not a holiday
    if (!isWeekend(current) && !excludeHolidays.includes(dateStr)) {
      businessDays++;
    }

    current.setDate(current.getDate() + 1);
  }

  return businessDays;
};

/**
 * Format date range for display
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: string | Date, endDate: string | Date): string => {
  const start = formatDateForDisplay(startDate, 'medium');
  const end = formatDateForDisplay(endDate, 'medium');

  if (start === end) {
    return start;
  }

  return `${start} - ${end}`;
};