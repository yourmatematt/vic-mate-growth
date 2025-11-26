/**
 * Case Study Utility Functions
 *
 * This file contains utility functions, type guards, validation helpers,
 * and other utilities for working with case studies.
 */

import {
  CaseStudy,
  CaseStudyFormData,
  CaseStudyStatus,
  CaseStudyMetrics,
  IndustryOption,
  TagOption,
  ImageType,
  FieldValidationResult,
  FormValidationResult,
  SlugValidationOptions,
  INDUSTRY_OPTIONS,
  TAG_OPTIONS,
  IMAGE_TYPES
} from '@/types/case-studies';

// ============================================================================
// SLUG GENERATION AND VALIDATION
// ============================================================================

/**
 * Generates a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validates a slug format
 */
export function validateSlug(
  slug: string,
  options: SlugValidationOptions = {}
): FieldValidationResult {
  const {
    allowNumbers = true,
    allowHyphens = true,
    maxLength = 100,
    existingIds = []
  } = options;

  if (!slug) {
    return { isValid: false, error: 'Slug is required' };
  }

  if (slug.length > maxLength) {
    return { isValid: false, error: `Slug must be ${maxLength} characters or less` };
  }

  // Check for valid characters
  let pattern = '[a-z]';
  if (allowNumbers) pattern += '0-9';
  if (allowHyphens) pattern += '-';

  const regex = new RegExp(`^[${pattern}]+$`);

  if (!regex.test(slug)) {
    return {
      isValid: false,
      error: 'Slug can only contain lowercase letters' +
             (allowNumbers ? ', numbers' : '') +
             (allowHyphens ? ', and hyphens' : '')
    };
  }

  // Check for consecutive hyphens
  if (allowHyphens && slug.includes('--')) {
    return { isValid: false, error: 'Slug cannot contain consecutive hyphens' };
  }

  // Check for leading/trailing hyphens
  if (allowHyphens && (slug.startsWith('-') || slug.endsWith('-'))) {
    return { isValid: false, error: 'Slug cannot start or end with a hyphen' };
  }

  // Check if slug already exists
  if (existingIds.includes(slug)) {
    return { isValid: false, error: 'This slug is already in use' };
  }

  return { isValid: true };
}

/**
 * Creates a unique slug by appending numbers if needed
 */
export function createUniqueSlug(title: string, existingSlugs: string[]): string {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid CaseStudyStatus
 */
export function isCaseStudyStatus(value: any): value is CaseStudyStatus {
  return Object.values(CaseStudyStatus).includes(value);
}

/**
 * Type guard to check if a value is a valid IndustryOption
 */
export function isIndustryOption(value: any): value is IndustryOption {
  return INDUSTRY_OPTIONS.includes(value as IndustryOption);
}

/**
 * Type guard to check if a value is a valid TagOption
 */
export function isTagOption(value: any): value is TagOption {
  return TAG_OPTIONS.includes(value as TagOption);
}

/**
 * Type guard to check if a value is a valid ImageType
 */
export function isImageType(value: any): value is ImageType {
  return IMAGE_TYPES.includes(value as ImageType);
}

/**
 * Type guard to check if an object is a valid CaseStudy
 */
export function isCaseStudy(obj: any): obj is CaseStudy {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.slug === 'string' &&
    typeof obj.client_name === 'string' &&
    isCaseStudyStatus(obj.status) &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}

/**
 * Type guard to check if metrics object is valid
 */
export function isValidMetrics(obj: any): obj is CaseStudyMetrics {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // Check that all values are strings if they exist
  for (const key in obj) {
    if (obj[key] !== undefined && typeof obj[key] !== 'string') {
      return false;
    }
  }

  return true;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validates a case study title
 */
export function validateTitle(title: string): FieldValidationResult {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title is required' };
  }

  if (title.length < 3) {
    return { isValid: false, error: 'Title must be at least 3 characters' };
  }

  if (title.length > 200) {
    return { isValid: false, error: 'Title must be 200 characters or less' };
  }

  return { isValid: true };
}

/**
 * Validates client name
 */
export function validateClientName(name: string): FieldValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Client name is required' };
  }

  if (name.length < 2) {
    return { isValid: false, error: 'Client name must be at least 2 characters' };
  }

  if (name.length > 100) {
    return { isValid: false, error: 'Client name must be 100 characters or less' };
  }

  return { isValid: true };
}

/**
 * Validates email format (for testimonial authors)
 */
export function validateEmail(email: string): FieldValidationResult {
  if (!email) {
    return { isValid: true }; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
}

/**
 * Validates URL format
 */
export function validateUrl(url: string, required = false): FieldValidationResult {
  if (!url || url.trim().length === 0) {
    if (required) {
      return { isValid: false, error: 'URL is required' };
    }
    return { isValid: true };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}

/**
 * Validates tags array
 */
export function validateTags(tags: string[]): FieldValidationResult {
  if (!Array.isArray(tags)) {
    return { isValid: false, error: 'Tags must be an array' };
  }

  if (tags.length > 10) {
    return { isValid: false, error: 'Cannot have more than 10 tags' };
  }

  const invalidTags = tags.filter(tag => !isTagOption(tag));
  if (invalidTags.length > 0) {
    return {
      isValid: false,
      error: `Invalid tags: ${invalidTags.join(', ')}`
    };
  }

  return { isValid: true };
}

/**
 * Validates the entire case study form
 */
export function validateCaseStudyForm(data: CaseStudyFormData): FormValidationResult {
  const errors: Record<string, string> = {};

  // Title validation
  const titleResult = validateTitle(data.title);
  if (!titleResult.isValid) {
    errors.title = titleResult.error!;
  }

  // Slug validation
  const slugResult = validateSlug(data.slug);
  if (!slugResult.isValid) {
    errors.slug = slugResult.error!;
  }

  // Client name validation
  const clientNameResult = validateClientName(data.client_name);
  if (!clientNameResult.isValid) {
    errors.client_name = clientNameResult.error!;
  }

  // Industry validation
  if (data.client_industry && !isIndustryOption(data.client_industry)) {
    errors.client_industry = 'Please select a valid industry';
  }

  // Tags validation
  const tagsResult = validateTags(data.tags);
  if (!tagsResult.isValid) {
    errors.tags = tagsResult.error!;
  }

  // URL validations
  const beforeImageResult = validateUrl(data.before_image_url);
  if (!beforeImageResult.isValid) {
    errors.before_image_url = beforeImageResult.error!;
  }

  const afterImageResult = validateUrl(data.after_image_url);
  if (!afterImageResult.isValid) {
    errors.after_image_url = afterImageResult.error!;
  }

  const featuredImageResult = validateUrl(data.featured_image_url);
  if (!featuredImageResult.isValid) {
    errors.featured_image_url = featuredImageResult.error!;
  }

  // Status validation
  if (!isCaseStudyStatus(data.status)) {
    errors.status = 'Please select a valid status';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// ============================================================================
// DATE AND TIME UTILITIES
// ============================================================================

/**
 * Formats a date string for display
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Australia/Melbourne'
  };

  return date.toLocaleDateString('en-AU', { ...defaultOptions, ...options });
}

/**
 * Formats a date for datetime-local input
 */
export function formatDateTimeLocal(dateString: string): string {
  const date = new Date(dateString);

  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Gets relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    return formatDate(dateString, { month: 'short', day: 'numeric' });
  }
}

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Converts database row to form data
 */
export function caseStudyToFormData(caseStudy: CaseStudy): CaseStudyFormData {
  return {
    title: caseStudy.title,
    slug: caseStudy.slug,
    client_name: caseStudy.client_name,
    client_industry: (caseStudy.client_industry as IndustryOption) || '',
    client_location: caseStudy.client_location || '',
    challenge: caseStudy.challenge || '',
    solution: caseStudy.solution || '',
    results: caseStudy.results || '',
    testimonial: caseStudy.testimonial || '',
    testimonial_author: caseStudy.testimonial_author || '',
    before_image_url: caseStudy.before_image_url || '',
    after_image_url: caseStudy.after_image_url || '',
    featured_image_url: caseStudy.featured_image_url || '',
    metrics: caseStudy.metrics || {},
    tags: caseStudy.tags || [],
    status: caseStudy.status,
    published_at: caseStudy.published_at
  };
}

/**
 * Converts form data to database insert/update data
 */
export function formDataToCaseStudy(formData: CaseStudyFormData): Partial<CaseStudy> {
  return {
    title: formData.title,
    slug: formData.slug,
    client_name: formData.client_name,
    client_industry: formData.client_industry || null,
    client_location: formData.client_location || null,
    challenge: formData.challenge || null,
    solution: formData.solution || null,
    results: formData.results || null,
    testimonial: formData.testimonial || null,
    testimonial_author: formData.testimonial_author || null,
    before_image_url: formData.before_image_url || null,
    after_image_url: formData.after_image_url || null,
    featured_image_url: formData.featured_image_url || null,
    metrics: Object.keys(formData.metrics).length > 0 ? formData.metrics : null,
    tags: formData.tags.length > 0 ? formData.tags : null,
    status: formData.status,
    published_at: formData.published_at
  };
}

/**
 * Sanitizes HTML content (basic implementation)
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and on* attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/g, '')
    .replace(/\son\w+=\'[^\']*\'/g, '')
    .trim();
}

/**
 * Truncates text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Extracts plain text from HTML
 */
export function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// ============================================================================
// SEARCH AND FILTER UTILITIES
// ============================================================================

/**
 * Filters case studies by search term
 */
export function filterBySearchTerm(caseStudies: CaseStudy[], searchTerm: string): CaseStudy[] {
  if (!searchTerm) return caseStudies;

  const term = searchTerm.toLowerCase();

  return caseStudies.filter(cs =>
    cs.title.toLowerCase().includes(term) ||
    cs.client_name.toLowerCase().includes(term) ||
    (cs.client_industry && cs.client_industry.toLowerCase().includes(term)) ||
    (cs.client_location && cs.client_location.toLowerCase().includes(term)) ||
    (cs.challenge && cs.challenge.toLowerCase().includes(term)) ||
    (cs.solution && cs.solution.toLowerCase().includes(term)) ||
    (cs.results && cs.results.toLowerCase().includes(term)) ||
    (cs.tags && cs.tags.some(tag => tag.toLowerCase().includes(term)))
  );
}

/**
 * Sorts case studies by specified field
 */
export function sortCaseStudies<T extends CaseStudy>(
  caseStudies: T[],
  sortBy: keyof T,
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...caseStudies].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    let comparison = 0;

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    } else if (aVal instanceof Date && bVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime();
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }

    return order === 'desc' ? -comparison : comparison;
  });
}

/**
 * Groups case studies by industry
 */
export function groupByIndustry(caseStudies: CaseStudy[]): Record<string, CaseStudy[]> {
  return caseStudies.reduce((groups, caseStudy) => {
    const industry = caseStudy.client_industry || 'Other';
    if (!groups[industry]) {
      groups[industry] = [];
    }
    groups[industry].push(caseStudy);
    return groups;
  }, {} as Record<string, CaseStudy[]>);
}

// ============================================================================
// FILE AND IMAGE UTILITIES
// ============================================================================

/**
 * Validates image file type and size
 */
export function validateImageFile(file: File, maxSizeMB = 10): FieldValidationResult {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)'
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be ${maxSizeMB}MB or less`
    };
  }

  return { isValid: true };
}

/**
 * Generates storage path for case study image
 */
export function generateImagePath(
  caseStudyId: string,
  imageType: ImageType,
  fileExtension: string
): string {
  const timestamp = Date.now();
  return `${caseStudyId}/${imageType}_${timestamp}.${fileExtension}`;
}

/**
 * Extracts file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}