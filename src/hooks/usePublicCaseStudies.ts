/**
 * Public Case Studies Data Fetching Hook
 *
 * Handles fetching published case studies for public pages
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { CaseStudy, CaseStudyStatus, Industry } from '@/types/case-studies';
import { ApiResponse } from '@/lib/api-helpers';

interface PublicCaseStudiesParams {
  industry?: Industry;
  tag?: string;
  limit?: number;
  search?: string;
}

interface PublicCaseStudiesResponse {
  caseStudies: CaseStudy[];
  total: number;
  hasMore: boolean;
  page: number;
}

// API function for fetching published case studies
const fetchPublicCaseStudies = async (
  params: PublicCaseStudiesParams & { page?: number } = {}
): Promise<PublicCaseStudiesResponse> => {
  const { page = 1, limit = 9, ...filterParams } = params;

  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('pageSize', limit.toString());

  if (filterParams.industry) {
    queryParams.append('industry', filterParams.industry);
  }
  if (filterParams.tag) {
    queryParams.append('tags', filterParams.tag);
  }
  if (filterParams.search) {
    queryParams.append('search', filterParams.search);
  }

  const response = await fetch(`/api/case-studies?${queryParams}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch case studies: ${response.statusText}`);
  }

  const apiResponse: ApiResponse<CaseStudy[]> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.error || 'Failed to fetch case studies');
  }

  return {
    caseStudies: apiResponse.data || [],
    total: apiResponse.pagination?.total || 0,
    hasMore: apiResponse.pagination?.hasMore || false,
    page: apiResponse.pagination?.page || page
  };
};

// API function for fetching single published case study by slug
const fetchPublicCaseStudy = async (slug: string): Promise<CaseStudy | null> => {
  const response = await fetch(`/api/case-studies/${slug}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch case study: ${response.statusText}`);
  }

  const apiResponse: ApiResponse<CaseStudy> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.error || 'Failed to fetch case study');
  }

  return apiResponse.data || null;
};

/**
 * Hook for fetching published case studies with pagination
 */
export const usePublicCaseStudies = (params: PublicCaseStudiesParams = {}) => {
  return useQuery({
    queryKey: ['publicCaseStudies', params],
    queryFn: () => fetchPublicCaseStudies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for infinite loading of published case studies
 */
export const useInfinitePublicCaseStudies = (params: PublicCaseStudiesParams = {}) => {
  return useInfiniteQuery({
    queryKey: ['publicCaseStudies', 'infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      fetchPublicCaseStudies({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

/**
 * Hook for fetching a single published case study by slug
 */
export const usePublicCaseStudy = (slug: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['publicCaseStudy', slug],
    queryFn: () => fetchPublicCaseStudy(slug),
    enabled: Boolean(slug) && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error) => {
      // Don't retry if case study not found
      return failureCount < 2;
    },
  });
};

/**
 * Hook for fetching related case studies
 */
export const useRelatedCaseStudies = (
  currentSlug: string,
  industry?: Industry,
  tags: string[] = [],
  limit: number = 3
) => {
  return useQuery({
    queryKey: ['relatedCaseStudies', currentSlug, industry, tags, limit],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      queryParams.append('limit', limit.toString());

      const response = await fetch(`/api/case-studies/${currentSlug}/related?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch related case studies: ${response.statusText}`);
      }

      const apiResponse: ApiResponse<CaseStudy[]> = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Failed to fetch related case studies');
      }

      return apiResponse.data || [];
    },
    enabled: Boolean(currentSlug),
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};

/**
 * Hook for getting all unique tags from published case studies
 */
export const usePublicCaseStudyTags = () => {
  return useQuery({
    queryKey: ['publicCaseStudyTags'],
    queryFn: async () => {
      const response = await fetch('/api/case-studies/stats');

      if (!response.ok) {
        throw new Error(`Failed to fetch case study stats: ${response.statusText}`);
      }

      const apiResponse: ApiResponse<any> = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Failed to fetch case study stats');
      }

      return apiResponse.data?.popularTags?.map((item: any) => item.tag) || [];
    },
    staleTime: 30 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });
};

/**
 * Hook for getting case study statistics
 */
export const usePublicCaseStudyStats = () => {
  return useQuery({
    queryKey: ['publicCaseStudyStats'],
    queryFn: async () => {
      const response = await fetch('/api/case-studies/stats');

      if (!response.ok) {
        throw new Error(`Failed to fetch case study stats: ${response.statusText}`);
      }

      const apiResponse: ApiResponse<any> = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'Failed to fetch case study stats');
      }

      const data = apiResponse.data;
      const industries = Object.keys(data?.industries || {});

      return {
        total: data?.total || 0,
        industries: data?.industries || {},
        availableIndustries: industries,
      };
    },
    staleTime: 15 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
};

export default usePublicCaseStudies;