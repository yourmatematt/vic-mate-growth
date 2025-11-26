/**
 * Content Calendar Grid Component
 * Mobile-first calendar view for Australian small business owners
 * Shows upcoming social media posts with mate-like, simple interface
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Eye,
  Edit3,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useContentPosts } from '@/hooks/useContentCalendar';
import { australianTimezoneUtils } from '@/services/contentCalendarService';
import type {
  ContentCalendarPostWithRelations,
  ContentPlatform,
  PostStatus,
  SubscriptionTier,
  ContentCalendarPostFilters,
} from '@/types/contentCalendar';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface ContentCalendarGridProps {
  userId: string;
  subscriptionTier: SubscriptionTier;
  onPostClick: (postId: string) => void;
}

interface CalendarDay {
  date: Date;
  posts: ContentCalendarPostWithRelations[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

// ============================================================================
// PLATFORM CONFIGURATION
// ============================================================================

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
} as const;

const platformColors = {
  facebook: 'bg-blue-500 hover:bg-blue-600',
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
  linkedin: 'bg-blue-600 hover:bg-blue-700',
  twitter: 'bg-gray-900 hover:bg-black',
} as const;

const statusConfig = {
  draft: {
    icon: Edit3,
    label: 'Draft',
    color: 'bg-gray-500 hover:bg-gray-600',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  scheduled: {
    icon: Clock,
    label: 'Scheduled',
    color: 'bg-orange-500 hover:bg-orange-600',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
  },
  published: {
    icon: CheckCircle,
    label: 'Live',
    color: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'bg-red-500 hover:bg-red-600',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
  },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate calendar days for the next 30 days
 */
const generateCalendarDays = (
  posts: ContentCalendarPostWithRelations[]
): CalendarDay[] => {
  const today = new Date();
  const days: CalendarDay[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Get posts for this day
    const dayPosts = posts.filter(post => {
      const postDate = new Date(post.scheduled_date);
      return (
        postDate.getDate() === date.getDate() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getFullYear() === date.getFullYear()
      );
    });

    days.push({
      date,
      posts: dayPosts,
      isCurrentMonth: true,
      isToday: i === 0,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    });
  }

  return days;
};

/**
 * Format date for Australian users
 */
const formatDateAustralian = (date: Date): string => {
  return date.toLocaleDateString('en-AU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

/**
 * Get friendly time description
 */
const getFriendlyTimeDescription = (date: Date): string => {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  return formatDateAustralian(date);
};

// ============================================================================
// SUB COMPONENTS
// ============================================================================

/**
 * Platform icon component
 */
const PlatformIcon: React.FC<{
  platform: ContentPlatform;
  size?: 'sm' | 'md' | 'lg'
}> = ({ platform, size = 'md' }) => {
  const Icon = platformIcons[platform];
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className={`inline-flex items-center justify-center rounded-full p-1.5 text-white ${platformColors[platform]}`}>
      <Icon className={sizeClasses[size]} />
    </div>
  );
};

/**
 * Status badge component
 */
const StatusBadge: React.FC<{ status: PostStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm'
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={`${config.bgColor} ${config.textColor} border-none ${size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
    >
      <Icon className={`w-3 h-3 mr-1 ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      {config.label}
    </Badge>
  );
};

/**
 * Post card component for mobile display
 */
const PostCard: React.FC<{
  post: ContentCalendarPostWithRelations;
  onClick: () => void;
}> = ({ post, onClick }) => {
  const scheduledTime = australianTimezoneUtils.formatAustralianTime(
    post.scheduled_date,
    'h:mm a'
  );

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-orange-200 bg-white border border-gray-200"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={post.platform} size="sm" />
            <span className="text-xs font-medium text-gray-600">{scheduledTime}</span>
          </div>
          <StatusBadge status={post.status} size="sm" />
        </div>

        <p className="text-sm text-gray-800 mb-2 overflow-hidden" style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical' as const,
          lineHeight: '1.4em',
          maxHeight: '4.2em'
        }}>
          {post.current_caption}
        </p>

        {post.image_url && (
          <div className="w-full h-24 bg-gray-100 rounded-md mb-2 overflow-hidden">
            <img
              src={post.image_url}
              alt="Post preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {post.ai_generated && (
              <Badge variant="outline" className="text-xs">
                AI Generated
              </Badge>
            )}
            {(post.comment_count || 0) > 0 && (
              <span>{post.comment_count} comment{post.comment_count !== 1 ? 's' : ''}</span>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Empty state component
 */
const EmptyState: React.FC<{
  hasFilters: boolean;
  subscriptionTier: SubscriptionTier;
}> = ({ hasFilters, subscriptionTier }) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No posts match your filters
        </h3>
        <p className="text-gray-500 mb-4">
          Try adjusting your platform or status filters to see more content.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-6" />
      <h3 className="text-xl font-semibold text-gray-700 mb-3">
        G'day! Ready to get started?
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Your content calendar is looking a bit empty. Let's create your first social media post to get things rolling!
      </p>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 max-w-sm mx-auto">
        <p className="text-sm text-orange-800">
          <strong>Your {subscriptionTier} plan includes:</strong><br />
          {subscriptionTier === 'starter' && '30 posts per month'}
          {subscriptionTier === 'growth' && '100 posts per month'}
          {subscriptionTier === 'pro' && '500 posts per month'}
        </p>
      </div>

      <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Post
      </Button>
    </div>
  );
};

/**
 * Loading skeleton component
 */
const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex gap-4 mb-6">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-10 w-32" />
    </div>
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ContentCalendarGrid: React.FC<ContentCalendarGridProps> = ({
  userId,
  subscriptionTier,
  onPostClick,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<ContentPlatform | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<PostStatus | 'all'>('all');

  // Build filters
  const filters = useMemo<ContentCalendarPostFilters>(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return {
      user_id: userId,
      scheduled_date_from: now.toISOString(),
      scheduled_date_to: thirtyDaysFromNow.toISOString(),
      ...(selectedPlatform !== 'all' && { platform: selectedPlatform }),
      ...(selectedStatus !== 'all' && { status: selectedStatus }),
    };
  }, [userId, selectedPlatform, selectedStatus]);

  // Fetch posts
  const {
    data: postsResponse,
    isLoading,
    error
  } = useContentPosts(
    userId,
    filters,
    { field: 'scheduled_date', direction: 'asc' },
    { page: 1, limit: 100 } // Get more posts for calendar view
  );

  const posts = postsResponse?.data || [];
  const calendarDays = useMemo(() => generateCalendarDays(posts), [posts]);
  const hasFilters = selectedPlatform !== 'all' || selectedStatus !== 'all';

  // Error state
  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Oops! Having trouble loading your content calendar. Give it another go in a tick.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Your Content Calendar
        </h2>
        <p className="text-gray-600">
          G'day! Here's what's coming up over the next 30 days.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Select
          value={selectedPlatform}
          onValueChange={(value) => setSelectedPlatform(value as ContentPlatform | 'all')}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="twitter">Twitter</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as PostStatus | 'all')}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Live</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedPlatform('all');
              setSelectedStatus('all');
            }}
            className="w-full sm:w-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Loading state */}
      {isLoading && <LoadingSkeleton />}

      {/* Content */}
      {!isLoading && (
        <>
          {posts.length === 0 ? (
            <EmptyState hasFilters={hasFilters} subscriptionTier={subscriptionTier} />
          ) : (
            <div className="space-y-6">
              {calendarDays
                .filter(day => day.posts.length > 0)
                .map(day => (
                  <div key={day.date.toISOString()} className="mb-8">
                    {/* Date Header */}
                    <div className="sticky top-0 bg-white/90 backdrop-blur-sm z-10 pb-3 mb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {day.isToday && (
                            <Badge className="mr-2 bg-orange-600 hover:bg-orange-700">
                              Today
                            </Badge>
                          )}
                          {formatDateAustralian(day.date)}
                          {day.isWeekend && !day.isToday && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Weekend
                            </Badge>
                          )}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {day.posts.length} post{day.posts.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Posts for this day */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {day.posts.map(post => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onClick={() => onPostClick(post.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}

      {/* Quick stats summary */}
      {!isLoading && posts.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Quick Overview</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-600">Scheduled</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p.status === 'draft').length}
              </div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.filter(p => p.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {posts.filter(p => (p.comment_count || 0) > 0).length}
              </div>
              <div className="text-sm text-gray-600">With Comments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendarGrid;