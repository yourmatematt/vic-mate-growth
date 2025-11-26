/**
 * Admin Bookings List Page
 * Main dashboard for managing all bookings with filtering and bulk actions
 */

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import BookingStats from '@/components/admin/BookingStats';
import BookingFilters, { BookingFiltersState } from '@/components/admin/BookingFilters';
import BookingsTable from '@/components/admin/BookingsTable';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  Trash2,
  Users,
  Download
} from 'lucide-react';
import { useBookings, useUpdateBooking, useDeleteBooking } from '@/hooks/useBookings';
import { Booking, BookingStatus } from '@/types/booking';
import { exportBookingsToCSV } from '@/lib/admin/export-bookings';

const ITEMS_PER_PAGE = 20;

const defaultFilters: BookingFiltersState = {
  search: '',
  status: 'all',
  dateRange: {},
  businessType: 'all',
  sortBy: 'date',
  sortOrder: 'desc'
};

const BookingsList: React.FC = () => {
  const [filters, setFilters] = useState<BookingFiltersState>(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkAction, setBulkAction] = useState<string>('');

  const {
    bookings,
    loading,
    refetch: refreshBookings
  } = useBookings();
  const { updateStatus: updateBookingStatus } = useUpdateBooking();
  const { deleteBooking } = useDeleteBooking();

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!bookings.length) {
      return {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        thisWeekBookings: 0,
        thisMonthBookings: 0,
        trends: {
          totalChange: 0,
          pendingChange: 0,
          confirmedChange: 0,
          weekChange: 0
        }
      };
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeekBookings = bookings.filter(b =>
      new Date(b.created_at) >= startOfWeek
    ).length;

    const thisMonthBookings = bookings.filter(b =>
      new Date(b.created_at) >= startOfMonth
    ).length;

    const pendingBookings = bookings.filter(b =>
      b.status === BookingStatus.PENDING
    ).length;

    const confirmedBookings = bookings.filter(b =>
      b.status === BookingStatus.CONFIRMED
    ).length;

    const completedBookings = bookings.filter(b =>
      b.status === BookingStatus.COMPLETED
    ).length;

    // Mock trend calculations (would normally compare to previous periods)
    return {
      totalBookings: bookings.length,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      thisWeekBookings,
      thisMonthBookings,
      trends: {
        totalChange: 12,
        pendingChange: -5,
        confirmedChange: 18,
        weekChange: 25
      }
    };
  }, [bookings]);

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.customer_name.toLowerCase().includes(searchLower) ||
        booking.customer_email.toLowerCase().includes(searchLower) ||
        booking.business_name.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status);
    }

    // Business type filter
    if (filters.businessType !== 'all') {
      filtered = filtered.filter(booking => booking.business_type === filters.businessType);
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.datetime);
        if (filters.dateRange.from && bookingDate < filters.dateRange.from) {
          return false;
        }
        if (filters.dateRange.to && bookingDate > filters.dateRange.to) {
          return false;
        }
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.customer_name;
          bValue = b.customer_name;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'date':
        default:
          aValue = new Date(a.datetime);
          bValue = new Date(b.datetime);
          break;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [bookings, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Clear selection when bookings change
  useEffect(() => {
    setSelectedIds([]);
  }, [filteredBookings]);

  const handleFiltersChange = (newFilters: BookingFiltersState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(defaultFilters);
  };

  const handleSort = (field: string) => {
    setFilters(prev => ({
      ...prev,
      sortBy: field as any,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      toast.error('Failed to update booking status');
      console.error('Error updating booking status:', error);
    }
  };

  const handleDelete = async (bookingId: string) => {
    try {
      await deleteBooking(bookingId);
      toast.success('Booking deleted successfully');
      setSelectedIds(prev => prev.filter(id => id !== bookingId));
    } catch (error) {
      toast.error('Failed to delete booking');
      console.error('Error deleting booking:', error);
    }
  };

  const handleBulkAction = async () => {
    if (!selectedIds.length || !bulkAction) return;

    try {
      const promises = selectedIds.map(id => {
        switch (bulkAction) {
          case 'confirm':
            return updateBookingStatus(id, BookingStatus.CONFIRMED);
          case 'cancel':
            return updateBookingStatus(id, BookingStatus.CANCELLED);
          case 'delete':
            return deleteBooking(id);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(promises);

      const actionText = bulkAction === 'delete' ? 'deleted' : `${bulkAction}ed`;
      toast.success(`${selectedIds.length} bookings ${actionText} successfully`);

      setSelectedIds([]);
      setBulkAction('');
    } catch (error) {
      toast.error(`Failed to ${bulkAction} selected bookings`);
      console.error('Bulk action error:', error);
    }
  };

  const handleExport = () => {
    try {
      exportBookingsToCSV(filteredBookings);
      toast.success('Bookings exported successfully');
    } catch (error) {
      toast.error('Failed to export bookings');
      console.error('Export error:', error);
    }
  };

  const handleStatsFilter = (filter: { status?: BookingStatus; period?: string }) => {
    setFilters(prev => ({
      ...prev,
      ...(filter.status && { status: filter.status }),
      ...(filter.period && {
        dateRange: filter.period === 'week' ? {
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          to: new Date()
        } : {}
      })
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">
              Bookings Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage strategy call bookings and customer appointments
            </p>
          </div>

          <Button onClick={refreshBookings} disabled={loading}>
            Refresh Data
          </Button>
        </div>

        {/* Statistics */}
        <BookingStats
          statistics={statistics}
          loading={loading}
          onFilterClick={handleStatsFilter}
        />

        {/* Filters */}
        <BookingFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onExport={handleExport}
          totalResults={filteredBookings.length}
          loading={loading}
        />

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedIds.length} booking{selectedIds.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Choose action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirm">Confirm All</SelectItem>
                    <SelectItem value="cancel">Cancel All</SelectItem>
                    <SelectItem value="delete">Delete All</SelectItem>
                  </SelectContent>
                </Select>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      disabled={!bulkAction}
                      className="whitespace-nowrap"
                    >
                      Apply Action
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to {bulkAction} {selectedIds.length} booking
                        {selectedIds.length !== 1 ? 's' : ''}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBulkAction}>
                        Yes, {bulkAction} {selectedIds.length} booking
                        {selectedIds.length !== 1 ? 's' : ''}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  onClick={() => setSelectedIds([])}
                  className="whitespace-nowrap"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Table */}
        <BookingsTable
          bookings={paginatedBookings}
          loading={loading}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDelete}
          sortField={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={handleSort}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredBookings.length)} of{' '}
              {filteredBookings.length} bookings
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-500">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BookingsList;