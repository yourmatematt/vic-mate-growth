/**
 * Time Slot Form Component
 * Form for creating and editing time slots in the admin panel
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Users } from 'lucide-react';
import { BookingTimeSlot } from '@/types/booking';

interface TimeSlotFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (timeSlot: Omit<BookingTimeSlot, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editingSlot?: BookingTimeSlot | null;
  loading?: boolean;
}

const daysOfWeek = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const time24 = `${hour.toString().padStart(2, '0')}:${minute}`;
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? 'AM' : 'PM';
  const time12 = `${hour12}:${minute} ${ampm}`;
  return { value: time24, label: time12 };
});

const TimeSlotForm: React.FC<TimeSlotFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSlot,
  loading = false
}) => {
  const [formData, setFormData] = useState(() => ({
    day_of_week: editingSlot?.day_of_week ?? 1,
    start_time: editingSlot?.start_time ?? '09:00',
    end_time: editingSlot?.end_time ?? '10:00',
    max_bookings: editingSlot?.max_bookings ?? 1,
    is_available: editingSlot?.is_available ?? true
  }));

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate start time is before end time
    if (formData.start_time >= formData.end_time) {
      newErrors.end_time = 'End time must be after start time';
    }

    // Validate max bookings
    if (formData.max_bookings < 1 || formData.max_bookings > 10) {
      newErrors.max_bookings = 'Max bookings must be between 1 and 10';
    }

    // Validate time slot duration (minimum 30 minutes)
    const startMinutes = parseInt(formData.start_time.split(':')[0]) * 60 +
                        parseInt(formData.start_time.split(':')[1]);
    const endMinutes = parseInt(formData.end_time.split(':')[0]) * 60 +
                      parseInt(formData.end_time.split(':')[1]);
    const duration = endMinutes - startMinutes;

    if (duration < 30) {
      newErrors.end_time = 'Time slot must be at least 30 minutes long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();

      // Reset form
      setFormData({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
        max_bookings: 1,
        is_available: true
      });
      setErrors({});
    } catch (error) {
      console.error('Error saving time slot:', error);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getDuration = () => {
    const startMinutes = parseInt(formData.start_time.split(':')[0]) * 60 +
                        parseInt(formData.start_time.split(':')[1]);
    const endMinutes = parseInt(formData.end_time.split(':')[0]) * 60 +
                      parseInt(formData.end_time.split(':')[1]);
    const duration = endMinutes - startMinutes;

    if (duration <= 0) return '0 minutes';

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
  };

  const selectedDay = daysOfWeek.find(day => day.value === formData.day_of_week);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingSlot ? 'Edit Time Slot' : 'Create New Time Slot'}
          </DialogTitle>
          <DialogDescription>
            {editingSlot
              ? 'Update the time slot details below.'
              : 'Create a new available time slot for strategy call bookings.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Day of Week */}
          <div className="space-y-2">
            <Label htmlFor="day_of_week">
              <Calendar className="inline h-4 w-4 mr-1" />
              Day of Week
            </Label>
            <Select
              value={formData.day_of_week.toString()}
              onValueChange={(value) => handleFieldChange('day_of_week', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">
                <Clock className="inline h-4 w-4 mr-1" />
                Start Time
              </Label>
              <Select
                value={formData.start_time}
                onValueChange={(value) => handleFieldChange('start_time', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Select
                value={formData.end_time}
                onValueChange={(value) => handleFieldChange('end_time', value)}
              >
                <SelectTrigger className={errors.end_time ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.end_time && (
                <p className="text-sm text-red-600">{errors.end_time}</p>
              )}
            </div>
          </div>

          {/* Duration Display */}
          {formData.start_time && formData.end_time && (
            <div className="flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Duration: {getDuration()}
              </span>
            </div>
          )}

          {/* Max Bookings */}
          <div className="space-y-2">
            <Label htmlFor="max_bookings">
              <Users className="inline h-4 w-4 mr-1" />
              Maximum Bookings per Slot
            </Label>
            <Input
              id="max_bookings"
              type="number"
              min="1"
              max="10"
              value={formData.max_bookings}
              onChange={(e) => handleFieldChange('max_bookings', parseInt(e.target.value) || 1)}
              className={errors.max_bookings ? 'border-red-500' : ''}
            />
            {errors.max_bookings && (
              <p className="text-sm text-red-600">{errors.max_bookings}</p>
            )}
            <p className="text-xs text-gray-600">
              How many bookings can be scheduled at this time (typically 1 for strategy calls)
            </p>
          </div>

          {/* Is Available Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="is_available" className="font-medium">
                Available for Booking
              </Label>
              <p className="text-sm text-gray-600">
                Enable this time slot for customer bookings
              </p>
            </div>
            <Switch
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => handleFieldChange('is_available', checked)}
            />
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">
                {selectedDay?.label}
              </Badge>
              <Badge variant="outline">
                {timeOptions.find(t => t.value === formData.start_time)?.label} - {' '}
                {timeOptions.find(t => t.value === formData.end_time)?.label}
              </Badge>
              <Badge variant="outline">
                Max {formData.max_bookings} booking{formData.max_bookings !== 1 ? 's' : ''}
              </Badge>
              <Badge variant={formData.is_available ? 'default' : 'secondary'}>
                {formData.is_available ? 'Available' : 'Unavailable'}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSlotForm;