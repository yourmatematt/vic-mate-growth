/**
 * Booking Success Modal
 * Displays confirmation and next steps after successful booking
 */

import React, { useState } from 'react';
import { formatDateForDisplay, formatTimeSlot } from '@/lib/booking-date-utils';
import type { Booking } from '@/types/booking';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  onBookAnother: () => void;
}

const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  onClose,
  booking,
  onBookAnother
}) => {
  const [emailCopied, setEmailCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  if (!isOpen || !booking) return null;

  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      } else {
        setPhoneCopied(true);
        setTimeout(() => setPhoneCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const generateCalendarEvent = () => {
    const startDate = new Date(`${booking.preferred_date}T${booking.preferred_time_slot.split('-')[0]}:00`);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour

    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:Your Mate Agency Booking
BEGIN:VEVENT
UID:${booking.id}@yourmateagency.com.au
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Strategy Call with Your Mate Agency
DESCRIPTION:Free strategy consultation with Matt from Your Mate Agency to discuss your business growth opportunities.${booking.google_meet_link ? `\\n\\nJoin here: ${booking.google_meet_link}` : ''}\\n\\nQuestions? Call +61 478 101 521 or email matt@yourmateagency.com.au
LOCATION:${booking.google_meet_link ? booking.google_meet_link : 'Online Meeting'}
ORGANIZER;CN=Your Mate Agency:MAILTO:matt@yourmateagency.com.au
ATTENDEE;CN=${booking.customer_name}:MAILTO:${booking.customer_email}
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'strategy-call-appointment.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const shareOnLinkedIn = () => {
    const text = encodeURIComponent(`Just booked a free strategy call with Your Mate Agency! Excited to explore new growth opportunities for my business. 🚀 #BusinessGrowth #DigitalMarketing #VictorianBusiness`);
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=https://yourmateagency.com.au/book-strategy-call&text=${text}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=https://yourmateagency.com.au/book-strategy-call`;
    window.open(url, '_blank');
  };

  // Parse time slot
  const [startTime, endTime] = booking.preferred_time_slot.split('-');
  const formattedTime = formatTimeSlot(startTime, endTime);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-20 mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              You're All Set! 🎉
            </h2>
            <p className="text-green-100">
              Your strategy call has been booked successfully
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Booking Details */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Your Appointment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Date:</span>
                  <span className="font-medium text-blue-900">
                    {formatDateForDisplay(booking.preferred_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Time:</span>
                  <span className="font-medium text-blue-900">
                    {formattedTime} (Melbourne time)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Duration:</span>
                  <span className="font-medium text-blue-900">60 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Cost:</span>
                  <span className="font-medium text-green-700">FREE</span>
                </div>
              </div>
            </div>

            {/* Google Meet Link */}
            {booking.google_meet_link && (
              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Meeting Link
                </h4>
                <div className="flex items-center space-x-2">
                  <a
                    href={booking.google_meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline flex-1 truncate"
                  >
                    {booking.google_meet_link}
                  </a>
                  <button
                    onClick={() => copyToClipboard(booking.google_meet_link!, 'email')}
                    className="flex-shrink-0 p-2 text-orange-600 hover:text-orange-800 transition-colors"
                    title="Copy link"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                What Happens Next?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <span>You'll receive a confirmation email with all the details within the next few minutes</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <span>We'll send you a reminder 24 hours before your call</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <span>Join the call at your scheduled time ready to discuss your business goals</span>
                </li>
              </ul>
            </div>

            {/* Preparation Tips */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">📋 Come Prepared With:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Current marketing challenges you're facing</li>
                <li>• Your business goals for the next 6-12 months</li>
                <li>• Any questions about digital marketing</li>
                <li>• Information about your current customer base</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={generateCalendarEvent}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to Calendar (.ics)
              </button>

              <button
                onClick={onBookAnother}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book Another Call
              </button>
            </div>

            {/* Social Sharing */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                Help other businesses discover us too!
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={shareOnLinkedIn}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span>Share</span>
                </button>

                <button
                  onClick={shareOnFacebook}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-3">
                Need to reschedule or have questions?
              </p>
              <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-4 space-y-2 sm:space-y-0 text-sm">
                <button
                  onClick={() => copyToClipboard('+61478101521', 'phone')}
                  className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{phoneCopied ? 'Copied!' : '+61 478 101 521'}</span>
                </button>

                <button
                  onClick={() => copyToClipboard('matt@yourmateagency.com.au', 'email')}
                  className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{emailCopied ? 'Copied!' : 'matt@yourmateagency.com.au'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccessModal;