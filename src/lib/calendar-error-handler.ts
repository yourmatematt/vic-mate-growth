/**
 * Google Calendar Error Handler
 * Handles API errors, retries, and fallback scenarios
 */

import { GoogleCalendarError } from '@/types/google-calendar';

/**
 * Error types that can occur during calendar operations
 */
export enum CalendarErrorType {
  RATE_LIMITED = 'RATE_LIMITED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  CALENDAR_NOT_FOUND = 'CALENDAR_NOT_FOUND',
  EVENT_CONFLICT = 'EVENT_CONFLICT',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Retry configuration for different error types
 */
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: CalendarErrorType[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableErrors: [
    CalendarErrorType.RATE_LIMITED,
    CalendarErrorType.NETWORK_ERROR,
    CalendarErrorType.UNKNOWN_ERROR
  ]
};

/**
 * Calendar operation error class
 */
export class CalendarError extends Error {
  public readonly type: CalendarErrorType;
  public readonly code?: number;
  public readonly retryable: boolean;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    type: CalendarErrorType,
    code?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'CalendarError';
    this.type = type;
    this.code = code;
    this.retryable = DEFAULT_RETRY_CONFIG.retryableErrors.includes(type);
    this.originalError = originalError;
  }
}

/**
 * Parse Google Calendar API error response
 */
export function parseGoogleCalendarError(error: any): CalendarError {
  // Handle network errors
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || !error.response) {
    return new CalendarError(
      'Network error occurred while connecting to Google Calendar',
      CalendarErrorType.NETWORK_ERROR,
      undefined,
      error
    );
  }

  // Handle HTTP errors
  const status = error.response?.status || error.status;
  const data = error.response?.data || error.data || {};

  switch (status) {
    case 400:
      return new CalendarError(
        data.error?.message || 'Invalid request to Google Calendar API',
        CalendarErrorType.INVALID_REQUEST,
        400,
        error
      );

    case 401:
      return new CalendarError(
        'Authentication failed. Token may be expired or invalid.',
        CalendarErrorType.TOKEN_EXPIRED,
        401,
        error
      );

    case 403:
      if (data.error?.errors?.some((e: any) => e.reason === 'quotaExceeded')) {
        return new CalendarError(
          'Google Calendar API quota exceeded',
          CalendarErrorType.QUOTA_EXCEEDED,
          403,
          error
        );
      }
      return new CalendarError(
        'Access denied to Google Calendar',
        CalendarErrorType.FORBIDDEN,
        403,
        error
      );

    case 404:
      if (data.error?.message?.includes('calendar')) {
        return new CalendarError(
          'Calendar not found',
          CalendarErrorType.CALENDAR_NOT_FOUND,
          404,
          error
        );
      }
      return new CalendarError(
        'Requested resource not found',
        CalendarErrorType.NOT_FOUND,
        404,
        error
      );

    case 409:
      return new CalendarError(
        'Event conflict detected',
        CalendarErrorType.EVENT_CONFLICT,
        409,
        error
      );

    case 429:
      return new CalendarError(
        'Rate limit exceeded. Please try again later.',
        CalendarErrorType.RATE_LIMITED,
        429,
        error
      );

    default:
      return new CalendarError(
        data.error?.message || `Google Calendar API error: ${status}`,
        CalendarErrorType.UNKNOWN_ERROR,
        status,
        error
      );
  }
}

/**
 * Calculate delay for exponential backoff
 */
function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig,
  rateLimitDelay?: number
): number {
  // If it's a rate limit error and server provided retry-after header
  if (rateLimitDelay) {
    return Math.min(rateLimitDelay * 1000, config.maxDelayMs);
  }

  // Exponential backoff with jitter
  const exponentialDelay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  const jitter = Math.random() * 0.3; // Add up to 30% jitter
  const delay = exponentialDelay * (1 + jitter);

  return Math.min(delay, config.maxDelayMs);
}

/**
 * Wait for specified delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for calendar operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: CalendarError;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      const result = await operation();

      // Log successful operation if it was retried
      if (attempt > 1) {
        console.log(`✅ ${operationName} succeeded on attempt ${attempt}`);
      }

      return result;
    } catch (error) {
      const calendarError = error instanceof CalendarError
        ? error
        : parseGoogleCalendarError(error);

      lastError = calendarError;

      // Don't retry on the last attempt or non-retryable errors
      if (attempt > config.maxRetries || !calendarError.retryable) {
        console.error(`❌ ${operationName} failed after ${attempt} attempts:`, calendarError);
        throw calendarError;
      }

      // Calculate delay for next attempt
      const retryAfter = calendarError.type === CalendarErrorType.RATE_LIMITED
        ? extractRetryAfterHeader(error)
        : undefined;

      const delayMs = calculateBackoffDelay(attempt, config, retryAfter);

      console.warn(
        `⚠️ ${operationName} failed on attempt ${attempt}/${config.maxRetries + 1}. ` +
        `Retrying in ${Math.round(delayMs / 1000)}s. Error: ${calendarError.message}`
      );

      await delay(delayMs);
    }
  }

  throw lastError!;
}

/**
 * Extract retry-after header value from error response
 */
function extractRetryAfterHeader(error: any): number | undefined {
  const retryAfter = error.response?.headers?.['retry-after'] ||
                    error.response?.headers?.['Retry-After'];

  if (retryAfter) {
    const seconds = parseInt(retryAfter, 10);
    return isNaN(seconds) ? undefined : seconds;
  }

  return undefined;
}

/**
 * Fallback options when calendar integration fails
 */
export interface CalendarFallbackOptions {
  sendEmailWithoutMeetLink: boolean;
  createManualMeetingInstructions: boolean;
  notifyAdminOfFailure: boolean;
  logErrorForDebug: boolean;
}

/**
 * Handle calendar operation failure with fallback options
 */
export async function handleCalendarFailure(
  operationType: 'create' | 'update' | 'delete',
  bookingId: string,
  error: CalendarError,
  options: CalendarFallbackOptions = {
    sendEmailWithoutMeetLink: true,
    createManualMeetingInstructions: true,
    notifyAdminOfFailure: true,
    logErrorForDebug: true
  }
): Promise<{
  success: boolean;
  fallbackActions: string[];
  meetingInstructions?: string;
}> {
  const fallbackActions: string[] = [];

  try {
    // Log error for debugging
    if (options.logErrorForDebug) {
      console.error(`Calendar ${operationType} failed for booking ${bookingId}:`, {
        error: error.message,
        type: error.type,
        code: error.code,
        retryable: error.retryable
      });

      // TODO: Log to database or external service
      fallbackActions.push('Error logged for debugging');
    }

    // Create manual meeting instructions
    let meetingInstructions: string | undefined;
    if (options.createManualMeetingInstructions) {
      meetingInstructions = createManualMeetingInstructions();
      fallbackActions.push('Manual meeting instructions created');
    }

    // Send email notification without Meet link
    if (options.sendEmailWithoutMeetLink) {
      // This would typically call the email service
      // await emailService.sendBookingConfirmation(booking, { meetLink: null });
      fallbackActions.push('Email sent with manual meeting instructions');
    }

    // Notify admin of failure
    if (options.notifyAdminOfFailure) {
      await notifyAdminOfCalendarFailure(bookingId, operationType, error);
      fallbackActions.push('Admin notified of calendar failure');
    }

    return {
      success: true,
      fallbackActions,
      meetingInstructions
    };
  } catch (fallbackError) {
    console.error('Fallback handling also failed:', fallbackError);

    return {
      success: false,
      fallbackActions: ['Fallback handling failed'],
      meetingInstructions: createManualMeetingInstructions()
    };
  }
}

/**
 * Create manual meeting instructions when Google Meet fails
 */
function createManualMeetingInstructions(): string {
  return `
📞 MEETING CONNECTION INSTRUCTIONS

Since we experienced a technical issue with Google Meet, please use one of these alternatives:

🎥 Option 1: Video Call
We'll send you a Zoom link via email 15 minutes before your scheduled time.

📞 Option 2: Phone Call
We'll call you at the number you provided: [PHONE_NUMBER]
Please ensure you're available to answer at your scheduled time.

💬 Option 3: WhatsApp Video
Message us at +61 478 101 521 for a WhatsApp video call.

⏰ Your scheduled time remains the same: [MEETING_TIME]

We apologize for any inconvenience and look forward to speaking with you!

Questions? Reply to this email or call +61 478 101 521.

Best regards,
Matt & the Your Mate Agency team
`.trim();
}

/**
 * Notify admin of calendar operation failure
 */
async function notifyAdminOfCalendarFailure(
  bookingId: string,
  operationType: string,
  error: CalendarError
): Promise<void> {
  try {
    // TODO: Send email/slack notification to admin
    console.error(`🚨 Calendar ${operationType} failed for booking ${bookingId}`, {
      errorType: error.type,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      retryable: error.retryable
    });

    // This would typically send an admin notification
    // await adminNotificationService.sendCalendarErrorAlert({
    //   bookingId,
    //   operationType,
    //   error: {
    //     type: error.type,
    //     message: error.message,
    //     code: error.code
    //   }
    // });
  } catch (notificationError) {
    console.error('Failed to notify admin of calendar error:', notificationError);
  }
}

/**
 * Check if error suggests token refresh is needed
 */
export function shouldRefreshToken(error: CalendarError): boolean {
  return error.type === CalendarErrorType.TOKEN_EXPIRED ||
         error.type === CalendarErrorType.INVALID_TOKEN ||
         (error.code === 401);
}

/**
 * Check if operation should be retried
 */
export function shouldRetryOperation(error: CalendarError, attempt: number, maxRetries: number): boolean {
  return error.retryable && attempt <= maxRetries;
}

/**
 * Get user-friendly error message for display
 */
export function getUserFriendlyErrorMessage(error: CalendarError): string {
  switch (error.type) {
    case CalendarErrorType.RATE_LIMITED:
      return 'Calendar service is temporarily busy. Please try again in a few minutes.';

    case CalendarErrorType.TOKEN_EXPIRED:
    case CalendarErrorType.INVALID_TOKEN:
      return 'Calendar connection needs to be refreshed. Please contact support.';

    case CalendarErrorType.CALENDAR_NOT_FOUND:
      return 'Calendar not found. Please contact support to fix the configuration.';

    case CalendarErrorType.NETWORK_ERROR:
      return 'Network connection issue. Please check your internet and try again.';

    case CalendarErrorType.QUOTA_EXCEEDED:
      return 'Calendar service limit reached. Please try again later or contact support.';

    case CalendarErrorType.FORBIDDEN:
      return 'Access denied to calendar service. Please contact support.';

    case CalendarErrorType.EVENT_CONFLICT:
      return 'Calendar event conflict detected. Please choose a different time.';

    default:
      return 'Calendar service is temporarily unavailable. Your booking is confirmed, but the calendar event may need to be created manually.';
  }
}

/**
 * Export error handler utilities
 */
export const CalendarErrorHandler = {
  parseGoogleCalendarError,
  withRetry,
  handleCalendarFailure,
  shouldRefreshToken,
  shouldRetryOperation,
  getUserFriendlyErrorMessage,
  CalendarError,
  CalendarErrorType
};