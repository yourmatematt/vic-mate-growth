/**
 * Email Service for Booking Notifications
 * Handles sending various booking-related emails
 */

import { Booking, BookingStatus } from '@/types/booking';

interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

interface EmailSendOptions {
  to: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  attachments?: {
    filename: string;
    content: string | Buffer;
    contentType: string;
  }[];
}

/**
 * Base email service configuration
 */
const EMAIL_CONFIG = {
  fromEmail: 'matt@yourmateagency.com.au',
  fromName: 'Matt from Your Mate Agency',
  replyTo: 'matt@yourmateagency.com.au',
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourmateagency.com.au',
  supportPhone: '+61 478 101 521',
  companyName: 'Your Mate Agency',
  companyAddress: 'Melbourne, Victoria, Australia',
  unsubscribeUrl: process.env.NEXT_PUBLIC_SITE_URL ? `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe` : '#'
};

/**
 * Format phone number for display
 */
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('61')) {
    const number = cleaned.slice(2);
    if (number.startsWith('4')) {
      return `0${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    } else {
      return `(0${number.slice(0, 1)}) ${number.slice(1, 5)} ${number.slice(5)}`;
    }
  }
  return phone;
};

/**
 * Format date and time for Australian timezone
 */
const formatDateTime = (dateTime: string) => {
  const date = new Date(dateTime);
  return {
    date: date.toLocaleDateString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Australia/Melbourne'
    }),
    time: date.toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'Australia/Melbourne'
    }),
    timeZone: 'AEST/AEDT'
  };
};

/**
 * Generate calendar event ICS file content
 */
const generateCalendarEvent = (booking: Booking): string => {
  const startDate = new Date(booking.datetime);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Your Mate Agency//Booking System//EN',
    'BEGIN:VEVENT',
    `UID:booking-${booking.id}@yourmateagency.com.au`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:Strategy Call with Your Mate Agency`,
    `DESCRIPTION:Strategy call with ${booking.customer_name} for ${booking.business_name}`,
    `LOCATION:${booking.google_meet_link || 'Online'}`,
    `ORGANIZER:CN=${EMAIL_CONFIG.fromName}:MAILTO:${EMAIL_CONFIG.fromEmail}`,
    `ATTENDEE:CN=${booking.customer_name}:MAILTO:${booking.customer_email}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

/**
 * Create confirmation email template
 */
const createConfirmationEmail = (booking: Booking): EmailTemplate => {
  const { date, time, timeZone } = formatDateTime(booking.datetime);
  const formattedPhone = formatPhoneNumber(booking.customer_phone);

  // Read the HTML template (in production, this would be loaded from a file or database)
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Strategy Call is Confirmed!</title>
    <style>
        body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center; color: white; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 20px; }
        .intro { font-size: 16px; color: #6b7280; line-height: 1.6; margin-bottom: 30px; }
        .booking-details { background-color: #eff6ff; border: 2px solid #dbeafe; border-radius: 12px; padding: 25px; margin: 30px 0; }
        .booking-title { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 20px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
        .detail-label { color: #1e40af; font-weight: 600; }
        .detail-value { color: #1e3a8a; font-weight: 700; }
        .meeting-link { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; color: white; }
        .meeting-button { display: inline-block; background-color: #ffffff; color: #d97706; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-bottom: 15px; }
        .footer { background-color: #f3f4f6; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .header, .content, .footer { padding: 20px !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Your Mate Agency</div>
            <p>Digital Marketing for Regional Victorian Businesses</p>
        </div>

        <div class="content">
            <h1 class="greeting">G'day ${booking.customer_name}! 👋</h1>

            <p class="intro">
                You beauty! Your free strategy call has been confirmed. We're genuinely excited to chat with you about growing ${booking.business_name} and helping you attract more customers in ${booking.business_location || 'your area'}.
            </p>

            <div class="booking-details">
                <div class="booking-title">📅 Your Strategy Call Details</div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${time} (${timeZone})</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">60 minutes</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Cost:</span>
                    <span class="detail-value" style="color: #059669;">FREE</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Your Business:</span>
                    <span class="detail-value">${booking.business_name}</span>
                </div>
            </div>

            ${booking.google_meet_link ? `
            <div class="meeting-link">
                <div style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">🎥 Join Your Video Call</div>
                <a href="${booking.google_meet_link}" class="meeting-button">Join Google Meet</a>
                <div style="color: #fbbf24; font-size: 14px; word-break: break-all;">${booking.google_meet_link}</div>
            </div>
            ` : ''}

            <div style="background-color: #f9fafb; border-radius: 12px; padding: 25px; margin: 30px 0;">
                <div style="font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 15px;">📋 Come Prepared With:</div>
                <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    <li>Your current marketing challenges${booking.biggest_challenge ? ` (you mentioned: "${booking.biggest_challenge}")` : ''}</li>
                    <li>Business goals for the next 6-12 months</li>
                    <li>Questions about digital marketing strategies</li>
                    <li>Information about your current customer base</li>
                    <li>Any marketing activities you're currently doing</li>
                    <li>Your budget range for marketing investments</li>
                </ul>
            </div>

            <div style="background-color: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                <div style="font-size: 18px; font-weight: bold; color: #92400e; margin-bottom: 15px;">Need to Reschedule?</div>
                <div style="color: #78350f; font-size: 14px; line-height: 1.6;">
                    No worries! Life happens. Just give us a call or send an email and we'll sort you out with a new time.<br><br>
                    📞 <a href="tel:${EMAIL_CONFIG.supportPhone}" style="color: #d97706; text-decoration: none; font-weight: bold;">${EMAIL_CONFIG.supportPhone}</a><br>
                    ✉️ <a href="mailto:${EMAIL_CONFIG.fromEmail}" style="color: #d97706; text-decoration: none; font-weight: bold;">${EMAIL_CONFIG.fromEmail}</a>
                </div>
            </div>

            <div style="margin: 30px 0; padding: 25px; border-left: 4px solid #3b82f6; background-color: #f8fafc;">
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0; font-style: italic;">
                    "I'm genuinely excited to chat with you about growing ${booking.business_name}. As someone who's worked with heaps of businesses across Victoria, I reckon we'll have some great ideas to help you attract more customers and grow your revenue. See you soon!"
                </p>
                <div style="margin-top: 15px; text-align: right;">
                    <strong style="color: #1f2937;">— Matt, Your Mate Agency</strong>
                </div>
            </div>
        </div>

        <div class="footer">
            <div style="font-size: 20px; font-weight: bold; color: #374151; margin-bottom: 10px;">Your Mate Agency</div>
            <p style="margin: 10px 0;">Helping Regional Victorian Businesses Grow Online</p>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                This email was sent because you booked a strategy call with Your Mate Agency.<br>
                If you need to contact us, reply to this email or call ${EMAIL_CONFIG.supportPhone}.
            </p>
        </div>
    </div>
</body>
</html>`;

  const textBody = `
G'day ${booking.customer_name}!

You beauty! Your free strategy call has been confirmed.

BOOKING DETAILS:
- Date: ${date}
- Time: ${time} (${timeZone})
- Duration: 60 minutes
- Cost: FREE
- Your Business: ${booking.business_name}

${booking.google_meet_link ? `
MEETING LINK:
${booking.google_meet_link}
` : ''}

COME PREPARED WITH:
- Your current marketing challenges${booking.biggest_challenge ? ` (you mentioned: "${booking.biggest_challenge}")` : ''}
- Business goals for the next 6-12 months
- Questions about digital marketing strategies
- Information about your current customer base
- Any marketing activities you're currently doing
- Your budget range for marketing investments

NEED TO RESCHEDULE?
No worries! Just give us a call or send an email:
Phone: ${EMAIL_CONFIG.supportPhone}
Email: ${EMAIL_CONFIG.fromEmail}

Looking forward to chatting with you!

Cheers,
Matt
Your Mate Agency
${EMAIL_CONFIG.baseUrl}
`;

  return {
    subject: 'Your Strategy Call is Confirmed! 📅',
    htmlBody: htmlTemplate,
    textBody: textBody.trim()
  };
};

/**
 * Create reminder email template
 */
const createReminderEmail = (booking: Booking): EmailTemplate => {
  const { date, time, timeZone } = formatDateTime(booking.datetime);

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .highlight { background: #eff6ff; border: 1px solid #dbeafe; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Strategy Call Reminder</h1>
            <p>Your Mate Agency</p>
        </div>
        <div class="content">
            <p>Hi ${booking.customer_name},</p>

            <p>This is a friendly reminder about your upcoming strategy call with Your Mate Agency.</p>

            <div class="highlight">
                <h3>📅 Appointment Details:</h3>
                <strong>Date:</strong> ${date}<br>
                <strong>Time:</strong> ${time} (${timeZone})<br>
                <strong>Duration:</strong> 60 minutes<br>
                <strong>Business:</strong> ${booking.business_name}
            </div>

            ${booking.google_meet_link ? `
            <div class="highlight">
                <h3>🎥 Join the Call:</h3>
                <a href="${booking.google_meet_link}" class="button">Join Google Meet</a><br>
                <small>Meeting Link: ${booking.google_meet_link}</small>
            </div>
            ` : ''}

            <p>We're looking forward to discussing how we can help grow ${booking.business_name}!</p>

            <p>If you need to reschedule, please call us at <a href="tel:${EMAIL_CONFIG.supportPhone}">${EMAIL_CONFIG.supportPhone}</a> or reply to this email.</p>

            <p>Cheers,<br>
            Matt<br>
            Your Mate Agency</p>
        </div>
    </div>
</body>
</html>`;

  const textBody = `
Hi ${booking.customer_name},

This is a friendly reminder about your upcoming strategy call with Your Mate Agency.

APPOINTMENT DETAILS:
Date: ${date}
Time: ${time} (${timeZone})
Duration: 60 minutes
Business: ${booking.business_name}

${booking.google_meet_link ? `
MEETING LINK: ${booking.google_meet_link}
` : ''}

We're looking forward to discussing how we can help grow ${booking.business_name}!

If you need to reschedule, please call us at ${EMAIL_CONFIG.supportPhone} or reply to this email.

Cheers,
Matt
Your Mate Agency
`;

  return {
    subject: `Reminder: Strategy Call Tomorrow at ${time}`,
    htmlBody,
    textBody: textBody.trim()
  };
};

/**
 * Create cancellation email template
 */
const createCancellationEmail = (booking: Booking): EmailTemplate => {
  const { date, time } = formatDateTime(booking.datetime);

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Strategy Call Cancelled</h1>
            <p>Your Mate Agency</p>
        </div>
        <div class="content">
            <p>Hi ${booking.customer_name},</p>

            <p>We're writing to let you know that your strategy call scheduled for <strong>${date} at ${time}</strong> has been cancelled.</p>

            <p>We apologise for any inconvenience this may cause.</p>

            <p>If you'd like to reschedule, we'd love to find another time that works for you. You can:</p>

            <ul>
                <li>Book a new time at <a href="${EMAIL_CONFIG.baseUrl}/book-strategy-call">yourmateagency.com.au/book-strategy-call</a></li>
                <li>Call us directly at <a href="tel:${EMAIL_CONFIG.supportPhone}">${EMAIL_CONFIG.supportPhone}</a></li>
                <li>Reply to this email and we'll get back to you</li>
            </ul>

            <p>Thanks for your understanding.</p>

            <p>Cheers,<br>
            Matt<br>
            Your Mate Agency</p>
        </div>
    </div>
</body>
</html>`;

  const textBody = `
Hi ${booking.customer_name},

We're writing to let you know that your strategy call scheduled for ${date} at ${time} has been cancelled.

We apologise for any inconvenience this may cause.

If you'd like to reschedule, we'd love to find another time that works for you. You can:

- Book a new time at ${EMAIL_CONFIG.baseUrl}/book-strategy-call
- Call us directly at ${EMAIL_CONFIG.supportPhone}
- Reply to this email and we'll get back to you

Thanks for your understanding.

Cheers,
Matt
Your Mate Agency
`;

  return {
    subject: 'Strategy Call Cancelled',
    htmlBody,
    textBody: textBody.trim()
  };
};

/**
 * Create reschedule email template
 */
const createRescheduleEmail = (booking: Booking, newDateTime: string): EmailTemplate => {
  const { date: oldDate, time: oldTime } = formatDateTime(booking.datetime);
  const { date: newDate, time: newTime, timeZone } = formatDateTime(newDateTime);

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .highlight { background: #eff6ff; border: 1px solid #dbeafe; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .old-time { text-decoration: line-through; color: #6b7280; }
        .new-time { color: #059669; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Strategy Call Rescheduled</h1>
            <p>Your Mate Agency</p>
        </div>
        <div class="content">
            <p>Hi ${booking.customer_name},</p>

            <p>Your strategy call has been rescheduled to a new time:</p>

            <div class="highlight">
                <h3>📅 Updated Appointment:</h3>
                <p class="old-time">Previous: ${oldDate} at ${oldTime}</p>
                <p class="new-time">New Date: ${newDate} at ${newTime} (${timeZone})</p>
                <strong>Business:</strong> ${booking.business_name}<br>
                <strong>Duration:</strong> 60 minutes
            </div>

            <p>If this new time doesn't work for you, please let us know as soon as possible so we can find another slot.</p>

            <p>Contact us:</p>
            <ul>
                <li>Phone: <a href="tel:${EMAIL_CONFIG.supportPhone}">${EMAIL_CONFIG.supportPhone}</a></li>
                <li>Email: <a href="mailto:${EMAIL_CONFIG.fromEmail}">${EMAIL_CONFIG.fromEmail}</a></li>
            </ul>

            <p>Looking forward to our chat!</p>

            <p>Cheers,<br>
            Matt<br>
            Your Mate Agency</p>
        </div>
    </div>
</body>
</html>`;

  const textBody = `
Hi ${booking.customer_name},

Your strategy call has been rescheduled to a new time:

Previous: ${oldDate} at ${oldTime}
NEW DATE: ${newDate} at ${newTime} (${timeZone})

Business: ${booking.business_name}
Duration: 60 minutes

If this new time doesn't work for you, please let us know as soon as possible so we can find another slot.

Contact us:
Phone: ${EMAIL_CONFIG.supportPhone}
Email: ${EMAIL_CONFIG.fromEmail}

Looking forward to our chat!

Cheers,
Matt
Your Mate Agency
`;

  return {
    subject: 'Strategy Call Rescheduled',
    htmlBody,
    textBody: textBody.trim()
  };
};

/**
 * Mock email sending function
 * In production, this would integrate with an email service like SendGrid, AWS SES, or similar
 */
const sendEmail = async (
  template: EmailTemplate,
  options: EmailSendOptions,
  attachments?: { filename: string; content: string; contentType: string }[]
): Promise<void> => {
  // Mock implementation - replace with actual email service
  console.log('📧 Email would be sent:', {
    to: options.to,
    subject: template.subject,
    from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
    replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
    attachments: attachments?.length || 0
  });

  // Simulate async email sending
  await new Promise(resolve => setTimeout(resolve, 100));

  // In production, you would:
  // 1. Initialize your email service (SendGrid, AWS SES, etc.)
  // 2. Send the email with the template and options
  // 3. Handle any errors appropriately
  // 4. Log the email sending for audit purposes

  /*
  // Example with SendGrid:
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: options.to,
    from: { email: EMAIL_CONFIG.fromEmail, name: EMAIL_CONFIG.fromName },
    subject: template.subject,
    text: template.textBody,
    html: template.htmlBody,
    replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
    attachments: attachments
  };

  await sgMail.send(msg);
  */
};

/**
 * Send booking confirmation email
 */
export const sendConfirmationEmail = async (booking: Booking): Promise<void> => {
  const template = createConfirmationEmail(booking);

  // Generate calendar attachment
  const calendarContent = generateCalendarEvent(booking);
  const attachments = [
    {
      filename: 'strategy-call.ics',
      content: calendarContent,
      contentType: 'text/calendar'
    }
  ];

  await sendEmail(
    template,
    {
      to: booking.customer_email,
      replyTo: EMAIL_CONFIG.fromEmail
    },
    attachments
  );
};

/**
 * Send booking reminder email
 */
export const sendReminderEmail = async (booking: Booking): Promise<void> => {
  const template = createReminderEmail(booking);

  await sendEmail(template, {
    to: booking.customer_email,
    replyTo: EMAIL_CONFIG.fromEmail
  });
};

/**
 * Send booking cancellation email
 */
export const sendCancellationEmail = async (booking: Booking): Promise<void> => {
  const template = createCancellationEmail(booking);

  await sendEmail(template, {
    to: booking.customer_email,
    replyTo: EMAIL_CONFIG.fromEmail
  });
};

/**
 * Send booking reschedule email
 */
export const sendRescheduledEmail = async (booking: Booking, newDateTime: string): Promise<void> => {
  const template = createRescheduleEmail(booking, newDateTime);

  // Generate updated calendar attachment
  const updatedBooking = { ...booking, datetime: newDateTime };
  const calendarContent = generateCalendarEvent(updatedBooking);
  const attachments = [
    {
      filename: 'updated-strategy-call.ics',
      content: calendarContent,
      contentType: 'text/calendar'
    }
  ];

  await sendEmail(
    template,
    {
      to: booking.customer_email,
      replyTo: EMAIL_CONFIG.fromEmail
    },
    attachments
  );
};

/**
 * Send admin notification email for new bookings
 */
export const sendAdminNotificationEmail = async (booking: Booking): Promise<void> => {
  const { date, time } = formatDateTime(booking.datetime);
  const formattedPhone = formatPhoneNumber(booking.customer_phone);

  const template: EmailTemplate = {
    subject: `New Strategy Call Booking: ${booking.customer_name} - ${booking.business_name}`,
    htmlBody: `
<h2>New Strategy Call Booking</h2>

<h3>Customer Details:</h3>
<ul>
  <li><strong>Name:</strong> ${booking.customer_name}</li>
  <li><strong>Email:</strong> <a href="mailto:${booking.customer_email}">${booking.customer_email}</a></li>
  <li><strong>Phone:</strong> <a href="tel:${booking.customer_phone}">${formattedPhone}</a></li>
</ul>

<h3>Business Details:</h3>
<ul>
  <li><strong>Business:</strong> ${booking.business_name}</li>
  <li><strong>Type:</strong> ${booking.business_type}</li>
  ${booking.business_location ? `<li><strong>Location:</strong> ${booking.business_location}</li>` : ''}
  ${booking.business_website ? `<li><strong>Website:</strong> <a href="${booking.business_website}" target="_blank">${booking.business_website}</a></li>` : ''}
  ${booking.current_revenue ? `<li><strong>Revenue:</strong> ${booking.current_revenue}</li>` : ''}
</ul>

<h3>Appointment Details:</h3>
<ul>
  <li><strong>Date:</strong> ${date}</li>
  <li><strong>Time:</strong> ${time}</li>
  <li><strong>Status:</strong> ${booking.status}</li>
</ul>

${booking.biggest_challenge ? `
<h3>Biggest Challenge:</h3>
<p>${booking.biggest_challenge}</p>
` : ''}

<p><a href="${EMAIL_CONFIG.baseUrl}/admin/bookings/${booking.id}">View in Admin Panel</a></p>
`,
    textBody: `
New Strategy Call Booking

Customer: ${booking.customer_name}
Email: ${booking.customer_email}
Phone: ${formattedPhone}

Business: ${booking.business_name}
Type: ${booking.business_type}
${booking.business_location ? `Location: ${booking.business_location}\n` : ''}

Appointment: ${date} at ${time}
Status: ${booking.status}

${booking.biggest_challenge ? `Biggest Challenge: ${booking.biggest_challenge}\n` : ''}

View in admin: ${EMAIL_CONFIG.baseUrl}/admin/bookings/${booking.id}
`
  };

  await sendEmail(template, {
    to: EMAIL_CONFIG.fromEmail,
    replyTo: booking.customer_email
  });
};

// Export email configuration for use in other components
export { EMAIL_CONFIG };