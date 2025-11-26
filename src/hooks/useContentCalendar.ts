/**
 * Content Calendar React Query Hooks
 * Provides data fetching, mutations, and caching for content calendar features
 * Includes optimistic updates for better UX and Australian timezone support
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type {
  ContentCalendarPost,
  ContentCalendarPostWithRelations,
  ContentCalendarRevision,
  ContentCalendarComment,
  ContentCalendarImage,
  CreateContentCalendarPostInput,
  UpdateContentCalendarPostInput,
  ContentCalendarPostFilters,
  ContentCalendarPostSort,
  PaginationParams,
  PaginatedResponse,
  PostStatus,
} from '@/types/contentCalendar';

import contentCalendarService, {
  ContentCalendarServiceError,
} from '@/services/contentCalendarService';

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Hierarchical query keys for content calendar data
 * Enables precise cache invalidation and efficient updates
 */
export const CONTENT_CALENDAR_KEYS = {
  all: ['contentCalendar'] as const,
  posts: () => [...CONTENT_CALENDAR_KEYS.all, 'posts'] as const,
  postsList: (filters?: ContentCalendarPostFilters, sort?: ContentCalendarPostSort, pagination?: PaginationParams) =>
    [...CONTENT_CALENDAR_KEYS.posts(), 'list', { filters, sort, pagination }] as const,
  postsDetail: () => [...CONTENT_CALENDAR_KEYS.posts(), 'detail'] as const,
  postDetail: (id: string) => [...CONTENT_CALENDAR_KEYS.postsDetail(), id] as const,
  revisions: (postId: string) => [...CONTENT_CALENDAR_KEYS.postDetail(postId), 'revisions'] as const,
  comments: (postId: string) => [...CONTENT_CALENDAR_KEYS.postDetail(postId), 'comments'] as const,
  images: (postId: string) => [...CONTENT_CALENDAR_KEYS.postDetail(postId), 'images'] as const,
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Handle service errors and show appropriate toast notifications
 */
const useErrorHandler = () => {
  const { toast } = useToast();

  return (error: any, defaultMessage: string = 'An unexpected error occurred') => {
    console.error('Content Calendar Error:', error);

    let errorMessage = defaultMessage;
    let errorTitle = 'Error';

    if (error instanceof ContentCalendarServiceError) {
      errorMessage = error.message;

      switch (error.code) {
        case 'MONTHLY_LIMIT_EXCEEDED':
        case 'REVISION_LIMIT_EXCEEDED':
        case 'IMAGE_LIMIT_EXCEEDED':
          errorTitle = 'Subscription Limit Reached';
          break;
        case 'NOT_FOUND':
          errorTitle = 'Content Not Found';
          break;
        case 'PERMISSION_DENIED':
          errorTitle = 'Access Denied';
          break;
        case 'VALIDATION_FAILED':
          errorTitle = 'Validation Error';
          break;
        default:
          errorTitle = 'Error';
      }
    } else if (error?.message) {
      errorMessage = error.message;
    }

    toast({
      title: errorTitle,
      description: errorMessage,
      variant: 'destructive',
    });
  };
};

/**
 * Show success toast notifications
 */
const useSuccessHandler = () => {
  const { toast } = useToast();

  return (message: string, title: string = 'Success') => {
    toast({
      title,
      description: message,
      variant: 'default',
    });
  };
};

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Hook to fetch paginated posts with filtering and sorting
 */
export function useContentPosts(
  userId: string,
  filters: ContentCalendarPostFilters = {},
  sort: ContentCalendarPostSort = { field: 'scheduled_date', direction: 'asc' },
  pagination: PaginationParams = { page: 1, limit: 10 }
) {
  const handleError = useErrorHandler();

  return useQuery({
    queryKey: CONTENT_CALENDAR_KEYS.postsList(filters, sort, pagination),
    queryFn: () => contentCalendarService.getPosts(userId, filters, sort, pagination),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry for client errors (4xx)
      if (error instanceof ContentCalendarServiceError) {
        const isClientError = ['NOT_FOUND', 'PERMISSION_DENIED', 'VALIDATION_FAILED'].includes(error.code);
        return !isClientError && failureCount < 3;
      }
      return failureCount < 3;
    },
    throwOnError: (error) => {
      handleError(error, 'Failed to load posts');
      return false;
    },
  });
}

/**
 * Hook to fetch a single post with all related data
 */
export function useContentPost(postId: string, enabled: boolean = true) {
  const handleError = useErrorHandler();

  return useQuery({
    queryKey: CONTENT_CALENDAR_KEYS.postDetail(postId),
    queryFn: () => contentCalendarService.getPostById(postId),
    enabled: enabled && !!postId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    retry: (failureCount, error) => {
      if (error instanceof ContentCalendarServiceError && error.code === 'NOT_FOUND') {
        return false; // Don't retry for 404s
      }
      return failureCount < 2;
    },
    throwOnError: (error) => {
      handleError(error, 'Failed to load post details');
      return false;
    },
  });
}

/**
 * Hook to fetch revisions for a specific post
 */
export function usePostRevisions(postId: string, enabled: boolean = true) {
  const handleError = useErrorHandler();

  return useQuery({
    queryKey: CONTENT_CALENDAR_KEYS.revisions(postId),
    queryFn: () => contentCalendarService.getPostRevisions(postId),
    enabled: enabled && !!postId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    throwOnError: (error) => {
      handleError(error, 'Failed to load revision history');
      return false;
    },
  });
}

/**
 * Hook to fetch comments for a specific post
 */
export function usePostComments(postId: string, enabled: boolean = true) {
  const handleError = useErrorHandler();

  return useQuery({
    queryKey: CONTENT_CALENDAR_KEYS.comments(postId),
    queryFn: () => contentCalendarService.getComments(postId),
    enabled: enabled && !!postId,
    staleTime: 1000 * 30, // 30 seconds (comments are more dynamic)
    gcTime: 1000 * 60 * 10, // 10 minutes
    throwOnError: (error) => {
      handleError(error, 'Failed to load comments');
      return false;
    },
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Hook to create a new post
 * Invalidates the posts list cache on success
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const handleSuccess = useSuccessHandler();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CreateContentCalendarPostInput }) =>
      contentCalendarService.createPost(userId, data),

    onSuccess: (newPost) => {
      // Invalidate posts list queries to trigger refetch
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.posts()
      });

      // Optionally prefetch the new post details
      queryClient.setQueryData(
        CONTENT_CALENDAR_KEYS.postDetail(newPost.id),
        newPost
      );

      handleSuccess(`Post scheduled for ${contentCalendarService.australianTimezoneUtils.formatAustralianTime(newPost.scheduled_date)}`, 'Post Created');
    },

    onError: (error) => {
      handleError(error, 'Failed to create post');
    },
  });
}

/**
 * Hook to update post caption with optimistic updates
 * Creates new revision and updates the post
 */
export function useUpdateCaption() {
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const handleSuccess = useSuccessHandler();

  return useMutation({
    mutationFn: ({ postId, newCaption, userId }: { postId: string; newCaption: string; userId: string }) =>
      contentCalendarService.updatePostCaption(postId, newCaption, userId),

    onMutate: async ({ postId, newCaption }) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: CONTENT_CALENDAR_KEYS.postDetail(postId) });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<ContentCalendarPostWithRelations>(
        CONTENT_CALENDAR_KEYS.postDetail(postId)
      );

      // Optimistically update the post
      if (previousPost) {
        queryClient.setQueryData<ContentCalendarPostWithRelations>(
          CONTENT_CALENDAR_KEYS.postDetail(postId),
          {
            ...previousPost,
            current_caption: newCaption,
            updated_at: new Date().toISOString(),
          }
        );
      }

      return { previousPost };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(
          CONTENT_CALENDAR_KEYS.postDetail(variables.postId),
          context.previousPost
        );
      }
      handleError(error, 'Failed to update caption');
    },

    onSuccess: ({ post, revision }, { postId }) => {
      // Update post data with server response
      queryClient.setQueryData(CONTENT_CALENDAR_KEYS.postDetail(postId), post);

      // Invalidate revisions to show the new one
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.revisions(postId)
      });

      // Invalidate posts list in case the caption is shown there
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.posts()
      });

      handleSuccess('Caption updated successfully');
    },

    onSettled: (data, error, { postId }) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.postDetail(postId)
      });
    },
  });
}

/**
 * Hook to update post status
 */
export function useUpdateStatus() {
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const handleSuccess = useSuccessHandler();

  return useMutation({
    mutationFn: ({ postId, newStatus }: { postId: string; newStatus: PostStatus }) =>
      contentCalendarService.updatePostStatus(postId, newStatus),

    onMutate: async ({ postId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: CONTENT_CALENDAR_KEYS.postDetail(postId) });

      const previousPost = queryClient.getQueryData<ContentCalendarPostWithRelations>(
        CONTENT_CALENDAR_KEYS.postDetail(postId)
      );

      if (previousPost) {
        queryClient.setQueryData<ContentCalendarPostWithRelations>(
          CONTENT_CALENDAR_KEYS.postDetail(postId),
          {
            ...previousPost,
            status: newStatus,
            updated_at: new Date().toISOString(),
          }
        );
      }

      return { previousPost };
    },

    onError: (error, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(
          CONTENT_CALENDAR_KEYS.postDetail(variables.postId),
          context.previousPost
        );
      }
      handleError(error, 'Failed to update post status');
    },

    onSuccess: (updatedPost, { postId }) => {
      queryClient.setQueryData(CONTENT_CALENDAR_KEYS.postDetail(postId), updatedPost);

      // Invalidate posts list as status change affects filtering
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.posts()
      });

      const statusMessages = {
        draft: 'Post saved as draft',
        scheduled: 'Post scheduled for publication',
        published: 'Post published successfully',
        cancelled: 'Post cancelled',
      };

      handleSuccess(statusMessages[updatedPost.status] || 'Status updated');
    },

    onSettled: (data, error, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.postDetail(postId)
      });
    },
  });
}

/**
 * Hook to upload image with progress tracking
 */
export function useUploadImage() {
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const handleSuccess = useSuccessHandler();

  return useMutation({
    mutationFn: ({ postId, file, userId }: { postId: string; file: File; userId: string }) =>
      contentCalendarService.uploadPostImage(postId, file, userId),

    onSuccess: (uploadedImage, { postId }) => {
      // Update the post's images in cache
      queryClient.setQueryData<ContentCalendarPostWithRelations>(
        CONTENT_CALENDAR_KEYS.postDetail(postId),
        (oldPost) => {
          if (!oldPost) return oldPost;
          return {
            ...oldPost,
            images: [...(oldPost.images || []), uploadedImage],
          };
        }
      );

      // Invalidate images query specifically
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.images(postId)
      });

      handleSuccess(`Image "${uploadedImage.file_name}" uploaded successfully`);
    },

    onError: (error) => {
      handleError(error, 'Failed to upload image');
    },
  });
}

/**
 * Hook to delete an image
 */
export function useDeleteImage() {
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const handleSuccess = useSuccessHandler();

  return useMutation({
    mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) =>
      contentCalendarService.deletePostImage(postId, imageId),

    onMutate: async ({ postId, imageId }) => {
      await queryClient.cancelQueries({ queryKey: CONTENT_CALENDAR_KEYS.postDetail(postId) });

      const previousPost = queryClient.getQueryData<ContentCalendarPostWithRelations>(
        CONTENT_CALENDAR_KEYS.postDetail(postId)
      );

      // Optimistically remove the image
      if (previousPost?.images) {
        queryClient.setQueryData<ContentCalendarPostWithRelations>(
          CONTENT_CALENDAR_KEYS.postDetail(postId),
          {
            ...previousPost,
            images: previousPost.images.filter(img => img.id !== imageId),
          }
        );
      }

      return { previousPost };
    },

    onError: (error, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(
          CONTENT_CALENDAR_KEYS.postDetail(variables.postId),
          context.previousPost
        );
      }
      handleError(error, 'Failed to delete image');
    },

    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.images(postId)
      });

      handleSuccess('Image deleted successfully');
    },

    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.postDetail(postId)
      });
    },
  });
}

/**
 * Hook to add a comment with optimistic updates
 */
export function useAddComment() {
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const handleSuccess = useSuccessHandler();

  return useMutation({
    mutationFn: ({ postId, userId, comment }: { postId: string; userId: string; comment: string }) =>
      contentCalendarService.addComment(postId, userId, comment),

    onMutate: async ({ postId, userId, comment }) => {
      await queryClient.cancelQueries({ queryKey: CONTENT_CALENDAR_KEYS.comments(postId) });

      const previousComments = queryClient.getQueryData<ContentCalendarComment[]>(
        CONTENT_CALENDAR_KEYS.comments(postId)
      );

      // Create optimistic comment
      const optimisticComment: ContentCalendarComment = {
        id: `temp-${Date.now()}`,
        post_id: postId,
        user_id: userId,
        comment,
        created_at: new Date().toISOString(),
      };

      // Optimistically add the comment
      queryClient.setQueryData<ContentCalendarComment[]>(
        CONTENT_CALENDAR_KEYS.comments(postId),
        (old) => [...(old || []), optimisticComment]
      );

      // Update comment count in post
      queryClient.setQueryData<ContentCalendarPostWithRelations>(
        CONTENT_CALENDAR_KEYS.postDetail(postId),
        (oldPost) => {
          if (!oldPost) return oldPost;
          return {
            ...oldPost,
            comment_count: (oldPost.comment_count || 0) + 1,
            comments: [...(oldPost.comments || []), optimisticComment],
          };
        }
      );

      return { previousComments };
    },

    onError: (error, { postId }, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          CONTENT_CALENDAR_KEYS.comments(postId),
          context.previousComments
        );
      }
      handleError(error, 'Failed to add comment');
    },

    onSuccess: (newComment, { postId }) => {
      // Replace optimistic comment with real one
      queryClient.setQueryData<ContentCalendarComment[]>(
        CONTENT_CALENDAR_KEYS.comments(postId),
        (old) => {
          if (!old) return [newComment];
          // Remove temp comment and add real one
          const withoutTemp = old.filter(c => !c.id.startsWith('temp-'));
          return [...withoutTemp, newComment];
        }
      );

      handleSuccess('Comment added successfully');
    },

    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.comments(postId)
      });
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.postDetail(postId)
      });
    },
  });
}

/**
 * Hook to delete a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const handleSuccess = useSuccessHandler();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string }) =>
      contentCalendarService.deleteComment(commentId),

    onSuccess: (_, { commentId }) => {
      // Find and invalidate all related queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return key.includes('comments') || key.includes('detail');
        },
      });

      handleSuccess('Comment deleted successfully');
    },

    onError: (error) => {
      handleError(error, 'Failed to delete comment');
    },
  });
}

/**
 * Hook to delete a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const handleSuccess = useSuccessHandler();

  return useMutation({
    mutationFn: ({ postId }: { postId: string }) =>
      contentCalendarService.deletePost(postId),

    onSuccess: (_, { postId }) => {
      // Remove post from cache
      queryClient.removeQueries({
        queryKey: CONTENT_CALENDAR_KEYS.postDetail(postId)
      });

      // Invalidate posts list
      queryClient.invalidateQueries({
        queryKey: CONTENT_CALENDAR_KEYS.posts()
      });

      handleSuccess('Post deleted successfully');
    },

    onError: (error) => {
      handleError(error, 'Failed to delete post');
    },
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to invalidate all content calendar caches
 * Useful for global refresh or when user changes
 */
export function useInvalidateContentCalendar() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: CONTENT_CALENDAR_KEYS.all
    });
  };
}

/**
 * Hook to get cached posts count for different statuses
 * Useful for dashboard metrics without additional API calls
 */
export function useCachedPostsStats(userId: string) {
  const queryClient = useQueryClient();

  const getCachedStats = () => {
    const cachedQueries = queryClient.getQueriesData({
      queryKey: CONTENT_CALENDAR_KEYS.posts()
    });

    let totalPosts = 0;
    const statusCounts = {
      draft: 0,
      scheduled: 0,
      published: 0,
      cancelled: 0,
    };

    cachedQueries.forEach(([_, data]) => {
      if (data && typeof data === 'object' && 'data' in data) {
        const posts = (data as PaginatedResponse<ContentCalendarPostWithRelations>).data;
        posts.forEach(post => {
          if (post.user_id === userId) {
            totalPosts++;
            statusCounts[post.status]++;
          }
        });
      }
    });

    return { totalPosts, statusCounts };
  };

  return getCachedStats;
}

// Export all hooks and utilities
export default {
  // Query hooks
  useContentPosts,
  useContentPost,
  usePostRevisions,
  usePostComments,

  // Mutation hooks
  useCreatePost,
  useUpdateCaption,
  useUpdateStatus,
  useUploadImage,
  useDeleteImage,
  useAddComment,
  useDeleteComment,
  useDeletePost,

  // Utility hooks
  useInvalidateContentCalendar,
  useCachedPostsStats,

  // Constants
  CONTENT_CALENDAR_KEYS,
};