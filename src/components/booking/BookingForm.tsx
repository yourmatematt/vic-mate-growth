/**
 * Multi-Step Booking Form
 * Main component that orchestrates the booking flow
 */

import React, { useState, useEffect } from 'react';
import { useBookingForm, useAvailableSlots, useBlackoutDates, useFormAutoSave } from '@/hooks/usePublicBooking';
import { getNext14Days } from '@/lib/booking-date-utils';
import { BUSINESS_TYPES_CONFIG, REVENUE_RANGES_CONFIG, BOOKING_MESSAGES } from '@/constants/booking';

import BookingProgress from './BookingProgress';
import FormField from './FormField';
import MultiSelect from './MultiSelect';
import BookingCalendar from './BookingCalendar';
import TimeSlotPicker from './TimeSlotPicker';
import BookingSuccessModal from './BookingSuccessModal';

const TOTAL_STEPS = 3;

const BookingForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Get available dates range (next 60 days)
  const dateRange = getNext14Days(60);
  const startDate = dateRange[0];
  const endDate = dateRange[dateRange.length - 1];

  // Hooks for data fetching
  const { slots: availableSlots, loading: slotsLoading, refetch: refetchSlots } = useAvailableSlots(
    startDate,
    endDate
  );

  const { blackoutDates } = useBlackoutDates(startDate, endDate);

  // Form management
  const {
    formData,
    errors,
    isValid,
    isSubmitting,
    updateField,
    validateForm,
    resetForm,
    submitForm
  } = useBookingForm(
    {},
    [], // Available time slots for validation - we'll handle this differently
    blackoutDates
  );

  // Auto-save functionality
  const { clearSavedData } = useFormAutoSave(formData);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('booking-form-draft');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        Object.entries(parsed).forEach(([key, value]) => {
          if (value) {
            updateField(key as any, value);
          }
        });
      } catch (err) {
        console.warn('Failed to load saved form data:', err);
      }
    }
  }, [updateField]);

  // Get available dates for calendar
  const availableDates = availableSlots.map(slot => slot.slot_date);

  const handleStepChange = (newStep: number) => {
    if (newStep < 1 || newStep > TOTAL_STEPS) return;

    // Validate current step before allowing navigation forward
    if (newStep > currentStep) {
      if (currentStep === 1) {
        // Validate business details
        const step1Errors = {
          business_name: !formData.business_name ? 'Business name is required' : undefined,
          business_type: !formData.business_type ? 'Please select a business type' : undefined,
          business_location: !formData.business_location ? 'Business location is required' : undefined,
          monthly_revenue_range: !formData.monthly_revenue_range ? 'Please select a revenue range' : undefined,
          biggest_challenge: !formData.biggest_challenge || formData.biggest_challenge.length < 10
            ? 'Please describe your biggest challenge (at least 10 characters)' : undefined,
        };

        const hasStep1Errors = Object.values(step1Errors).some(error => !!error);
        if (hasStep1Errors) {
          // Show errors and don't advance
          Object.entries(step1Errors).forEach(([field, error]) => {
            if (error) updateField(field as any, formData[field as keyof typeof formData]);
          });
          return;
        }
      } else if (currentStep === 2) {
        // Validate time selection
        if (!formData.preferred_date || !formData.preferred_time_slot) {
          alert(BOOKING_MESSAGES.VALIDATION.INVALID_DATE_FORMAT);
          return;
        }
      }
    }

    setCurrentStep(newStep);
  };

  const handleSubmit = async () => {
    const success = await submitForm();
    if (success) {
      setShowSuccessModal(true);
      clearSavedData();
    }
  };

  const handleBookAnother = () => {
    setShowSuccessModal(false);
    setCurrentStep(1);
    resetForm();
    refetchSlots();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Tell Us About Your Business
              </h2>
              <p className="text-gray-600">
                This helps us prepare a tailored strategy for your call
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="Business Name"
                name="business_name"
                placeholder="e.g., Geelong Coffee Co."
                value={formData.business_name}
                onChange={(e) => updateField('business_name', e.target.value)}
                error={errors.business_name}
                required
              />

              <FormField
                label="Business Type"
                name="business_type"
                type="select"
                value={formData.business_type}
                onChange={(e) => updateField('business_type', e.target.value)}
                error={errors.business_type}
                required
              >
                <option value="">Select your business type</option>
                {BUSINESS_TYPES_CONFIG.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </FormField>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="Business Location"
                name="business_location"
                placeholder="e.g., Geelong, Ballarat, Bendigo"
                value={formData.business_location}
                onChange={(e) => updateField('business_location', e.target.value)}
                error={errors.business_location}
                required
                tooltip="This helps us understand your local market"
              />

              <FormField
                label="Monthly Revenue Range"
                name="monthly_revenue_range"
                type="select"
                value={formData.monthly_revenue_range}
                onChange={(e) => updateField('monthly_revenue_range', e.target.value)}
                error={errors.monthly_revenue_range}
                required
              >
                <option value="">Select revenue range</option>
                {REVENUE_RANGES_CONFIG.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label} - {range.description}
                  </option>
                ))}
              </FormField>
            </div>

            <MultiSelect
              label="Current Marketing Activities"
              name="current_marketing"
              value={formData.current_marketing}
              onChange={(value) => updateField('current_marketing', value)}
              error={errors.current_marketing}
            />

            <FormField
              label="What's Your Biggest Marketing Challenge?"
              name="biggest_challenge"
              type="textarea"
              placeholder="Tell us about your main marketing pain point. For example: 'Not getting enough customers through the door' or 'Struggling to compete with larger businesses online'..."
              value={formData.biggest_challenge}
              onChange={(e) => updateField('biggest_challenge', e.target.value)}
              error={errors.biggest_challenge}
              required
              maxLength={500}
              showCharacterCount
              rows={4}
              tooltip="The more specific you are, the better we can help you"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Preferred Time
              </h2>
              <p className="text-gray-600">
                Select a date and time that works best for you
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <BookingCalendar
                selectedDate={formData.preferred_date}
                onDateSelect={(date) => {
                  updateField('preferred_date', date);
                  updateField('preferred_time_slot', ''); // Clear time slot when date changes
                }}
                blackoutDates={blackoutDates}
                availableDates={availableDates}
                minDate={new Date()}
                maxDate={new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)} // 60 days from now
              />

              <TimeSlotPicker
                selectedDate={formData.preferred_date}
                availableSlots={availableSlots.filter(slot => slot.slot_date === formData.preferred_date)}
                selectedTimeSlot={formData.preferred_time_slot}
                onTimeSlotSelect={(timeSlot) => updateField('preferred_time_slot', timeSlot)}
                loading={slotsLoading}
              />
            </div>

            {errors.preferred_date && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800">{errors.preferred_date}</p>
                </div>
              </div>
            )}

            {errors.preferred_time_slot && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800">{errors.preferred_time_slot}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Contact Details
              </h2>
              <p className="text-gray-600">
                We'll use these details to confirm your booking and send you the meeting link
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                label="Your Name"
                name="customer_name"
                placeholder="Your full name"
                value={formData.customer_name}
                onChange={(e) => updateField('customer_name', e.target.value)}
                error={errors.customer_name}
                required
              />

              <FormField
                label="Email Address"
                name="customer_email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.customer_email}
                onChange={(e) => updateField('customer_email', e.target.value)}
                error={errors.customer_email}
                required
                tooltip="We'll send your confirmation and meeting link here"
              />
            </div>

            <FormField
              label="Phone Number"
              name="customer_phone"
              type="tel"
              placeholder="0412 345 678"
              value={formData.customer_phone}
              onChange={(e) => updateField('customer_phone', e.target.value)}
              error={errors.customer_phone}
              required
              tooltip="Australian mobile or landline number"
            />

            <FormField
              label="Additional Notes (Optional)"
              name="additional_notes"
              type="textarea"
              placeholder="Is there anything specific you'd like us to focus on during the call? Any particular goals or challenges you want to discuss?"
              value={formData.additional_notes || ''}
              onChange={(e) => updateField('additional_notes', e.target.value)}
              error={errors.additional_notes}
              maxLength={1000}
              showCharacterCount
              rows={4}
            />

            {/* Booking Summary */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Booking Summary
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Business:</span>
                  <p className="text-blue-900">{formData.business_name}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Type:</span>
                  <p className="text-blue-900">{formData.business_type}</p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Date:</span>
                  <p className="text-blue-900">
                    {formData.preferred_date ?
                      new Date(formData.preferred_date).toLocaleDateString('en-AU', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : 'Not selected'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Time:</span>
                  <p className="text-blue-900">
                    {formData.preferred_time_slot ?
                      (() => {
                        const [start, end] = formData.preferred_time_slot.split('-');
                        const startTime = new Date(`1970-01-01T${start}`).toLocaleTimeString('en-AU', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });
                        const endTime = new Date(`1970-01-01T${end}`).toLocaleTimeString('en-AU', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        });
                        return `${startTime} - ${endTime} (Melbourne time)`;
                      })() : 'Not selected'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <BookingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Step Content */}
        <div className="min-h-[600px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => handleStepChange(currentStep - 1)}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                disabled={isSubmitting}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Step indicator dots */}
            <div className="hidden sm:flex space-x-2">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
                <button
                  key={step}
                  onClick={() => handleStepChange(step)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    step === currentStep
                      ? 'bg-blue-600'
                      : step < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                  aria-label={`Go to step ${step}`}
                />
              ))}
            </div>

            {/* Next/Submit button */}
            {currentStep < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => handleStepChange(currentStep + 1)}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                disabled={isSubmitting}
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !isValid}
                className="inline-flex items-center px-8 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Booking Your Call...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Book My Free Call
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help? Call us on{' '}
            <a href="tel:+61478101521" className="text-blue-600 hover:text-blue-800 font-medium">
              +61 478 101 521
            </a>{' '}
            or email{' '}
            <a href="mailto:matt@yourmateagency.com.au" className="text-blue-600 hover:text-blue-800 font-medium">
              matt@yourmateagency.com.au
            </a>
          </p>
        </div>
      </div>

      {/* Success Modal */}
      <BookingSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        booking={null} // This would come from the submission result
        onBookAnother={handleBookAnother}
      />
    </>
  );
};

export default BookingForm;