/**
 * Booking Status Badge Component
 * Displays color-coded status badges for bookings
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { BookingStatus } from '@/types/booking';

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const statusConfig = {
  [BookingStatus.PENDING]: {
    label: 'Pending',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
  },
  [BookingStatus.CONFIRMED]: {
    label: 'Confirmed',
    variant: 'secondary' as const,
    className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
  },
  [BookingStatus.COMPLETED]: {
    label: 'Completed',
    variant: 'secondary' as const,
    className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
  },
  [BookingStatus.CANCELLED]: {
    label: 'Cancelled',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200'
  },
  [BookingStatus.NO_SHOW]: {
    label: 'No Show',
    variant: 'secondary' as const,
    className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
  }
};

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  className
}) => {
  const config = statusConfig[status];

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${className || ''}`}
    >
      {config.label}
    </Badge>
  );
};

export default BookingStatusBadge;