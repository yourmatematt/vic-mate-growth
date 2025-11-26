/**
 * Supabase Case Study Service Layer
 *
 * Abstracts all database operations for case studies
 */

import { supabase } from '@/lib/supabase';
import { CaseStudy, CaseStudyFormData, CaseStudyStatus, Industry, CaseStudyImage } from '@/types/case-studies';

// Query filters interface
export interface CaseStudyFilters {
  industry?: Industry;
  tags?: string[];
  search?: string;
  status?: CaseStudyStatus[];
  author_id?: string;
  published_after?: string;
  published_before?: string;
}

// Query options interface
export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'updated_at' | 'published_at' | 'title' | 'client_name';
  sortOrder?: 'asc' | 'desc';
  includeImages?: boolean;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Case study with images interface
export interface CaseStudyWithImages extends CaseStudy {
  case_study_images: CaseStudyImage[];
}

/**
 * List case studies with filters and pagination
 */
export async function listCaseStudies(
  filters: CaseStudyFilters = {},
  options: QueryOptions = {}
): Promise<PaginatedResponse<CaseStudy>> {
  const {
    page = 1,
    pageSize = 12,
    sortBy = 'created_at',
    sortOrder = 'desc',
    includeImages = false
  } = options;

  let query = supabase
    .from('case_studies')
    .select(`
      *,
      ${includeImages ? 'case_study_images(*)' : ''}
    `, { count: 'exact' });

  // Apply filters
  if (filters.industry) {
    query = query.eq('client_industry', filters.industry);
  }

  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  if (filters.author_id) {
    query = query.eq('author_id', filters.author_id);
  }

  if (filters.published_after) {
    query = query.gte('published_at', filters.published_after);
  }

  if (filters.published_before) {
    query = query.lte('published_at', filters.published_before);
  }

  // Search across multiple fields
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.or(`
      title.ilike.${searchTerm},
      client_name.ilike.${searchTerm},
      challenge.ilike.${searchTerm},
      solution.ilike.${searchTerm}
    `);
  }

  // Tag filtering (using contains operator for arrays)
  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  // Sorting
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, count, error } = await query;

  if (error) {
    console.error('Error listing case studies:', error);
    throw new Error(`Failed to fetch case studies: ${error.message}`);
  }

  const total = count || 0;
  const hasMore = from + pageSize < total;

  return {
    data: data || [],
    total,
    page,
    pageSize,
    hasMore
  };
}

/**
 * Get case study by slug (published only)
 */
export async function getCaseStudyBySlug(slug: string): Promise<CaseStudyWithImages | null> {
  const { data, error } = await supabase
    .from('case_studies')
    .select(`
      *,
      case_study_images(*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    console.error('Error fetching case study by slug:', error);
    throw new Error(`Failed to fetch case study: ${error.message}`);
  }

  return data;
}

/**
 * Get case study by ID (admin access)
 */
export async function getCaseStudyById(id: string): Promise<CaseStudyWithImages | null> {
  const { data, error } = await supabase
    .from('case_studies')
    .select(`
      *,
      case_study_images(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching case study by ID:', error);
    throw new Error(`Failed to fetch case study: ${error.message}`);
  }

  return data;
}

/**
 * Create new case study
 */
export async function createCaseStudy(
  data: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>,
  userId: string
): Promise<CaseStudy> {
  const caseStudyData = {
    ...data,
    author_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Set published_at if status is published
    published_at: data.status === 'published' ? new Date().toISOString() : null
  };

  const { data: createdCaseStudy, error } = await supabase
    .from('case_studies')
    .insert(caseStudyData)
    .select()
    .single();

  if (error) {
    console.error('Error creating case study:', error);
    throw new Error(`Failed to create case study: ${error.message}`);
  }

  return createdCaseStudy;
}

/**
 * Update case study
 */
export async function updateCaseStudy(
  id: string,
  data: Partial<CaseStudy>,
  userId: string
): Promise<CaseStudy> {
  const updateData = {
    ...data,
    updated_at: new Date().toISOString()
  };

  // Handle published_at based on status
  if (data.status === 'published' && !updateData.published_at) {
    updateData.published_at = new Date().toISOString();
  } else if (data.status !== 'published') {
    updateData.published_at = null;
  }

  const { data: updatedCaseStudy, error } = await supabase
    .from('case_studies')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating case study:', error);
    throw new Error(`Failed to update case study: ${error.message}`);
  }

  return updatedCaseStudy;
}

/**
 * Delete case study
 */
export async function deleteCaseStudy(id: string, userId: string): Promise<void> {
  // First, delete all associated images from the database
  const { error: imagesError } = await supabase
    .from('case_study_images')
    .delete()
    .eq('case_study_id', id);

  if (imagesError) {
    console.error('Error deleting case study images:', imagesError);
    throw new Error(`Failed to delete case study images: ${imagesError.message}`);
  }

  // Then delete the case study
  const { error } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting case study:', error);
    throw new Error(`Failed to delete case study: ${error.message}`);
  }
}

/**
 * Duplicate case study
 */
export async function duplicateCaseStudy(
  id: string,
  userId: string
): Promise<CaseStudy> {
  // First get the original case study
  const original = await getCaseStudyById(id);
  if (!original) {
    throw new Error('Case study not found');
  }

  // Create a copy with modified title and slug
  const copyData = {
    ...original,
    title: `${original.title} (Copy)`,
    slug: `${original.slug}-copy-${Date.now()}`,
    status: 'draft' as CaseStudyStatus,
    published_at: null,
    // Remove auto-generated fields
    id: undefined,
    created_at: undefined,
    updated_at: undefined,
    case_study_images: undefined
  };

  return createCaseStudy(copyData as any, userId);
}

/**
 * Bulk delete case studies
 */
export async function bulkDeleteCaseStudies(
  ids: string[],
  userId: string
): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];

  for (const id of ids) {
    try {
      await deleteCaseStudy(id, userId);
      success.push(id);
    } catch (error) {
      console.error(`Failed to delete case study ${id}:`, error);
      failed.push(id);
    }
  }

  return { success, failed };
}

/**
 * Bulk update status
 */
export async function bulkUpdateStatus(
  ids: string[],
  status: CaseStudyStatus,
  userId: string
): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];

  for (const id of ids) {
    try {
      await updateCaseStudy(id, { status }, userId);
      success.push(id);
    } catch (error) {
      console.error(`Failed to update case study ${id}:`, error);
      failed.push(id);
    }
  }

  return { success, failed };
}

/**
 * Get case study statistics
 */
export async function getCaseStudyStats(): Promise<{
  total: number;
  published: number;
  draft: number;
  industries: Record<Industry, number>;
  popularTags: { tag: string; count: number }[];
}> {
  // Get basic counts
  const { count: totalCount } = await supabase
    .from('case_studies')
    .select('*', { count: 'exact', head: true });

  const { count: publishedCount } = await supabase
    .from('case_studies')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const { count: draftCount } = await supabase
    .from('case_studies')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft');

  // Get industry breakdown
  const { data: industryData } = await supabase
    .from('case_studies')
    .select('client_industry')
    .eq('status', 'published');

  const industries: Record<Industry, number> = {} as any;
  industryData?.forEach(item => {
    const industry = item.client_industry as Industry;
    industries[industry] = (industries[industry] || 0) + 1;
  });

  // Get popular tags
  const { data: tagsData } = await supabase
    .from('case_studies')
    .select('tags')
    .eq('status', 'published');

  const tagCounts: Record<string, number> = {};
  tagsData?.forEach(item => {
    item.tags?.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const popularTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    total: totalCount || 0,
    published: publishedCount || 0,
    draft: draftCount || 0,
    industries,
    popularTags
  };
}

/**
 * Get related case studies
 */
export async function getRelatedCaseStudies(
  currentId: string,
  industry?: Industry,
  tags: string[] = [],
  limit: number = 3
): Promise<CaseStudy[]> {
  let query = supabase
    .from('case_studies')
    .select('*')
    .eq('status', 'published')
    .neq('id', currentId);

  // Prefer same industry or shared tags
  if (industry || tags.length > 0) {
    const conditions: string[] = [];

    if (industry) {
      conditions.push(`client_industry.eq.${industry}`);
    }

    if (tags.length > 0) {
      // Use overlaps for array intersection
      conditions.push(`tags.ov.{${tags.join(',')}}`);
    }

    if (conditions.length > 0) {
      query = query.or(conditions.join(','));
    }
  }

  query = query
    .order('published_at', { ascending: false })
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching related case studies:', error);
    return [];
  }

  return data || [];
}

/**
 * Update case study status only
 */
export async function updateCaseStudyStatus(
  id: string,
  status: CaseStudyStatus,
  userId: string
): Promise<CaseStudy> {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };

  // Set/clear published_at based on status
  if (status === 'published') {
    updateData.published_at = new Date().toISOString();
  } else {
    updateData.published_at = null;
  }

  const { data, error } = await supabase
    .from('case_studies')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating case study status:', error);
    throw new Error(`Failed to update case study status: ${error.message}`);
  }

  return data;
}

/**
 * Check if slug is unique
 */
export async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from('case_studies')
    .select('id')
    .eq('slug', slug);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking slug uniqueness:', error);
    return false;
  }

  return !data || data.length === 0;
}

/**
 * Get all published case studies (for sitemap generation, etc.)
 */
export async function getAllPublishedSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('case_studies')
    .select('slug')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching published slugs:', error);
    return [];
  }

  return data?.map(item => item.slug) || [];
}