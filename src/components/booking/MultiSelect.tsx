/**
 * Multi-Select Checkbox Component
 * For selecting multiple marketing channels
 */

import React from 'react';
import { MARKETING_CHANNELS_CONFIG } from '@/constants/booking';

interface MultiSelectProps {
  label: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  name,
  value = [],
  onChange,
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  const hasError = Boolean(error);

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(v => v !== optionValue));
    }
  };

  const handleSelectAll = () => {
    if (value.length === MARKETING_CHANNELS_CONFIG.length) {
      onChange([]);
    } else {
      onChange(MARKETING_CHANNELS_CONFIG.map(option => option.value));
    }
  };

  const isAllSelected = value.length === MARKETING_CHANNELS_CONFIG.length;
  const isPartiallySelected = value.length > 0 && value.length < MARKETING_CHANNELS_CONFIG.length;

  // Separate popular and other channels
  const popularChannels = MARKETING_CHANNELS_CONFIG.filter(option => option.popular);
  const otherChannels = MARKETING_CHANNELS_CONFIG.filter(option => !option.popular);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label and Select All */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>

        <button
          type="button"
          onClick={handleSelectAll}
          disabled={disabled}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isAllSelected ? 'Clear All' : 'Select All'}
        </button>
      </div>

      {/* Popular Channels */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Popular Options
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {popularChannels.map((option) => {
            const isChecked = value.includes(option.value);

            return (
              <label
                key={option.value}
                className={`
                  flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:border-blue-300'}
                  ${isChecked
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-500'
                    : 'bg-white border-gray-300'
                  }
                  ${hasError ? 'border-red-300' : ''}
                `}
              >
                <div className="flex items-center space-x-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    name={`${name}[]`}
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />

                  {/* Icon */}
                  <span className="text-xl flex-shrink-0" aria-hidden="true">
                    {option.icon}
                  </span>

                  {/* Label */}
                  <span className="text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Other Channels */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Other Options
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {otherChannels.map((option) => {
            const isChecked = value.includes(option.value);

            return (
              <label
                key={option.value}
                className={`
                  flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-400'}
                  ${isChecked
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-500'
                    : 'bg-white border-gray-300'
                  }
                  ${hasError ? 'border-red-300' : ''}
                `}
              >
                <div className="flex items-center space-x-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    name={`${name}[]`}
                    value={option.value}
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />

                  {/* Icon */}
                  <span className="text-xl flex-shrink-0" aria-hidden="true">
                    {option.icon}
                  </span>

                  {/* Label */}
                  <span className="text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Selection Summary */}
      {value.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-blue-800">
              {value.length} {value.length === 1 ? 'channel' : 'channels'} selected
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {value.map((selectedValue) => {
              const option = MARKETING_CHANNELS_CONFIG.find(opt => opt.value === selectedValue);
              return option ? (
                <span
                  key={selectedValue}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {value.length === 0 && (
        <p className="text-sm text-gray-500">
          Select the marketing activities you're currently doing (if any). This helps us understand your current situation better.
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1" role="alert">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default MultiSelect;