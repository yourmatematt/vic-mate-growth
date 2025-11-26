/**
 * Image Upload Service
 * Handles file uploads to Supabase Storage with validation and utilities
 * Supports content calendar images with Australian file size conventions
 */

import { supabase } from '@/lib/supabase';

/**
 * Custom error class for image upload operations
 */
class ImageUploadServiceError extends Error {
  public code: string;
  public field?: string;
  public details?: any;

  constructor(message: string, code: string, field?: string, details?: any) {
    super(message);
    this.name = 'ImageUploadServiceError';
    this.code = code;
    this.field = field;
    this.details = details;
  }
}

/**
 * Image validation configuration
 */
const IMAGE_VALIDATION_CONFIG = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB maximum file size
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  minWidth: 100,
  minHeight: 100,
  maxWidth: 4096,
  maxHeight: 4096,
};

/**
 * Image upload response interface
 */
export interface ImageUploadResponse {
  publicUrl: string;
  path: string;
  size: number;
  type: string;
}

/**
 * Image validation result interface
 */
export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
  file?: {
    size: number;
    type: string;
    width?: number;
    height?: number;
  };
}

/**
 * Validate image file before upload
 * Checks file size, type, and dimensions with Australian English error messages
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  const errors: string[] = [];

  // Check file size (5MB limit)
  if (file.size > IMAGE_VALIDATION_CONFIG.maxSizeBytes) {
    const maxSizeMB = IMAGE_VALIDATION_CONFIG.maxSizeBytes / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    errors.push(`File size (${fileSizeMB}MB) exceeds the maximum allowed size of ${maxSizeMB}MB`);
  }

  // Check file type
  if (!IMAGE_VALIDATION_CONFIG.allowedTypes.includes(file.type)) {
    errors.push('File type not supported. Please upload a JPG, PNG, or WebP image');
  }

  // Check file extension
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const hasValidExtension = IMAGE_VALIDATION_CONFIG.allowedExtensions.some(ext =>
    ext.substring(1) === fileExtension
  );

  if (!hasValidExtension) {
    errors.push('File extension not supported. Please use .jpg, .jpeg, .png, or .webp');
  }

  // Validate image dimensions (requires loading the image)
  let imageDimensions: { width: number; height: number } | undefined;

  if (errors.length === 0) {
    try {
      imageDimensions = await getImageDimensions(file);

      if (imageDimensions) {
        const { width, height } = imageDimensions;

        if (width < IMAGE_VALIDATION_CONFIG.minWidth || height < IMAGE_VALIDATION_CONFIG.minHeight) {
          errors.push(`Image dimensions (${width}x${height}) are too small. Minimum size is ${IMAGE_VALIDATION_CONFIG.minWidth}x${IMAGE_VALIDATION_CONFIG.minHeight}px`);
        }

        if (width > IMAGE_VALIDATION_CONFIG.maxWidth || height > IMAGE_VALIDATION_CONFIG.maxHeight) {
          errors.push(`Image dimensions (${width}x${height}) are too large. Maximum size is ${IMAGE_VALIDATION_CONFIG.maxWidth}x${IMAGE_VALIDATION_CONFIG.maxHeight}px`);
        }
      }
    } catch (error) {
      errors.push('Unable to read image file. Please ensure it\'s a valid image');
    }
  }

  const isValid = errors.length === 0;

  if (!isValid) {
    throw new ImageUploadServiceError(
      errors.join('. '),
      'VALIDATION_FAILED',
      'file',
      { errors, file: { size: file.size, type: file.type, ...imageDimensions } }
    );
  }

  return {
    valid: isValid,
    errors,
    file: {
      size: file.size,
      type: file.type,
      width: imageDimensions?.width,
      height: imageDimensions?.height,
    },
  };
}

/**
 * Get image dimensions by loading it in memory
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { naturalWidth: width, naturalHeight: height } = img;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Upload file to Supabase Storage
 * Returns public URL and upload details
 */
export async function uploadToStorage(
  file: File,
  bucket: string,
  path: string
): Promise<ImageUploadResponse> {
  try {
    // Validate file before upload
    await validateImageFile(file);

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600', // Cache for 1 hour
        upsert: false, // Don't overwrite existing files
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);

      // Handle specific storage errors with Australian English messages
      let errorMessage = 'Failed to upload image';

      switch (uploadError.message) {
        case 'The resource already exists':
          errorMessage = 'A file with this name already exists. Please try again';
          break;
        case 'Payload too large':
          errorMessage = 'File size is too large for upload';
          break;
        case 'Invalid file type':
          errorMessage = 'File type not supported';
          break;
        default:
          errorMessage = uploadError.message || 'Failed to upload image';
      }

      throw new ImageUploadServiceError(
        errorMessage,
        'UPLOAD_FAILED',
        undefined,
        uploadError
      );
    }

    if (!uploadData) {
      throw new ImageUploadServiceError(
        'Upload completed but no data returned',
        'UPLOAD_INCOMPLETE'
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    if (!urlData?.publicUrl) {
      throw new ImageUploadServiceError(
        'Failed to generate public URL for uploaded file',
        'URL_GENERATION_FAILED'
      );
    }

    return {
      publicUrl: urlData.publicUrl,
      path: uploadData.path,
      size: file.size,
      type: file.type,
    };

  } catch (error) {
    if (error instanceof ImageUploadServiceError) {
      throw error;
    }

    console.error('Image upload service error:', error);
    throw new ImageUploadServiceError(
      'An unexpected error occurred during file upload',
      'UNKNOWN_ERROR',
      undefined,
      error
    );
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromStorage(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Storage deletion error:', error);

      // Don't throw errors for file not found, as it might already be deleted
      if (error.message.includes('not found')) {
        console.warn(`File not found for deletion: ${path}`);
        return;
      }

      throw new ImageUploadServiceError(
        'Failed to delete file from storage',
        'DELETION_FAILED',
        undefined,
        error
      );
    }
  } catch (error) {
    if (error instanceof ImageUploadServiceError) {
      throw error;
    }

    console.error('Image deletion service error:', error);
    throw new ImageUploadServiceError(
      'An unexpected error occurred during file deletion',
      'UNKNOWN_ERROR',
      undefined,
      error
    );
  }
}

/**
 * Get public URL for a file in storage
 */
export function getPublicUrl(bucket: string, path: string): string {
  try {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    if (!data?.publicUrl) {
      throw new ImageUploadServiceError(
        'Failed to generate public URL',
        'URL_GENERATION_FAILED'
      );
    }

    return data.publicUrl;
  } catch (error) {
    if (error instanceof ImageUploadServiceError) {
      throw error;
    }

    console.error('Public URL generation error:', error);
    throw new ImageUploadServiceError(
      'An unexpected error occurred while generating public URL',
      'UNKNOWN_ERROR',
      undefined,
      error
    );
  }
}

/**
 * Get file info from storage (size, metadata, etc.)
 */
export async function getFileInfo(bucket: string, path: string): Promise<any> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop(),
      });

    if (error) {
      throw new ImageUploadServiceError(
        'Failed to retrieve file information',
        'FILE_INFO_FAILED',
        undefined,
        error
      );
    }

    if (!data || data.length === 0) {
      throw new ImageUploadServiceError(
        'File not found in storage',
        'FILE_NOT_FOUND'
      );
    }

    return data[0];
  } catch (error) {
    if (error instanceof ImageUploadServiceError) {
      throw error;
    }

    console.error('File info retrieval error:', error);
    throw new ImageUploadServiceError(
      'An unexpected error occurred while retrieving file information',
      'UNKNOWN_ERROR',
      undefined,
      error
    );
  }
}

/**
 * Upload multiple files with progress tracking
 */
export async function uploadMultipleFiles(
  files: File[],
  bucket: string,
  getPath: (file: File, index: number) => string,
  onProgress?: (uploadedCount: number, totalCount: number, currentFile: string) => void
): Promise<ImageUploadResponse[]> {
  const results: ImageUploadResponse[] = [];
  const errors: { file: string; error: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = getPath(file, i);

    try {
      if (onProgress) {
        onProgress(i, files.length, file.name);
      }

      const result = await uploadToStorage(file, bucket, path);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, files.length, file.name);
      }
    } catch (error) {
      const errorMessage = error instanceof ImageUploadServiceError
        ? error.message
        : 'Upload failed';

      errors.push({
        file: file.name,
        error: errorMessage,
      });

      console.error(`Failed to upload ${file.name}:`, error);
    }
  }

  if (errors.length > 0 && results.length === 0) {
    // All uploads failed
    throw new ImageUploadServiceError(
      `All file uploads failed: ${errors.map(e => `${e.file}: ${e.error}`).join('; ')}`,
      'ALL_UPLOADS_FAILED',
      undefined,
      { errors }
    );
  }

  if (errors.length > 0) {
    // Some uploads failed
    console.warn('Some file uploads failed:', errors);
  }

  return results;
}

/**
 * Generate optimised image storage path
 * Creates organised folder structure: userId/year/month/filename
 */
export function generateImagePath(
  userId: string,
  fileName: string,
  prefix: string = 'content'
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Clean filename and ensure unique name
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);

  const extension = cleanFileName.split('.').pop();
  const baseName = cleanFileName.replace(`.${extension}`, '');

  const uniqueFileName = `${baseName}-${timestamp}-${randomString}.${extension}`;

  return `${userId}/${prefix}/${year}/${month}/${uniqueFileName}`;
}

/**
 * Convert file size to human readable format (Australian English)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get image file type description
 */
export function getImageTypeDescription(mimeType: string): string {
  const typeMap: { [key: string]: string } = {
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/webp': 'WebP Image',
    'image/gif': 'GIF Image',
    'image/bmp': 'Bitmap Image',
    'image/svg+xml': 'SVG Vector Image',
  };

  return typeMap[mimeType] || 'Image File';
}

// ============================================================================
// EXPORT ALL FUNCTIONS AND TYPES
// ============================================================================

export {
  ImageUploadServiceError,
  IMAGE_VALIDATION_CONFIG,
};

// Export default object with all functions
export default {
  uploadToStorage,
  deleteFromStorage,
  getPublicUrl,
  validateImageFile,
  getFileInfo,
  uploadMultipleFiles,
  generateImagePath,
  formatFileSize,
  getImageTypeDescription,
  getImageDimensions,
};