/**
 * Booking Progress Indicator
 * Shows current step in the booking process
 */

import React from 'react';

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
}

interface StepInfo {
  number: number;
  label: string;
  description: string;
}

const STEPS: StepInfo[] = [
  {
    number: 1,
    label: 'Business Details',
    description: 'Tell us about your business'
  },
  {
    number: 2,
    label: 'Choose Time',
    description: 'Pick your preferred date & time'
  },
  {
    number: 3,
    label: 'Contact Info',
    description: 'Your details for confirmation'
  }
];

const BookingProgress: React.FC<BookingProgressProps> = ({
  currentStep,
  totalSteps = 3
}) => {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-600 text-white border-green-600',
          label: 'text-green-600 font-medium',
          description: 'text-green-500',
          connector: 'bg-green-600'
        };
      case 'current':
        return {
          circle: 'bg-blue-600 text-white border-blue-600 ring-4 ring-blue-100',
          label: 'text-blue-600 font-medium',
          description: 'text-blue-500',
          connector: 'bg-gray-300'
        };
      case 'upcoming':
        return {
          circle: 'bg-white text-gray-400 border-gray-300',
          label: 'text-gray-400',
          description: 'text-gray-400',
          connector: 'bg-gray-300'
        };
      default:
        return {
          circle: 'bg-gray-300',
          label: 'text-gray-400',
          description: 'text-gray-400',
          connector: 'bg-gray-300'
        };
    }
  };

  return (
    <div className="w-full mb-8">
      {/* Mobile Progress Bar */}
      <div className="block md:hidden mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        <div className="mt-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {STEPS[currentStep - 1]?.label}
          </h3>
          <p className="text-sm text-gray-600">
            {STEPS[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Desktop Step Indicator */}
      <div className="hidden md:block">
        <nav aria-label="Booking progress">
          <ol className="flex items-center justify-center">
            {STEPS.map((step, index) => {
              const status = getStepStatus(step.number);
              const classes = getStepClasses(status);
              const isLast = index === STEPS.length - 1;

              return (
                <li key={step.number} className="relative flex-1 max-w-xs">
                  <div className="flex flex-col items-center">
                    {/* Step Circle */}
                    <div className="relative z-10 flex items-center justify-center">
                      <div className={`
                        w-10 h-10 rounded-full border-2 flex items-center justify-center
                        transition-all duration-200 text-sm font-semibold
                        ${classes.circle}
                      `}>
                        {status === 'completed' ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          step.number
                        )}
                      </div>
                    </div>

                    {/* Step Label & Description */}
                    <div className="mt-3 text-center">
                      <div className={`text-sm font-medium ${classes.label}`}>
                        {step.label}
                      </div>
                      <div className={`text-xs mt-1 ${classes.description}`}>
                        {step.description}
                      </div>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {!isLast && (
                    <div
                      className={`
                        absolute top-5 left-1/2 transform -translate-y-1/2 translate-x-5
                        h-0.5 w-full transition-colors duration-200
                        ${classes.connector}
                      `}
                      style={{
                        width: 'calc(100% - 2.5rem)',
                        marginLeft: '1.25rem'
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Progress Summary */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Take your time - we auto-save your progress as you go!
        </p>
      </div>
    </div>
  );
};

export default BookingProgress;