/**
 * Meeting Calendar Event Template
 * Creates Google Calendar events for recurring meetings
 */

import { RecurringMeeting, MeetingInstance } from '@/types/recurring-meetings';
import { GoogleCalendarEvent } from '@/types/google-calendar';

/**
 * Create Google Calendar event data from meeting and instance
 */
export function createCalendarEventFromMeeting(
  meeting: RecurringMeeting,
  instance: MeetingInstance
): GoogleCalendarEvent {
  const { start, end } = createEventDateTime(meeting, instance);

  return {
    summary: createEventSummary(meeting),
    description: createEventDescription(meeting, instance),
    start: {
      dateTime: start,
      timeZone: meeting.timezone
    },
    end: {
      dateTime: end,
      timeZone: meeting.timezone
    },
    attendees: createEventAttendees(meeting),
    conferenceData: {
      createRequest: {
        requestId: `recurring-meeting-${instance.id}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 24 hours
        { method: 'email', minutes: 60 },      // 1 hour
        { method: 'popup', minutes: 15 }       // 15 minutes
      ]
    },
    visibility: 'private',
    location: 'Google Meet (link will be provided)',
    extendedProperties: {
      private: {
        recurringMeetingId: meeting.id,
        instanceId: instance.id,
        meetingType: meeting.meeting_type,
        subscriptionTier: meeting.subscription_tier
      }
    }
  };
}

/**
 * Create event summary/title
 */
function createEventSummary(meeting: RecurringMeeting): string {
  // Get user info for personalized title
  const baseTitle = meeting.title || 'Report Brief Meeting';
  return `${baseTitle} - Your Mate Agency`;
}

/**
 * Create detailed event description
 */
function createEventDescription(meeting: RecurringMeeting, instance: MeetingInstance): string {
  const meetingTypeDescriptions = {
    report_brief: 'Monthly business performance review and strategy discussion',
    strategy: 'Quarterly planning and growth strategy session',
    consultation: 'One-on-one consultation and advisory session'
  };

  const description = meetingTypeDescriptions[meeting.meeting_type] || 'Business consultation meeting';

  return `
📊 ${meeting.title}

${description}

🕒 Duration: ${meeting.duration_minutes} minutes
📅 Meeting Type: ${meeting.meeting_type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
🔄 Recurring: ${meeting.recurrence_frequency}

📋 AGENDA:
${getMeetingAgenda(meeting.meeting_type)}

📝 PREPARATION:
${getMeetingPreparation(meeting.meeting_type)}

🎯 WHAT TO EXPECT:
${getMeetingExpectations(meeting.meeting_type)}

📞 MEETING DETAILS:
• Google Meet link will be provided automatically
• Please join 2-3 minutes early to test audio/video
• Have your questions and updates ready

❓ QUESTIONS OR NEED TO RESCHEDULE?
• Email: matt@yourmateagency.com.au
• Phone: +61 478 101 521
• SMS: Also available for quick questions

---
Your Mate Agency - Marketing that actually works for regional businesses
ABN: 37179872328
`.trim();
}

/**
 * Get meeting agenda based on type
 */
function getMeetingAgenda(meetingType: string): string {
  switch (meetingType) {
    case 'report_brief':
      return `• Review last month's performance metrics
• Discuss what's working and what's not
• Identify opportunities for improvement
• Plan next month's focus areas
• Answer your marketing questions`;

    case 'strategy':
      return `• Review quarterly business goals
• Analyze market position and competition
• Discuss new marketing opportunities
• Plan campaign strategies
• Set priorities for next quarter`;

    case 'consultation':
      return `• Address specific business challenges
• Provide tailored marketing advice
• Review current marketing activities
• Recommend next steps
• Answer your questions`;

    default:
      return `• Review current business performance
• Discuss marketing strategies
• Address your questions and concerns
• Plan next steps`;
  }
}

/**
 * Get meeting preparation instructions
 */
function getMeetingPreparation(meetingType: string): string {
  switch (meetingType) {
    case 'report_brief':
      return `• Review your business performance from last month
• Note any questions about your current marketing
• Think about what challenges you're facing
• Have your phone/computer ready for screen sharing if needed`;

    case 'strategy':
      return `• Consider your business goals for next quarter
• Review competitor activities you've noticed
• Think about new products/services you're considering
• Prepare questions about marketing opportunities`;

    case 'consultation':
      return `• List the specific challenges you want to discuss
• Gather any relevant business information
• Prepare questions about your marketing
• Think about your immediate priorities`;

    default:
      return `• Review recent business performance
• Prepare any questions about marketing
• Have a quiet space for our call`;
  }
}

/**
 * Get meeting expectations
 */
function getMeetingExpectations(meetingType: string): string {
  switch (meetingType) {
    case 'report_brief':
      return `• Honest feedback about what's working
• Clear explanations in plain English (no jargon)
• Specific recommendations for next month
• Direct answers to your questions
• A plan you can actually implement`;

    case 'strategy':
      return `• Strategic insights for your business
• Practical advice you can implement
• Clear priorities and next steps
• Honest assessment of opportunities
• Planning that fits your budget and time`;

    case 'consultation':
      return `• Tailored advice for your specific situation
• Honest feedback (even if it's not what you want to hear)
• Practical solutions you can implement
• Clear next steps
• Direct answers to your questions`;

    default:
      return `• Practical advice tailored to your business
• Clear explanations and next steps
• Honest feedback and recommendations`;
  }
}

/**
 * Create event attendees list
 */
function createEventAttendees(meeting: RecurringMeeting): Array<{ email: string; displayName?: string }> {
  // TODO: Get user email from user_profiles table
  // For now, we'll use a placeholder - this should be populated with actual user email
  return [
    {
      email: 'matt@yourmateagency.com.au',
      displayName: 'Matt - Your Mate Agency'
    }
    // User email will be added when we have access to user profiles
  ];
}

/**
 * Create start and end datetime strings for the event
 */
function createEventDateTime(meeting: RecurringMeeting, instance: MeetingInstance): {
  start: string;
  end: string;
} {
  // Create start datetime
  const startDate = new Date(`${instance.scheduled_date}T${instance.scheduled_time}:00`);

  // Create end datetime (add duration)
  const endDate = new Date(startDate.getTime() + (meeting.duration_minutes * 60 * 1000));

  // Format for Google Calendar API (ISO format)
  const start = startDate.toISOString();
  const end = endDate.toISOString();

  return { start, end };
}

/**
 * Create .ics calendar file content for email attachments
 */
export function createICSFile(meeting: RecurringMeeting, instance: MeetingInstance): string {
  const { start, end } = createEventDateTime(meeting, instance);
  const startUTC = new Date(start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const endUTC = new Date(end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const summary = createEventSummary(meeting);
  const description = createEventDescription(meeting, instance)
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your Mate Agency//Recurring Meetings//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:recurring-meeting-${instance.id}@yourmateagency.com.au
DTSTART:${startUTC}
DTEND:${endUTC}
DTSTAMP:${now}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:Google Meet (link will be provided)
STATUS:CONFIRMED
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:EMAIL
DESCRIPTION:Reminder: ${summary} tomorrow
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:EMAIL
DESCRIPTION:Reminder: ${summary} in 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`;
}

/**
 * Create a meeting URL for the client to join
 */
export function createMeetingJoinUrl(instance: MeetingInstance): string {
  if (instance.google_meet_link) {
    return instance.google_meet_link;
  }

  // Fallback if no Meet link is available
  return `mailto:matt@yourmateagency.com.au?subject=Meeting%20Link%20Request&body=Hi%20Matt,%0A%0AI%20need%20the%20meeting%20link%20for%20my%20appointment%20on%20${instance.scheduled_date}%20at%20${instance.scheduled_time}.%0A%0AThanks!`;
}

export default {
  createCalendarEventFromMeeting,
  createICSFile,
  createMeetingJoinUrl
};