/**
 * Booking Quick Actions Dashboard Widget
 * Displays upcoming bookings and quick management actions
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Eye
} from 'lucide-react';
import { format, isToday, isTomorrow, addDays, isBefore } from 'date-fns';
import { Booking, BookingStatus } from '@/types/booking';
import BookingStatusBadge from './BookingStatusBadge';

interface BookingQuickActionsProps {
  bookings: Booking[];
  loading?: boolean;
  onStatusUpdate?: (bookingId: string, status: BookingStatus) => void;
}

const BookingQuickActions: React.FC<BookingQuickActionsProps> = ({
  bookings,
  loading = false,
  onStatusUpdate
}) => {
  // Filter for upcoming bookings (next 7 days)
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.datetime);
    const today = new Date();
    const nextWeek = addDays(today, 7);

    return bookingDate >= today && bookingDate <= nextWeek;
  }).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  // Filter for pending confirmations
  const pendingConfirmations = bookings.filter(booking =>
    booking.status === BookingStatus.PENDING
  ).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  // Today's bookings
  const todaysBookings = bookings.filter(booking =>
    isToday(new Date(booking.datetime))
  ).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const formatTime = (datetime: string) => {
    return format(new Date(datetime), 'h:mm a');
  };

  const formatDateShort = (datetime: string) => {
    const date = new Date(datetime);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-1">
                    <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Today's Bookings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Today's Bookings
            {todaysBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {todaysBookings.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todaysBookings.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No bookings today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-medium">
                      {getCustomerInitials(booking.customer_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {booking.customer_name}
                      </p>
                      <span className="text-xs text-gray-600 ml-2">
                        {formatTime(booking.datetime)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {booking.business_name}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <BookingStatusBadge status={booking.status} />
                      {booking.status === BookingStatus.CONFIRMED && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => window.open(`tel:${booking.customer_phone}`)}
                            className="p-1 hover:bg-blue-200 rounded"
                            title="Call customer"
                          >
                            <Phone className="h-3 w-3 text-blue-600" />
                          </button>
                          <button
                            onClick={() => window.open(`mailto:${booking.customer_email}`)}
                            className="p-1 hover:bg-blue-200 rounded"
                            title="Email customer"
                          >
                            <Mail className="h-3 w-3 text-blue-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {todaysBookings.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/bookings?filter=today">
                      View all {todaysBookings.length} bookings
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Confirmations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
            Need Confirmation
            {pendingConfirmations.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                {pendingConfirmations.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingConfirmations.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">All caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingConfirmations.slice(0, 3).map((booking) => {
                const isUrgent = isBefore(new Date(booking.datetime), addDays(new Date(), 2));

                return (
                  <div
                    key={booking.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      isUrgent ? 'bg-red-50 border border-red-200' : 'bg-yellow-50'
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-medium">
                        {getCustomerInitials(booking.customer_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {booking.customer_name}
                        </p>
                        <span className="text-xs text-gray-600 ml-2">
                          {formatDateShort(booking.datetime)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {booking.business_name}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <BookingStatusBadge status={booking.status} />
                        <div className="flex space-x-1">
                          {onStatusUpdate && (
                            <Button
                              size="sm"
                              onClick={() => onStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
                              className="h-6 px-2 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Confirm
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                            <Link to={`/admin/bookings/${booking.id}`}>
                              <Eye className="h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {pendingConfirmations.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/bookings?status=pending">
                      View all {pendingConfirmations.length} pending
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Clock className="h-5 w-5 mr-2 text-green-600" />
            Next 7 Days
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {upcomingBookings.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming bookings</p>
              <Button variant="outline" size="sm" className="mt-3" asChild>
                <Link to="/admin/time-slots">
                  Manage Time Slots
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.slice(0, 4).map((booking) => (
                <div key={booking.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-medium">
                      {getCustomerInitials(booking.customer_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {booking.customer_name}
                      </p>
                      <span className="text-xs text-gray-600 ml-2">
                        {formatDateShort(booking.datetime)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {booking.business_name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <BookingStatusBadge status={booking.status} />
                      <span className="text-xs text-gray-500">
                        {formatTime(booking.datetime)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {upcomingBookings.length > 4 && (
                <div className="text-center pt-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/bookings?period=week">
                      View all upcoming
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Footer */}
      <div className="lg:col-span-3 flex justify-center space-x-4 pt-4">
        <Button asChild>
          <Link to="/admin/bookings">
            <Users className="h-4 w-4 mr-2" />
            View All Bookings
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/time-slots">
            <Clock className="h-4 w-4 mr-2" />
            Manage Schedule
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/blackout-dates">
            <Calendar className="h-4 w-4 mr-2" />
            Blackout Dates
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default BookingQuickActions;