/**
 * Reusable Form Field Component
 * Provides consistent styling and functionality for form inputs
 */

import React, { forwardRef } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  showCharacterCount?: boolean;
  tooltip?: string;
  children?: React.ReactNode; // For select options
  rows?: number; // For textarea
  className?: string;
  inputClassName?: string;
}

const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  FormFieldProps
>(({
  label,
  name,
  type = 'text',
  placeholder,
  value = '',
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  maxLength,
  showCharacterCount = false,
  tooltip,
  children,
  rows = 4,
  className = '',
  inputClassName = ''
}, ref) => {
  const hasError = Boolean(error);
  const characterCount = value.length;
  const isTextarea = type === 'textarea';
  const isSelect = type === 'select';

  const baseInputClasses = `
    w-full px-4 py-3 border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${hasError
      ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 text-gray-900'
    }
    ${inputClassName}
  `;

  const renderInput = () => {
    if (isTextarea) {
      return (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          rows={rows}
          className={`${baseInputClasses} resize-none`}
          aria-describedby={hasError ? `${name}-error` : undefined}
        />
      );
    }

    if (isSelect) {
      return (
        <select
          ref={ref as React.Ref<HTMLSelectElement>}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          className={baseInputClasses}
          aria-describedby={hasError ? `${name}-error` : undefined}
        >
          {children}
        </select>
      );
    }

    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
        className={baseInputClasses}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>

        {tooltip && (
          <div className="group relative">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="More information"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <div className="absolute bottom-full mb-2 right-0 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
              {tooltip}
              <div className="absolute top-full right-4 w-2 h-2 bg-gray-900 rotate-45 transform -mt-1"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        {renderInput()}

        {/* Character count */}
        {showCharacterCount && maxLength && (
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {characterCount}/{maxLength}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p
          id={`${name}-error`}
          className="text-sm text-red-600 flex items-center space-x-1"
          role="alert"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </p>
      )}

      {/* Character count for textareas (bottom position) */}
      {isTextarea && showCharacterCount && maxLength && !error && (
        <div className="text-xs text-gray-500 text-right">
          {characterCount}/{maxLength} characters
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;