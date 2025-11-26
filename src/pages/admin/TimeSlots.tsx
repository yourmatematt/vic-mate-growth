/**
 * Admin Time Slots Management Page
 * Manage available time slots for booking appointments
 */

import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';
import TimeSlotForm from '@/components/admin/TimeSlotForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Clock,
  Calendar,
  Users,
  Edit,
  Trash2,
  MoreHorizontal,
  Copy,
  ToggleLeft,
  ToggleRight,
  Download,
  Upload,
  Settings
} from 'lucide-react';
import { useAdminTimeSlots } from '@/hooks/useAdminBooking';
import { BookingTimeSlot } from '@/types/booking';

const daysOfWeek = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const TimeSlots: React.FC = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<BookingTimeSlot | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');

  const {
    timeSlots,
    loading,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    toggleTimeSlotAvailability,
    refreshTimeSlots
  } = useAdminTimeSlots();

  // Group time slots by day for week view
  const timeSlotsByDay = useMemo(() => {
    const grouped: Record<number, BookingTimeSlot[]> = {};

    daysOfWeek.forEach(day => {
      grouped[day.value] = timeSlots
        .filter(slot => slot.day_of_week === day.value)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return grouped;
  }, [timeSlots]);

  // Filter time slots for list view
  const filteredTimeSlots = useMemo(() => {
    let filtered = [...timeSlots];

    if (selectedDay !== 'all') {
      filtered = filtered.filter(slot => slot.day_of_week === selectedDay);
    }

    return filtered.sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) {
        return a.day_of_week - b.day_of_week;
      }
      return a.start_time.localeCompare(b.start_time);
    });
  }, [timeSlots, selectedDay]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDuration = (startTime: string, endTime: string) => {
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    const duration = endMinutes - startMinutes;

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const handleCreateSlot = () => {
    setEditingSlot(null);
    setFormOpen(true);
  };

  const handleEditSlot = (slot: BookingTimeSlot) => {
    setEditingSlot(slot);
    setFormOpen(true);
  };

  const handleSaveSlot = async (slotData: Omit<BookingTimeSlot, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingSlot) {
        await updateTimeSlot(editingSlot.id, slotData);
        toast.success('Time slot updated successfully');
      } else {
        await createTimeSlot(slotData);
        toast.success('Time slot created successfully');
      }
    } catch (error) {
      toast.error(editingSlot ? 'Failed to update time slot' : 'Failed to create time slot');
      console.error('Error saving time slot:', error);
      throw error;
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await deleteTimeSlot(slotId);
      toast.success('Time slot deleted successfully');
    } catch (error) {
      toast.error('Failed to delete time slot');
      console.error('Error deleting time slot:', error);
    }
  };

  const handleToggleAvailability = async (slotId: string, isAvailable: boolean) => {
    try {
      await toggleTimeSlotAvailability(slotId, isAvailable);
      toast.success(`Time slot ${isAvailable ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update time slot availability');
      console.error('Error toggling availability:', error);
    }
  };

  const handleDuplicateSlot = (slot: BookingTimeSlot) => {
    const duplicateData = {
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      max_bookings: slot.max_bookings,
      is_available: slot.is_available
    };
    setEditingSlot(null);
    // Pre-populate form with duplicate data (would need to modify TimeSlotForm)
    setFormOpen(true);
  };

  const handleBulkToggleDay = async (dayOfWeek: number, enable: boolean) => {
    const daySlots = timeSlotsByDay[dayOfWeek];
    if (!daySlots.length) return;

    try {
      await Promise.all(
        daySlots.map(slot => toggleTimeSlotAvailability(slot.id, enable))
      );
      toast.success(`All ${daysOfWeek[dayOfWeek].label} slots ${enable ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error(`Failed to update ${daysOfWeek[dayOfWeek].label} slots`);
    }
  };

  const statistics = useMemo(() => {
    const total = timeSlots.length;
    const available = timeSlots.filter(slot => slot.is_available).length;
    const unavailable = total - available;
    const totalCapacity = timeSlots.reduce((sum, slot) => sum + (slot.is_available ? slot.max_bookings : 0), 0);

    return { total, available, unavailable, totalCapacity };
  }, [timeSlots]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">
              Time Slots Management
            </h1>
            <p className="mt-2 text-gray-600">
              Configure available time slots for strategy call bookings
            </p>
          </div>

          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Select value={viewMode} onValueChange={(value: 'week' | 'list') => setViewMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="list">List View</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={refreshTimeSlots} variant="outline" disabled={loading}>
              Refresh
            </Button>

            <Button onClick={handleCreateSlot}>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Slots</p>
                  <p className="text-2xl font-bold">{statistics.total}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.available}</p>
                </div>
                <ToggleRight className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unavailable</p>
                  <p className="text-2xl font-bold text-gray-600">{statistics.unavailable}</p>
                </div>
                <ToggleLeft className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Weekly Capacity</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.totalCapacity}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {daysOfWeek.map((day) => {
              const daySlots = timeSlotsByDay[day.value];
              const availableSlots = daySlots.filter(slot => slot.is_available).length;

              return (
                <Card key={day.value} className="min-h-[300px]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{day.short}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleBulkToggleDay(day.value, true)}
                              disabled={!daySlots.length}
                            >
                              <ToggleRight className="mr-2 h-4 w-4" />
                              Enable All
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleBulkToggleDay(day.value, false)}
                              disabled={!daySlots.length}
                            >
                              <ToggleLeft className="mr-2 h-4 w-4" />
                              Disable All
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {availableSlots} of {daySlots.length} available
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          slot.is_available
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditSlot(slot)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateSlot(slot)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleAvailability(slot.id, !slot.is_available)}
                              >
                                {slot.is_available ? (
                                  <>
                                    <ToggleLeft className="mr-2 h-4 w-4" />
                                    Disable
                                  </>
                                ) : (
                                  <>
                                    <ToggleRight className="mr-2 h-4 w-4" />
                                    Enable
                                  </>
                                )}
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
                                    <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this time slot for {day.label} at{' '}
                                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSlot(slot.id)}
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
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>{getDuration(slot.start_time, slot.end_time)}</span>
                          <span>Max {slot.max_bookings}</span>
                        </div>
                        <div className="mt-2">
                          <Switch
                            checked={slot.is_available}
                            onCheckedChange={(checked) => handleToggleAvailability(slot.id, checked)}
                            size="sm"
                          />
                        </div>
                      </div>
                    ))}

                    {daySlots.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <div className="text-sm">No time slots</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Time Slots</CardTitle>
                <Select
                  value={selectedDay.toString()}
                  onValueChange={(value) => setSelectedDay(value === 'all' ? 'all' : parseInt(value))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTimeSlots.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No time slots found</h3>
                  <p className="text-gray-600 mb-6">
                    {selectedDay === 'all'
                      ? 'Create your first time slot to start accepting bookings.'
                      : `No time slots configured for ${daysOfWeek.find(d => d.value === selectedDay)?.label}.`
                    }
                  </p>
                  <Button onClick={handleCreateSlot}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Time Slot
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTimeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        slot.is_available
                          ? 'bg-white border-gray-200 hover:bg-gray-50'
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">
                          {daysOfWeek.find(d => d.value === slot.day_of_week)?.label}
                        </Badge>
                        <div>
                          <div className="font-medium">
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {getDuration(slot.start_time, slot.end_time)} • Max {slot.max_bookings} booking{slot.max_bookings !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={slot.is_available}
                          onCheckedChange={(checked) => handleToggleAvailability(slot.id, checked)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSlot(slot)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicateSlot(slot)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
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
                                  <AlertDialogTitle>Delete Time Slot</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this time slot? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSlot(slot.id)}
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
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Time Slot Form Modal */}
        <TimeSlotForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSave={handleSaveSlot}
          editingSlot={editingSlot}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
};

export default TimeSlots;