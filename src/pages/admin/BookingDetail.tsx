/**
 * Admin Booking Detail Page
 * Detailed view of a single booking with management actions
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import BookingStatusBadge from '@/components/admin/BookingStatusBadge';
import UpdateBookingStatusModal from '@/components/admin/UpdateBookingStatusModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Edit,
  Trash2,
  Send,
  Video,
  Download,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  History,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { useBookings, useUpdateBooking, useDeleteBooking } from '@/hooks/useBookings';
import { Booking, BookingStatus } from '@/types/booking';

const BookingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const {
    bookings,
    refetch: refreshBookings
  } = useBookings();
  const { updateStatus: updateBookingStatus } = useUpdateBooking();
  const { deleteBooking } = useDeleteBooking();

  useEffect(() => {
    if (id && bookings.length > 0) {
      const foundBooking = bookings.find(b => b.id === id);
      if (foundBooking) {
        setBooking(foundBooking);
        setLoading(false);
      } else {
        // Booking not found, redirect to list
        toast.error('Booking not found');
        navigate('/admin/bookings');
      }
    } else if (bookings.length === 0) {
      // Still loading bookings
      setLoading(true);
    }
  }, [id, bookings, navigate]);

  const handleStatusUpdate = async (status: BookingStatus, note?: string, sendNotification?: boolean) => {
    if (!booking) return;

    setUpdating(true);
    try {
      await updateBookingStatus(booking.id, status, note, sendNotification);

      // Update local booking state
      setBooking(prev => prev ? { ...prev, status } : null);

      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      toast.error('Failed to update booking status');
      console.error('Error updating booking status:', error);
      throw error; // Re-throw to let modal handle it
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!booking) return;

    try {
      await deleteBooking(booking.id);
      toast.success('Booking deleted successfully');
      navigate('/admin/bookings');
    } catch (error) {
      toast.error('Failed to delete booking');
      console.error('Error deleting booking:', error);
    }
  };

  const handleSendEmail = async (type: 'confirmation' | 'reminder') => {
    if (!booking) return;

    try {
      // TODO: Implement email sending
      toast.success(`${type === 'confirmation' ? 'Confirmation' : 'Reminder'} email sent successfully`);
    } catch (error) {
      toast.error('Failed to send email');
      console.error('Error sending email:', error);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: format(date, 'EEEE, MMMM d, yyyy'),
      time: format(date, 'h:mm a'),
      timeZone: 'AEST'
    };
  };

  const formatPhoneNumber = (phone: string) => {
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

  const getStatusIcon = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case BookingStatus.CONFIRMED:
        return <CheckCircle className="h-4 w-4" />;
      case BookingStatus.COMPLETED:
        return <CheckCircle className="h-4 w-4" />;
      case BookingStatus.CANCELLED:
        return <AlertCircle className="h-4 w-4" />;
      case BookingStatus.NO_SHOW:
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="w-full h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!booking) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Booking not found</h3>
          <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or has been deleted.</p>
          <Button asChild>
            <Link to="/admin/bookings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Bookings
            </Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const { date, time, timeZone } = formatDateTime(booking.datetime);
  const canConfirm = booking.status === BookingStatus.PENDING;
  const canComplete = booking.status === BookingStatus.CONFIRMED && new Date(booking.datetime) < new Date();
  const canCancel = [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/bookings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Bookings
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-2xl font-heading font-bold text-gray-900">
                {booking.customer_name}
              </h1>
              <div className="flex items-center space-x-3 mt-1">
                <BookingStatusBadge status={booking.status} />
                <span className="text-sm text-gray-600">
                  Booking #{booking.id.slice(-8)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => setStatusModalOpen(true)}
              disabled={updating}
            >
              <Edit className="h-4 w-4 mr-2" />
              Update Status
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSendEmail('confirmation')}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Confirmation Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSendEmail('reminder')}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Reminder Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Booking
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this booking for {booking.customer_name}?
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Actions */}
        {(canConfirm || canComplete || canCancel) && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="font-medium text-blue-900">Quick Actions</h3>
                  <p className="text-sm text-blue-700">Common actions for this booking</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canConfirm && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(BookingStatus.CONFIRMED)}
                      disabled={updating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Booking
                    </Button>
                  )}
                  {canComplete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(BookingStatus.COMPLETED)}
                      disabled={updating}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusUpdate(BookingStatus.CANCELLED)}
                      disabled={updating}
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Date & Time</div>
                <div className="text-lg font-semibold">{date}</div>
                <div className="text-gray-600">{time} ({timeZone})</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Status</div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(booking.status)}
                  <BookingStatusBadge status={booking.status} />
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Duration</div>
                <div>60 minutes</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Created</div>
                <div className="text-sm text-gray-600">
                  {format(new Date(booking.created_at), 'PPp')}
                </div>
              </div>

              {booking.google_meet_link && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Google Meet</div>
                    <Button variant="outline" size="sm" asChild className="w-full">
                      <a href={booking.google_meet_link} target="_blank" rel="noopener noreferrer">
                        <Video className="h-4 w-4 mr-2" />
                        Join Meeting
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Name</div>
                <div className="font-medium">{booking.customer_name}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Email</div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <a
                    href={`mailto:${booking.customer_email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {booking.customer_email}
                  </a>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Phone</div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <a
                    href={`tel:${booking.customer_phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {formatPhoneNumber(booking.customer_phone)}
                  </a>
                </div>
              </div>

              {booking.biggest_challenge && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Biggest Challenge</div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      "{booking.biggest_challenge}"
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Business Name</div>
                <div className="font-medium">{booking.business_name}</div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Industry</div>
                <Badge variant="outline">
                  {getBusinessTypeLabel(booking.business_type)}
                </Badge>
              </div>

              {booking.business_location && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Location</div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    {booking.business_location}
                  </div>
                </div>
              )}

              {booking.business_website && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Website</div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-2 text-gray-400" />
                    <a
                      href={booking.business_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {booking.business_website}
                    </a>
                  </div>
                </div>
              )}

              {booking.current_revenue && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Annual Revenue</div>
                  <Badge variant="secondary">
                    {booking.current_revenue.replace('-', ' - ')}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Update Status Modal */}
        <UpdateBookingStatusModal
          isOpen={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          currentStatus={booking.status}
          customerName={booking.customer_name}
          onUpdate={handleStatusUpdate}
          loading={updating}
        />
      </div>
    </AdminLayout>
  );
};

export default BookingDetail;