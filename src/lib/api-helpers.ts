/**
 * API Helpers and Middleware
 *
 * Utilities for API route handlers, authentication, and response formatting
 */

import { supabase } from '@/lib/supabase';
import { CaseStudyFilters, QueryOptions } from '@/services/caseStudyService';

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

// User context interface
export interface UserContext {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

/**
 * Create a successful API response
 */
export function createApiResponse<T>(
  data: T,
  message?: string,
  pagination?: ApiResponse['pagination']
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    pagination
  };
}

/**
 * Create an error API response
 */
export function createApiError(
  message: string,
  statusCode: number = 400,
  error?: any
): { response: ApiResponse; statusCode: number } {
  console.error('API Error:', { message, statusCode, error });

  return {
    response: {
      success: false,
      error: message
    },
    statusCode
  };
}

/**
 * Validate and sanitize pagination parameters
 */
export function validatePagination(
  page?: string | number,
  pageSize?: string | number
): { page: number; pageSize: number } {
  const parsedPage = typeof page === 'string' ? parseInt(page, 10) : (page || 1);
  const parsedPageSize = typeof pageSize === 'string' ? parseInt(pageSize, 10) : (pageSize || 12);

  return {
    page: Math.max(1, isNaN(parsedPage) ? 1 : parsedPage),
    pageSize: Math.min(100, Math.max(1, isNaN(parsedPageSize) ? 12 : parsedPageSize))
  };
}

/**
 * Build filters from query parameters
 */
export function buildFiltersFromQuery(query: URLSearchParams): CaseStudyFilters {
  const filters: CaseStudyFilters = {};

  // Industry filter
  const industry = query.get('industry');
  if (industry) {
    filters.industry = industry as any;
  }

  // Tags filter (multiple values)
  const tags = query.getAll('tags');
  if (tags.length > 0) {
    filters.tags = tags;
  }

  // Search filter
  const search = query.get('search');
  if (search && search.trim()) {
    filters.search = search.trim();
  }

  // Status filter (multiple values)
  const statuses = query.getAll('status');
  if (statuses.length > 0) {
    filters.status = statuses as any;
  }

  // Author filter
  const authorId = query.get('author_id');
  if (authorId) {
    filters.author_id = authorId;
  }

  // Date range filters
  const publishedAfter = query.get('published_after');
  if (publishedAfter) {
    filters.published_after = publishedAfter;
  }

  const publishedBefore = query.get('published_before');
  if (publishedBefore) {
    filters.published_before = publishedBefore;
  }

  return filters;
}

/**
 * Build query options from URL parameters
 */
export function buildQueryOptionsFromQuery(query: URLSearchParams): QueryOptions {
  const options: QueryOptions = {};

  // Pagination
  const { page, pageSize } = validatePagination(
    query.get('page') || undefined,
    query.get('pageSize') || query.get('limit') || undefined
  );
  options.page = page;
  options.pageSize = pageSize;

  // Sorting
  const sortBy = query.get('sortBy') || query.get('sort');
  if (sortBy && ['created_at', 'updated_at', 'published_at', 'title', 'client_name'].includes(sortBy)) {
    options.sortBy = sortBy as any;
  }

  const sortOrder = query.get('sortOrder') || query.get('order');
  if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
    options.sortOrder = sortOrder as 'asc' | 'desc';
  }

  // Include images
  const includeImages = query.get('includeImages') === 'true';
  options.includeImages = includeImages;

  return options;
}

/**
 * Get user from authorization header
 */
export async function getUserFromAuth(authHeader?: string): Promise<UserContext | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Auth error:', error);
      return null;
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Default to regular user if profile not found
    }

    return {
      id: user.id,
      email: user.email || '',
      role: profile?.role || 'user',
      isAdmin: profile?.role === 'admin'
    };
  } catch (error) {
    console.error('Error getting user from auth:', error);
    return null;
  }
}

/**
 * Middleware to require authentication
 */
export function withAuth<T extends any[]>(
  handler: (user: UserContext, ...args: T) => Promise<any>
) {
  return async (request: Request, ...args: T): Promise<Response> => {
    try {
      const authHeader = request.headers.get('Authorization');
      const user = await getUserFromAuth(authHeader || undefined);

      if (!user) {
        const { response, statusCode } = createApiError('Authentication required', 401);
        return new Response(JSON.stringify(response), {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const result = await handler(user, ...args);

      // If result is already a Response, return it
      if (result instanceof Response) {
        return result;
      }

      // Otherwise, wrap in JSON response
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      const { response, statusCode } = createApiError(
        'Internal server error',
        500,
        error
      );
      return new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}

/**
 * Middleware to require admin role
 */
export function withAdmin<T extends any[]>(
  handler: (user: UserContext, ...args: T) => Promise<any>
) {
  return withAuth(async (user: UserContext, ...args: T) => {
    if (!user.isAdmin) {
      const { response, statusCode } = createApiError(
        'Admin access required',
        403
      );
      return new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return handler(user, ...args);
  });
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): string[] {
  const missingFields: string[] = [];

  requiredFields.forEach(field => {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(String(field));
    }
  });

  return missingFields;
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate unique slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 50); // Limit length
}

/**
 * Parse JSON safely
 */
export function parseJsonSafely<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

/**
 * Handle CORS headers
 */
export function addCorsHeaders(response: Response): Response {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

/**
 * Handle OPTIONS request for CORS
 */
export function handleOptions(): Response {
  const response = new Response(null, { status: 200 });
  return addCorsHeaders(response);
}

/**
 * Rate limiting helper (simple in-memory implementation)
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || [];

    // Filter out old requests
    const recentRequests = requests.filter(time => time > windowStart);

    // Check if under limit
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requests = this.requests.get(identifier) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Apply rate limiting to request
 */
export function withRateLimit(identifier: string): boolean {
  return rateLimiter.isAllowed(identifier);
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}