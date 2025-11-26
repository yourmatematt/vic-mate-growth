/**
 * Google Calendar Service
 * Handles Google Calendar API integration with OAuth 2.0
 */

import {
  GoogleCalendarEvent,
  GoogleAuthTokens,
  CalendarEventRequest,
  CalendarEventResponse,
  GoogleOAuthTokenResponse,
  GoogleCalendarConfig,
  EventCreationOptions,
  GOOGLE_CALENDAR_CONSTANTS
} from '@/types/google-calendar';
import { Booking } from '@/types/booking';
import { createCalendarEventFromBooking } from '@/templates/calendar-event-template';
import {
  CalendarErrorHandler,
  CalendarError,
  CalendarErrorType
} from '@/lib/calendar-error-handler';
import { supabase } from '@/lib/supabase';

/**
 * Google Calendar Service Configuration
 */
const config: GoogleCalendarConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: '',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/admin/google-calendar-auth`,
  calendarId: import.meta.env.VITE_GOOGLE_CALENDAR_ID || 'primary',
  timeZone: GOOGLE_CALENDAR_CONSTANTS.TIME_ZONE,
  scopes: GOOGLE_CALENDAR_CONSTANTS.SCOPES
};

/**
 * Google Calendar Service Class
 */
class GoogleCalendarService {
  private baseUrl = GOOGLE_CALENDAR_CONSTANTS.API_BASE_URL;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Initialize the service and load stored tokens
   */
  async initialize(): Promise<void> {
    try {
      const tokens = await this.getStoredTokens();
      if (tokens) {
        this.accessToken = tokens.access_token;
        this.refreshToken = tokens.refresh_token;
        this.tokenExpiry = new Date(tokens.expiry_date);

        // Refresh token if it's expired or expires soon (within 5 minutes)
        const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
        if (this.tokenExpiry <= fiveMinutesFromNow) {
          await this.refreshAccessToken();
        }
      }
    } catch (error) {
      console.error('Failed to initialize Google Calendar service:', error);
      throw new CalendarError(
        'Failed to initialize calendar service',
        CalendarErrorType.UNKNOWN_ERROR,
        undefined,
        error
      );
    }
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      response_type: 'code',
      scope: config.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state })
    });

    return `${GOOGLE_CALENDAR_CONSTANTS.OAUTH_URL}?${params.toString()}`;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleOAuthCallback(code: string): Promise<GoogleAuthTokens> {
    try {
      const tokenResponse = await fetch(GOOGLE_CALENDAR_CONSTANTS.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: config.redirectUri,
          grant_type: 'authorization_code',
          code
        }).toString()
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new CalendarError(
          `OAuth token exchange failed: ${errorData.error_description || errorData.error}`,
          CalendarErrorType.INVALID_TOKEN,
          tokenResponse.status
        );
      }

      const tokenData: GoogleOAuthTokenResponse = await tokenResponse.json();

      if (!tokenData.refresh_token) {
        throw new CalendarError(
          'No refresh token received. Please re-authorize with consent.',
          CalendarErrorType.INVALID_TOKEN
        );
      }

      const tokens: GoogleAuthTokens = {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expiry_date: Date.now() + (tokenData.expires_in * 1000)
      };

      // Store tokens in database
      await this.storeTokens(tokens);

      // Update instance variables
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      this.tokenExpiry = new Date(tokens.expiry_date);

      return tokens;
    } catch (error) {
      if (error instanceof CalendarError) {
        throw error;
      }
      throw CalendarErrorHandler.parseGoogleCalendarError(error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new CalendarError(
        'No refresh token available. Re-authorization required.',
        CalendarErrorType.TOKEN_EXPIRED
      );
    }

    try {
      const refreshResponse = await fetch(GOOGLE_CALENDAR_CONSTANTS.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token'
        }).toString()
      });

      if (!refreshResponse.ok) {
        const errorData = await refreshResponse.json();
        throw new CalendarError(
          `Token refresh failed: ${errorData.error_description || errorData.error}`,
          CalendarErrorType.TOKEN_EXPIRED,
          refreshResponse.status
        );
      }

      const refreshData: Omit<GoogleOAuthTokenResponse, 'refresh_token'> = await refreshResponse.json();

      const updatedTokens: GoogleAuthTokens = {
        access_token: refreshData.access_token,
        refresh_token: this.refreshToken, // Keep existing refresh token
        expiry_date: Date.now() + (refreshData.expires_in * 1000)
      };

      // Update stored tokens
      await this.storeTokens(updatedTokens);

      // Update instance variables
      this.accessToken = updatedTokens.access_token;
      this.tokenExpiry = new Date(updatedTokens.expiry_date);

      console.log('✅ Google Calendar access token refreshed successfully');

      return updatedTokens.access_token;
    } catch (error) {
      if (error instanceof CalendarError) {
        throw error;
      }
      throw CalendarErrorHandler.parseGoogleCalendarError(error);
    }
  }

  /**
   * Make authenticated API request to Google Calendar
   */
  private async makeApiRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    await this.ensureValidToken();

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...(body && { body: JSON.stringify(body) })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw CalendarErrorHandler.parseGoogleCalendarError({
        response: {
          status: response.status,
          data: errorData
        }
      });
    }

    return response.json();
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken) {
      await this.initialize();
    }

    if (!this.accessToken) {
      throw new CalendarError(
        'No access token available. Please authenticate first.',
        CalendarErrorType.TOKEN_EXPIRED
      );
    }

    // Check if token is expired or expires soon
    const twoMinutesFromNow = new Date(Date.now() + 2 * 60 * 1000);
    if (this.tokenExpiry && this.tokenExpiry <= twoMinutesFromNow) {
      await this.refreshAccessToken();
    }
  }

  /**
   * Create a calendar event from a booking
   */
  async createCalendarEvent(booking: Booking, options?: EventCreationOptions): Promise<CalendarEventResponse> {
    const operation = async () => {
      const eventData = createCalendarEventFromBooking(booking);

      const queryParams = new URLSearchParams({
        conferenceDataVersion: '1',
        sendUpdates: options?.sendUpdates || 'all'
      });

      const response = await this.makeApiRequest<GoogleCalendarEvent>(
        `/calendars/${encodeURIComponent(config.calendarId)}/events?${queryParams.toString()}`,
        'POST',
        eventData
      );

      // Update booking with calendar details
      await this.updateBookingCalendarInfo(booking.id, {
        google_calendar_event_id: response.id!,
        google_meet_link: response.hangoutLink || '',
        calendar_sync_status: 'synced',
        calendar_synced_at: new Date().toISOString()
      });

      // Log successful operation
      await this.logCalendarOperation(booking.id, 'create', 'success', response.id!);

      return {
        eventId: response.id!,
        meetLink: response.hangoutLink,
        htmlLink: response.htmlLink,
        status: response.status || 'confirmed',
        created: response.created || new Date().toISOString()
      };
    };

    try {
      return await CalendarErrorHandler.withRetry(
        operation,
        `Create calendar event for booking ${booking.id}`
      );
    } catch (error) {
      // Log failed operation
      await this.logCalendarOperation(
        booking.id,
        'create',
        'failed',
        undefined,
        error instanceof CalendarError ? error.message : String(error)
      );

      // Update booking sync status
      await this.updateBookingCalendarInfo(booking.id, {
        calendar_sync_status: 'failed',
        calendar_sync_error: error instanceof CalendarError ? error.message : String(error)
      });

      throw error;
    }
  }

  /**
   * Update an existing calendar event
   */
  async updateCalendarEvent(eventId: string, booking: Booking, options?: EventCreationOptions): Promise<void> {
    const operation = async () => {
      const eventData = createCalendarEventFromBooking(booking);

      const queryParams = new URLSearchParams({
        sendUpdates: options?.sendUpdates || 'all'
      });

      await this.makeApiRequest<GoogleCalendarEvent>(
        `/calendars/${encodeURIComponent(config.calendarId)}/events/${eventId}?${queryParams.toString()}`,
        'PUT',
        eventData
      );

      // Update booking sync status
      await this.updateBookingCalendarInfo(booking.id, {
        calendar_sync_status: 'synced',
        calendar_synced_at: new Date().toISOString()
      });
    };

    try {
      await CalendarErrorHandler.withRetry(
        operation,
        `Update calendar event ${eventId} for booking ${booking.id}`
      );

      await this.logCalendarOperation(booking.id, 'update', 'success', eventId);
    } catch (error) {
      await this.logCalendarOperation(
        booking.id,
        'update',
        'failed',
        eventId,
        error instanceof CalendarError ? error.message : String(error)
      );

      await this.updateBookingCalendarInfo(booking.id, {
        calendar_sync_status: 'failed',
        calendar_sync_error: error instanceof CalendarError ? error.message : String(error)
      });

      throw error;
    }
  }

  /**
   * Delete a calendar event
   */
  async deleteCalendarEvent(eventId: string, bookingId: string): Promise<void> {
    const operation = async () => {
      await this.makeApiRequest(
        `/calendars/${encodeURIComponent(config.calendarId)}/events/${eventId}?sendUpdates=all`,
        'DELETE'
      );

      // Update booking to remove calendar info
      await this.updateBookingCalendarInfo(bookingId, {
        google_calendar_event_id: null,
        google_meet_link: null,
        calendar_sync_status: 'cancelled',
        calendar_synced_at: new Date().toISOString()
      });
    };

    try {
      await CalendarErrorHandler.withRetry(
        operation,
        `Delete calendar event ${eventId} for booking ${bookingId}`
      );

      await this.logCalendarOperation(bookingId, 'delete', 'success', eventId);
    } catch (error) {
      await this.logCalendarOperation(
        bookingId,
        'delete',
        'failed',
        eventId,
        error instanceof CalendarError ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Get a calendar event by ID
   */
  async getEvent(eventId: string): Promise<GoogleCalendarEvent> {
    return CalendarErrorHandler.withRetry(
      () => this.makeApiRequest<GoogleCalendarEvent>(
        `/calendars/${encodeURIComponent(config.calendarId)}/events/${eventId}`
      ),
      `Get calendar event ${eventId}`
    );
  }

  /**
   * Get stored authentication tokens from database
   */
  private async getStoredTokens(): Promise<GoogleAuthTokens | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_google_auth_token', { user_email: config.calendarId })
        .single();

      if (error) {
        console.warn('No stored Google Calendar tokens found:', error.message);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiry_date: new Date(data.expires_at).getTime()
      };
    } catch (error) {
      console.error('Failed to retrieve stored tokens:', error);
      return null;
    }
  }

  /**
   * Store authentication tokens in database
   */
  private async storeTokens(tokens: GoogleAuthTokens): Promise<void> {
    try {
      const expiresInSeconds = Math.floor((tokens.expiry_date - Date.now()) / 1000);

      const { error } = await supabase.rpc('store_google_auth_token', {
        user_email: config.calendarId,
        new_access_token: tokens.access_token,
        new_refresh_token: tokens.refresh_token,
        expires_in_seconds: expiresInSeconds
      });

      if (error) {
        throw new Error(`Failed to store tokens: ${error.message}`);
      }

      console.log('✅ Google Calendar tokens stored successfully');
    } catch (error) {
      console.error('Failed to store Google Calendar tokens:', error);
      throw error;
    }
  }

  /**
   * Update booking with calendar information
   */
  private async updateBookingCalendarInfo(bookingId: string, updates: {
    google_calendar_event_id?: string | null;
    google_meet_link?: string | null;
    calendar_sync_status?: string;
    calendar_sync_error?: string | null;
    calendar_synced_at?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId);

      if (error) {
        console.error('Failed to update booking calendar info:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating booking calendar info:', error);
      // Don't throw here to avoid breaking calendar operations
    }
  }

  /**
   * Log calendar operation for debugging and auditing
   */
  private async logCalendarOperation(
    bookingId: string,
    operation: 'create' | 'update' | 'delete' | 'sync',
    status: 'pending' | 'success' | 'failed',
    eventId?: string,
    errorMessage?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_calendar_sync_operation', {
        booking_uuid: bookingId,
        operation,
        sync_status: status,
        event_id: eventId,
        error_msg: errorMessage
      });

      if (error) {
        console.error('Failed to log calendar operation:', error);
      }
    } catch (error) {
      console.error('Error logging calendar operation:', error);
      // Don't throw to avoid breaking main operations
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!(config.clientId && config.redirectUri);
  }

  /**
   * Check if the service is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.accessToken && this.refreshToken);
  }

  /**
   * Get current configuration (without secrets)
   */
  getConfig() {
    return {
      calendarId: config.calendarId,
      timeZone: config.timeZone,
      scopes: config.scopes,
      redirectUri: config.redirectUri,
      isConfigured: this.isConfigured(),
      isAuthenticated: this.isAuthenticated(),
      tokenExpiry: this.tokenExpiry
    };
  }
}

// Create singleton instance
export const googleCalendarService = new GoogleCalendarService();

// Export types and utilities
export {
  GoogleCalendarService,
  CalendarErrorHandler,
  CalendarError,
  CalendarErrorType
};

// Export default service instance
export default googleCalendarService;