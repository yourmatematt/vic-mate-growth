/**
 * Content Calendar Service
 * API layer for content calendar operations
 * Handles CRUD operations for posts, revisions, comments, and related data
 * Includes Australian timezone support for scheduling
 */

import { supabase } from '@/lib/supabase';
import type {
  ContentCalendarPost,
  ContentCalendarRevision,
  ContentCalendarComment,
  ContentCalendarImage,
  ContentCalendarPostWithRelations,
  CreateContentCalendarPostInput,
  UpdateContentCalendarPostInput,
  CreateContentCalendarRevisionInput,
  CreateContentCalendarCommentInput,
  ContentCalendarPostFilters,
  ContentCalendarPostSort,
  PaginationParams,
  PaginatedResponse,
  PostStatus,
  ApiResponse,
  SubscriptionTier,
} from '@/types/contentCalendar';

import {
  AUSTRALIAN_TIMEZONE,
  SUBSCRIPTION_TIER_LIMITS,
} from '@/types/contentCalendar';

/**
 * Custom error class for content calendar operations
 */
class ContentCalendarServiceError extends Error {
  public code: string;
  public field?: string;
  public details?: any;

  constructor(message: string, code: string, field?: string, details?: any) {
    super(message);
    this.name = 'ContentCalendarServiceError';
    this.code = code;
    this.field = field;
    this.details = details;
  }
}

/**
 * Handle Supabase errors and convert to ContentCalendarServiceError
 */
const handleSupabaseError = (error: any, operation: string): never => {
  console.error(`Content Calendar Service ${operation} Error:`, error);

  let errorMessage = 'An unexpected error occurred';
  let errorCode = 'UNKNOWN_ERROR';

  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        errorMessage = 'The requested content was not found';
        errorCode = 'NOT_FOUND';
        break;
      case '23505':
        errorMessage = 'This content already exists';
        errorCode = 'DUPLICATE_CONTENT';
        break;
      case '23503':
        errorMessage = 'Invalid reference to another resource';
        errorCode = 'INVALID_REFERENCE';
        break;
      case 'PGRST301':
        errorMessage = 'You do not have permission to access this content';
        errorCode = 'PERMISSION_DENIED';
        break;
      default:
        errorMessage = error.message || 'Database operation failed';
        errorCode = error.code;
    }
  }

  throw new ContentCalendarServiceError(errorMessage, errorCode, undefined, error);
};

/**
 * Australian timezone utilities
 */
export const australianTimezoneUtils = {
  /**
   * Convert date to Australian timezone
   */
  toAustralianTime: (date: Date | string): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Date(dateObj.toLocaleString('en-AU', { timeZone: AUSTRALIAN_TIMEZONE }));
  },

  /**
   * Format date in Australian timezone
   */
  formatAustralianTime: (date: Date | string, format: string = 'dd/MM/yyyy h:mm a'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('en-AU', {
      timeZone: AUSTRALIAN_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },

  /**
   * Check if date/time is during Australian business hours (9 AM - 5 PM AEST/AEDT)
   */
  isBusinessHours: (date: Date | string): boolean => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const ausTime = new Date(dateObj.toLocaleString('en-AU', { timeZone: AUSTRALIAN_TIMEZONE }));
    const hours = ausTime.getHours();
    const day = ausTime.getDay();

    // Monday to Friday, 9 AM to 5 PM
    return day >= 1 && day <= 5 && hours >= 9 && hours < 17;
  },

  /**
   * Get next business day in Australian timezone
   */
  getNextBusinessDay: (date: Date | string): Date => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const nextDay = new Date(dateObj);

    do {
      nextDay.setDate(nextDay.getDate() + 1);
      const ausDay = new Date(nextDay.toLocaleString('en-AU', { timeZone: AUSTRALIAN_TIMEZONE })).getDay();
      if (ausDay >= 1 && ausDay <= 5) break; // Monday to Friday
    } while (true);

    return nextDay;
  },
};

/**
 * Validate subscription tier limits
 */
const validateSubscriptionLimits = async (
  userId: string,
  subscriptionTier: SubscriptionTier,
  operation: 'create_post' | 'add_revision' | 'upload_image',
  postId?: string
): Promise<void> => {
  const limits = SUBSCRIPTION_TIER_LIMITS[subscriptionTier];
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

  switch (operation) {
    case 'create_post': {
      // Check monthly post limit
      const { count: monthlyPosts } = await supabase
        .from('content_calendar_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', `${currentMonth}-01`)
        .lt('created_at', `${currentMonth}-31`);

      if (monthlyPosts && monthlyPosts >= limits.max_posts_per_month) {
        throw new ContentCalendarServiceError(
          `You've reached your monthly limit of ${limits.max_posts_per_month} posts for the ${subscriptionTier} plan`,
          'MONTHLY_LIMIT_EXCEEDED'
        );
      }
      break;
    }

    case 'add_revision': {
      if (!postId) return;

      // Check revision limit per post
      const { count: revisionCount } = await supabase
        .from('content_calendar_revisions')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (revisionCount && revisionCount >= limits.max_revisions_per_post) {
        throw new ContentCalendarServiceError(
          `You've reached the maximum of ${limits.max_revisions_per_post} revisions for this post on the ${subscriptionTier} plan`,
          'REVISION_LIMIT_EXCEEDED'
        );
      }
      break;
    }

    case 'upload_image': {
      if (!postId) return;

      // Check image limit per post
      const { count: imageCount } = await supabase
        .from('content_calendar_images')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (imageCount && imageCount >= limits.max_images_per_post) {
        throw new ContentCalendarServiceError(
          `You've reached the maximum of ${limits.max_images_per_post} images for this post on the ${subscriptionTier} plan`,
          'IMAGE_LIMIT_EXCEEDED'
        );
      }
      break;
    }
  }
};

// ============================================================================
// POST OPERATIONS
// ============================================================================

/**
 * Get posts with optional filters and pagination
 */
export async function getPosts(
  userId: string,
  filters: ContentCalendarPostFilters = {},
  sort: ContentCalendarPostSort = { field: 'scheduled_date', direction: 'asc' },
  pagination: PaginationParams = { page: 1, limit: 10 }
): Promise<PaginatedResponse<ContentCalendarPostWithRelations>> {
  try {
    let query = supabase
      .from('content_calendar_posts')
      .select(`
        *,
        revisions:content_calendar_revisions(*),
        comments:content_calendar_comments(*, user:user_profiles(id, email, role)),
        images:content_calendar_images(*)
      `, { count: 'exact' });

    // Apply filters
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    } else {
      query = query.eq('user_id', userId);
    }

    if (filters.subscription_tier) {
      query = query.eq('subscription_tier', filters.subscription_tier);
    }

    if (filters.platform) {
      query = query.eq('platform', filters.platform);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.scheduled_date_from) {
      query = query.gte('scheduled_date', filters.scheduled_date_from);
    }

    if (filters.scheduled_date_to) {
      query = query.lte('scheduled_date', filters.scheduled_date_to);
    }

    if (filters.ai_generated !== undefined) {
      query = query.eq('ai_generated', filters.ai_generated);
    }

    if (filters.search) {
      query = query.or(`original_caption.ilike.%${filters.search}%,current_caption.ilike.%${filters.search}%`);
    }

    // Apply sorting
    query = query.order(sort.field, { ascending: sort.direction === 'asc' });

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit;
    query = query.range(offset, offset + pagination.limit - 1);

    const { data, error, count } = await query;

    if (error) {
      handleSupabaseError(error, 'getPosts');
    }

    // Add computed fields
    const postsWithExtras = data?.map(post => ({
      ...post,
      latest_revision: post.revisions?.[post.revisions.length - 1],
      comment_count: post.comments?.length || 0,
    })) || [];

    const total = count || 0;
    const pages = Math.ceil(total / pagination.limit);

    return {
      data: postsWithExtras,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages,
      },
    };
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'getPosts');
  }
}

/**
 * Get a single post by ID with all relations
 */
export async function getPostById(postId: string): Promise<ContentCalendarPostWithRelations> {
  try {
    const { data, error } = await supabase
      .from('content_calendar_posts')
      .select(`
        *,
        revisions:content_calendar_revisions(*),
        comments:content_calendar_comments(*, user:user_profiles(id, email, role)),
        images:content_calendar_images(*)
      `)
      .eq('id', postId)
      .single();

    if (error) {
      handleSupabaseError(error, 'getPostById');
    }

    if (!data) {
      throw new ContentCalendarServiceError(
        'Post not found',
        'NOT_FOUND'
      );
    }

    return {
      ...data,
      latest_revision: data.revisions?.[data.revisions.length - 1],
      comment_count: data.comments?.length || 0,
    };
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'getPostById');
  }
}

/**
 * Create a new post
 */
export async function createPost(
  userId: string,
  data: CreateContentCalendarPostInput
): Promise<ContentCalendarPost> {
  try {
    // Validate subscription limits
    await validateSubscriptionLimits(userId, data.subscription_tier, 'create_post');

    const postData = {
      user_id: userId,
      subscription_tier: data.subscription_tier,
      platform: data.platform,
      scheduled_date: data.scheduled_date,
      original_caption: data.original_caption,
      current_caption: data.current_caption || data.original_caption,
      image_url: data.image_url || null,
      ai_generated: data.ai_generated ?? true,
    };

    const { data: newPost, error } = await supabase
      .from('content_calendar_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'createPost');
    }

    // Create initial revision
    if (newPost) {
      await createRevision(newPost.id, userId, {
        post_id: newPost.id,
        caption: newPost.current_caption,
        revision_number: 1,
      });
    }

    return newPost!;
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'createPost');
  }
}

/**
 * Update post caption and create revision
 */
export async function updatePostCaption(
  postId: string,
  newCaption: string,
  userId: string
): Promise<{ post: ContentCalendarPost; revision: ContentCalendarRevision }> {
  try {
    // Get current post to validate ownership
    const post = await getPostById(postId);

    // Validate subscription limits
    await validateSubscriptionLimits(userId, post.subscription_tier, 'add_revision', postId);

    // Update post caption
    const { data: updatedPost, error: updateError } = await supabase
      .from('content_calendar_posts')
      .update({
        current_caption: newCaption,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single();

    if (updateError) {
      handleSupabaseError(updateError, 'updatePostCaption');
    }

    // Get next revision number
    const { count: revisionCount } = await supabase
      .from('content_calendar_revisions')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    const nextRevisionNumber = (revisionCount || 0) + 1;

    // Create revision
    const revision = await createRevision(postId, userId, {
      post_id: postId,
      caption: newCaption,
      revision_number: nextRevisionNumber,
    });

    return {
      post: updatedPost!,
      revision,
    };
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'updatePostCaption');
  }
}

/**
 * Update post status
 */
export async function updatePostStatus(
  postId: string,
  newStatus: PostStatus
): Promise<ContentCalendarPost> {
  try {
    const { data: updatedPost, error } = await supabase
      .from('content_calendar_posts')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'updatePostStatus');
    }

    return updatedPost!;
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'updatePostStatus');
  }
}

/**
 * Delete a post and all related data
 */
export async function deletePost(postId: string): Promise<void> {
  try {
    // Delete images from storage first
    const { data: images } = await supabase
      .from('content_calendar_images')
      .select('storage_path')
      .eq('post_id', postId);

    if (images) {
      for (const image of images) {
        await supabase.storage
          .from('content-calendar-images')
          .remove([image.storage_path]);
      }
    }

    // Delete post (cascading will handle related records)
    const { error } = await supabase
      .from('content_calendar_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      handleSupabaseError(error, 'deletePost');
    }
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'deletePost');
  }
}

// ============================================================================
// REVISION OPERATIONS
// ============================================================================

/**
 * Create a new revision
 */
export async function createRevision(
  postId: string,
  userId: string,
  data: CreateContentCalendarRevisionInput
): Promise<ContentCalendarRevision> {
  try {
    const { data: revision, error } = await supabase
      .from('content_calendar_revisions')
      .insert({
        post_id: postId,
        user_id: userId,
        caption: data.caption,
        revision_number: data.revision_number,
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'createRevision');
    }

    return revision!;
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'createRevision');
  }
}

/**
 * Get all revisions for a post
 */
export async function getPostRevisions(postId: string): Promise<ContentCalendarRevision[]> {
  try {
    const { data: revisions, error } = await supabase
      .from('content_calendar_revisions')
      .select(`
        *,
        user:user_profiles(id, email, role)
      `)
      .eq('post_id', postId)
      .order('revision_number', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'getPostRevisions');
    }

    return revisions || [];
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'getPostRevisions');
  }
}

// ============================================================================
// COMMENT OPERATIONS
// ============================================================================

/**
 * Add a comment to a post
 */
export async function addComment(
  postId: string,
  userId: string,
  comment: string
): Promise<ContentCalendarComment> {
  try {
    const { data: newComment, error } = await supabase
      .from('content_calendar_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        comment,
      })
      .select(`
        *,
        user:user_profiles(id, email, role)
      `)
      .single();

    if (error) {
      handleSupabaseError(error, 'addComment');
    }

    return newComment!;
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'addComment');
  }
}

/**
 * Get all comments for a post
 */
export async function getComments(postId: string): Promise<ContentCalendarComment[]> {
  try {
    const { data: comments, error } = await supabase
      .from('content_calendar_comments')
      .select(`
        *,
        user:user_profiles(id, email, role)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      handleSupabaseError(error, 'getComments');
    }

    return comments || [];
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'getComments');
  }
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('content_calendar_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      handleSupabaseError(error, 'deleteComment');
    }
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'deleteComment');
  }
}

// ============================================================================
// IMAGE OPERATIONS (delegated to imageUploadService)
// ============================================================================

/**
 * Upload an image for a post
 * Note: This delegates to the imageUploadService for actual file handling
 */
export async function uploadPostImage(
  postId: string,
  file: File,
  userId: string
): Promise<ContentCalendarImage> {
  try {
    // Import imageUploadService dynamically to avoid circular dependencies
    const { uploadToStorage, validateImageFile } = await import('./imageUploadService');

    // Get post to validate subscription limits
    const post = await getPostById(postId);
    await validateSubscriptionLimits(userId, post.subscription_tier, 'upload_image', postId);

    // Validate file
    await validateImageFile(file);

    // Generate storage path
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const storagePath = `${userId}/${postId}/${fileName}`;

    // Upload to storage
    const { publicUrl } = await uploadToStorage(file, 'content-calendar-images', storagePath);

    // Save image record
    const { data: image, error } = await supabase
      .from('content_calendar_images')
      .insert({
        post_id: postId,
        user_id: userId,
        storage_path: storagePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (error) {
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('content-calendar-images')
        .remove([storagePath]);

      handleSupabaseError(error, 'uploadPostImage');
    }

    return image!;
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'uploadPostImage');
  }
}

/**
 * Delete an image from a post
 */
export async function deletePostImage(postId: string, imageId: string): Promise<void> {
  try {
    // Get image record
    const { data: image, error: fetchError } = await supabase
      .from('content_calendar_images')
      .select('storage_path')
      .eq('id', imageId)
      .eq('post_id', postId)
      .single();

    if (fetchError) {
      handleSupabaseError(fetchError, 'deletePostImage');
    }

    if (!image) {
      throw new ContentCalendarServiceError('Image not found', 'NOT_FOUND');
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('content-calendar-images')
      .remove([image.storage_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete database record
    const { error } = await supabase
      .from('content_calendar_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      handleSupabaseError(error, 'deletePostImage');
    }
  } catch (error) {
    if (error instanceof ContentCalendarServiceError) throw error;
    handleSupabaseError(error, 'deletePostImage');
  }
}

// ============================================================================
// EXPORT SERVICE FUNCTIONS
// ============================================================================

export {
  ContentCalendarServiceError,
  type PaginatedResponse,
};

// Export all functions for easy importing
export default {
  // Post operations
  getPosts,
  getPostById,
  createPost,
  updatePostCaption,
  updatePostStatus,
  deletePost,

  // Revision operations
  getPostRevisions,
  createRevision,

  // Comment operations
  addComment,
  getComments,
  deleteComment,

  // Image operations
  uploadPostImage,
  deletePostImage,

  // Utility functions
  australianTimezoneUtils,
  validateSubscriptionLimits,
};