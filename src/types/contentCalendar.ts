/**
 * Content Calendar TypeScript Definitions
 *
 * This file contains all TypeScript types and interfaces for the content calendar
 * management system, matching the Supabase database schema.
 * Supports Australian timezone operations and multi-tier subscriptions.
 */

// ============================================================================
// DATABASE TYPES (matching Supabase schema)
// ============================================================================

/**
 * Supported social media platforms
 */
export type ContentPlatform = 'facebook' | 'instagram' | 'linkedin' | 'twitter';

/**
 * Post status workflow
 */
export type PostStatus = 'draft' | 'scheduled' | 'published' | 'cancelled';

/**
 * Subscription tiers with different feature access
 */
export type SubscriptionTier = 'starter' | 'growth' | 'pro';

/**
 * Main content calendar post database row type
 * Matches the content_calendar_posts table structure
 */
export interface ContentCalendarPost {
  id: string;
  user_id: string;
  subscription_tier: SubscriptionTier;
  platform: ContentPlatform;
  scheduled_date: string; // ISO timestamp with timezone
  status: PostStatus;
  original_caption: string; // AI-generated caption
  current_caption: string;  // Latest edited version
  image_url: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Caption revision tracking for audit trail
 * Matches the content_calendar_revisions table structure
 */
export interface ContentCalendarRevision {
  id: string;
  post_id: string;
  user_id: string;
  caption: string;
  revision_number: number;
  created_at: string;
}

/**
 * Client feedback and comments on posts
 * Matches the content_calendar_comments table structure
 */
export interface ContentCalendarComment {
  id: string;
  post_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

/**
 * Custom uploaded images for posts
 * Matches the content_calendar_images table structure
 */
export interface ContentCalendarImage {
  id: string;
  post_id: string;
  user_id: string;
  storage_path: string; // Supabase storage path
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

// ============================================================================
// EXTENDED TYPES WITH RELATIONS
// ============================================================================

/**
 * Post with all related data for UI display
 */
export interface ContentCalendarPostWithRelations extends ContentCalendarPost {
  revisions?: ContentCalendarRevision[];
  comments?: ContentCalendarComment[];
  images?: ContentCalendarImage[];
  latest_revision?: ContentCalendarRevision;
  comment_count?: number;
}

/**
 * Revision with user information
 */
export interface ContentCalendarRevisionWithUser extends ContentCalendarRevision {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

/**
 * Comment with user information
 */
export interface ContentCalendarCommentWithUser extends ContentCalendarComment {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

// ============================================================================
// FORM AND INPUT TYPES
// ============================================================================

/**
 * Form data for creating a new post
 */
export interface CreateContentCalendarPostInput {
  subscription_tier: SubscriptionTier;
  platform: ContentPlatform;
  scheduled_date: string; // ISO timestamp
  original_caption: string;
  current_caption?: string; // Optional, defaults to original_caption
  image_url?: string;
  ai_generated?: boolean; // Defaults to true
}

/**
 * Form data for updating an existing post
 */
export interface UpdateContentCalendarPostInput {
  platform?: ContentPlatform;
  scheduled_date?: string;
  status?: PostStatus;
  current_caption?: string;
  image_url?: string;
}

/**
 * Form data for creating a new revision
 */
export interface CreateContentCalendarRevisionInput {
  post_id: string;
  caption: string;
  revision_number: number;
}

/**
 * Form data for creating a new comment
 */
export interface CreateContentCalendarCommentInput {
  post_id: string;
  comment: string;
}

/**
 * Form data for uploading an image
 */
export interface CreateContentCalendarImageInput {
  post_id: string;
  file: File;
  file_name: string;
}

// ============================================================================
// FILTER AND QUERY TYPES
// ============================================================================

/**
 * Filters for querying posts
 */
export interface ContentCalendarPostFilters {
  user_id?: string;
  subscription_tier?: SubscriptionTier;
  platform?: ContentPlatform;
  status?: PostStatus;
  scheduled_date_from?: string;
  scheduled_date_to?: string;
  ai_generated?: boolean;
  search?: string; // Search in captions
}

/**
 * Sorting options for posts
 */
export interface ContentCalendarPostSort {
  field: 'scheduled_date' | 'created_at' | 'updated_at';
  direction: 'asc' | 'desc';
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ============================================================================
// CALENDAR VIEW TYPES
// ============================================================================

/**
 * Calendar month view data
 */
export interface CalendarMonth {
  year: number;
  month: number; // 0-11 (JavaScript Date convention)
  weeks: CalendarWeek[];
}

/**
 * Calendar week view data
 */
export interface CalendarWeek {
  days: CalendarDay[];
}

/**
 * Calendar day with posts
 */
export interface CalendarDay {
  date: Date;
  posts: ContentCalendarPost[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

// ============================================================================
// SUBSCRIPTION TIER LIMITS
// ============================================================================

/**
 * Feature limits by subscription tier
 */
export interface SubscriptionTierLimits {
  max_posts_per_month: number;
  max_revisions_per_post: number;
  max_images_per_post: number;
  platforms_allowed: ContentPlatform[];
  ai_generation_limit: number | null; // null = unlimited
  storage_limit_mb: number;
}

/**
 * Subscription tier limits configuration
 */
export const SUBSCRIPTION_TIER_LIMITS: Record<SubscriptionTier, SubscriptionTierLimits> = {
  starter: {
    max_posts_per_month: 30,
    max_revisions_per_post: 3,
    max_images_per_post: 1,
    platforms_allowed: ['facebook', 'instagram'],
    ai_generation_limit: 50,
    storage_limit_mb: 100,
  },
  growth: {
    max_posts_per_month: 100,
    max_revisions_per_post: 10,
    max_images_per_post: 3,
    platforms_allowed: ['facebook', 'instagram', 'linkedin'],
    ai_generation_limit: 200,
    storage_limit_mb: 500,
  },
  pro: {
    max_posts_per_month: 500,
    max_revisions_per_post: 50,
    max_images_per_post: 10,
    platforms_allowed: ['facebook', 'instagram', 'linkedin', 'twitter'],
    ai_generation_limit: null,
    storage_limit_mb: 2000,
  },
};

// ============================================================================
// PLATFORM CONFIGURATION
// ============================================================================

/**
 * Platform-specific configuration
 */
export interface PlatformConfig {
  name: string;
  color: string;
  icon: string;
  max_caption_length: number;
  supports_images: boolean;
  image_aspect_ratios: string[];
  hashtag_limit: number;
}

/**
 * Platform configurations
 */
export const PLATFORM_CONFIGS: Record<ContentPlatform, PlatformConfig> = {
  facebook: {
    name: 'Facebook',
    color: '#1877F2',
    icon: 'facebook',
    max_caption_length: 63206,
    supports_images: true,
    image_aspect_ratios: ['1:1', '16:9', '9:16'],
    hashtag_limit: 30,
  },
  instagram: {
    name: 'Instagram',
    color: '#E4405F',
    icon: 'instagram',
    max_caption_length: 2200,
    supports_images: true,
    image_aspect_ratios: ['1:1', '4:5', '16:9'],
    hashtag_limit: 30,
  },
  linkedin: {
    name: 'LinkedIn',
    color: '#0A66C2',
    icon: 'linkedin',
    max_caption_length: 3000,
    supports_images: true,
    image_aspect_ratios: ['1.91:1', '1:1'],
    hashtag_limit: 5,
  },
  twitter: {
    name: 'Twitter/X',
    color: '#000000',
    icon: 'twitter',
    max_caption_length: 280,
    supports_images: true,
    image_aspect_ratios: ['16:9', '2:1'],
    hashtag_limit: 10,
  },
};

// ============================================================================
// AUSTRALIAN TIMEZONE UTILITIES
// ============================================================================

/**
 * Australian timezone constants
 */
export const AUSTRALIAN_TIMEZONE = 'Australia/Melbourne';

/**
 * Date/time utilities for Australian timezone
 */
export interface AustralianDateTimeUtils {
  toAustralianTime: (date: Date | string) => Date;
  fromAustralianTime: (date: Date | string) => Date;
  formatAustralianTime: (date: Date | string, format?: string) => string;
  isBusinessHours: (date: Date | string) => boolean;
  getNextBusinessDay: (date: Date | string) => Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    version: string;
  };
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult<T> {
  successful: T[];
  failed: {
    item: any;
    error: string;
  }[];
  total: number;
}

// Export constants and configurations that need to be imported as values
export { AUSTRALIAN_TIMEZONE, SUBSCRIPTION_TIER_LIMITS, PLATFORM_CONFIGS };