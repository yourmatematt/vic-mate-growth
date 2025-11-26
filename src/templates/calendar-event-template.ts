/**
 * Google Calendar Event Templates
 * Generate event details from booking data
 */

import { Booking } from '@/types/booking';
import { GoogleCalendarEvent } from '@/types/google-calendar';
import { format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TIME_ZONE = 'Australia/Melbourne';
const MEETING_DURATION_MINUTES = 60;

/**
 * Create event summary (title) for calendar
 */
export function createEventSummary(booking: Booking): string {
  return `Strategy Call - ${booking.business_name}`;
}

/**
 * Create detailed event description with all booking information
 */
export function createEventDescription(booking: Booking): string {
  const businessTypeLabels: Record<string, string> = {
    'restaurant': 'Restaurant',
    'retail': 'Retail',
    'healthcare': 'Healthcare',
    'professional-services': 'Professional Services',
    'fitness': 'Fitness & Wellness',
    'beauty': 'Beauty & Personal Care',
    'home-services': 'Home Services',
    'automotive': 'Automotive',
    'real-estate': 'Real Estate',
    'education': 'Education & Training',
    'technology': 'Technology',
    'other': 'Other'
  };

  const businessType = businessTypeLabels[booking.business_type] || booking.business_type;

  const description = `
🎯 FREE STRATEGY CALL - YOUR MATE AGENCY

══════════════════════════════════════════════
📋 CUSTOMER INFORMATION
══════════════════════════════════════════════
👤 Name: ${booking.customer_name}
📧 Email: ${booking.customer_email}
📞 Phone: ${booking.customer_phone}

══════════════════════════════════════════════
🏢 BUSINESS INFORMATION
══════════════════════════════════════════════
🏪 Business: ${booking.business_name}
🏷️ Industry: ${businessType}
📍 Location: ${booking.business_location || 'Not specified'}
${booking.business_website ? `🌐 Website: ${booking.business_website}` : ''}
${booking.current_revenue ? `💰 Revenue Range: ${booking.current_revenue}` : ''}

══════════════════════════════════════════════
🎯 CALL PREPARATION
══════════════════════════════════════════════
❗ Biggest Challenge:
"${booking.biggest_challenge || 'Not specified'}"

${booking.current_marketing && booking.current_marketing.length > 0
  ? `📊 Current Marketing: ${booking.current_marketing.join(', ')}`
  : ''}

${booking.marketing_budget
  ? `💵 Marketing Budget: ${booking.marketing_budget}`
  : ''}

${booking.primary_goals && booking.primary_goals.length > 0
  ? `🎯 Primary Goals: ${booking.primary_goals.join(', ')}`
  : ''}

══════════════════════════════════════════════
📝 CALL AGENDA (60 MINUTES)
══════════════════════════════════════════════
✅ Introductions & business overview (10 min)
✅ Current marketing audit & challenges (15 min)
✅ Competitor analysis discussion (10 min)
✅ Strategic recommendations (20 min)
✅ Next steps & proposal outline (5 min)

══════════════════════════════════════════════
📞 MEETING DETAILS
══════════════════════════════════════════════
⏰ Duration: 60 minutes
🎥 Platform: Google Meet (link will be provided)
🕐 Time Zone: Australian Eastern Time (AEST/AEDT)

══════════════════════════════════════════════
📋 PRE-CALL PREPARATION
══════════════════════════════════════════════
□ Review current website and online presence
□ Research local competitors (top 3-5)
□ Check Google My Business listing
□ Prepare questions about their target audience
□ Review their current marketing materials

══════════════════════════════════════════════
🚀 FOLLOW-UP ITEMS
══════════════════════════════════════════════
□ Send strategy call summary within 24 hours
□ Provide custom marketing proposal if interested
□ Schedule follow-up call if needed
□ Connect on LinkedIn/social media

══════════════════════════════════════════════

📅 Booking ID: ${booking.id}
🌐 Booked via: https://yourmateagency.com.au/book-strategy-call
📞 Support: matt@yourmateagency.com.au | +61 478 101 521

Your Mate Agency - Digital Marketing for Regional Victorian Businesses
`.trim();

  return description;
}

/**
 * Create calendar location string
 */
export function createEventLocation(booking: Booking): string {
  return 'Online via Google Meet';
}

/**
 * Create attendees array for the event
 */
export function createEventAttendees(booking: Booking): Array<{email: string; displayName: string}> {
  return [
    {
      email: booking.customer_email,
      displayName: booking.customer_name
    },
    {
      email: 'matt@yourmateagency.com.au',
      displayName: 'Matt - Your Mate Agency'
    }
  ];
}

/**
 * Create date/time objects for calendar event
 */
export function createEventDateTime(booking: Booking): {
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
} {
  const bookingDate = new Date(booking.datetime);
  const startTime = toZonedTime(bookingDate, TIME_ZONE);

  const endTime = new Date(startTime.getTime() + MEETING_DURATION_MINUTES * 60 * 1000);

  return {
    start: {
      dateTime: fromZonedTime(startTime, TIME_ZONE).toISOString(),
      timeZone: TIME_ZONE
    },
    end: {
      dateTime: fromZonedTime(endTime, TIME_ZONE).toISOString(),
      timeZone: TIME_ZONE
    }
  };
}

/**
 * Create complete Google Calendar event from booking
 */
export function createCalendarEventFromBooking(booking: Booking): GoogleCalendarEvent {
  const { start, end } = createEventDateTime(booking);

  return {
    summary: createEventSummary(booking),
    description: createEventDescription(booking),
    start,
    end,
    location: createEventLocation(booking),
    attendees: createEventAttendees(booking),
    conferenceData: {
      createRequest: {
        requestId: `strategy-call-${booking.id}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    },
    reminders: {
      useDefault: false,
      overrides: [
        {
          method: 'email',
          minutes: 24 * 60 // 24 hours
        },
        {
          method: 'email',
          minutes: 60 // 1 hour
        },
        {
          method: 'popup',
          minutes: 15 // 15 minutes
        }
      ]
    },
    transparency: 'opaque', // Show as busy
    visibility: 'private',
    status: 'confirmed'
  };
}

/**
 * Create event for rescheduled booking
 */
export function createRescheduledEventFromBooking(
  booking: Booking,
  newDateTime: string
): GoogleCalendarEvent {
  const updatedBooking = {
    ...booking,
    datetime: newDateTime
  };

  const event = createCalendarEventFromBooking(updatedBooking);

  // Update summary to indicate reschedule
  event.summary = `[RESCHEDULED] ${event.summary}`;

  // Add reschedule note to description
  const originalTime = format(new Date(booking.datetime), 'PPpp');
  const newTime = format(new Date(newDateTime), 'PPpp');

  event.description += `\n\n⚠️ RESCHEDULED:\nOriginal: ${originalTime}\nNew: ${newTime}`;

  return event;
}

/**
 * Create follow-up meeting event
 */
export function createFollowUpEventFromBooking(
  booking: Booking,
  followUpDateTime: string,
  followUpType: 'proposal-review' | 'project-kickoff' | 'check-in' = 'proposal-review'
): GoogleCalendarEvent {
  const { start, end } = createEventDateTime({ ...booking, datetime: followUpDateTime });

  const followUpTitles = {
    'proposal-review': 'Proposal Review',
    'project-kickoff': 'Project Kickoff',
    'check-in': 'Check-in Call'
  };

  return {
    summary: `${followUpTitles[followUpType]} - ${booking.business_name}`,
    description: `
🔄 FOLLOW-UP CALL - YOUR MATE AGENCY

══════════════════════════════════════════════
📋 CUSTOMER INFORMATION
══════════════════════════════════════════════
👤 Name: ${booking.customer_name}
📧 Email: ${booking.customer_email}
📞 Phone: ${booking.customer_phone}
🏪 Business: ${booking.business_name}

══════════════════════════════════════════════
📅 MEETING CONTEXT
══════════════════════════════════════════════
🎯 Meeting Type: ${followUpTitles[followUpType]}
📅 Original Strategy Call: ${format(new Date(booking.datetime), 'PPpp')}
📋 Original Challenge: "${booking.biggest_challenge}"

══════════════════════════════════════════════
📝 AGENDA
══════════════════════════════════════════════
${followUpType === 'proposal-review' ? `
✅ Review custom marketing proposal
✅ Address questions and concerns
✅ Discuss implementation timeline
✅ Finalize project details and pricing
✅ Next steps and contract signing
` : followUpType === 'project-kickoff' ? `
✅ Welcome and project overview
✅ Set up communication channels
✅ Review project timeline and milestones
✅ Assign roles and responsibilities
✅ Schedule regular check-ins
` : `
✅ Progress review since last meeting
✅ Address any challenges or concerns
✅ Discuss upcoming initiatives
✅ Plan next steps and priorities
✅ Schedule follow-up if needed
`}

══════════════════════════════════════════════

📅 Booking ID: ${booking.id}
🌐 Your Mate Agency: https://yourmateagency.com.au
📞 Support: matt@yourmateagency.com.au | +61 478 101 521
`.trim(),
    start,
    end,
    location: 'Online via Google Meet',
    attendees: createEventAttendees(booking),
    conferenceData: {
      createRequest: {
        requestId: `followup-${followUpType}-${booking.id}-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    },
    reminders: {
      useDefault: false,
      overrides: [
        {
          method: 'email',
          minutes: 24 * 60 // 24 hours
        },
        {
          method: 'popup',
          minutes: 15 // 15 minutes
        }
      ]
    },
    transparency: 'opaque',
    visibility: 'private',
    status: 'confirmed'
  };
}

/**
 * Create internal prep meeting before strategy call
 */
export function createPrepMeetingFromBooking(booking: Booking): GoogleCalendarEvent {
  // Schedule prep meeting 30 minutes before strategy call
  const strategyCallTime = new Date(booking.datetime);
  const prepTime = new Date(strategyCallTime.getTime() - 30 * 60 * 1000);

  const { start, end } = createEventDateTime({
    ...booking,
    datetime: new Date(prepTime.getTime() + 15 * 60 * 1000).toISOString() // 15 min prep meeting
  });

  return {
    summary: `PREP: Strategy Call - ${booking.business_name}`,
    description: `
🎯 STRATEGY CALL PREPARATION

══════════════════════════════════════════════
📅 UPCOMING CALL
══════════════════════════════════════════════
⏰ Strategy Call: ${format(strategyCallTime, 'PPpp')}
👤 Customer: ${booking.customer_name}
🏪 Business: ${booking.business_name}
📞 Phone: ${booking.customer_phone}

══════════════════════════════════════════════
📋 PREP CHECKLIST
══════════════════════════════════════════════
□ Review customer's website: ${booking.business_website || 'N/A'}
□ Research local competitors (${booking.business_location})
□ Check their Google My Business listing
□ Review their biggest challenge: "${booking.biggest_challenge}"
□ Prepare industry-specific talking points
□ Test Google Meet connection
□ Review Your Mate Agency service offerings
□ Prepare pricing strategy based on their revenue: ${booking.current_revenue || 'TBD'}

══════════════════════════════════════════════
🎯 KEY DISCUSSION POINTS
══════════════════════════════════════════════
• Current marketing efforts: ${booking.current_marketing?.join(', ') || 'Unknown'}
• Main challenge: ${booking.biggest_challenge}
• Budget range: ${booking.marketing_budget || 'To be discussed'}
• Goals: ${booking.primary_goals?.join(', ') || 'To be discussed'}

══════════════════════════════════════════════

📅 Booking ID: ${booking.id}
`.trim(),
    start,
    end,
    location: 'Your Mate Agency Office',
    attendees: [
      {
        email: 'matt@yourmateagency.com.au',
        displayName: 'Matt - Your Mate Agency'
      }
    ],
    reminders: {
      useDefault: false,
      overrides: [
        {
          method: 'popup',
          minutes: 5
        }
      ]
    },
    transparency: 'opaque',
    visibility: 'private',
    status: 'confirmed'
  };
}

/**
 * Export all template functions
 */
export const CalendarEventTemplates = {
  createEventSummary,
  createEventDescription,
  createEventLocation,
  createEventAttendees,
  createEventDateTime,
  createCalendarEventFromBooking,
  createRescheduledEventFromBooking,
  createFollowUpEventFromBooking,
  createPrepMeetingFromBooking
};