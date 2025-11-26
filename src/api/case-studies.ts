/**
 * Public API Endpoints for Case Studies
 *
 * These endpoints serve published case studies to the public pages
 */

import {
  listCaseStudies,
  getCaseStudyBySlug,
  getCaseStudyStats,
  getRelatedCaseStudies
} from '@/services/caseStudyService';
import {
  createApiResponse,
  createApiError,
  buildFiltersFromQuery,
  buildQueryOptionsFromQuery,
  addCorsHeaders,
  handleOptions,
  withRateLimit,
  getClientIp
} from '@/lib/api-helpers';

/**
 * GET /api/case-studies
 * List published case studies with filtering and pagination
 */
export async function getCaseStudies(request: Request): Promise<Response> {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    if (!withRateLimit(`case-studies-list-${clientIp}`)) {
      const { response, statusCode } = createApiError('Too many requests', 429);
      return addCorsHeaders(new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    const url = new URL(request.url);
    const query = url.searchParams;

    // Build filters for published case studies only
    const filters = buildFiltersFromQuery(query);
    filters.status = ['published']; // Override to only show published

    // Build query options
    const options = buildQueryOptionsFromQuery(query);
    options.includeImages = false; // Don't include images in list view for performance

    // Fetch case studies
    const result = await listCaseStudies(filters, options);

    const response = createApiResponse(
      result.data,
      `Found ${result.total} case studies`,
      {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        hasMore: result.hasMore
      }
    );

    return addCorsHeaders(new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));

  } catch (error) {
    console.error('Error in getCaseStudies:', error);
    const { response, statusCode } = createApiError(
      'Failed to fetch case studies',
      500,
      error
    );
    return addCorsHeaders(new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

/**
 * GET /api/case-studies/:slug
 * Get single published case study by slug
 */
export async function getCaseStudy(request: Request, slug: string): Promise<Response> {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    if (!withRateLimit(`case-study-detail-${clientIp}`)) {
      const { response, statusCode } = createApiError('Too many requests', 429);
      return addCorsHeaders(new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    if (!slug || typeof slug !== 'string') {
      const { response, statusCode } = createApiError('Invalid slug parameter', 400);
      return addCorsHeaders(new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // Fetch case study
    const caseStudy = await getCaseStudyBySlug(slug);

    if (!caseStudy) {
      const { response, statusCode } = createApiError('Case study not found', 404);
      return addCorsHeaders(new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // Optional: Increment view count (for analytics)
    // This could be done asynchronously or tracked separately

    const response = createApiResponse(caseStudy, 'Case study retrieved successfully');

    return addCorsHeaders(new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));

  } catch (error) {
    console.error('Error in getCaseStudy:', error);
    const { response, statusCode } = createApiError(
      'Failed to fetch case study',
      500,
      error
    );
    return addCorsHeaders(new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

/**
 * GET /api/case-studies/stats
 * Get public case study statistics
 */
export async function getCaseStudyStatsAPI(request: Request): Promise<Response> {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    if (!withRateLimit(`case-studies-stats-${clientIp}`)) {
      const { response, statusCode } = createApiError('Too many requests', 429);
      return addCorsHeaders(new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // Fetch stats
    const stats = await getCaseStudyStats();

    // Only return public stats (don't expose draft counts)
    const publicStats = {
      total: stats.published, // Only published count
      industries: stats.industries,
      popularTags: stats.popularTags
    };

    const response = createApiResponse(publicStats, 'Statistics retrieved successfully');

    return addCorsHeaders(new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));

  } catch (error) {
    console.error('Error in getCaseStudyStats:', error);
    const { response, statusCode } = createApiError(
      'Failed to fetch statistics',
      500,
      error
    );
    return addCorsHeaders(new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

/**
 * GET /api/case-studies/:slug/related
 * Get related case studies for a specific case study
 */
export async function getRelatedCaseStudiesAPI(request: Request, slug: string): Promise<Response> {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    if (!withRateLimit(`related-case-studies-${clientIp}`)) {
      const { response, statusCode } = createApiError('Too many requests', 429);
      return addCorsHeaders(new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    if (!slug || typeof slug !== 'string') {
      const { response, statusCode } = createApiError('Invalid slug parameter', 400);
      return addCorsHeaders(new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // First get the current case study to extract industry and tags
    const currentCaseStudy = await getCaseStudyBySlug(slug);

    if (!currentCaseStudy) {
      const { response, statusCode } = createApiError('Case study not found', 404);
      return addCorsHeaders(new Response(JSON.stringify(response), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // Get related case studies
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '3');

    const relatedCaseStudies = await getRelatedCaseStudies(
      currentCaseStudy.id,
      currentCaseStudy.client_industry,
      currentCaseStudy.tags,
      Math.min(limit, 6) // Cap at 6 for performance
    );

    const response = createApiResponse(
      relatedCaseStudies,
      `Found ${relatedCaseStudies.length} related case studies`
    );

    return addCorsHeaders(new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));

  } catch (error) {
    console.error('Error in getRelatedCaseStudies:', error);
    const { response, statusCode } = createApiError(
      'Failed to fetch related case studies',
      500,
      error
    );
    return addCorsHeaders(new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}

/**
 * Route handler for different HTTP methods and paths
 */
export async function handleCaseStudiesAPI(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  // Remove API prefix to get the path
  const path = pathname.replace(/^\/api\/case-studies\/?/, '');

  try {
    switch (method) {
      case 'OPTIONS':
        return handleOptions();

      case 'GET':
        if (!path) {
          // GET /api/case-studies
          return getCaseStudies(request);
        } else if (path === 'stats') {
          // GET /api/case-studies/stats
          return getCaseStudyStatsAPI(request);
        } else if (path.includes('/related')) {
          // GET /api/case-studies/:slug/related
          const slug = path.replace('/related', '');
          return getRelatedCaseStudiesAPI(request, slug);
        } else {
          // GET /api/case-studies/:slug
          return getCaseStudy(request, path);
        }

      default:
        const { response, statusCode } = createApiError(`Method ${method} not allowed`, 405);
        return addCorsHeaders(new Response(JSON.stringify(response), {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' }
        }));
    }
  } catch (error) {
    console.error('Error in handleCaseStudiesAPI:', error);
    const { response, statusCode } = createApiError(
      'Internal server error',
      500,
      error
    );
    return addCorsHeaders(new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }));
  }
}