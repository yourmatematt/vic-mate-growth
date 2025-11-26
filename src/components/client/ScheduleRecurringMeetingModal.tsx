import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  RecurringMeetingFormData,
  RECURRENCE_OPTIONS,
  DAY_OF_MONTH_OPTIONS,
  DAY_OF_WEEK_OPTIONS,
  TIME_SLOT_OPTIONS,
  SUBSCRIPTION_PERMISSIONS,
  getAllowedFrequencies,
  formatMeetingSchedule
} from '@/types/recurring-meetings';
import { recurringMeetingsService } from '@/services/recurringMeetingsService';

interface ScheduleRecurringMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscriptionTier: 'starter' | 'growth' | 'pro';
}

const ScheduleRecurringMeetingModal: React.FC<ScheduleRecurringMeetingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subscriptionTier
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RecurringMeetingFormData>({
    recurrence_frequency: 'monthly',
    preferred_time: '14:00',
    start_date: new Date().toISOString().split('T')[0]
  });

  const allowedFrequencies = getAllowedFrequencies(subscriptionTier);
  const permissions = SUBSCRIPTION_PERMISSIONS[subscriptionTier];

  const resetForm = () => {
    setStep(1);
    setError(null);
    setFormData({
      recurrence_frequency: 'monthly',
      preferred_time: '14:00',
      start_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!formData.recurrence_frequency;
      case 2:
        if (formData.recurrence_frequency === 'monthly') {
          return !!(formData.day_of_month || (formData.day_of_week && formData.week_of_month));
        }
        return !!formData.day_of_week;
      case 3:
        return !!formData.preferred_time;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await recurringMeetingsService.createRecurringMeeting(
        user.id,
        subscriptionTier,
        formData
      );

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to create recurring meeting:', error);
      setError(error instanceof Error ? error.message : 'Failed to schedule meetings');
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewText = (): string => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return 'Complete the form to see your schedule preview';
    }

    // Create a mock meeting object for formatting
    const mockMeeting = {
      recurrence_frequency: formData.recurrence_frequency,
      day_of_week: formData.day_of_week || null,
      day_of_month: formData.day_of_month || null,
      week_of_month: formData.week_of_month || null,
      preferred_time: formData.preferred_time
    } as any;

    return `Your meetings will be ${formatMeetingSchedule(mockMeeting)}`;
  };

  const generateNextMeetingDates = (): string[] => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return [];
    }

    // Generate next 3 meeting dates for preview
    const dates: string[] = [];
    const startDate = new Date(formData.start_date);

    if (formData.recurrence_frequency === 'monthly' && formData.day_of_month) {
      for (let i = 0; i < 3; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        date.setDate(formData.day_of_month);

        // Handle edge case where day doesn't exist (e.g., Feb 31st)
        if (date.getDate() !== formData.day_of_month) {
          // Go to last day of month
          date.setDate(0);
        }

        dates.push(date.toLocaleDateString('en-AU', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
      }
    } else if (formData.recurrence_frequency === 'bi-weekly' && formData.day_of_week) {
      let currentDate = new Date(startDate);

      // Find first occurrence of target weekday
      while (currentDate.getDay() !== (formData.day_of_week % 7)) {
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (let i = 0; i < 3; i++) {
        dates.push(currentDate.toLocaleDateString('en-AU', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
        currentDate.setDate(currentDate.getDate() + 14);
      }
    }

    return dates;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Schedule Your Report Brief Meetings
          </DialogTitle>
          <DialogDescription>
            Set up recurring meetings with Matt for regular business check-ins
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center ${
                  stepNumber < 4 ? 'space-x-2' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > stepNumber ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 4 && (
                  <ArrowRight
                    className={`h-4 w-4 ${
                      step > stepNumber ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {step === 1 && 'Choose Frequency'}
                {step === 2 && 'Pick Your Day'}
                {step === 3 && 'Select Time'}
                {step === 4 && 'Confirm Schedule'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Frequency */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {RECURRENCE_OPTIONS.filter(option =>
                      allowedFrequencies.includes(option.value)
                    ).map((option) => (
                      <Card
                        key={option.value}
                        className={`cursor-pointer transition-all ${
                          formData.recurrence_frequency === option.value
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setFormData({
                          ...formData,
                          recurrence_frequency: option.value,
                          // Reset dependent fields
                          day_of_week: undefined,
                          day_of_month: undefined,
                          week_of_month: undefined
                        })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{option.label}</h4>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                              <Badge variant="outline" className="mt-2">
                                {option.maxFrequency} meeting{option.maxFrequency > 1 ? 's' : ''} per month
                              </Badge>
                            </div>
                            {formData.recurrence_frequency === option.value && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {permissions.description}
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 2: Day Selection */}
              {step === 2 && (
                <div className="space-y-4">
                  {formData.recurrence_frequency === 'monthly' && (
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        Which day of the month works best for you?
                      </Label>

                      <Select
                        value={formData.day_of_month?.toString()}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          day_of_month: parseInt(value),
                          day_of_week: undefined,
                          week_of_month: undefined
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day of month" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAY_OF_MONTH_OPTIONS.slice(0, 28).map((option) => (
                            <SelectItem key={option.value} value={option.value.toString()}>
                              {option.label} of each month
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="text-sm text-muted-foreground">
                        <strong>Popular choices:</strong> 1st (start of month), 15th (mid-month), or 30th (end of month)
                      </div>
                    </div>
                  )}

                  {(formData.recurrence_frequency === 'bi-weekly' || formData.recurrence_frequency === 'weekly') && (
                    <div className="space-y-4">
                      <Label className="text-base font-medium">
                        Which day of the week works best for you?
                      </Label>

                      <div className="grid grid-cols-3 gap-3">
                        {DAY_OF_WEEK_OPTIONS.map((option) => (
                          <Card
                            key={option.value}
                            className={`cursor-pointer transition-all ${
                              formData.day_of_week === option.value
                                ? 'ring-2 ring-primary bg-primary/5'
                                : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setFormData({
                              ...formData,
                              day_of_week: option.value
                            })}
                          >
                            <CardContent className="p-4 text-center">
                              <div className="font-medium">{option.label}</div>
                              {formData.day_of_week === option.value && (
                                <CheckCircle className="h-4 w-4 text-primary mx-auto mt-2" />
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Time Selection */}
              {step === 3 && (
                <div className="space-y-4">
                  <Label className="text-base font-medium">
                    What time works best for you?
                  </Label>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TIME_SLOT_OPTIONS.filter(slot =>
                      // Business hours: 9 AM - 4:30 PM
                      slot.value >= '09:00' && slot.value <= '16:30'
                    ).map((slot) => (
                      <Card
                        key={slot.value}
                        className={`cursor-pointer transition-all ${
                          formData.preferred_time === slot.value
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setFormData({
                          ...formData,
                          preferred_time: slot.value
                        })}
                      >
                        <CardContent className="p-3 text-center">
                          <div className="font-medium">{slot.label}</div>
                          <div className="text-xs text-muted-foreground">{slot.period}</div>
                          {formData.preferred_time === slot.value && (
                            <CheckCircle className="h-4 w-4 text-primary mx-auto mt-1" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      All times are in Australian Eastern Time (AEST/AEDT). Matt's available Monday-Friday, 9 AM - 4:30 PM.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="bg-primary/5 rounded-lg p-6">
                    <h4 className="font-semibold mb-4">Your Meeting Schedule</h4>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium">{generatePreviewText()}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        30-minute report brief sessions with Matt
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-3">Next 3 meetings will be:</h5>
                    <div className="space-y-2">
                      {generateNextMeetingDates().map((date, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                        >
                          <span className="text-sm">{date}</span>
                          <span className="text-sm font-medium">
                            {TIME_SLOT_OPTIONS.find(t => t.value === formData.preferred_time)?.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Calendar invites with Google Meet links will be sent automatically. You can reschedule individual meetings if needed.
                    </AlertDescription>
                  </Alert>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {step > 1 && (
                <Button
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>

              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!validateStep(step)}
                  className="mate-button-primary"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mate-button-primary"
                >
                  {loading ? 'Scheduling...' : 'Confirm Schedule'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleRecurringMeetingModal;