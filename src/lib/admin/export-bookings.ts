/**
 * Booking Export Utility
 * Exports booking data to various formats (CSV, Excel, etc.)
 */

import { Booking, BookingStatus } from '@/types/booking';
import { format } from 'date-fns';

interface ExportOptions {
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  status?: BookingStatus | 'all';
  format?: 'csv' | 'excel';
  includeFields?: string[];
}

/**
 * Format phone number for export
 */
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('61')) {
    const number = cleaned.slice(2);
    if (number.startsWith('4')) {
      return `0${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
    } else {
      return `(0${number.slice(0, 1)}) ${number.slice(1, 5)} ${number.slice(5)}`;
    }
  }
  return phone;
};

/**
 * Get business type label
 */
const getBusinessTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    'restaurant': 'Restaurant',
    'retail': 'Retail',
    'healthcare': 'Healthcare',
    'professional-services': 'Professional Services',
    'fitness': 'Fitness & Wellness',
    'beauty': 'Beauty & Personal Care',
    'home-services': 'Home Services',
    'automotive': 'Automotive',
    'real-estate': 'Real Estate',
    'education': 'Education & Training',
    'technology': 'Technology',
    'other': 'Other'
  };
  return types[type] || type;
};

/**
 * Get status label
 */
const getStatusLabel = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.PENDING:
      return 'Pending';
    case BookingStatus.CONFIRMED:
      return 'Confirmed';
    case BookingStatus.COMPLETED:
      return 'Completed';
    case BookingStatus.CANCELLED:
      return 'Cancelled';
    case BookingStatus.NO_SHOW:
      return 'No Show';
    default:
      return status;
  }
};

/**
 * Convert booking data to export format
 */
const formatBookingForExport = (booking: Booking) => {
  const appointmentDate = new Date(booking.datetime);
  const createdDate = new Date(booking.created_at);
  const updatedDate = booking.updated_at ? new Date(booking.updated_at) : null;

  return {
    // Booking Information
    'Booking ID': booking.id,
    'Status': getStatusLabel(booking.status),
    'Appointment Date': format(appointmentDate, 'yyyy-MM-dd'),
    'Appointment Time': format(appointmentDate, 'HH:mm'),
    'Appointment DateTime': format(appointmentDate, 'yyyy-MM-dd HH:mm:ss'),
    'Duration': '60 minutes',

    // Customer Information
    'Customer Name': booking.customer_name,
    'Customer Email': booking.customer_email,
    'Customer Phone': formatPhoneNumber(booking.customer_phone),

    // Business Information
    'Business Name': booking.business_name,
    'Business Type': getBusinessTypeLabel(booking.business_type),
    'Business Location': booking.business_location || '',
    'Business Website': booking.business_website || '',
    'Annual Revenue': booking.current_revenue || '',

    // Additional Information
    'Biggest Challenge': booking.biggest_challenge || '',
    'Google Meet Link': booking.google_meet_link || '',

    // System Information
    'Created Date': format(createdDate, 'yyyy-MM-dd'),
    'Created Time': format(createdDate, 'HH:mm:ss'),
    'Created DateTime': format(createdDate, 'yyyy-MM-dd HH:mm:ss'),
    'Last Updated': updatedDate ? format(updatedDate, 'yyyy-MM-dd HH:mm:ss') : '',

    // Calculated Fields
    'Days Until Appointment': Math.ceil((appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'Days Since Created': Math.ceil((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)),
    'Is Past Appointment': appointmentDate < new Date() ? 'Yes' : 'No',
    'Weekday': format(appointmentDate, 'EEEE'),
    'Month': format(appointmentDate, 'MMMM yyyy')
  };
};

/**
 * Filter bookings based on options
 */
const filterBookings = (bookings: Booking[], options: ExportOptions): Booking[] => {
  let filtered = [...bookings];

  // Filter by date range
  if (options.dateRange?.from || options.dateRange?.to) {
    filtered = filtered.filter(booking => {
      const bookingDate = new Date(booking.datetime);
      if (options.dateRange?.from && bookingDate < options.dateRange.from) {
        return false;
      }
      if (options.dateRange?.to && bookingDate > options.dateRange.to) {
        return false;
      }
      return true;
    });
  }

  // Filter by status
  if (options.status && options.status !== 'all') {
    filtered = filtered.filter(booking => booking.status === options.status);
  }

  return filtered;
};

/**
 * Convert array of objects to CSV string
 */
const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Escape CSV values
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);

    // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  };

  // Create CSV content
  const csvHeaders = headers.map(escapeCSVValue).join(',');
  const csvRows = data.map(row =>
    headers.map(header => escapeCSVValue(row[header])).join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Trigger file download
 */
const downloadFile = (content: string, filename: string, contentType: string): void => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate filename with timestamp
 */
const generateFilename = (baseName: string, extension: string, options: ExportOptions): string => {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HHmm');
  let suffix = '';

  // Add status to filename if filtered
  if (options.status && options.status !== 'all') {
    suffix += `_${options.status}`;
  }

  // Add date range to filename if filtered
  if (options.dateRange?.from || options.dateRange?.to) {
    const fromStr = options.dateRange.from ? format(options.dateRange.from, 'yyyy-MM-dd') : 'start';
    const toStr = options.dateRange.to ? format(options.dateRange.to, 'yyyy-MM-dd') : 'end';
    suffix += `_${fromStr}_to_${toStr}`;
  }

  return `${baseName}${suffix}_${timestamp}.${extension}`;
};

/**
 * Export bookings to CSV format
 */
export const exportBookingsToCSV = (
  bookings: Booking[],
  options: ExportOptions = {}
): void => {
  try {
    // Filter bookings based on options
    const filteredBookings = filterBookings(bookings, options);

    if (filteredBookings.length === 0) {
      throw new Error('No bookings to export with current filters');
    }

    // Convert bookings to export format
    const exportData = filteredBookings.map(formatBookingForExport);

    // Filter fields if specified
    let finalData = exportData;
    if (options.includeFields && options.includeFields.length > 0) {
      finalData = exportData.map(row => {
        const filteredRow: any = {};
        options.includeFields!.forEach(field => {
          if (field in row) {
            filteredRow[field] = row[field as keyof typeof row];
          }
        });
        return filteredRow;
      });
    }

    // Convert to CSV
    const csvContent = convertToCSV(finalData);

    // Generate filename and download
    const filename = generateFilename('bookings_export', 'csv', options);
    downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');

  } catch (error) {
    console.error('Error exporting bookings to CSV:', error);
    throw error;
  }
};

/**
 * Export bookings to Excel format (simplified CSV with .xlsx extension)
 * For true Excel export, you would use a library like xlsx or exceljs
 */
export const exportBookingsToExcel = (
  bookings: Booking[],
  options: ExportOptions = {}
): void => {
  try {
    // For now, export as CSV but with Excel-compatible format
    const filteredBookings = filterBookings(bookings, options);

    if (filteredBookings.length === 0) {
      throw new Error('No bookings to export with current filters');
    }

    const exportData = filteredBookings.map(formatBookingForExport);
    const csvContent = convertToCSV(exportData);

    // Generate filename and download as Excel-compatible CSV
    const filename = generateFilename('bookings_export', 'csv', options);
    downloadFile(csvContent, filename, 'application/vnd.ms-excel;charset=utf-8;');

    // TODO: Implement true Excel export using xlsx library:
    /*
    import * as XLSX from 'xlsx';

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const filename = generateFilename('bookings_export', 'xlsx', options);
    downloadFile(excelBuffer, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    */

  } catch (error) {
    console.error('Error exporting bookings to Excel:', error);
    throw error;
  }
};

/**
 * Export filtered bookings with custom options
 */
export const exportFilteredBookings = (
  bookings: Booking[],
  filters: {
    status?: BookingStatus | 'all';
    dateFrom?: Date;
    dateTo?: Date;
    search?: string;
    businessType?: string;
  },
  format: 'csv' | 'excel' = 'csv'
): void => {
  try {
    // Apply additional filtering based on the filters object
    let filteredBookings = [...bookings];

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filteredBookings = filteredBookings.filter(booking => booking.status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      filteredBookings = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.datetime);
        if (filters.dateFrom && bookingDate < filters.dateFrom) return false;
        if (filters.dateTo && bookingDate > filters.dateTo) return false;
        return true;
      });
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredBookings = filteredBookings.filter(booking =>
        booking.customer_name.toLowerCase().includes(searchLower) ||
        booking.customer_email.toLowerCase().includes(searchLower) ||
        booking.business_name.toLowerCase().includes(searchLower)
      );
    }

    // Business type filter
    if (filters.businessType && filters.businessType !== 'all') {
      filteredBookings = filteredBookings.filter(booking => booking.business_type === filters.businessType);
    }

    const options: ExportOptions = {
      status: filters.status,
      dateRange: {
        from: filters.dateFrom,
        to: filters.dateTo
      },
      format
    };

    // Export based on format
    if (format === 'excel') {
      exportBookingsToExcel(filteredBookings, options);
    } else {
      exportBookingsToCSV(filteredBookings, options);
    }

  } catch (error) {
    console.error('Error exporting filtered bookings:', error);
    throw error;
  }
};

/**
 * Get export statistics
 */
export const getExportStats = (bookings: Booking[], options: ExportOptions = {}) => {
  const filteredBookings = filterBookings(bookings, options);

  return {
    totalBookings: filteredBookings.length,
    statusBreakdown: {
      pending: filteredBookings.filter(b => b.status === BookingStatus.PENDING).length,
      confirmed: filteredBookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
      completed: filteredBookings.filter(b => b.status === BookingStatus.COMPLETED).length,
      cancelled: filteredBookings.filter(b => b.status === BookingStatus.CANCELLED).length,
      noShow: filteredBookings.filter(b => b.status === BookingStatus.NO_SHOW).length
    },
    dateRange: filteredBookings.length > 0 ? {
      earliest: filteredBookings.reduce((earliest, booking) =>
        new Date(booking.datetime) < new Date(earliest.datetime) ? booking : earliest
      ).datetime,
      latest: filteredBookings.reduce((latest, booking) =>
        new Date(booking.datetime) > new Date(latest.datetime) ? booking : latest
      ).datetime
    } : null
  };
};