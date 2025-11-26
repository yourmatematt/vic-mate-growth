/**
 * Recurring Meetings Types
 * TypeScript definitions for recurring meeting functionality
 */

export type SubscriptionTier = 'starter' | 'growth' | 'pro';
export type MeetingType = 'report_brief' | 'strategy' | 'consultation';
export type RecurrenceFrequency = 'weekly' | 'bi-weekly' | 'monthly';
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no-show';

export interface RecurringMeeting {
  id: string;
  user_id: string;
  subscription_tier: SubscriptionTier;
  meeting_type: MeetingType;
  title: string;
  recurrence_frequency: RecurrenceFrequency;
  day_of_week: number | null; // 0=Sunday, 6=Saturday
  day_of_month: number | null; // 1-31
  week_of_month: number | null; // 1st, 2nd, 3rd, 4th week
  preferred_time: string; // HH:MM format
  timezone: string;
  duration_minutes: number;
  google_calendar_event_ids: string[];
  google_meet_link: string | null;
  is_active: boolean;
  start_date: string; // YYYY-MM-DD format
  end_date: string | null;
  created_at: string;
  updated_at: string;
  last_generated_at: string | null;
}

export interface MeetingInstance {
  id: string;
  recurring_meeting_id: string;
  scheduled_date: string; // YYYY-MM-DD format
  scheduled_time: string; // HH:MM format
  timezone: string;
  google_calendar_event_id: string | null;
  google_meet_link: string | null;
  calendar_html_link: string | null;
  status: MeetingStatus;
  attended: boolean | null;
  original_date: string | null;
  original_time: string | null;
  reschedule_reason: string | null;
  client_notes: string | null;
  admin_notes: string | null;
  meeting_summary: string | null;
  reminder_24h_sent: boolean;
  reminder_1h_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpcomingMeeting extends MeetingInstance {
  // Extended with recurring meeting info
  meeting_type: MeetingType;
  title: string;
  duration_minutes: number;
  user_email?: string;
  user_name?: string;
}

export interface RecurringMeetingFormData {
  meeting_type?: MeetingType;
  title?: string;
  recurrence_frequency: RecurrenceFrequency;
  day_of_month?: number; // For monthly (1-31)
  day_of_week?: number; // For weekly/bi-weekly (0-6, Monday=1)
  week_of_month?: number; // For monthly by week (1st Tuesday, etc.)
  preferred_time: string; // HH:MM format
  start_date: string; // YYYY-MM-DD format
  end_date?: string; // Optional end date
  duration_minutes?: number;
}

export interface RescheduleMeetingData {
  instance_id: string;
  new_date: string;
  new_time: string;
  reason?: string;
}

export interface MeetingInstanceUpdate {
  status?: MeetingStatus;
  attended?: boolean;
  client_notes?: string;
  admin_notes?: string;
  meeting_summary?: string;
}

// Static option definitions
export const RECURRENCE_OPTIONS = [
  {
    value: 'monthly' as const,
    label: 'Monthly',
    description: 'Same day each month',
    maxFrequency: 1
  },
  {
    value: 'bi-weekly' as const,
    label: 'Bi-weekly',
    description: 'Every 2 weeks',
    maxFrequency: 2
  },
  {
    value: 'weekly' as const,
    label: 'Weekly',
    description: 'Same day every week',
    maxFrequency: 4
  }
] as const;

export const MEETING_TYPE_OPTIONS = [
  {
    value: 'report_brief' as const,
    label: 'Report Brief',
    description: 'Monthly business performance review',
    defaultDuration: 30
  },
  {
    value: 'strategy' as const,
    label: 'Strategy Session',
    description: 'Quarterly planning session',
    defaultDuration: 60
  },
  {
    value: 'consultation' as const,
    label: 'Consultation',
    description: 'Ad-hoc consultation call',
    defaultDuration: 45
  }
] as const;

// Helper function to get ordinal suffix (1st, 2nd, 3rd, etc.)
export function getOrdinalSuffix(num: number): string {
  if (num >= 11 && num <= 13) return 'th';
  switch (num % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Day options for monthly meetings
export const DAY_OF_MONTH_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}${getOrdinalSuffix(i + 1)}`,
  description: `${i + 1}${getOrdinalSuffix(i + 1)} of each month`
}));

// Weekday options (Monday-Friday for business meetings)
export const DAY_OF_WEEK_OPTIONS = [
  { value: 1, label: 'Monday', shortLabel: 'Mon' },
  { value: 2, label: 'Tuesday', shortLabel: 'Tue' },
  { value: 3, label: 'Wednesday', shortLabel: 'Wed' },
  { value: 4, label: 'Thursday', shortLabel: 'Thu' },
  { value: 5, label: 'Friday', shortLabel: 'Fri' }
];

// Week of month options for monthly meetings
export const WEEK_OF_MONTH_OPTIONS = [
  { value: 1, label: '1st week', description: 'First occurrence in the month' },
  { value: 2, label: '2nd week', description: 'Second occurrence in the month' },
  { value: 3, label: '3rd week', description: 'Third occurrence in the month' },
  { value: 4, label: '4th week', description: 'Fourth occurrence in the month' }
];

// Time slot options (business hours AEST)
export const TIME_SLOT_OPTIONS = [
  { value: '09:00', label: '9:00 AM', period: 'Morning' },
  { value: '09:30', label: '9:30 AM', period: 'Morning' },
  { value: '10:00', label: '10:00 AM', period: 'Morning' },
  { value: '10:30', label: '10:30 AM', period: 'Morning' },
  { value: '11:00', label: '11:00 AM', period: 'Morning' },
  { value: '11:30', label: '11:30 AM', period: 'Morning' },
  { value: '12:00', label: '12:00 PM', period: 'Midday' },
  { value: '12:30', label: '12:30 PM', period: 'Midday' },
  { value: '13:00', label: '1:00 PM', period: 'Afternoon' },
  { value: '13:30', label: '1:30 PM', period: 'Afternoon' },
  { value: '14:00', label: '2:00 PM', period: 'Afternoon' },
  { value: '14:30', label: '2:30 PM', period: 'Afternoon' },
  { value: '15:00', label: '3:00 PM', period: 'Afternoon' },
  { value: '15:30', label: '3:30 PM', period: 'Afternoon' },
  { value: '16:00', label: '4:00 PM', period: 'Afternoon' },
  { value: '16:30', label: '4:30 PM', period: 'Afternoon' }
];

// Subscription tier permissions
export interface SubscriptionPermissions {
  allowedFrequencies: RecurrenceFrequency[];
  maxMeetingsPerMonth: number;
  canAccessRecurring: boolean;
  description: string;
}

export const SUBSCRIPTION_PERMISSIONS: Record<SubscriptionTier, SubscriptionPermissions> = {
  starter: {
    allowedFrequencies: [],
    maxMeetingsPerMonth: 0,
    canAccessRecurring: false,
    description: 'Recurring meetings not included'
  },
  growth: {
    allowedFrequencies: ['monthly'],
    maxMeetingsPerMonth: 1,
    canAccessRecurring: true,
    description: 'Monthly report brief meetings included'
  },
  pro: {
    allowedFrequencies: ['monthly', 'bi-weekly'],
    maxMeetingsPerMonth: 2,
    canAccessRecurring: true,
    description: 'Bi-weekly report brief meetings included'
  }
};

// Helper functions
export function formatMeetingSchedule(meeting: RecurringMeeting): string {
  const timeLabel = TIME_SLOT_OPTIONS.find(t => t.value === meeting.preferred_time)?.label || meeting.preferred_time;

  if (meeting.recurrence_frequency === 'monthly') {
    if (meeting.day_of_month) {
      const ordinal = `${meeting.day_of_month}${getOrdinalSuffix(meeting.day_of_month)}`;
      return `${ordinal} of each month at ${timeLabel}`;
    } else if (meeting.day_of_week && meeting.week_of_month) {
      const dayName = DAY_OF_WEEK_OPTIONS.find(d => d.value === meeting.day_of_week)?.label;
      const weekOrdinal = WEEK_OF_MONTH_OPTIONS.find(w => w.value === meeting.week_of_month)?.label;
      return `${weekOrdinal} ${dayName} of each month at ${timeLabel}`;
    }
  } else if (meeting.recurrence_frequency === 'bi-weekly') {
    const dayName = DAY_OF_WEEK_OPTIONS.find(d => d.value === meeting.day_of_week)?.label;
    return `Every other ${dayName} at ${timeLabel}`;
  } else if (meeting.recurrence_frequency === 'weekly') {
    const dayName = DAY_OF_WEEK_OPTIONS.find(d => d.value === meeting.day_of_week)?.label;
    return `Every ${dayName} at ${timeLabel}`;
  }

  return `${meeting.recurrence_frequency} at ${timeLabel}`;
}

export function formatMeetingDateTime(instance: MeetingInstance): string {
  const date = new Date(`${instance.scheduled_date}T${instance.scheduled_time}`);
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: instance.timezone || 'Australia/Melbourne'
  }).format(date);
}

export function canAccessRecurringMeetings(tier: SubscriptionTier): boolean {
  return SUBSCRIPTION_PERMISSIONS[tier].canAccessRecurring;
}

export function getAllowedFrequencies(tier: SubscriptionTier): RecurrenceFrequency[] {
  return SUBSCRIPTION_PERMISSIONS[tier].allowedFrequencies;
}

export function getMaxMeetingsPerMonth(tier: SubscriptionTier): number {
  return SUBSCRIPTION_PERMISSIONS[tier].maxMeetingsPerMonth;
}

export function isUpcoming(instance: MeetingInstance): boolean {
  const now = new Date();
  const meetingDate = new Date(`${instance.scheduled_date}T${instance.scheduled_time}`);
  return meetingDate > now && instance.status === 'scheduled';
}

export function isPastDue(instance: MeetingInstance): boolean {
  const now = new Date();
  const meetingDate = new Date(`${instance.scheduled_date}T${instance.scheduled_time}`);
  return meetingDate < now && instance.status === 'scheduled';
}

export function getTimeUntilMeeting(instance: MeetingInstance): {
  days: number;
  hours: number;
  minutes: number;
  isToday: boolean;
  isTomorrow: boolean;
} {
  const now = new Date();
  const meetingDate = new Date(`${instance.scheduled_date}T${instance.scheduled_time}`);
  const diffMs = meetingDate.getTime() - now.getTime();

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const today = now.toDateString();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
  const meetingDay = meetingDate.toDateString();

  return {
    days,
    hours,
    minutes,
    isToday: meetingDay === today,
    isTomorrow: meetingDay === tomorrow
  };
}

// Error types
export class RecurringMeetingError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_TIER' | 'FREQUENCY_NOT_ALLOWED' | 'INSTANCE_NOT_FOUND' | 'ALREADY_EXISTS' | 'GENERATION_FAILED'
  ) {
    super(message);
    this.name = 'RecurringMeetingError';
  }
}

export default {
  RecurringMeeting,
  MeetingInstance,
  UpcomingMeeting,
  RecurringMeetingFormData,
  RescheduleMeetingData,
  MeetingInstanceUpdate,
  RECURRENCE_OPTIONS,
  MEETING_TYPE_OPTIONS,
  DAY_OF_MONTH_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  WEEK_OF_MONTH_OPTIONS,
  TIME_SLOT_OPTIONS,
  SUBSCRIPTION_PERMISSIONS,
  formatMeetingSchedule,
  formatMeetingDateTime,
  canAccessRecurringMeetings,
  getAllowedFrequencies,
  getMaxMeetingsPerMonth,
  isUpcoming,
  isPastDue,
  getTimeUntilMeeting,
  RecurringMeetingError
};