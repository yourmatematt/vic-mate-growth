/**
 * Booking Form Skeleton Loader
 * Shows loading state while form data is being fetched
 */

import React from 'react';

const BookingFormSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 animate-pulse">
      {/* Progress indicator skeleton */}
      <div className="mb-8">
        <div className="flex justify-center space-x-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full mb-3"></div>
              <div className="w-20 h-3 bg-gray-200 rounded"></div>
              <div className="w-16 h-2 bg-gray-200 rounded mt-2"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Title skeleton */}
      <div className="text-center mb-8">
        <div className="w-64 h-8 bg-gray-200 rounded mx-auto mb-3"></div>
        <div className="w-80 h-5 bg-gray-200 rounded mx-auto"></div>
      </div>

      {/* Form fields skeleton */}
      <div className="space-y-6">
        {/* Two column fields */}
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((field) => (
            <div key={field} className="space-y-2">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Single column field */}
        <div className="space-y-2">
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
          <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Multi-select skeleton */}
        <div className="space-y-3">
          <div className="w-48 h-4 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center p-3 border border-gray-200 rounded-lg">
                <div className="w-4 h-4 bg-gray-200 rounded mr-3"></div>
                <div className="w-2 h-2 bg-gray-200 rounded-full mr-3"></div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Textarea skeleton */}
        <div className="space-y-2">
          <div className="w-40 h-4 bg-gray-200 rounded"></div>
          <div className="w-full h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Navigation skeleton */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
        <div className="w-16 h-10 bg-gray-200 rounded-lg"></div>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {[1, 2, 3].map((dot) => (
              <div key={dot} className="w-3 h-3 bg-gray-200 rounded-full"></div>
            ))}
          </div>
          <div className="w-20 h-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      {/* Help text skeleton */}
      <div className="mt-6 text-center">
        <div className="w-64 h-4 bg-gray-200 rounded mx-auto"></div>
      </div>
    </div>
  );
};

export default BookingFormSkeleton;