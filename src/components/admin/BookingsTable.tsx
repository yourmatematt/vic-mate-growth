/**
 * Bookings Table Component
 * Displays bookings in a sortable, responsive table with bulk actions
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronUp,
  ChevronDown,
  Users,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { Booking, BookingStatus } from '@/types/booking';
import BookingStatusBadge from './BookingStatusBadge';

interface BookingsTableProps {
  bookings: Booking[];
  loading?: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onStatusUpdate: (bookingId: string, status: BookingStatus) => void;
  onDelete: (bookingId: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  loading = false,
  selectedIds,
  onSelectionChange,
  onStatusUpdate,
  onDelete,
  sortField,
  sortOrder,
  onSort
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(bookings.map(b => b.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, id]);
    } else {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const isSelected = (id: string) => selectedIds.includes(id);
  const isAllSelected = bookings.length > 0 && selectedIds.length === bookings.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < bookings.length;

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: format(date, 'MMM d, yyyy'),
      time: format(date, 'h:mm a')
    };
  };

  const formatPhoneNumber = (phone: string) => {
    // Format Australian phone numbers
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('61')) {
      const number = cleaned.slice(2);
      if (number.startsWith('4')) {
        // Mobile: 0412 345 678
        return `0${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
      } else {
        // Landline: (03) 1234 5678
        return `(0${number.slice(0, 1)}) ${number.slice(1, 5)} ${number.slice(5)}`;
      }
    }
    return phone;
  };

  const getBusinessTypeLabel = (type: string) => {
    const types: Record<string, string> = {
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
    return types[type] || type;
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => onSort(field)}
      className="h-auto p-0 font-medium text-left justify-start hover:bg-transparent"
    >
      {children}
      {sortField === field && (
        sortOrder === 'asc' ?
          <ChevronUp className="ml-2 h-4 w-4" /> :
          <ChevronDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
        <p className="text-gray-500 mb-6">
          No bookings match your current filters. Try adjusting your search criteria.
        </p>
        <Button variant="outline" asChild>
          <Link to="/admin/time-slots">
            Manage Time Slots
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all bookings"
                  ref={React.createRef<HTMLInputElement>()}
                  {...(isSomeSelected && { 'data-state': 'indeterminate' } as any)}
                />
              </TableHead>
              <TableHead>
                <SortableHeader field="datetime">Date & Time</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader field="customer_name">Customer</SortableHeader>
              </TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>
                <SortableHeader field="status">Status</SortableHeader>
              </TableHead>
              <TableHead>
                <SortableHeader field="created_at">Created</SortableHeader>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => {
              const { date, time } = formatDateTime(booking.datetime);
              const customerInitials = booking.customer_name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase();

              return (
                <TableRow
                  key={booking.id}
                  className={`hover:bg-gray-50 ${isSelected(booking.id) ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected(booking.id)}
                      onCheckedChange={(checked) => handleSelectOne(booking.id, checked as boolean)}
                      aria-label={`Select booking for ${booking.customer_name}`}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{date}</div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium">
                          {customerInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          <Link
                            to={`/admin/bookings/${booking.id}`}
                            className="hover:text-blue-600 hover:underline"
                          >
                            {booking.customer_name}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-600">{booking.customer_email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{booking.business_name}</div>
                      <Badge variant="outline" className="text-xs">
                        {getBusinessTypeLabel(booking.business_type)}
                      </Badge>
                      {booking.business_location && (
                        <div className="text-sm text-gray-600 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {booking.business_location}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" />
                        {formatPhoneNumber(booking.customer_phone)}
                      </div>
                      <div className="text-sm flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" />
                        <a
                          href={`mailto:${booking.customer_email}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          Email
                        </a>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <BookingStatusBadge status={booking.status} />
                  </TableCell>

                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {format(new Date(booking.created_at), 'MMM d, h:mm a')}
                    </div>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/bookings/${booking.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>

                        {booking.status === BookingStatus.PENDING && (
                          <DropdownMenuItem
                            onClick={() => onStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Booking
                          </DropdownMenuItem>
                        )}

                        {[BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status) && (
                          <DropdownMenuItem
                            onClick={() => onStatusUpdate(booking.id, BookingStatus.CANCELLED)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Booking
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => onDelete(booking.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {bookings.map((booking) => {
          const { date, time } = formatDateTime(booking.datetime);
          const customerInitials = booking.customer_name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();

          return (
            <div
              key={booking.id}
              className={`p-4 ${isSelected(booking.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={isSelected(booking.id)}
                    onCheckedChange={(checked) => handleSelectOne(booking.id, checked as boolean)}
                    aria-label={`Select booking for ${booking.customer_name}`}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm font-medium">
                      {customerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-lg">
                      <Link
                        to={`/admin/bookings/${booking.id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {booking.customer_name}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-600">{booking.customer_email}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/admin/bookings/${booking.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    {booking.status === BookingStatus.PENDING && (
                      <DropdownMenuItem
                        onClick={() => onStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(booking.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {date} at {time}
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>

                <div className="text-sm text-gray-600">
                  <div className="font-medium">{booking.business_name}</div>
                  <div className="flex items-center">
                    <Badge variant="outline" className="text-xs mr-2">
                      {getBusinessTypeLabel(booking.business_type)}
                    </Badge>
                    {booking.business_location && (
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {booking.business_location}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <a
                    href={`tel:${booking.customer_phone}`}
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    {formatPhoneNumber(booking.customer_phone)}
                  </a>
                  <a
                    href={`mailto:${booking.customer_email}`}
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </a>
                </div>

                <div className="text-xs text-gray-500">
                  Created {format(new Date(booking.created_at), 'MMM d, h:mm a')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingsTable;