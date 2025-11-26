/**
 * Time Slot Picker Component
 * Grid display of available time slots for selected date
 */

import React from 'react';
import { formatTimeSlot, formatDateForDisplay } from '@/lib/booking-date-utils';
import type { AvailableSlot } from '@/types/booking';

interface TimeSlotPickerProps {
  selectedDate: string;
  availableSlots: AvailableSlot[];
  selectedTimeSlot?: string;
  onTimeSlotSelect: (timeSlot: string) => void;
  loading?: boolean;
  className?: string;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  availableSlots,
  selectedTimeSlot,
  onTimeSlotSelect,
  loading = false,
  className = ''
}) => {
  // Group slots by date (should only be one date, but keeping it flexible)
  const slotsForDate = availableSlots.filter(slot => slot.slot_date === selectedDate);

  const formatSlotTime = (slot: AvailableSlot): string => {
    return formatTimeSlot(slot.start_time, slot.end_time);
  };

  const getSlotValue = (slot: AvailableSlot): string => {
    return `${slot.start_time}-${slot.end_time}`;
  };

  const getSlotClasses = (slot: AvailableSlot, isSelected: boolean) => {
    const baseClasses = 'relative p-4 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center';

    if (slot.available_count <= 0) {
      return `${baseClasses} bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed`;
    }

    if (isSelected) {
      return `${baseClasses} bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500 shadow-lg transform scale-105`;
    }

    // Check if this is a popular time (morning or afternoon start)
    const hour = parseInt(slot.start_time.split(':')[0]);
    const isPopularTime = hour >= 9 && hour <= 11; // Morning slots tend to be popular

    if (isPopularTime) {
      return `${baseClasses} bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100 hover:border-orange-300 hover:shadow-md cursor-pointer`;
    }

    return `${baseClasses} bg-white text-gray-900 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md cursor-pointer`;
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedDate) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Date First</h3>
          <p className="text-gray-500">Choose a date from the calendar to see available time slots.</p>
        </div>
      </div>
    );
  }

  if (slotsForDate.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Slots Available</h3>
          <p className="text-gray-500 mb-4">
            Sorry, there are no available time slots for {formatDateForDisplay(selectedDate)}.
          </p>
          <p className="text-sm text-gray-400">
            Try selecting another date or give us a call on +61 478 101 521 to discuss alternative times.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose Your Time
        </h3>
        <p className="text-sm text-gray-600">
          Available slots for {formatDateForDisplay(selectedDate)}
          <span className="ml-2 text-gray-500">(Melbourne time)</span>
        </p>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {slotsForDate.map((slot) => {
          const slotValue = getSlotValue(slot);
          const isSelected = selectedTimeSlot === slotValue;
          const isAvailable = slot.available_count > 0;

          return (
            <button
              key={slotValue}
              type="button"
              onClick={() => isAvailable ? onTimeSlotSelect(slotValue) : undefined}
              disabled={!isAvailable}
              className={getSlotClasses(slot, isSelected)}
              aria-label={`${formatSlotTime(slot)}, ${isAvailable ? 'available' : 'fully booked'}`}
            >
              {/* Time */}
              <div className="font-semibold text-sm mb-1">
                {formatSlotTime(slot)}
              </div>

              {/* Status */}
              <div className="text-xs">
                {!isAvailable ? (
                  <span className="text-gray-500">Fully Booked</span>
                ) : isSelected ? (
                  <span className="text-blue-100">Selected</span>
                ) : (
                  <span className="text-gray-500">Available</span>
                )}
              </div>

              {/* Popular indicator */}
              {isAvailable && !isSelected && (
                (() => {
                  const hour = parseInt(slot.start_time.split(':')[0]);
                  const isPopularTime = hour >= 9 && hour <= 11;

                  return isPopularTime ? (
                    <div className="absolute top-2 right-2">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-orange-200 text-orange-800">
                        Popular
                      </span>
                    </div>
                  ) : null;
                })()
              )}

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-200 rounded border border-orange-300"></div>
              <span>Popular times</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-gray-200 rounded"></div>
              <span>Fully booked</span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            ⏱️ All calls are 60 minutes • 🎯 Free strategy session
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeSlotPicker;