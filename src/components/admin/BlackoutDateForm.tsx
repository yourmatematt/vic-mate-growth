/**
 * Blackout Date Form Component
 * Form for creating and editing blackout dates in the admin panel
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  CalendarIcon,
  CalendarX,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { BookingBlackoutDate } from '@/types/booking';

interface BlackoutDateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blackoutDate: Omit<BookingBlackoutDate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editingDate?: BookingBlackoutDate | null;
  loading?: boolean;
}

// Common Victorian holidays
const commonHolidays = [
  { name: 'New Year\'s Day', date: '01-01' },
  { name: 'Australia Day', date: '01-26' },
  { name: 'Labour Day (VIC)', date: '03-11' }, // Second Monday in March (approximate)
  { name: 'Good Friday', date: 'easter-2' }, // Easter-based
  { name: 'Easter Saturday', date: 'easter-1' },
  { name: 'Easter Monday', date: 'easter+1' },
  { name: 'Anzac Day', date: '04-25' },
  { name: 'Queen\'s Birthday (VIC)', date: '06-10' }, // Second Monday in June (approximate)
  { name: 'Melbourne Cup Day (VIC)', date: '11-05' }, // First Tuesday in November (approximate)
  { name: 'Christmas Day', date: '12-25' },
  { name: 'Boxing Day', date: '12-26' },
];

const BlackoutDateForm: React.FC<BlackoutDateFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDate,
  loading = false
}) => {
  const [formData, setFormData] = useState(() => ({
    start_date: editingDate?.start_date ? new Date(editingDate.start_date) : new Date(),
    end_date: editingDate?.end_date ? new Date(editingDate.end_date) : new Date(),
    reason: editingDate?.reason || '',
    is_recurring: editingDate?.is_recurring || false,
    recurrence_pattern: editingDate?.recurrence_pattern || null
  }));

  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isDateRange, setIsDateRange] = useState(() =>
    editingDate ? editingDate.start_date !== editingDate.end_date : false
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate reason is provided
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    // Validate date range
    if (isDateRange && isAfter(formData.start_date, formData.end_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    // Validate dates are not in the past (unless editing)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!editingDate && isBefore(formData.start_date, today)) {
      newErrors.start_date = 'Start date cannot be in the past';
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
      await onSave({
        start_date: format(formData.start_date, 'yyyy-MM-dd'),
        end_date: format(isDateRange ? formData.end_date : formData.start_date, 'yyyy-MM-dd'),
        reason: formData.reason.trim(),
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : null
      });

      onClose();

      // Reset form
      setFormData({
        start_date: new Date(),
        end_date: new Date(),
        reason: '',
        is_recurring: false,
        recurrence_pattern: null
      });
      setIsDateRange(false);
      setErrors({});
    } catch (error) {
      console.error('Error saving blackout date:', error);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when field is changed
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDateRangeSelect = (range: { from?: Date; to?: Date }) => {
    if (range.from) {
      setFormData(prev => ({ ...prev, start_date: range.from! }));
    }
    if (range.to) {
      setFormData(prev => ({ ...prev, end_date: range.to! }));
      setIsDateRange(true);
    }
    if (!range.to && range.from) {
      setFormData(prev => ({ ...prev, end_date: range.from! }));
      setIsDateRange(false);
    }
  };

  const handleQuickAdd = (holiday: typeof commonHolidays[0]) => {
    const currentYear = new Date().getFullYear();
    let date: Date;

    if (holiday.date.includes('easter')) {
      // Easter calculation would need a library or complex logic
      // For now, use a placeholder
      date = new Date(currentYear, 3, 15); // Approximate Easter
    } else {
      const [month, day] = holiday.date.split('-');
      date = new Date(currentYear, parseInt(month) - 1, parseInt(day));
    }

    setFormData(prev => ({
      ...prev,
      start_date: date,
      end_date: date,
      reason: `${holiday.name} - Office Closed`
    }));
    setIsDateRange(false);
  };

  const getDuration = () => {
    if (!isDateRange) return '1 day';

    const days = Math.ceil((formData.end_date.getTime() - formData.start_date.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingDate ? 'Edit Blackout Date' : 'Add Blackout Date'}
          </DialogTitle>
          <DialogDescription>
            {editingDate
              ? 'Update the blackout date details below.'
              : 'Block out dates when strategy calls are not available.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quick Add Holidays */}
          {!editingDate && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Quick Add Victorian Holidays</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {commonHolidays.slice(0, 6).map((holiday) => (
                  <Button
                    key={holiday.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAdd(holiday)}
                    className="text-xs h-auto py-2"
                  >
                    {holiday.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                <CalendarIcon className="inline h-4 w-4 mr-1" />
                Date Selection
              </Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="dateRange" className="text-sm text-gray-600">
                  Date Range
                </Label>
                <Switch
                  id="dateRange"
                  checked={isDateRange}
                  onCheckedChange={setIsDateRange}
                />
              </div>
            </div>

            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    errors.start_date || errors.end_date ? 'border-red-500' : ''
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {isDateRange ? (
                    <>
                      {format(formData.start_date, "MMM d, yyyy")} -{" "}
                      {format(formData.end_date, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(formData.start_date, "PPP")
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode={isDateRange ? "range" : "single"}
                  defaultMonth={formData.start_date}
                  selected={
                    isDateRange
                      ? { from: formData.start_date, to: formData.end_date }
                      : formData.start_date
                  }
                  onSelect={
                    isDateRange
                      ? handleDateRangeSelect
                      : (date) => date && handleFieldChange('start_date', date)
                  }
                  numberOfMonths={isDateRange ? 2 : 1}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return !editingDate && isBefore(date, today);
                  }}
                />
              </PopoverContent>
            </Popover>

            {(errors.start_date || errors.end_date) && (
              <p className="text-sm text-red-600">
                {errors.start_date || errors.end_date}
              </p>
            )}

            {/* Duration Display */}
            <div className="flex items-center justify-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Clock className="h-4 w-4 mr-2 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">
                Duration: {getDuration()}
              </span>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Reason <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => handleFieldChange('reason', e.target.value)}
              placeholder="e.g., Public Holiday - Office Closed, Staff Training Day, Christmas Break..."
              className={`min-h-[80px] ${errors.reason ? 'border-red-500' : ''}`}
              maxLength={200}
            />
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason}</p>
            )}
            <div className="text-xs text-gray-600 text-right">
              {formData.reason.length}/200 characters
            </div>
          </div>

          {/* Recurring Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="is_recurring" className="font-medium">
                  Recurring Blackout
                </Label>
                <p className="text-sm text-gray-600">
                  Repeat this blackout annually (e.g., for public holidays)
                </p>
              </div>
              <Switch
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={(checked) => handleFieldChange('is_recurring', checked)}
              />
            </div>

            {formData.is_recurring && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Recurrence Pattern</Label>
                <Input
                  value={formData.recurrence_pattern || 'FREQ=YEARLY;INTERVAL=1'}
                  onChange={(e) => handleFieldChange('recurrence_pattern', e.target.value)}
                  placeholder="FREQ=YEARLY;INTERVAL=1"
                  className="text-sm font-mono"
                />
                <p className="text-xs text-gray-600">
                  RFC 5545 recurrence rule (default: yearly repeat)
                </p>
              </div>
            )}
          </div>

          {/* Warning for existing bookings */}
          {editingDate && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-yellow-800">
                    Warning: Editing Existing Blackout
                  </p>
                  <p className="text-sm text-yellow-700">
                    Changes to this blackout date may affect existing bookings.
                    Please review any affected appointments manually.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CalendarX className="h-4 w-4 text-red-600" />
                <span className="text-sm">
                  {isDateRange
                    ? `${format(formData.start_date, 'MMM d')} - ${format(formData.end_date, 'MMM d, yyyy')}`
                    : format(formData.start_date, 'MMM d, yyyy')
                  }
                </span>
                <Badge variant="destructive" className="text-xs">
                  Blocked
                </Badge>
              </div>
              {formData.reason && (
                <p className="text-sm text-gray-600 pl-6">
                  {formData.reason}
                </p>
              )}
              {formData.is_recurring && (
                <p className="text-xs text-blue-600 pl-6">
                  🔄 Repeats annually
                </p>
              )}
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
              {loading ? 'Saving...' : editingDate ? 'Update Blackout' : 'Add Blackout'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BlackoutDateForm;