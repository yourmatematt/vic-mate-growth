/**
 * Custom React Hook for Creating Case Studies
 *
 * Handles form submission, image uploads, and case study creation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CaseStudyFormData, CaseStudy, ApiResponse } from '@/types/case-studies';
import { mockCaseStudies } from '@/lib/mockCaseStudiesData';
import { formDataToCaseStudy, generateSlug, createUniqueSlug } from '@/lib/case-study-utils';
import { uploadCaseStudyImage } from '@/lib/supabase-storage';

// Mock API delay function
const mockApiDelay = (ms: number = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Mock create function
const createCaseStudy = async (formData: CaseStudyFormData): Promise<ApiResponse<CaseStudy>> => {
  await mockApiDelay(1500);

  try {
    // Generate unique ID
    const id = `cs-${Date.now()}`;

    // Ensure unique slug
    const existingSlugs = mockCaseStudies.map(cs => cs.slug);
    const uniqueSlug = formData.slug || createUniqueSlug(formData.title, existingSlugs);

    // Convert form data to case study
    const caseStudyData = formDataToCaseStudy(formData);

    // Create new case study
    const newCaseStudy: CaseStudy = {
      id,
      ...caseStudyData,
      slug: uniqueSlug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_id: 'admin-1' // Mock current user ID
    } as CaseStudy;

    // If status is published and no publish date set, set it to now
    if (newCaseStudy.status === 'published' && !newCaseStudy.published_at) {
      newCaseStudy.published_at = new Date().toISOString();
    }

    // Add to mock data (in real app, this would be a database insert)
    mockCaseStudies.unshift(newCaseStudy);

    return {
      success: true,
      data: newCaseStudy,
      message: 'Case study created successfully'
    };
  } catch (error) {
    console.error('Create case study error:', error);
    throw new Error('Failed to create case study');
  }
};

// Interface for create case study parameters
interface CreateCaseStudyParams {
  formData: CaseStudyFormData;
  imageFiles?: {
    featured?: File;
    before?: File;
    after?: File;
    gallery?: File[];
  };
}

// Enhanced create function with image uploads
const createCaseStudyWithImages = async ({
  formData,
  imageFiles
}: CreateCaseStudyParams): Promise<ApiResponse<CaseStudy>> => {
  try {
    // First create the case study to get an ID
    const caseStudyResponse = await createCaseStudy(formData);

    if (!caseStudyResponse.success || !caseStudyResponse.data) {
      throw new Error(caseStudyResponse.message || 'Failed to create case study');
    }

    const caseStudyId = caseStudyResponse.data.id;
    const uploadPromises: Promise<any>[] = [];

    // Prepare image uploads
    if (imageFiles?.featured) {
      uploadPromises.push(
        uploadCaseStudyImage(imageFiles.featured, caseStudyId, 'featured')
          .then(result => {
            if (result.success && result.data) {
              caseStudyResponse.data!.featured_image_url = result.data.publicUrl;
            }
          })
      );
    }

    if (imageFiles?.before) {
      uploadPromises.push(
        uploadCaseStudyImage(imageFiles.before, caseStudyId, 'before')
          .then(result => {
            if (result.success && result.data) {
              caseStudyResponse.data!.before_image_url = result.data.publicUrl;
            }
          })
      );
    }

    if (imageFiles?.after) {
      uploadPromises.push(
        uploadCaseStudyImage(imageFiles.after, caseStudyId, 'after')
          .then(result => {
            if (result.success && result.data) {
              caseStudyResponse.data!.after_image_url = result.data.publicUrl;
            }
          })
      );
    }

    // Wait for all image uploads to complete
    if (uploadPromises.length > 0) {
      await Promise.allSettled(uploadPromises);

      // Update the case study in mock data with image URLs
      const caseStudyIndex = mockCaseStudies.findIndex(cs => cs.id === caseStudyId);
      if (caseStudyIndex !== -1) {
        mockCaseStudies[caseStudyIndex] = caseStudyResponse.data;
      }
    }

    return caseStudyResponse;
  } catch (error) {
    console.error('Create case study with images error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create case study');
  }
};

/**
 * Hook for creating a new case study
 */
export const useCreateCaseStudy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCaseStudyWithImages,
    onSuccess: (data) => {
      // Invalidate case studies queries to refresh the list
      queryClient.invalidateQueries({
        queryKey: ['caseStudies']
      });

      // Optionally add the new case study to the cache
      if (data.data) {
        queryClient.setQueryData(
          ['caseStudies', 'detail', data.data.id],
          data.data
        );
      }
    },
    onError: (error) => {
      console.error('Error creating case study:', error);
    }
  });
};

/**
 * Hook for validating case study data before submission
 */
export const useValidateCaseStudy = () => {
  return useMutation({
    mutationFn: async (formData: CaseStudyFormData) => {
      await mockApiDelay(300);

      const errors: Record<string, string> = {};

      // Basic validation
      if (!formData.title?.trim()) {
        errors.title = 'Title is required';
      }

      if (!formData.client_name?.trim()) {
        errors.client_name = 'Client name is required';
      }

      if (!formData.challenge?.trim() || formData.challenge.length < 100) {
        errors.challenge = 'Challenge description must be at least 100 characters';
      }

      if (!formData.solution?.trim() || formData.solution.length < 100) {
        errors.solution = 'Solution description must be at least 100 characters';
      }

      if (!formData.results?.trim() || formData.results.length < 100) {
        errors.results = 'Results description must be at least 100 characters';
      }

      if (!formData.client_industry) {
        errors.client_industry = 'Industry selection is required';
      }

      // Slug validation
      if (formData.slug) {
        const existingSlugs = mockCaseStudies.map(cs => cs.slug);
        if (existingSlugs.includes(formData.slug)) {
          errors.slug = 'This slug is already in use';
        }
      }

      const isValid = Object.keys(errors).length === 0;

      return {
        isValid,
        errors
      };
    }
  });
};

/**
 * Hook for checking slug availability
 */
export const useCheckSlugAvailability = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      await mockApiDelay(200);

      const existingSlugs = mockCaseStudies.map(cs => cs.slug);
      const isAvailable = !existingSlugs.includes(slug);

      return {
        slug,
        isAvailable,
        suggestion: !isAvailable ? `${slug}-${Date.now()}` : null
      };
    }
  });
};

export default useCreateCaseStudy;