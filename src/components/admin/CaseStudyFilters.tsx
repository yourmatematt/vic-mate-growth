import React from 'react';
import { Search, Filter, X, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  CaseStudyFilters as FilterType,
  CaseStudyStatus,
  IndustryOption,
  TagOption,
  SortOption,
  SortOrder,
  INDUSTRY_OPTIONS,
  TAG_OPTIONS,
  SORT_OPTIONS
} from '@/types/case-studies';

interface CaseStudyFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
  onClearFilters: () => void;
  totalCount?: number;
}

const CaseStudyFilters: React.FC<CaseStudyFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalCount
}) => {
  const updateFilter = (key: keyof FilterType, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    });
  };

  const toggleTag = (tag: TagOption) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    updateFilter('tags', newTags);
  };

  const removeTag = (tagToRemove: TagOption) => {
    const newTags = (filters.tags || []).filter(tag => tag !== tagToRemove);
    updateFilter('tags', newTags);
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    (filters.industry && filters.industry !== 'all') ||
    (filters.tags && filters.tags.length > 0) ||
    filters.dateFrom ||
    filters.dateTo
  );

  return (
    <div className="space-y-4">
      {/* Search and main filters row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search case studies..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => updateFilter('status', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={CaseStudyStatus.PUBLISHED}>Published</SelectItem>
            <SelectItem value={CaseStudyStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={CaseStudyStatus.ARCHIVED}>Archived</SelectItem>
          </SelectContent>
        </Select>

        {/* Industry filter */}
        <Select
          value={filters.industry || 'all'}
          onValueChange={(value) => updateFilter('industry', value === 'all' ? undefined : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {INDUSTRY_OPTIONS.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tags filter popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Tags
              {filters.tags && filters.tags.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                  {filters.tags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Tags</Label>
              <div className="grid grid-cols-2 gap-2">
                {TAG_OPTIONS.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={filters.tags?.includes(tag) || false}
                      onCheckedChange={() => toggleTag(tag)}
                    />
                    <Label
                      htmlFor={tag}
                      className="text-sm cursor-pointer capitalize"
                    >
                      {tag.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.tags && filters.tags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilter('tags', [])}
                  className="w-full"
                >
                  Clear all tags
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort controls */}
        <div className="flex items-center gap-2">
          <Select
            value={filters.sortBy || 'created_at'}
            onValueChange={(value) => updateFilter('sortBy', value as SortOption)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="client_name">Client</SelectItem>
              <SelectItem value="updated_at">Modified</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
            }
            title={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Active filters and clear button row */}
      {(hasActiveFilters || (filters.tags && filters.tags.length > 0)) && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Search filter badge */}
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.search}"
              <button
                onClick={() => updateFilter('search', undefined)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Status filter badge */}
          {filters.status && filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <button
                onClick={() => updateFilter('status', undefined)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Industry filter badge */}
          {filters.industry && filters.industry !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Industry: {filters.industry}
              <button
                onClick={() => updateFilter('industry', undefined)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {/* Tag filter badges */}
          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag.replace('-', ' ')}
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Clear all button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-7 px-2 text-xs"
            >
              Clear filters
            </Button>
          )}
        </div>
      )}

      {/* Results count */}
      {totalCount !== undefined && (
        <div className="text-sm text-muted-foreground">
          {totalCount === 0 ? (
            'No case studies found'
          ) : (
            `${totalCount} case stud${totalCount === 1 ? 'y' : 'ies'} ${
              hasActiveFilters ? 'matching filters' : 'total'
            }`
          )}
        </div>
      )}
    </div>
  );
};

export default CaseStudyFilters;