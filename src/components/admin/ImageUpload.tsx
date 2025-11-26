import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageType } from '@/types/case-studies';
import { uploadCaseStudyImageWithProgress, UploadProgress } from '@/lib/supabase-storage';

interface ImageUploadProps {
  onUploadSuccess: (url: string, path: string) => void;
  onUploadError?: (error: string) => void;
  existingImageUrl?: string;
  caseStudyId: string;
  imageType: ImageType;
  label?: string;
  description?: string;
  recommendedSize?: string;
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  preview: string | null;
  file: File | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  existingImageUrl,
  caseStudyId,
  imageType,
  label,
  description,
  recommendedSize,
  className = '',
  disabled = false,
  multiple = false,
  maxFiles = 1
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    preview: existingImageUrl || null,
    file: null
  });
  const [isDragOver, setIsDragOver] = useState(false);

  // Reset upload state
  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      preview: existingImageUrl || null,
      file: null
    });
  }, [existingImageUrl]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      const file = files[0]; // For now, handle single file only

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setUploadState(prev => ({
        ...prev,
        preview: previewUrl,
        file,
        error: null
      }));

      // Start upload
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0
      }));

      try {
        const result = await uploadCaseStudyImageWithProgress(
          file,
          caseStudyId,
          imageType,
          (progress: UploadProgress) => {
            setUploadState(prev => ({
              ...prev,
              progress: progress.percentage
            }));
          }
        );

        if (result.success && result.data) {
          setUploadState(prev => ({
            ...prev,
            isUploading: false,
            progress: 100,
            preview: result.data!.publicUrl,
            error: null
          }));

          onUploadSuccess(result.data.publicUrl, result.data.path);
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';

        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          progress: 0,
          error: errorMessage
        }));

        onUploadError?.(errorMessage);

        // Clean up preview URL
        URL.revokeObjectURL(previewUrl);
      }
    },
    [caseStudyId, imageType, onUploadSuccess, onUploadError, disabled]
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect, disabled]);

  // Handle click to browse
  const handleBrowseClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Handle remove
  const handleRemove = useCallback(() => {
    if (uploadState.preview && uploadState.preview !== existingImageUrl) {
      URL.revokeObjectURL(uploadState.preview);
    }
    resetUpload();
  }, [uploadState.preview, existingImageUrl, resetUpload]);

  // Handle replace
  const handleReplace = useCallback(() => {
    handleBrowseClick();
  }, [handleBrowseClick]);

  const hasImage = Boolean(uploadState.preview);
  const isProcessing = uploadState.isUploading;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label and description */}
      {(label || description || recommendedSize) && (
        <div className="space-y-1">
          {label && (
            <div className="text-sm font-medium text-foreground">{label}</div>
          )}
          {description && (
            <div className="text-xs text-muted-foreground">{description}</div>
          )}
          {recommendedSize && (
            <Badge variant="outline" className="text-xs">
              Recommended: {recommendedSize}
            </Badge>
          )}
        </div>
      )}

      {/* Upload area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-colors
          ${isDragOver && !disabled
            ? 'border-primary bg-primary/5'
            : hasImage
            ? 'border-border'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!hasImage ? handleBrowseClick : undefined}
      >
        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        {/* Content */}
        {!hasImage ? (
          // Upload prompt
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Drag & drop an image here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP up to 10MB
              </p>
            </div>
          </div>
        ) : (
          // Image preview
          <div className="relative group">
            <img
              src={uploadState.preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />

            {/* Upload progress overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                <div className="text-center text-white space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                  <div className="text-sm">Uploading...</div>
                  <div className="w-32">
                    <Progress value={uploadState.progress} className="h-2" />
                  </div>
                  <div className="text-xs">{uploadState.progress}%</div>
                </div>
              </div>
            )}

            {/* Success indicator */}
            {!isProcessing && !uploadState.error && uploadState.preview !== existingImageUrl && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            {/* Action buttons */}
            {!isProcessing && (
              <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReplace();
                    }}
                    disabled={disabled}
                  >
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    disabled={disabled}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* File info */}
            {uploadState.file && !isProcessing && (
              <div className="absolute bottom-2 left-2 right-2">
                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
                  {uploadState.file.name} ({Math.round(uploadState.file.size / 1024)} KB)
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {uploadState.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {uploadState.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Upload instructions when dragging */}
      {isDragOver && !disabled && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-lg flex items-center justify-center z-10">
          <div className="text-primary font-medium">Drop image here</div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;