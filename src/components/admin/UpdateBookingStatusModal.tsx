/**
 * Update Booking Status Modal Component
 * Allows admins to change booking status with optional notes and notifications
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookingStatus } from '@/types/booking';
import BookingStatusBadge from './BookingStatusBadge';

interface UpdateBookingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: BookingStatus;
  customerName: string;
  onUpdate: (status: BookingStatus, note?: string, sendNotification?: boolean) => Promise<void>;
  loading?: boolean;
}

const statusOptions = [
  {
    value: BookingStatus.PENDING,
    label: 'Pending',
    description: 'Booking is waiting for confirmation',
    allowedFrom: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED]
  },
  {
    value: BookingStatus.CONFIRMED,
    label: 'Confirmed',
    description: 'Booking is confirmed and scheduled',
    allowedFrom: [BookingStatus.PENDING, BookingStatus.CANCELLED]
  },
  {
    value: BookingStatus.COMPLETED,
    label: 'Completed',
    description: 'Meeting has been completed',
    allowedFrom: [BookingStatus.CONFIRMED]
  },
  {
    value: BookingStatus.CANCELLED,
    label: 'Cancelled',
    description: 'Booking has been cancelled',
    allowedFrom: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
  },
  {
    value: BookingStatus.NO_SHOW,
    label: 'No Show',
    description: 'Customer did not attend the meeting',
    allowedFrom: [BookingStatus.CONFIRMED]
  }
];

const getEmailTemplate = (status: BookingStatus, customerName: string) => {
  const templates = {
    [BookingStatus.CONFIRMED]: {
      subject: 'Your Strategy Call is Confirmed!',
      preview: `Hi ${customerName}, great news! Your strategy call has been confirmed...`
    },
    [BookingStatus.CANCELLED]: {
      subject: 'Strategy Call Cancelled',
      preview: `Hi ${customerName}, we're writing to let you know that your strategy call has been cancelled...`
    },
    [BookingStatus.COMPLETED]: {
      subject: 'Thank You for Your Strategy Call',
      preview: `Hi ${customerName}, thank you for taking the time to speak with us today...`
    },
    [BookingStatus.PENDING]: {
      subject: 'Strategy Call Update',
      preview: `Hi ${customerName}, we wanted to update you on your strategy call booking...`
    },
    [BookingStatus.NO_SHOW]: {
      subject: 'We Missed You Today',
      preview: `Hi ${customerName}, we noticed you weren't able to make it to your strategy call today...`
    }
  };

  return templates[status];
};

const UpdateBookingStatusModal: React.FC<UpdateBookingStatusModalProps> = ({
  isOpen,
  onClose,
  currentStatus,
  customerName,
  onUpdate,
  loading = false
}) => {
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus>(currentStatus);
  const [note, setNote] = useState('');
  const [sendNotification, setSendNotification] = useState(true);

  // Get allowed status transitions
  const allowedStatuses = statusOptions.filter(option =>
    option.value === currentStatus || option.allowedFrom.includes(currentStatus)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStatus === currentStatus && !note.trim()) {
      onClose();
      return;
    }

    try {
      await onUpdate(selectedStatus, note.trim() || undefined, sendNotification);
      onClose();

      // Reset form
      setNote('');
      setSendNotification(true);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  const emailTemplate = getEmailTemplate(selectedStatus, customerName);
  const hasStatusChanged = selectedStatus !== currentStatus;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Update Booking Status</DialogTitle>
          <DialogDescription>
            Change the status for {customerName}'s booking and optionally send a notification email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Status</Label>
            <div>
              <BookingStatusBadge status={currentStatus} />
            </div>
          </div>

          {/* New Status */}
          <div className="space-y-3">
            <Label htmlFor="status" className="text-sm font-medium">
              New Status
            </Label>
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as BookingStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allowedStatuses.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasStatusChanged && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm">
                  <span className="text-blue-900">Status will change from </span>
                  <BookingStatusBadge status={currentStatus} className="mx-1" />
                  <span className="text-blue-900"> to </span>
                  <BookingStatusBadge status={selectedStatus} className="mx-1" />
                </div>
              </div>
            )}
          </div>

          {/* Note */}
          <div className="space-y-3">
            <Label htmlFor="note" className="text-sm font-medium">
              Internal Note <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this status change (for internal use only)..."
              className="min-h-[80px]"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {note.length}/500 characters
            </div>
          </div>

          {/* Email Notification */}
          {hasStatusChanged && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="sendNotification"
                  checked={sendNotification}
                  onCheckedChange={(checked) => setSendNotification(checked as boolean)}
                />
                <Label htmlFor="sendNotification" className="text-sm font-medium">
                  Send notification email to customer
                </Label>
              </div>

              {sendNotification && emailTemplate && (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-1">
                      📧 Email Preview:
                    </div>
                    <div className="text-gray-700">
                      <strong>Subject:</strong> {emailTemplate.subject}
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      {emailTemplate.preview}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
              {loading ? 'Updating...' : hasStatusChanged ? 'Update Status' : 'Save Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateBookingStatusModal;