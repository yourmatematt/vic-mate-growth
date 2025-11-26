/**
 * Custom React Hooks for Case Studies Management
 *
 * Handles CRUD operations for case studies in the admin interface
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CaseStudy,
  CaseStudyStatus,
  Industry,
  CaseStudyFilters,
  CaseStudyListResponse,
  ApiResponse
} from '@/types/case-studies';

// Query Keys
const CASE_STUDIES_KEYS = {
  all: ['caseStudies'] as const,
  lists: () => [...CASE_STUDIES_KEYS.all, 'list'] as const,
  list: (filters: CaseStudyFilters) => [...CASE_STUDIES_KEYS.lists(), filters] as const,
  details: () => [...CASE_STUDIES_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CASE_STUDIES_KEYS.details(), id] as const,
  stats: () => [...CASE_STUDIES_KEYS.all, 'stats'] as const,
};

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// API functions
const fetchCaseStudies = async (filters: CaseStudyFilters): Promise<CaseStudyListResponse> => {
  const queryParams = new URLSearchParams();

  // Add pagination
  if (filters.page) queryParams.append('page', filters.page.toString());
  if (filters.pageSize) queryParams.append('pageSize', filters.pageSize.toString());

  // Add filters
  if (filters.status && filters.status !== 'all') {
    queryParams.append('status', filters.status);
  }
  if (filters.industry && filters.industry !== 'all') {
    queryParams.append('industry', filters.industry);
  }
  if (filters.search) {
    queryParams.append('search', filters.search);
  }
  if (filters.tags && filters.tags.length > 0) {
    filters.tags.forEach(tag => queryParams.append('tags', tag));
  }
  if (filters.authorId) {
    queryParams.append('author_id', filters.authorId);
  }
  if (filters.dateFrom) {
    queryParams.append('published_after', filters.dateFrom);
  }
  if (filters.dateTo) {
    queryParams.append('published_before', filters.dateTo);
  }

  // Add sorting
  if (filters.sortBy) {
    queryParams.append('sortBy', filters.sortBy);
    queryParams.append('sortOrder', filters.sortOrder || 'desc');
  }

  queryParams.append('includeImages', 'true');

  const response = await fetch(`/api/admin/case-studies?${queryParams}`, {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch case studies: ${response.statusText}`);
  }

  const apiResponse: ApiResponse<CaseStudy[]> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.error || 'Failed to fetch case studies');
  }

  return {
    data: apiResponse.data || [],
    total: apiResponse.pagination?.total || 0,
    page: apiResponse.pagination?.page || 1,
    pageSize: apiResponse.pagination?.pageSize || 10,
    totalPages: Math.ceil((apiResponse.pagination?.total || 0) / (apiResponse.pagination?.pageSize || 10))
  };
};

const fetchCaseStudy = async (id: string): Promise<CaseStudy | null> => {
  const response = await fetch(`/api/admin/case-studies/${id}`, {
    headers: getAuthHeaders()
  });

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

const deleteCaseStudy = async (id: string): Promise<ApiResponse<void>> => {
  const response = await fetch(`/api/admin/case-studies/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to delete case study: ${response.statusText}`);
  }

  const apiResponse: ApiResponse<void> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.error || 'Failed to delete case study');
  }

  return apiResponse;
};

const bulkDeleteCaseStudies = async (ids: string[]): Promise<ApiResponse<void>> => {
  const response = await fetch('/api/admin/case-studies/bulk-delete', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids })
  });

  if (!response.ok) {
    throw new Error(`Failed to bulk delete case studies: ${response.statusText}`);
  }

  const apiResponse: ApiResponse<any> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.error || 'Failed to bulk delete case studies');
  }

  return {
    success: true,
    message: `Deleted ${apiResponse.data?.success?.length || 0} case studies`
  };
};

const bulkUpdateCaseStudyStatus = async (
  ids: string[],
  status: CaseStudyStatus
): Promise<ApiResponse<void>> => {
  const response = await fetch('/api/admin/case-studies/bulk-update-status', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ids, status })
  });

  if (!response.ok) {
    throw new Error(`Failed to bulk update case studies: ${response.statusText}`);
  }

  const apiResponse: ApiResponse<any> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.error || 'Failed to bulk update case studies');
  }

  return {
    success: true,
    message: `Updated ${apiResponse.data?.success?.length || 0} case studies to ${status}`
  };
};

const duplicateCaseStudy = async (id: string): Promise<ApiResponse<CaseStudy>> => {
  const response = await fetch(`/api/admin/case-studies/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to duplicate case study: ${response.statusText}`);
  }

  const apiResponse: ApiResponse<CaseStudy> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.error || 'Failed to duplicate case study');
  }

  return apiResponse;
};

const updateCaseStudyStatus = async (
  id: string,
  status: CaseStudyStatus
): Promise<ApiResponse<CaseStudy>> => {
  const response = await fetch(`/api/admin/case-studies/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    throw new Error(`Failed to update case study status: ${response.statusText}`);
  }

  const apiResponse: ApiResponse<CaseStudy> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.error || 'Failed to update case study status');
  }

  return apiResponse;
};

const fetchCaseStudyStats = async () => {
  const response = await fetch('/api/admin/case-studies/stats', {
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch case study stats: ${response.statusText}`);
  }

  const apiResponse: ApiResponse<any> = await response.json();

  if (!apiResponse.success) {
    throw new Error(apiResponse.error || 'Failed to fetch case study stats');
  }

  const data = apiResponse.data;

  return {
    total: data?.total || 0,
    published: data?.published || 0,
    drafts: data?.draft || 0,
    archived: 0, // Not implemented yet
    totalViews: Math.floor(Math.random() * 10000) + 1000, // Mock for now
    thisMonthViews: Math.floor(Math.random() * 3000) + 100 // Mock for now
  };
};

// Custom Hooks

/**
 * Hook for fetching case studies list with filtering and pagination
 */
export const useCaseStudies = (filters: CaseStudyFilters = {}) => {
  return useQuery({
    queryKey: CASE_STUDIES_KEYS.list(filters),
    queryFn: () => fetchCaseStudies(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching a single case study
 */
export const useCaseStudy = (id: string) => {
  return useQuery({
    queryKey: CASE_STUDIES_KEYS.detail(id),
    queryFn: () => fetchCaseStudy(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook for deleting a single case study
 */
export const useDeleteCaseStudy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCaseStudy,
    onSuccess: () => {
      // Invalidate and refetch case studies list
      queryClient.invalidateQueries({
        queryKey: CASE_STUDIES_KEYS.lists()
      });
      queryClient.invalidateQueries({
        queryKey: CASE_STUDIES_KEYS.stats()
      });
    },
    onError: (error) => {
      console.error('Error deleting case study:', error);
    }
  });
};

/**
 * Hook for bulk deleting case studies
 */
export const useBulkDeleteCaseStudies = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDeleteCaseStudies,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CASE_STUDIES_KEYS.lists()
      });
      queryClient.invalidateQueries({
        queryKey: CASE_STUDIES_KEYS.stats()
      });
    },
    onError: (error) => {
      console.error('Error bulk deleting case studies:', error);
    }
  });
};

/**
 * Hook for bulk updating case study status
 */
export const useBulkUpdateCaseStudyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: CaseStudyStatus }) =>
      bulkUpdateCaseStudyStatus(ids, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CASE_STUDIES_KEYS.lists()
      });
      queryClient.invalidateQueries({
        queryKey: CASE_STUDIES_KEYS.stats()
      });
    },
    onError: (error) => {
      console.error('Error bulk updating case studies:', error);
    }
  });
};

/**
 * Hook for duplicating a case study
 */
export const useDuplicateCaseStudy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateCaseStudy,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CASE_STUDIES_KEYS.lists()
      });
      queryClient.invalidateQueries({
        queryKey: CASE_STUDIES_KEYS.stats()
      });
    },
    onError: (error) => {
      console.error('Error duplicating case study:', error);
    }
  });
};

/**
 * Hook for updating case study status
 */
export const useUpdateCaseStudyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CaseStudyStatus }) =>
      updateCaseStudyStatus(id, status),
    onSuccess: (data, variables) => {
      // Update specific case study in cache
      if (data.data) {
        queryClient.setQueryData(
          CASE_STUDIES_KEYS.detail(variables.id),
          data.data
        );
      }

      // Invalidate lists to refresh
      queryClient.invalidateQueries({
        queryKey: CASE_STUDIES_KEYS.lists()
      });
      queryClient.invalidateQueries({
        queryKey: CASE_STUDIES_KEYS.stats()
      });
    },
    onError: (error) => {
      console.error('Error updating case study status:', error);
    }
  });
};

/**
 * Hook for getting case studies statistics
 */
export const useCaseStudiesStats = () => {
  return useQuery({
    queryKey: CASE_STUDIES_KEYS.stats(),
    queryFn: fetchCaseStudyStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export default useCaseStudies;