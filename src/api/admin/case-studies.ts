/**
 * Admin API Endpoints for Case Studies
 *
 * These endpoints require authentication and admin privileges
 */

import {
  listCaseStudies,
  getCaseStudyById,
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  duplicateCaseStudy,
  bulkDeleteCaseStudies,
  bulkUpdateStatus,
  updateCaseStudyStatus,
  isSlugUnique,
  getCaseStudyStats
} from '@/services/caseStudyService';
import {
  createApiResponse,
  createApiError,
  buildFiltersFromQuery,
  buildQueryOptionsFromQuery,
  withAdmin,
  withAuth,
  validateRequiredFields,
  sanitizeString,
  generateSlug,
  parseJsonSafely,
  addCorsHeaders,
  handleOptions,
  UserContext
} from '@/lib/api-helpers';
import { CaseStudy, CaseStudyFormData, CaseStudyStatus } from '@/types/case-studies';

/**
 * GET /api/admin/case-studies
 * List all case studies (including drafts) with admin access
 */
async function getAdminCaseStudies(user: UserContext, request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams;

  // Build filters (admin can see all statuses)
  const filters = buildFiltersFromQuery(query);

  // If no status filter specified, show all
  if (!filters.status || filters.status.length === 0) {
    filters.status = ['published', 'draft'];
  }

  // Build query options
  const options = buildQueryOptionsFromQuery(query);

  // Default to including images for admin
  if (options.includeImages === undefined) {
    options.includeImages = true;
  }

  // Fetch case studies
  const result = await listCaseStudies(filters, options);

  return createApiResponse(
    result.data,
    `Found ${result.total} case studies`,
    {
      page: result.page,
      pageSize: result.pageSize,
      total: result.total,
      hasMore: result.hasMore
    }
  );
}

/**
 * POST /api/admin/case-studies
 * Create new case study
 */
async function createAdminCaseStudy(user: UserContext, request: Request) {
  const body = await request.text();
  const data = parseJsonSafely<CaseStudyFormData>(body, {} as CaseStudyFormData);

  // Validate required fields
  const requiredFields: (keyof CaseStudyFormData)[] = [
    'title',
    'client_name',
    'challenge',
    'solution',
    'results'
  ];

  const missingFields = validateRequiredFields(data, requiredFields);
  if (missingFields.length > 0) {
    const { response, statusCode } = createApiError(
      `Missing required fields: ${missingFields.join(', ')}`,
      400
    );
    throw { response, statusCode };
  }

  // Sanitize string fields
  const sanitizedData = {
    ...data,
    title: sanitizeString(data.title),
    client_name: sanitizeString(data.client_name),
    challenge: sanitizeString(data.challenge),
    solution: sanitizeString(data.solution),
    results: sanitizeString(data.results),
    testimonial_content: data.testimonial_content ? sanitizeString(data.testimonial_content) : undefined,
    testimonial_author: data.testimonial_author ? sanitizeString(data.testimonial_author) : undefined,
    testimonial_role: data.testimonial_role ? sanitizeString(data.testimonial_role) : undefined,
    client_location: data.client_location ? sanitizeString(data.client_location) : undefined,
  };

  // Generate slug if not provided
  let slug = sanitizedData.slug || generateSlug(sanitizedData.title);

  // Ensure slug is unique
  let counter = 1;
  let originalSlug = slug;
  while (!(await isSlugUnique(slug))) {
    slug = `${originalSlug}-${counter}`;
    counter++;
  }

  // Prepare case study data
  const caseStudyData: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'> = {
    title: sanitizedData.title,
    slug,
    client_name: sanitizedData.client_name,
    client_industry: sanitizedData.client_industry || 'Professional Services',
    client_location: sanitizedData.client_location,
    challenge: sanitizedData.challenge,
    solution: sanitizedData.solution,
    results: sanitizedData.results,
    featured_image_url: sanitizedData.featured_image_url,
    before_image_url: sanitizedData.before_image_url,
    after_image_url: sanitizedData.after_image_url,
    testimonial_content: sanitizedData.testimonial_content,
    testimonial_author: sanitizedData.testimonial_author,
    testimonial_role: sanitizedData.testimonial_role,
    metrics: sanitizedData.metrics || [],
    tags: sanitizedData.tags || [],
    status: sanitizedData.status || 'draft',
    published_at: null, // Will be set by service if status is published
    author_id: user.id
  };

  // Create case study
  const createdCaseStudy = await createCaseStudy(caseStudyData, user.id);

  return createApiResponse(createdCaseStudy, 'Case study created successfully');
}

/**
 * GET /api/admin/case-studies/:id
 * Get single case study by ID
 */
async function getAdminCaseStudy(user: UserContext, id: string) {
  if (!id || typeof id !== 'string') {
    const { response, statusCode } = createApiError('Invalid case study ID', 400);
    throw { response, statusCode };
  }

  const caseStudy = await getCaseStudyById(id);

  if (!caseStudy) {
    const { response, statusCode } = createApiError('Case study not found', 404);
    throw { response, statusCode };
  }

  return createApiResponse(caseStudy, 'Case study retrieved successfully');
}

/**
 * PUT /api/admin/case-studies/:id
 * Update case study
 */
async function updateAdminCaseStudy(user: UserContext, request: Request, id: string) {
  if (!id || typeof id !== 'string') {
    const { response, statusCode } = createApiError('Invalid case study ID', 400);
    throw { response, statusCode };
  }

  // Check if case study exists
  const existingCaseStudy = await getCaseStudyById(id);
  if (!existingCaseStudy) {
    const { response, statusCode } = createApiError('Case study not found', 404);
    throw { response, statusCode };
  }

  // Check ownership (unless admin)
  if (!user.isAdmin && existingCaseStudy.author_id !== user.id) {
    const { response, statusCode } = createApiError('Access denied', 403);
    throw { response, statusCode };
  }

  const body = await request.text();
  const data = parseJsonSafely<Partial<CaseStudyFormData>>(body, {});

  // Sanitize string fields if present
  const sanitizedData: Partial<CaseStudy> = {};

  if (data.title !== undefined) {
    sanitizedData.title = sanitizeString(data.title);
  }
  if (data.client_name !== undefined) {
    sanitizedData.client_name = sanitizeString(data.client_name);
  }
  if (data.challenge !== undefined) {
    sanitizedData.challenge = sanitizeString(data.challenge);
  }
  if (data.solution !== undefined) {
    sanitizedData.solution = sanitizeString(data.solution);
  }
  if (data.results !== undefined) {
    sanitizedData.results = sanitizeString(data.results);
  }
  if (data.testimonial_content !== undefined) {
    sanitizedData.testimonial_content = data.testimonial_content ? sanitizeString(data.testimonial_content) : null;
  }
  if (data.testimonial_author !== undefined) {
    sanitizedData.testimonial_author = data.testimonial_author ? sanitizeString(data.testimonial_author) : null;
  }
  if (data.testimonial_role !== undefined) {
    sanitizedData.testimonial_role = data.testimonial_role ? sanitizeString(data.testimonial_role) : null;
  }
  if (data.client_location !== undefined) {
    sanitizedData.client_location = data.client_location ? sanitizeString(data.client_location) : null;
  }

  // Handle other fields
  if (data.client_industry !== undefined) {
    sanitizedData.client_industry = data.client_industry;
  }
  if (data.featured_image_url !== undefined) {
    sanitizedData.featured_image_url = data.featured_image_url;
  }
  if (data.before_image_url !== undefined) {
    sanitizedData.before_image_url = data.before_image_url;
  }
  if (data.after_image_url !== undefined) {
    sanitizedData.after_image_url = data.after_image_url;
  }
  if (data.metrics !== undefined) {
    sanitizedData.metrics = data.metrics;
  }
  if (data.tags !== undefined) {
    sanitizedData.tags = data.tags;
  }
  if (data.status !== undefined) {
    sanitizedData.status = data.status;
  }

  // Handle slug updates
  if (data.slug !== undefined) {
    let slug = sanitizeString(data.slug) || generateSlug(sanitizedData.title || existingCaseStudy.title);

    // Check if slug is unique (excluding current case study)
    if (slug !== existingCaseStudy.slug && !(await isSlugUnique(slug, id))) {
      const { response, statusCode } = createApiError('Slug is already in use', 400);
      throw { response, statusCode };
    }

    sanitizedData.slug = slug;
  }

  // Update case study
  const updatedCaseStudy = await updateCaseStudy(id, sanitizedData, user.id);

  return createApiResponse(updatedCaseStudy, 'Case study updated successfully');
}

/**
 * DELETE /api/admin/case-studies/:id
 * Delete case study
 */
async function deleteAdminCaseStudy(user: UserContext, id: string) {
  if (!id || typeof id !== 'string') {
    const { response, statusCode } = createApiError('Invalid case study ID', 400);
    throw { response, statusCode };
  }

  // Check if case study exists and user has permission
  const existingCaseStudy = await getCaseStudyById(id);
  if (!existingCaseStudy) {
    const { response, statusCode } = createApiError('Case study not found', 404);
    throw { response, statusCode };
  }

  // Check ownership (unless admin)
  if (!user.isAdmin && existingCaseStudy.author_id !== user.id) {
    const { response, statusCode } = createApiError('Access denied', 403);
    throw { response, statusCode };
  }

  // Delete case study (this will also handle image cleanup)
  await deleteCaseStudy(id, user.id);

  return createApiResponse(null, 'Case study deleted successfully');
}

/**
 * PATCH /api/admin/case-studies/:id/status
 * Update case study status only
 */
async function updateAdminCaseStudyStatus(user: UserContext, request: Request, id: string) {
  if (!id || typeof id !== 'string') {
    const { response, statusCode } = createApiError('Invalid case study ID', 400);
    throw { response, statusCode };
  }

  const body = await request.text();
  const data = parseJsonSafely<{ status: CaseStudyStatus }>(body, {} as any);

  if (!data.status || !['draft', 'published'].includes(data.status)) {
    const { response, statusCode } = createApiError('Invalid status value', 400);
    throw { response, statusCode };
  }

  // Check if case study exists and user has permission
  const existingCaseStudy = await getCaseStudyById(id);
  if (!existingCaseStudy) {
    const { response, statusCode } = createApiError('Case study not found', 404);
    throw { response, statusCode };
  }

  // Check ownership (unless admin)
  if (!user.isAdmin && existingCaseStudy.author_id !== user.id) {
    const { response, statusCode } = createApiError('Access denied', 403);
    throw { response, statusCode };
  }

  // Update status
  const updatedCaseStudy = await updateCaseStudyStatus(id, data.status, user.id);

  return createApiResponse(updatedCaseStudy, `Case study ${data.status === 'published' ? 'published' : 'unpublished'} successfully`);
}

/**
 * POST /api/admin/case-studies/:id/duplicate
 * Duplicate case study
 */
async function duplicateAdminCaseStudy(user: UserContext, id: string) {
  if (!id || typeof id !== 'string') {
    const { response, statusCode } = createApiError('Invalid case study ID', 400);
    throw { response, statusCode };
  }

  // Check if case study exists
  const existingCaseStudy = await getCaseStudyById(id);
  if (!existingCaseStudy) {
    const { response, statusCode } = createApiError('Case study not found', 404);
    throw { response, statusCode };
  }

  // Duplicate case study
  const duplicatedCaseStudy = await duplicateCaseStudy(id, user.id);

  return createApiResponse(duplicatedCaseStudy, 'Case study duplicated successfully');
}

/**
 * POST /api/admin/case-studies/bulk-delete
 * Bulk delete case studies
 */
async function bulkDeleteAdminCaseStudies(user: UserContext, request: Request) {
  const body = await request.text();
  const data = parseJsonSafely<{ ids: string[] }>(body, { ids: [] });

  if (!Array.isArray(data.ids) || data.ids.length === 0) {
    const { response, statusCode } = createApiError('Invalid or empty IDs array', 400);
    throw { response, statusCode };
  }

  if (data.ids.length > 50) {
    const { response, statusCode } = createApiError('Too many IDs (max 50)', 400);
    throw { response, statusCode };
  }

  // Perform bulk delete
  const result = await bulkDeleteCaseStudies(data.ids, user.id);

  return createApiResponse(result, `Deleted ${result.success.length} case studies, ${result.failed.length} failed`);
}

/**
 * POST /api/admin/case-studies/bulk-update-status
 * Bulk update case study status
 */
async function bulkUpdateAdminCaseStudyStatus(user: UserContext, request: Request) {
  const body = await request.text();
  const data = parseJsonSafely<{ ids: string[]; status: CaseStudyStatus }>(body, {} as any);

  if (!Array.isArray(data.ids) || data.ids.length === 0) {
    const { response, statusCode } = createApiError('Invalid or empty IDs array', 400);
    throw { response, statusCode };
  }

  if (!data.status || !['draft', 'published'].includes(data.status)) {
    const { response, statusCode } = createApiError('Invalid status value', 400);
    throw { response, statusCode };
  }

  if (data.ids.length > 50) {
    const { response, statusCode } = createApiError('Too many IDs (max 50)', 400);
    throw { response, statusCode };
  }

  // Perform bulk status update
  const result = await bulkUpdateStatus(data.ids, data.status, user.id);

  return createApiResponse(result, `Updated ${result.success.length} case studies, ${result.failed.length} failed`);
}

/**
 * GET /api/admin/case-studies/stats
 * Get admin case study statistics (includes drafts)
 */
async function getAdminCaseStudyStats(user: UserContext) {
  const stats = await getCaseStudyStats();
  return createApiResponse(stats, 'Statistics retrieved successfully');
}

/**
 * Route handler for admin case studies API
 */
export async function handleAdminCaseStudiesAPI(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  // Remove API prefix to get the path
  const path = pathname.replace(/^\/api\/admin\/case-studies\/?/, '');

  try {
    switch (method) {
      case 'OPTIONS':
        return handleOptions();

      case 'GET':
        if (!path) {
          // GET /api/admin/case-studies
          return withAdmin(getAdminCaseStudies)(request);
        } else if (path === 'stats') {
          // GET /api/admin/case-studies/stats
          return withAdmin(getAdminCaseStudyStats)(request);
        } else {
          // GET /api/admin/case-studies/:id
          return withAdmin((user: UserContext) => getAdminCaseStudy(user, path))(request);
        }

      case 'POST':
        if (!path) {
          // POST /api/admin/case-studies
          return withAdmin(createAdminCaseStudy)(request);
        } else if (path === 'bulk-delete') {
          // POST /api/admin/case-studies/bulk-delete
          return withAdmin(bulkDeleteAdminCaseStudies)(request);
        } else if (path === 'bulk-update-status') {
          // POST /api/admin/case-studies/bulk-update-status
          return withAdmin(bulkUpdateAdminCaseStudyStatus)(request);
        } else if (path.endsWith('/duplicate')) {
          // POST /api/admin/case-studies/:id/duplicate
          const id = path.replace('/duplicate', '');
          return withAdmin((user: UserContext) => duplicateAdminCaseStudy(user, id))(request);
        }
        break;

      case 'PUT':
        if (path) {
          // PUT /api/admin/case-studies/:id
          return withAdmin((user: UserContext) => updateAdminCaseStudy(user, request, path))(request);
        }
        break;

      case 'PATCH':
        if (path.endsWith('/status')) {
          // PATCH /api/admin/case-studies/:id/status
          const id = path.replace('/status', '');
          return withAdmin((user: UserContext) => updateAdminCaseStudyStatus(user, request, id))(request);
        }
        break;

      case 'DELETE':
        if (path) {
          // DELETE /api/admin/case-studies/:id
          return withAdmin((user: UserContext) => deleteAdminCaseStudy(user, path))(request);
        }
        break;

      default:
        const { response, statusCode } = createApiError(`Method ${method} not allowed`, 405);
        return addCorsHeaders(new Response(JSON.stringify(response), {
          status: statusCode,
          headers: { 'Content-Type': 'application/json' }
        }));
    }

    // If we reach here, no route matched
    const { response, statusCode } = createApiError('Route not found', 404);
    return addCorsHeaders(new Response(JSON.stringify(response), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' }
    }));

  } catch (error: any) {
    console.error('Error in handleAdminCaseStudiesAPI:', error);

    // If error has response and statusCode, it's a handled error
    if (error.response && error.statusCode) {
      return addCorsHeaders(new Response(JSON.stringify(error.response), {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    // Otherwise, it's an unhandled error
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