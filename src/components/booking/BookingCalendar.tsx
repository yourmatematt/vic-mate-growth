/**
 * Booking Calendar Component
 * Month view calendar for selecting booking dates
 */

import React, { useState, useMemo } from 'react';
import { formatDateForDisplay, getDayName, isToday, isTomorrow } from '@/lib/booking-date-utils';
import type { BookingBlackoutDate } from '@/types/booking';

interface BookingCalendarProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  blackoutDates?: BookingBlackoutDate[];
  availableDates?: string[];
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  onDateSelect,
  blackoutDates = [],
  availableDates = [],
  minDate = new Date(),
  maxDate,
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return selectedDate ? new Date(selectedDate) : new Date();
  });

  // Calculate month data
  const monthData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start with Sunday of the first week
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // End with Saturday of the last week
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const weeks: Date[][] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    return {
      weeks,
      monthName: firstDay.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' }),
      firstDay,
      lastDay
    };
  }, [currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const getDateStatus = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
    const isPast = date < minDate;
    const isTooFar = maxDate && date > maxDate;
    const isBlackedOut = blackoutDates.some(bd => bd.date === dateStr);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const hasSlots = availableDates.includes(dateStr);
    const isSelected = selectedDate === dateStr;

    return {
      dateStr,
      isCurrentMonth,
      isPast,
      isTooFar,
      isBlackedOut,
      isWeekend,
      hasSlots,
      isSelected,
      isToday: isToday(date),
      isTomorrow: isTomorrow(date),
      isAvailable: isCurrentMonth && !isPast && !isTooFar && !isBlackedOut && !isWeekend && hasSlots
    };
  };

  const getDateClasses = (status: ReturnType<typeof getDateStatus>) => {
    const baseClasses = 'w-full h-12 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500';

    if (!status.isCurrentMonth) {
      return `${baseClasses} text-gray-300 cursor-default`;
    }

    if (status.isSelected) {
      return `${baseClasses} bg-blue-600 text-white shadow-lg ring-2 ring-blue-500`;
    }

    if (!status.isAvailable) {
      const reason = status.isPast ? 'Past date' :
                    status.isTooFar ? 'Too far ahead' :
                    status.isBlackedOut ? 'Not available' :
                    status.isWeekend ? 'Weekend' :
                    'No slots available';

      return `${baseClasses} text-gray-400 cursor-not-allowed bg-gray-100 relative group`;
    }

    // Available dates
    if (status.isToday) {
      return `${baseClasses} bg-orange-100 text-orange-800 hover:bg-orange-200 border-2 border-orange-300 cursor-pointer`;
    }

    if (status.isTomorrow) {
      return `${baseClasses} bg-blue-50 text-blue-800 hover:bg-blue-100 border-2 border-blue-200 cursor-pointer`;
    }

    return `${baseClasses} bg-white text-gray-900 hover:bg-blue-50 hover:text-blue-700 border border-gray-200 hover:border-blue-300 cursor-pointer`;
  };

  const getDateLabel = (date: Date, status: ReturnType<typeof getDateStatus>) => {
    if (status.isToday) return 'Today';
    if (status.isTomorrow) return 'Tomorrow';
    return date.getDate().toString();
  };

  const getBlackoutReason = (dateStr: string) => {
    const blackout = blackoutDates.find(bd => bd.date === dateStr);
    return blackout?.reason || 'Not available';
  };

  const canNavigatePrev = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(currentMonth.getMonth() - 1);
    return prevMonth.getMonth() >= minDate.getMonth() || prevMonth.getFullYear() > minDate.getFullYear();
  };

  const canNavigateNext = () => {
    if (!maxDate) return true;
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1);
    return nextMonth.getMonth() <= maxDate.getMonth() && nextMonth.getFullYear() <= maxDate.getFullYear();
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {monthData.monthName}
        </h3>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => navigateMonth('prev')}
            disabled={!canNavigatePrev()}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Previous month"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => navigateMonth('next')}
            disabled={!canNavigateNext()}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-label="Next month"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="h-10 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthData.weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const status = getDateStatus(date);

            return (
              <div key={`${weekIndex}-${dayIndex}`} className="relative">
                <button
                  type="button"
                  onClick={() => status.isAvailable ? onDateSelect(status.dateStr) : undefined}
                  disabled={!status.isAvailable}
                  className={getDateClasses(status)}
                  aria-label={`${formatDateForDisplay(date)}, ${getDayName(date)}`}
                  title={!status.isAvailable ? getBlackoutReason(status.dateStr) : undefined}
                >
                  <span className="relative z-10">
                    {getDateLabel(date, status)}
                  </span>

                  {/* Available indicator */}
                  {status.isAvailable && !status.isSelected && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
                  )}

                  {/* Tooltip for unavailable dates */}
                  {!status.isAvailable && status.isCurrentMonth && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                      {status.isPast ? 'Past date' :
                       status.isTooFar ? 'Too far ahead' :
                       status.isBlackedOut ? getBlackoutReason(status.dateStr) :
                       status.isWeekend ? 'Weekend (not available)' :
                       'No time slots available'}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-1 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-gray-600">Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-200 rounded border border-orange-300"></div>
            <span className="text-gray-600">Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white border border-blue-200 rounded relative">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-gray-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span className="text-gray-600">Unavailable</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-3">
          📅 Available Monday to Friday only • 🕘 All times in Melbourne timezone
        </p>
      </div>
    </div>
  );
};

export default BookingCalendar;