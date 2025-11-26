/**
 * Supabase Storage Utilities for Case Studies
 *
 * Handles image uploads, deletions, and URL generation for case study assets
 */

import { supabase } from '@/lib/supabase';
import { ImageType } from '@/types/case-studies';

const BUCKET_NAME = 'case-studies';

// Utility functions
export const generateImagePath = (
  caseStudyId: string,
  imageType: ImageType,
  fileExtension: string
): string => {
  const timestamp = Date.now();
  return `${caseStudyId}/${imageType}_${timestamp}.${fileExtension}`;
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

export const getPublicUrl = (path: string): string => {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
};

export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a JPEG, PNG, or WebP image file'
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB'
    };
  }

  return { isValid: true };
};

// Real Supabase image upload function
export const uploadCaseStudyImage = async (
  file: File,
  caseStudyId: string,
  imageType: ImageType
): Promise<{
  success: boolean;
  data?: {
    path: string;
    publicUrl: string;
    size: number;
  };
  error?: string;
}> => {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    };
  }

  try {
    // Generate file path
    const fileExtension = getFileExtension(file.name);
    const filePath = generateImagePath(caseStudyId, imageType, fileExtension);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image. Please try again.'
      };
    }

    const publicUrl = getPublicUrl(data.path);

    return {
      success: true,
      data: {
        path: data.path,
        publicUrl,
        size: file.size
      }
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Failed to upload image. Please try again.'
    };
  }
};

// Mock batch upload function
export const uploadMultipleImages = async (
  files: File[],
  caseStudyId: string,
  imageType: ImageType = 'gallery'
): Promise<{
  success: boolean;
  data?: Array<{
    path: string;
    publicUrl: string;
    size: number;
    originalName: string;
  }>;
  errors?: string[];
}> => {
  const results = [];
  const errors = [];

  for (const file of files) {
    try {
      const result = await uploadCaseStudyImage(file, caseStudyId, imageType);
      if (result.success && result.data) {
        results.push({
          ...result.data,
          originalName: file.name
        });
      } else {
        errors.push(`${file.name}: ${result.error}`);
      }
    } catch (error) {
      errors.push(`${file.name}: Upload failed`);
    }
  }

  return {
    success: results.length > 0,
    data: results,
    errors: errors.length > 0 ? errors : undefined
  };
};

// Real Supabase delete function
export const deleteCaseStudyImage = async (imagePath: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([imagePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image. Please try again.'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: 'Failed to delete image. Please try again.'
    };
  }
};

// Mock function to get image dimensions
export const getImageDimensions = (file: File): Promise<{
  width: number;
  height: number;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
};

// Generate optimized image URL with transformations (if using a service like Cloudinary)
export const getOptimizedImageUrl = (
  publicUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string => {
  // For now, just return the original URL
  // In production, you could integrate with Cloudinary, ImageKit, etc.
  return publicUrl;
};

// Helper function to extract path from public URL
export const getPathFromUrl = (publicUrl: string): string | null => {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split('/');

    // Look for the storage path pattern
    const objectIndex = pathParts.indexOf('object');
    const publicIndex = pathParts.indexOf('public');
    const bucketIndex = pathParts.indexOf(BUCKET_NAME);

    if (bucketIndex !== -1 && pathParts.length > bucketIndex + 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }

    return null;
  } catch {
    return null;
  }
};

// Cleanup function to delete all images for a case study
export const deleteAllCaseStudyImages = async (caseStudyId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // List all files in the case study folder
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(caseStudyId);

    if (listError) {
      console.error('Error listing files:', listError);
      return {
        success: false,
        error: 'Failed to list images for deletion.'
      };
    }

    if (files && files.length > 0) {
      // Delete all files in the folder
      const filePaths = files.map(file => `${caseStudyId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(filePaths);

      if (deleteError) {
        console.error('Error deleting files:', deleteError);
        return {
          success: false,
          error: 'Failed to delete some images.'
        };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Batch delete error:', error);
    return {
      success: false,
      error: 'Failed to delete images. Please try again.'
    };
  }
};

// Type definitions for upload progress
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Enhanced upload with progress callback
export const uploadCaseStudyImageWithProgress = async (
  file: File,
  caseStudyId: string,
  imageType: ImageType,
  onProgress?: (progress: UploadProgress) => void
): Promise<{
  success: boolean;
  data?: {
    path: string;
    publicUrl: string;
    size: number;
  };
  error?: string;
}> => {
  // Validate file first
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    };
  }

  try {
    // Simulate upload progress
    if (onProgress) {
      const total = file.size;
      let loaded = 0;

      const progressInterval = setInterval(() => {
        loaded += total * 0.1; // Simulate progress
        if (loaded >= total) {
          loaded = total;
          clearInterval(progressInterval);
        }

        onProgress({
          loaded,
          total,
          percentage: Math.round((loaded / total) * 100)
        });
      }, 100);

      // Simulate upload time
      await new Promise(resolve => setTimeout(resolve, 1500));
    } else {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Generate file path and return success
    const fileExtension = getFileExtension(file.name);
    const filePath = generateImagePath(caseStudyId, imageType, fileExtension);
    const publicUrl = getPublicUrl(filePath);

    return {
      success: true,
      data: {
        path: filePath,
        publicUrl,
        size: file.size
      }
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: 'Failed to upload image. Please try again.'
    };
  }
};