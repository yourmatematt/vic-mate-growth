/**
 * Custom React Hook for Updating Case Studies
 *
 * Handles form submission, image uploads, and case study updates
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CaseStudyFormData, CaseStudy, ApiResponse } from '@/types/case-studies';
import { mockCaseStudies } from '@/lib/mockCaseStudiesData';
import { formDataToCaseStudy, createUniqueSlug } from '@/lib/case-study-utils';
import { uploadCaseStudyImage, deleteCaseStudyImage, getPathFromUrl } from '@/lib/supabase-storage';

// Mock API delay function
const mockApiDelay = (ms: number = 1000) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Mock update function
const updateCaseStudy = async (
  id: string,
  formData: CaseStudyFormData
): Promise<ApiResponse<CaseStudy>> => {
  await mockApiDelay(1200);

  try {
    // Find existing case study
    const existingIndex = mockCaseStudies.findIndex(cs => cs.id === id);
    if (existingIndex === -1) {
      throw new Error('Case study not found');
    }

    const existingCaseStudy = mockCaseStudies[existingIndex];

    // Check slug uniqueness (excluding current case study)
    if (formData.slug && formData.slug !== existingCaseStudy.slug) {
      const otherSlugs = mockCaseStudies
        .filter(cs => cs.id !== id)
        .map(cs => cs.slug);

      if (otherSlugs.includes(formData.slug)) {
        throw new Error('Slug is already in use by another case study');
      }
    }

    // Convert form data to case study updates
    const updateData = formDataToCaseStudy(formData);

    // Create updated case study
    const updatedCaseStudy: CaseStudy = {
      ...existingCaseStudy,
      ...updateData,
      updated_at: new Date().toISOString()
    };

    // Handle publish date logic
    if (updatedCaseStudy.status === 'published' && !updatedCaseStudy.published_at) {
      updatedCaseStudy.published_at = new Date().toISOString();
    } else if (updatedCaseStudy.status !== 'published') {
      updatedCaseStudy.published_at = null;
    }

    // Update mock data
    mockCaseStudies[existingIndex] = updatedCaseStudy;

    return {
      success: true,
      data: updatedCaseStudy,
      message: 'Case study updated successfully'
    };
  } catch (error) {
    console.error('Update case study error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update case study');
  }
};

// Interface for update case study parameters
interface UpdateCaseStudyParams {
  id: string;
  formData: CaseStudyFormData;
  imageFiles?: {
    featured?: File;
    before?: File;
    after?: File;
    gallery?: File[];
  };
  imagesToDelete?: {
    featured?: string; // URL of image to delete
    before?: string;
    after?: string;
    gallery?: string[];
  };
}

// Enhanced update function with image handling
const updateCaseStudyWithImages = async ({
  id,
  formData,
  imageFiles,
  imagesToDelete
}: UpdateCaseStudyParams): Promise<ApiResponse<CaseStudy>> => {
  try {
    // First, handle image deletions
    if (imagesToDelete) {
      const deletePromises: Promise<any>[] = [];

      // Delete featured image
      if (imagesToDelete.featured) {
        const path = getPathFromUrl(imagesToDelete.featured);
        if (path) {
          deletePromises.push(deleteCaseStudyImage(path));
        }
      }

      // Delete before image
      if (imagesToDelete.before) {
        const path = getPathFromUrl(imagesToDelete.before);
        if (path) {
          deletePromises.push(deleteCaseStudyImage(path));
        }
      }

      // Delete after image
      if (imagesToDelete.after) {
        const path = getPathFromUrl(imagesToDelete.after);
        if (path) {
          deletePromises.push(deleteCaseStudyImage(path));
        }
      }

      // Delete gallery images
      if (imagesToDelete.gallery) {
        imagesToDelete.gallery.forEach(url => {
          const path = getPathFromUrl(url);
          if (path) {
            deletePromises.push(deleteCaseStudyImage(path));
          }
        });
      }

      // Wait for deletions to complete
      if (deletePromises.length > 0) {
        await Promise.allSettled(deletePromises);
      }
    }

    // Update the case study
    const caseStudyResponse = await updateCaseStudy(id, formData);

    if (!caseStudyResponse.success || !caseStudyResponse.data) {
      throw new Error(caseStudyResponse.message || 'Failed to update case study');
    }

    const updatedCaseStudy = caseStudyResponse.data;

    // Handle new image uploads
    if (imageFiles) {
      const uploadPromises: Promise<any>[] = [];

      // Upload featured image
      if (imageFiles.featured) {
        uploadPromises.push(
          uploadCaseStudyImage(imageFiles.featured, id, 'featured')
            .then(result => {
              if (result.success && result.data) {
                updatedCaseStudy.featured_image_url = result.data.publicUrl;
              }
            })
        );
      }

      // Upload before image
      if (imageFiles.before) {
        uploadPromises.push(
          uploadCaseStudyImage(imageFiles.before, id, 'before')
            .then(result => {
              if (result.success && result.data) {
                updatedCaseStudy.before_image_url = result.data.publicUrl;
              }
            })
        );
      }

      // Upload after image
      if (imageFiles.after) {
        uploadPromises.push(
          uploadCaseStudyImage(imageFiles.after, id, 'after')
            .then(result => {
              if (result.success && result.data) {
                updatedCaseStudy.after_image_url = result.data.publicUrl;
              }
            })
        );
      }

      // Wait for all uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.allSettled(uploadPromises);

        // Update the case study in mock data with new image URLs
        const caseStudyIndex = mockCaseStudies.findIndex(cs => cs.id === id);
        if (caseStudyIndex !== -1) {
          mockCaseStudies[caseStudyIndex] = updatedCaseStudy;
        }
      }
    }

    return {
      ...caseStudyResponse,
      data: updatedCaseStudy
    };
  } catch (error) {
    console.error('Update case study with images error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update case study');
  }
};

/**
 * Hook for updating an existing case study
 */
export const useUpdateCaseStudy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCaseStudyWithImages,
    onSuccess: (data, variables) => {
      // Invalidate case studies queries to refresh lists
      queryClient.invalidateQueries({
        queryKey: ['caseStudies']
      });

      // Update the specific case study in cache
      if (data.data) {
        queryClient.setQueryData(
          ['caseStudies', 'detail', variables.id],
          data.data
        );
      }
    },
    onError: (error) => {
      console.error('Error updating case study:', error);
    }
  });
};

/**
 * Hook for auto-saving case study drafts
 */
export const useAutoSaveCaseStudy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id?: string; formData: CaseStudyFormData }) => {
      // Auto-save logic - only save basic form data, not images
      await mockApiDelay(300);

      if (id) {
        // Update existing draft
        const existingIndex = mockCaseStudies.findIndex(cs => cs.id === id);
        if (existingIndex !== -1) {
          const existing = mockCaseStudies[existingIndex];
          const updateData = formDataToCaseStudy(formData);

          mockCaseStudies[existingIndex] = {
            ...existing,
            ...updateData,
            updated_at: new Date().toISOString(),
            status: 'draft' // Force draft status for auto-save
          };

          return mockCaseStudies[existingIndex];
        }
      } else {
        // Create new draft
        const newId = `draft-${Date.now()}`;
        const existingSlugs = mockCaseStudies.map(cs => cs.slug);
        const uniqueSlug = formData.slug || createUniqueSlug(formData.title || 'untitled', existingSlugs);

        const draftCaseStudy: CaseStudy = {
          id: newId,
          ...formDataToCaseStudy(formData),
          slug: uniqueSlug,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          author_id: 'admin-1',
          published_at: null
        } as CaseStudy;

        mockCaseStudies.unshift(draftCaseStudy);
        return draftCaseStudy;
      }
    },
    onSuccess: () => {
      // Invalidate queries but don't show notifications for auto-save
      queryClient.invalidateQueries({
        queryKey: ['caseStudies']
      });
    },
    onError: (error) => {
      // Silent error handling for auto-save
      console.warn('Auto-save failed:', error);
    }
  });
};

/**
 * Hook for publishing a case study
 */
export const usePublishCaseStudy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await mockApiDelay(800);

      const existingIndex = mockCaseStudies.findIndex(cs => cs.id === id);
      if (existingIndex === -1) {
        throw new Error('Case study not found');
      }

      const existing = mockCaseStudies[existingIndex];

      // Update to published status
      mockCaseStudies[existingIndex] = {
        ...existing,
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return mockCaseStudies[existingIndex];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['caseStudies']
      });

      if (data) {
        queryClient.setQueryData(
          ['caseStudies', 'detail', data.id],
          data
        );
      }
    }
  });
};

/**
 * Hook for unpublishing a case study
 */
export const useUnpublishCaseStudy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await mockApiDelay(500);

      const existingIndex = mockCaseStudies.findIndex(cs => cs.id === id);
      if (existingIndex === -1) {
        throw new Error('Case study not found');
      }

      const existing = mockCaseStudies[existingIndex];

      // Update to draft status
      mockCaseStudies[existingIndex] = {
        ...existing,
        status: 'draft',
        published_at: null,
        updated_at: new Date().toISOString()
      };

      return mockCaseStudies[existingIndex];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['caseStudies']
      });

      if (data) {
        queryClient.setQueryData(
          ['caseStudies', 'detail', data.id],
          data
        );
      }
    }
  });
};

export default useUpdateCaseStudy;