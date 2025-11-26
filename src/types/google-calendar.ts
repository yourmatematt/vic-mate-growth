/**
 * Google Calendar API Types and Interfaces
 * Used for calendar event management and OAuth flow
 */

import { Booking } from './booking';

/**
 * Google Calendar Event structure
 */
export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees: Array<{
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }>;
  conferenceData?: {
    createRequest?: {
      requestId: string;
      conferenceSolutionKey: {
        type: 'hangoutsMeet';
      };
    };
    entryPoints?: Array<{
      uri: string;
      entryPointType: 'video' | 'phone' | 'sip' | 'more';
    }>;
    conferenceSolution?: {
      key: {
        type: 'hangoutsMeet';
      };
      name: string;
      iconUri: string;
    };
  };
  hangoutLink?: string;
  htmlLink?: string;
  location?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  visibility?: 'default' | 'public' | 'private';
  transparency?: 'opaque' | 'transparent';
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
  creator?: {
    email: string;
    displayName?: string;
  };
  organizer?: {
    email: string;
    displayName?: string;
  };
  created?: string;
  updated?: string;
  etag?: string;
}

/**
 * OAuth 2.0 token response from Google
 */
export interface GoogleOAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: 'Bearer';
  scope: string;
  id_token?: string;
}

/**
 * Stored authentication tokens
 */
export interface GoogleAuthTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
  token_type?: string;
  scope?: string;
}

/**
 * Request to create calendar event from booking
 */
export interface CalendarEventRequest {
  booking: Booking;
  sendNotifications?: boolean;
  sendUpdates?: 'all' | 'externalOnly' | 'none';
}

/**
 * Response from calendar event creation
 */
export interface CalendarEventResponse {
  eventId: string;
  meetLink?: string;
  htmlLink?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  created: string;
}

/**
 * Free/busy query request
 */
export interface FreeBusyRequest {
  timeMin: string; // RFC3339 timestamp
  timeMax: string; // RFC3339 timestamp
  timeZone?: string;
  calendarIds: string[];
}

/**
 * Free/busy query response
 */
export interface FreeBusyResponse {
  timeMin: string;
  timeMax: string;
  calendars: Record<string, {
    busy: Array<{
      start: string;
      end: string;
    }>;
    errors?: Array<{
      domain: string;
      reason: string;
    }>;
  }>;
}

/**
 * Calendar list entry
 */
export interface CalendarListEntry {
  id: string;
  summary: string;
  description?: string;
  timeZone: string;
  accessRole: 'freeBusyReader' | 'reader' | 'writer' | 'owner';
  primary?: boolean;
  selected?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
}

/**
 * Error response from Google Calendar API
 */
export interface GoogleCalendarError {
  code: number;
  message: string;
  errors?: Array<{
    domain: string;
    reason: string;
    message: string;
    locationType?: string;
    location?: string;
  }>;
}

/**
 * Calendar event update request
 */
export interface CalendarEventUpdate {
  summary?: string;
  description?: string;
  start?: {
    dateTime: string;
    timeZone: string;
  };
  end?: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  sendUpdates?: 'all' | 'externalOnly' | 'none';
}

/**
 * OAuth authorization URL parameters
 */
export interface GoogleOAuthParams {
  client_id: string;
  redirect_uri: string;
  response_type: 'code';
  scope: string;
  access_type: 'offline';
  prompt?: 'consent' | 'select_account';
  state?: string;
}

/**
 * Calendar service configuration
 */
export interface GoogleCalendarConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  calendarId: string;
  timeZone: string;
  scopes: string[];
}

/**
 * Event creation options
 */
export interface EventCreationOptions {
  sendNotifications?: boolean;
  conferenceDataVersion?: number;
  maxAttendees?: number;
  sendUpdates?: 'all' | 'externalOnly' | 'none';
  supportsAttachments?: boolean;
}

/**
 * Calendar sync status for bookings
 */
export interface CalendarSyncStatus {
  synced: boolean;
  eventId?: string;
  lastSync?: string;
  syncError?: string;
  retryCount?: number;
}

/**
 * Webhook notification from Google Calendar
 */
export interface CalendarWebhookNotification {
  kind: 'api#channel';
  id: string;
  resourceId: string;
  resourceUri: string;
  token?: string;
  expiration?: string;
}

/**
 * Calendar access levels
 */
export type CalendarAccessRole = 'freeBusyReader' | 'reader' | 'writer' | 'owner';

/**
 * Event types for different booking purposes
 */
export type EventType = 'strategy-call' | 'follow-up' | 'meeting' | 'consultation';

/**
 * Calendar event status
 */
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled';

/**
 * Time zone identifiers for Australian locations
 */
export type AustralianTimeZone =
  | 'Australia/Melbourne'
  | 'Australia/Sydney'
  | 'Australia/Brisbane'
  | 'Australia/Adelaide'
  | 'Australia/Perth'
  | 'Australia/Hobart'
  | 'Australia/Darwin';

/**
 * Default configuration constants
 */
export const GOOGLE_CALENDAR_CONSTANTS = {
  SCOPES: [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ],
  TIME_ZONE: 'Australia/Melbourne' as const,
  CONFERENCE_SOLUTION: 'hangoutsMeet' as const,
  DEFAULT_REMINDER_MINUTES: [24 * 60, 60, 15], // 1 day, 1 hour, 15 minutes
  MAX_ATTENDEES: 50,
  EVENT_DURATION_MINUTES: 60,
  API_BASE_URL: 'https://www.googleapis.com/calendar/v3',
  OAUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN_URL: 'https://oauth2.googleapis.com/token'
} as const;

/**
 * Type guards for runtime type checking
 */
export const isGoogleCalendarEvent = (obj: any): obj is GoogleCalendarEvent => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.summary === 'string' &&
    typeof obj.start === 'object' &&
    typeof obj.start.dateTime === 'string' &&
    typeof obj.end === 'object' &&
    typeof obj.end.dateTime === 'string'
  );
};

export const isGoogleCalendarError = (obj: any): obj is GoogleCalendarError => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.code === 'number' &&
    typeof obj.message === 'string'
  );
};

/**
 * Helper type for creating events from bookings
 */
export type CreateEventFromBooking = (
  booking: Booking,
  options?: EventCreationOptions
) => GoogleCalendarEvent;