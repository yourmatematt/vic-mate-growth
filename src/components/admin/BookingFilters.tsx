/**
 * Booking Filters Component
 * Provides filtering and search controls for booking lists
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  X,
  CalendarIcon,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { BookingStatus } from '@/types/booking';

export interface BookingFiltersState {
  search: string;
  status: BookingStatus | 'all';
  dateRange: {
    from?: Date;
    to?: Date;
  };
  businessType: string;
  sortBy: 'date' | 'name' | 'status' | 'created';
  sortOrder: 'asc' | 'desc';
}

interface BookingFiltersProps {
  filters: BookingFiltersState;
  onFiltersChange: (filters: BookingFiltersState) => void;
  onExport?: () => void;
  onClearFilters: () => void;
  totalResults?: number;
  loading?: boolean;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({
  filters,
  onFiltersChange,
  onExport,
  onClearFilters,
  totalResults,
  loading = false
}) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.businessType !== 'all';

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status as BookingStatus | 'all'
    });
  };

  const handleDateRangeSelect = (range: { from?: Date; to?: Date }) => {
    onFiltersChange({
      ...filters,
      dateRange: range
    });
  };

  const handleQuickDateFilter = (type: 'today' | 'week' | 'month') => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let dateRange: { from?: Date; to?: Date } = {};

    switch (type) {
      case 'today':
        dateRange = { from: startOfDay, to: startOfDay };
        break;
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        dateRange = { from: startOfWeek, to: today };
        break;
      case 'month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        dateRange = { from: startOfMonth, to: today };
        break;
    }

    handleDateRangeSelect(dateRange);
  };

  const handleBusinessTypeChange = (businessType: string) => {
    onFiltersChange({ ...filters, businessType });
  };

  const handleSortChange = (field: string) => {
    const [sortBy, sortOrder] = field.split('-');
    onFiltersChange({
      ...filters,
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc'
    });
  };

  const businessTypes = [
    { value: 'all', label: 'All Business Types' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'retail', label: 'Retail' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'professional-services', label: 'Professional Services' },
    { value: 'fitness', label: 'Fitness & Wellness' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'home-services', label: 'Home Services' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'real-estate', label: 'Real Estate' },
    { value: 'education', label: 'Education & Training' },
    { value: 'technology', label: 'Technology' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: BookingStatus.PENDING, label: 'Pending' },
    { value: BookingStatus.CONFIRMED, label: 'Confirmed' },
    { value: BookingStatus.COMPLETED, label: 'Completed' },
    { value: BookingStatus.CANCELLED, label: 'Cancelled' },
    { value: BookingStatus.NO_SHOW, label: 'No Show' }
  ];

  const sortOptions = [
    { value: 'date-desc', label: 'Booking Date (Newest)' },
    { value: 'date-asc', label: 'Booking Date (Oldest)' },
    { value: 'name-asc', label: 'Customer Name (A-Z)' },
    { value: 'name-desc', label: 'Customer Name (Z-A)' },
    { value: 'created-desc', label: 'Created (Newest)' },
    { value: 'created-asc', label: 'Created (Oldest)' },
    { value: 'status-asc', label: 'Status (A-Z)' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="space-y-4">
        {/* Search and Quick Actions Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by customer name, email, or business name..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex gap-2">
            {onExport && (
              <Button
                variant="outline"
                onClick={onExport}
                disabled={loading}
                className="whitespace-nowrap"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={onClearFilters}
                disabled={loading}
                className="whitespace-nowrap"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Status</Label>
            <Select
              value={filters.status}
              onValueChange={handleStatusChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business Type Filter */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Business Type</Label>
            <Select
              value={filters.businessType}
              onValueChange={handleBusinessTypeChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Date Range</Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  disabled={loading}
                  className={`w-full justify-start text-left font-normal ${
                    !filters.dateRange.from && 'text-muted-foreground'
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "MMM d")} -{" "}
                        {format(filters.dateRange.to, "MMM d, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "PPP")
                    )
                  ) : (
                    "Pick a date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex">
                  <div className="p-3 border-r">
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleQuickDateFilter('today');
                          setDatePickerOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        Today
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleQuickDateFilter('week');
                          setDatePickerOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        This Week
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          handleQuickDateFilter('month');
                          setDatePickerOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        This Month
                      </Button>
                    </div>
                  </div>
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange.from}
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to
                    }}
                    onSelect={handleDateRangeSelect}
                    numberOfMonths={1}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Sort By */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-600">Sort By</Label>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onValueChange={handleSortChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters and Results */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                Search: "{filters.search}"
                <button
                  onClick={() => handleSearchChange('')}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.status !== 'all' && (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Status: {statusOptions.find(s => s.value === filters.status)?.label}
                <button
                  onClick={() => handleStatusChange('all')}
                  className="ml-1 hover:text-green-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.businessType !== 'all' && (
              <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                Type: {businessTypes.find(t => t.value === filters.businessType)?.label}
                <button
                  onClick={() => handleBusinessTypeChange('all')}
                  className="ml-1 hover:text-purple-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {(filters.dateRange.from || filters.dateRange.to) && (
              <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                Date: {filters.dateRange.from && format(filters.dateRange.from, 'MMM d')}
                {filters.dateRange.to && filters.dateRange.from !== filters.dateRange.to &&
                  ` - ${format(filters.dateRange.to, 'MMM d')}`}
                <button
                  onClick={() => handleDateRangeSelect({})}
                  className="ml-1 hover:text-orange-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          {totalResults !== undefined && (
            <div className="text-sm text-gray-600">
              {totalResults} booking{totalResults !== 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFilters;