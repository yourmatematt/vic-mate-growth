/**
 * Case Studies TypeScript Definitions
 *
 * This file contains all TypeScript types and interfaces for the case studies
 * management system, matching the Supabase database schema.
 */

// ============================================================================
// DATABASE TYPES (matching Supabase schema)
// ============================================================================

/**
 * Main case study database row type
 * Matches the case_studies table structure
 */
export interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client_name: string;
  client_industry: string | null;
  client_location: string | null;
  challenge: string | null;
  solution: string | null;
  results: string | null;
  testimonial: string | null;
  testimonial_author: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  featured_image_url: string | null;
  metrics: CaseStudyMetrics | null;
  tags: string[] | null;
  status: CaseStudyStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
}

/**
 * Case study image gallery item
 * Matches the case_study_images table structure
 */
export interface CaseStudyImage {
  id: string;
  case_study_id: string;
  image_url: string;
  caption: string | null;
  display_order: number;
  created_at: string;
}

/**
 * Database view for case studies with additional computed fields
 */
export interface PublishedCaseStudy extends CaseStudy {
  additional_image_count: number;
}

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

/**
 * Case study status options
 */
export enum CaseStudyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

/**
 * Available industry options for case studies
 * Based on Australian market focus
 */
export const INDUSTRY_OPTIONS = [
  'Trades & Services',
  'Retail & E-commerce',
  'Healthcare & Wellness',
  'Hospitality & Tourism',
  'Professional Services',
  'Real Estate',
  'Automotive',
  'Construction',
  'Education & Training',
  'Finance & Insurance',
  'Agriculture & Farming',
  'Manufacturing',
  'Technology',
  'Beauty & Personal Care',
  'Home & Garden Services',
  'Sports & Fitness',
  'Legal Services',
  'Accounting & Bookkeeping',
  'Other'
] as const;

/**
 * Available tags for categorizing case studies
 */
export const TAG_OPTIONS = [
  'social-media',
  'website-design',
  'seo',
  'local-seo',
  'google-ads',
  'facebook-ads',
  'content-marketing',
  'email-marketing',
  'branding',
  'conversion-optimization',
  'e-commerce',
  'mobile-optimization',
  'analytics',
  'lead-generation',
  'reputation-management'
] as const;

/**
 * Image types for case studies
 */
export const IMAGE_TYPES = [
  'before',
  'after',
  'featured',
  'gallery'
] as const;

/**
 * Sort options for case study listings
 */
export const SORT_OPTIONS = [
  'created_at',
  'published_at',
  'title',
  'client_name',
  'updated_at'
] as const;

// ============================================================================
// TYPE HELPERS
// ============================================================================

export type IndustryOption = typeof INDUSTRY_OPTIONS[number];
export type TagOption = typeof TAG_OPTIONS[number];
export type ImageType = typeof IMAGE_TYPES[number];
export type SortOption = typeof SORT_OPTIONS[number];
export type SortOrder = 'asc' | 'desc';

/**
 * Metrics object structure for storing performance data
 */
export interface CaseStudyMetrics {
  revenue_increase?: string;
  traffic_increase?: string;
  conversion_rate_increase?: string;
  leads_generated?: string;
  ranking_improvement?: string;
  social_followers_increase?: string;
  cost_reduction?: string;
  time_to_results?: string;
  roi?: string;
  [key: string]: string | undefined;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

/**
 * Form data for creating/editing case studies
 * Includes validation-friendly types
 */
export interface CaseStudyFormData {
  title: string;
  slug: string;
  client_name: string;
  client_industry: IndustryOption | '';
  client_location: string;
  challenge: string;
  solution: string;
  results: string;
  testimonial: string;
  testimonial_author: string;
  before_image_url: string;
  after_image_url: string;
  featured_image_url: string;
  metrics: CaseStudyMetrics;
  tags: TagOption[];
  status: CaseStudyStatus;
  published_at: string | null;
}

/**
 * Partial form data for updates
 */
export interface CaseStudyUpdateData extends Partial<CaseStudyFormData> {
  id: string;
}

/**
 * Form data for adding gallery images
 */
export interface CaseStudyImageFormData {
  case_study_id: string;
  image_url: string;
  caption: string;
  display_order: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Response for case study list endpoints
 */
export interface CaseStudyListResponse {
  data: CaseStudy[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Response for single case study with images
 */
export interface CaseStudyDetailResponse {
  caseStudy: CaseStudy;
  images: CaseStudyImage[];
}

/**
 * Response for published case studies (public API)
 */
export interface PublishedCaseStudyResponse {
  data: PublishedCaseStudy[];
  total: number;
  industries: string[];
  tags: string[];
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// FILTER AND QUERY TYPES
// ============================================================================

/**
 * Comprehensive filtering options for case study queries
 */
export interface CaseStudyFilters {
  status?: CaseStudyStatus | 'all';
  industry?: IndustryOption | 'all';
  tags?: TagOption[];
  search?: string;
  sortBy?: SortOption;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
  dateFrom?: string;
  dateTo?: string;
  authorId?: string;
}

/**
 * Search and pagination parameters
 */
export interface CaseStudySearchParams {
  q?: string;
  industry?: string;
  tags?: string;
  page?: string;
  limit?: string;
  sort?: string;
}

/**
 * Admin dashboard filter options
 */
export interface AdminCaseStudyFilters extends CaseStudyFilters {
  includeUnpublished?: boolean;
  includeDrafts?: boolean;
}

// ============================================================================
// IMAGE UPLOAD TYPES
// ============================================================================

/**
 * Data for uploading images to storage
 */
export interface ImageUploadData {
  file: File;
  type: ImageType;
  caseStudyId?: string;
  caption?: string;
}

/**
 * Response from successful image upload
 */
export interface UploadedImage {
  url: string;
  path: string;
  publicUrl: string;
  size: number;
  type: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Batch upload data for multiple images
 */
export interface BatchImageUpload {
  images: ImageUploadData[];
  caseStudyId: string;
}

/**
 * Image optimization options
 */
export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  progressive?: boolean;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Loading states for different operations
 */
export interface CaseStudyLoadingState {
  list: boolean;
  detail: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  imageUpload: boolean;
}

/**
 * Form state management
 */
export interface CaseStudyFormState {
  data: CaseStudyFormData;
  errors: Partial<Record<keyof CaseStudyFormData, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

/**
 * Modal/dialog state
 */
export interface CaseStudyModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view' | 'delete';
  selectedId?: string;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Field validation result
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Slug validation options
 */
export interface SlugValidationOptions {
  allowNumbers?: boolean;
  allowHyphens?: boolean;
  maxLength?: number;
  existingIds?: string[];
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

/**
 * User permission levels for case studies
 */
export type CaseStudyPermission = 'read' | 'create' | 'update' | 'delete' | 'publish' | 'admin';

/**
 * Permission check context
 */
export interface PermissionContext {
  userId: string;
  userRole?: string;
  resourceOwnerId?: string;
  resourceStatus?: CaseStudyStatus;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Case study analytics data
 */
export interface CaseStudyAnalytics {
  views: number;
  shares: number;
  engagement: number;
  conversionRate: number;
  averageReadTime: number;
  topReferrers: string[];
}

/**
 * Dashboard statistics
 */
export interface CaseStudyStats {
  total: number;
  published: number;
  drafts: number;
  archived: number;
  totalViews: number;
  popularTags: Array<{ tag: string; count: number }>;
  topIndustries: Array<{ industry: string; count: number }>;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

/**
 * Data export options
 */
export interface CaseStudyExportOptions {
  format: 'json' | 'csv' | 'pdf';
  includeImages?: boolean;
  includeMetrics?: boolean;
  filters?: CaseStudyFilters;
}

/**
 * Import data structure
 */
export interface CaseStudyImportData {
  caseStudies: Omit<CaseStudyFormData, 'slug'>[];
  validateOnly?: boolean;
  overwriteExisting?: boolean;
}