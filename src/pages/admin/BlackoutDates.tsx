/**
 * Admin Blackout Dates Management Page
 * Manage dates when bookings are not available
 */

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import BlackoutDateForm from '@/components/admin/BlackoutDateForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Calendar as CalendarIcon,
  CalendarX,
  Edit,
  Trash2,
  MoreHorizontal,
  RotateCcw,
  Clock,
  AlertTriangle,
  List,
  Grid3X3
} from 'lucide-react';
import { format, isAfter, isBefore, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { useAdminBlackoutDates } from '@/hooks/useAdminBooking';
import { BookingBlackoutDate } from '@/types/booking';

const BlackoutDates: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<BookingBlackoutDate | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  const {
    blackoutDates,
    loading,
    createBlackoutDate,
    updateBlackoutDate,
    deleteBlackoutDate,
    refreshBlackoutDates
  } = useAdminBlackoutDates();

  // Filter blackout dates for current view
  const filteredBlackoutDates = useMemo(() => {
    if (viewMode === 'calendar') {
      const monthStart = startOfMonth(selectedMonth);
      const monthEnd = endOfMonth(selectedMonth);

      return blackoutDates.filter(blackoutDate => {
        const startDate = new Date(blackoutDate.start_date);
        const endDate = new Date(blackoutDate.end_date);

        // Include if blackout overlaps with the selected month
        return !(isAfter(startDate, monthEnd) || isBefore(endDate, monthStart));
      });
    }

    return blackoutDates;
  }, [blackoutDates, viewMode, selectedMonth]);

  // Create a set of blackout dates for calendar highlighting
  const blackoutDateSet = useMemo(() => {
    const dateSet = new Set<string>();

    filteredBlackoutDates.forEach(blackoutDate => {
      const startDate = new Date(blackoutDate.start_date);
      const endDate = new Date(blackoutDate.end_date);

      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dateSet.add(format(currentDate, 'yyyy-MM-dd'));
        currentDate = addDays(currentDate, 1);
      }
    });

    return dateSet;
  }, [filteredBlackoutDates]);

  const handleCreateDate = () => {
    setEditingDate(null);
    setFormOpen(true);
  };

  const handleEditDate = (blackoutDate: BookingBlackoutDate) => {
    setEditingDate(blackoutDate);
    setFormOpen(true);
  };

  const handleSaveDate = async (dateData: Omit<BookingBlackoutDate, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingDate) {
        await updateBlackoutDate(editingDate.id, dateData);
        toast.success('Blackout date updated successfully');
      } else {
        await createBlackoutDate(dateData);
        toast.success('Blackout date created successfully');
      }
    } catch (error) {
      toast.error(editingDate ? 'Failed to update blackout date' : 'Failed to create blackout date');
      console.error('Error saving blackout date:', error);
      throw error;
    }
  };

  const handleDeleteDate = async (dateId: string) => {
    try {
      await deleteBlackoutDate(dateId);
      toast.success('Blackout date deleted successfully');
    } catch (error) {
      toast.error('Failed to delete blackout date');
      console.error('Error deleting blackout date:', error);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (startDate === endDate) {
      return format(start, 'MMM d, yyyy');
    }

    if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }

    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const isDateBlackedOut = (date: Date) => {
    return blackoutDateSet.has(format(date, 'yyyy-MM-dd'));
  };

  const getBlackoutForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredBlackoutDates.find(blackoutDate => {
      const startDate = new Date(blackoutDate.start_date);
      const endDate = new Date(blackoutDate.end_date);
      const currentDate = new Date(dateStr);

      return currentDate >= startDate && currentDate <= endDate;
    });
  };

  const statistics = useMemo(() => {
    const total = blackoutDates.length;
    const active = blackoutDates.filter(date => {
      const endDate = new Date(date.end_date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return endDate >= today;
    }).length;
    const recurring = blackoutDates.filter(date => date.is_recurring).length;

    // Count total blocked days this year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31);

    let totalBlockedDays = 0;
    blackoutDates.forEach(blackoutDate => {
      const startDate = new Date(blackoutDate.start_date);
      const endDate = new Date(blackoutDate.end_date);

      if (!(isAfter(startDate, yearEnd) || isBefore(endDate, yearStart))) {
        const effectiveStart = isAfter(startDate, yearStart) ? startDate : yearStart;
        const effectiveEnd = isBefore(endDate, yearEnd) ? endDate : yearEnd;
        const days = Math.ceil((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        totalBlockedDays += days;
      }
    });

    return { total, active, recurring, totalBlockedDays };
  }, [blackoutDates]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">
              Blackout Dates
            </h1>
            <p className="mt-2 text-gray-600">
              Manage dates when strategy calls are not available for booking
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Select value={viewMode} onValueChange={(value: 'calendar' | 'list') => setViewMode(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calendar">
                  <Grid3X3 className="h-4 w-4 mr-2 inline" />
                  Calendar
                </SelectItem>
                <SelectItem value="list">
                  <List className="h-4 w-4 mr-2 inline" />
                  List
                </SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={refreshBlackoutDates} variant="outline" disabled={loading}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button onClick={handleCreateDate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Blackout
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Blackouts</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <CalendarX className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active/Upcoming</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.active}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Recurring</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.recurring}</p>
                </div>
                <RotateCcw className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Blocked Days (Year)</p>
                  <p className="text-2xl font-bold text-orange-600">{statistics.totalBlockedDays}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Calendar View
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={undefined}
                  month={selectedMonth}
                  onMonthChange={setSelectedMonth}
                  className="rounded-md border"
                  modifiers={{
                    blackout: isDateBlackedOut
                  }}
                  modifiersStyles={{
                    blackout: {
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      fontWeight: 'bold'
                    }
                  }}
                  components={{
                    Day: ({ date, ...props }) => {
                      const blackout = getBlackoutForDate(date);
                      return (
                        <div
                          className={`relative ${props.className || ''}`}
                          title={blackout ? `Blackout: ${blackout.reason}` : ''}
                        >
                          <span>{date.getDate()}</span>
                          {blackout && (
                            <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                        </div>
                      );
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {format(selectedMonth, 'MMMM yyyy')} Blackouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredBlackoutDates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarX className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No blackouts this month</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredBlackoutDates.map((blackoutDate) => (
                      <div
                        key={blackoutDate.id}
                        className="p-3 border border-red-200 bg-red-50 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-sm font-medium text-red-900">
                            {formatDateRange(blackoutDate.start_date, blackoutDate.end_date)}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditDate(blackoutDate)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Blackout Date</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this blackout for{' '}
                                      {formatDateRange(blackoutDate.start_date, blackoutDate.end_date)}?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteDate(blackoutDate.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="text-xs text-red-700 mb-1">
                          {blackoutDate.reason}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {getDuration(blackoutDate.start_date, blackoutDate.end_date)}
                          </Badge>
                          {blackoutDate.is_recurring && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader>
              <CardTitle>All Blackout Dates</CardTitle>
            </CardHeader>
            <CardContent>
              {blackoutDates.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No blackout dates</h3>
                  <p className="text-gray-600 mb-6">
                    Add blackout dates to prevent bookings on specific days.
                  </p>
                  <Button onClick={handleCreateDate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Blackout
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blackoutDates
                      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
                      .map((blackoutDate) => {
                        const isPast = isBefore(new Date(blackoutDate.end_date), new Date());

                        return (
                          <TableRow key={blackoutDate.id} className={isPast ? 'opacity-60' : ''}>
                            <TableCell>
                              <div className="font-medium">
                                {formatDateRange(blackoutDate.start_date, blackoutDate.end_date)}
                              </div>
                              {isPast && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  Past
                                </Badge>
                              )}
                            </TableCell>

                            <TableCell>
                              <div className="max-w-xs truncate" title={blackoutDate.reason}>
                                {blackoutDate.reason}
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline">
                                {getDuration(blackoutDate.start_date, blackoutDate.end_date)}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              {blackoutDate.is_recurring ? (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                  <RotateCcw className="h-3 w-3 mr-1" />
                                  Recurring
                                </Badge>
                              ) : (
                                <Badge variant="secondary">One-time</Badge>
                              )}
                            </TableCell>

                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {format(new Date(blackoutDate.created_at), 'MMM d, yyyy')}
                              </div>
                            </TableCell>

                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditDate(blackoutDate)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Blackout Date</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this blackout for{' '}
                                          {formatDateRange(blackoutDate.start_date, blackoutDate.end_date)}?
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteDate(blackoutDate.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Blackout Date Form Modal */}
        <BlackoutDateForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSaveDate}
          editingDate={editingDate}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
};

export default BlackoutDates;