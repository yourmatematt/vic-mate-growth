/**
 * Post Editor Modal Component
 * Allows editing of social media posts with caption, images, and comments
 * Mobile-friendly with mate-like interface for Australian small business owners
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
  Clock,
  Calendar,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MessageCircle,
  History,
  CheckCircle,
  Edit3,
  AlertCircle,
  Loader2,
  Plus,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  useContentPost,
  useUpdateCaption,
  useUploadImage,
  useDeleteImage,
  useAddComment,
  usePostRevisions,
  usePostComments,
} from '@/hooks/useContentCalendar';
import { australianTimezoneUtils } from '@/services/contentCalendarService';
import type {
  ContentCalendarPostWithRelations,
  ContentPlatform,
  PostStatus,
  ContentCalendarRevision,
  ContentCalendarComment,
} from '@/types/contentCalendar';

// ============================================================================
// INTERFACES AND TYPES
// ============================================================================

interface PostEditorModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface DragDropState {
  isDragging: boolean;
  isOver: boolean;
}

// ============================================================================
// PLATFORM CONFIGURATION
// ============================================================================

const platformIcons = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
} as const;

const platformColors = {
  facebook: 'bg-blue-500 text-white',
  instagram: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white',
  linkedin: 'bg-blue-600 text-white',
  twitter: 'bg-gray-900 text-white',
} as const;

const platformLimits = {
  facebook: { maxChars: 63206, name: 'Facebook' },
  instagram: { maxChars: 2200, name: 'Instagram' },
  linkedin: { maxChars: 3000, name: 'LinkedIn' },
  twitter: { maxChars: 280, name: 'Twitter/X' },
} as const;

const statusConfig = {
  draft: { icon: Edit3, label: 'Draft', color: 'bg-gray-500' },
  scheduled: { icon: Clock, label: 'Scheduled', color: 'bg-orange-500' },
  published: { icon: CheckCircle, label: 'Live', color: 'bg-green-500' },
  cancelled: { icon: AlertCircle, label: 'Cancelled', color: 'bg-red-500' },
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if caption length is within limits
 */
const getCaptionLengthStatus = (text: string, platform: ContentPlatform) => {
  const limit = platformLimits[platform].maxChars;
  const length = text.length;
  const percentage = (length / limit) * 100;

  return {
    length,
    limit,
    percentage,
    isValid: length <= limit,
    isWarning: percentage > 80 && percentage <= 100,
    isError: percentage > 100,
  };
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// ============================================================================
// SUB COMPONENTS
// ============================================================================

/**
 * Platform header component
 */
const PlatformHeader: React.FC<{
  platform: ContentPlatform;
  status: PostStatus;
  scheduledDate: string;
}> = ({ platform, status, scheduledDate }) => {
  const PlatformIcon = platformIcons[platform];
  const StatusIcon = statusConfig[status].icon;

  const formattedDate = australianTimezoneUtils.formatAustralianTime(scheduledDate);
  const formattedTime = australianTimezoneUtils.formatAustralianTime(
    scheduledDate,
    'h:mm a'
  );

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${platformColors[platform]}`}>
          <PlatformIcon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {platformLimits[platform].name}
          </h3>
          <p className="text-sm text-gray-600">
            {formattedDate} at {formattedTime}
          </p>
        </div>
      </div>
      <Badge className={`${statusConfig[status].color} text-white`}>
        <StatusIcon className="w-3 h-3 mr-1" />
        {statusConfig[status].label}
      </Badge>
    </div>
  );
};

/**
 * Character counter component
 */
const CharacterCounter: React.FC<{
  text: string;
  platform: ContentPlatform;
}> = ({ text, platform }) => {
  const status = getCaptionLengthStatus(text, platform);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`flex-1 ${status.isError ? 'text-red-600' : status.isWarning ? 'text-orange-600' : 'text-gray-600'}`}>
        {status.length.toLocaleString()} / {status.limit.toLocaleString()} characters
      </div>
      <div className="w-16">
        <Progress
          value={Math.min(status.percentage, 100)}
          className={`h-2 ${status.isError ? 'bg-red-100' : status.isWarning ? 'bg-orange-100' : 'bg-gray-100'}`}
        />
      </div>
    </div>
  );
};

/**
 * Image upload zone component
 */
const ImageUploadZone: React.FC<{
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
}> = ({ onFileSelect, isUploading, uploadProgress }) => {
  const [dragState, setDragState] = useState<DragDropState>({
    isDragging: false,
    isOver: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragState({ isDragging: true, isOver: true });
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragState({ isDragging: true, isOver: false });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragState({ isDragging: false, isOver: false });

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      onFileSelect(imageFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  if (isUploading) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <p className="text-sm text-gray-600">Uploading your image...</p>
          <Progress value={uploadProgress} className="w-full max-w-xs" />
          <p className="text-xs text-gray-500">{uploadProgress}% complete</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
        ${dragState.isOver
          ? 'border-orange-500 bg-orange-50'
          : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center gap-3">
        <div className={`p-3 rounded-full ${dragState.isOver ? 'bg-orange-100' : 'bg-gray-100'}`}>
          <Upload className={`w-6 h-6 ${dragState.isOver ? 'text-orange-600' : 'text-gray-600'}`} />
        </div>
        <div>
          <p className="font-medium text-gray-900">
            Drop your image here, or click to browse
          </p>
          <p className="text-sm text-gray-600 mt-1">
            JPG, PNG or WebP • Max 5MB • Perfect for social media
          </p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInput}
      />
    </div>
  );
};

/**
 * Revision history component
 */
const RevisionHistory: React.FC<{
  revisions: ContentCalendarRevision[];
  currentCaption: string;
}> = ({ revisions, currentCaption }) => {
  if (revisions.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic text-center py-4">
        No revision history yet. Your changes will appear here as you edit.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Current version */}
      <div className="border border-green-200 bg-green-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-green-600 text-white">Current</Badge>
          <span className="text-sm text-green-700">Latest version</span>
        </div>
        <p className="text-sm text-gray-800">{currentCaption}</p>
      </div>

      {/* Previous revisions */}
      {revisions
        .slice()
        .reverse()
        .map((revision, index) => (
          <div key={revision.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                Version {revisions.length - index}
              </Badge>
              <span className="text-xs text-gray-500">
                {australianTimezoneUtils.formatAustralianTime(revision.created_at)}
              </span>
            </div>
            <p className="text-sm text-gray-700">{revision.caption}</p>
          </div>
        ))}
    </div>
  );
};

/**
 * Comments section component
 */
const CommentsSection: React.FC<{
  comments: ContentCalendarComment[];
  onAddComment: (comment: string) => void;
  isAddingComment: boolean;
}> = ({ comments, onAddComment, isAddingComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Add new comment */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Leave feedback or suggestions about this post..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <Button
          type="submit"
          disabled={!newComment.trim() || isAddingComment}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isAddingComment ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Add Comment
            </>
          )}
        </Button>
      </form>

      <Separator />

      {/* Existing comments */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500 italic text-center py-4">
          No comments yet. Be the first to leave feedback!
        </p>
      ) : (
        <ScrollArea className="h-60">
          <div className="space-y-3 pr-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="border-gray-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {(comment as any).user?.email || 'Team Member'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {australianTimezoneUtils.formatAustralianTime(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{comment.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PostEditorModal: React.FC<PostEditorModalProps> = ({
  postId,
  isOpen,
  onClose,
}) => {
  const { toast } = useToast();
  const [caption, setCaption] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // API hooks
  const { data: post, isLoading: isLoadingPost } = useContentPost(postId, isOpen);
  const { data: revisions = [] } = usePostRevisions(postId, isOpen);
  const { data: comments = [] } = usePostComments(postId, isOpen);

  const updateCaptionMutation = useUpdateCaption();
  const uploadImageMutation = useUploadImage();
  const deleteImageMutation = useDeleteImage();
  const addCommentMutation = useAddComment();

  // Initialize caption when post loads
  useEffect(() => {
    if (post && !isDirty) {
      setCaption(post.current_caption);
    }
  }, [post, isDirty]);

  // Auto-save functionality
  useEffect(() => {
    if (isDirty && caption && post && caption !== post.current_caption) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new timeout for auto-save
      const timeout = setTimeout(() => {
        handleSaveCaption();
      }, 2000);

      setAutoSaveTimeout(timeout);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [caption, isDirty, post]);

  const handleCaptionChange = (value: string) => {
    setCaption(value);
    setIsDirty(true);
  };

  const handleSaveCaption = async () => {
    if (!post || !isDirty || caption === post.current_caption) return;

    try {
      await updateCaptionMutation.mutateAsync({
        postId: post.id,
        newCaption: caption,
        userId: post.user_id,
      });
      setIsDirty(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!post) return;

    try {
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 100);

      await uploadImageMutation.mutateAsync({
        postId: post.id,
        file,
        userId: post.user_id,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => setUploadProgress(0), 1000);

      toast({
        title: "Image uploaded successfully!",
        description: `${file.name} has been added to your post.`,
      });
    } catch (error) {
      setUploadProgress(0);
      // Error handled by the hook
    }
  };

  const handleImageDelete = async (imageId: string) => {
    if (!post) return;

    try {
      await deleteImageMutation.mutateAsync({
        postId: post.id,
        imageId,
      });
    } catch (error) {
      // Error handled by the hook
    }
  };

  const handleAddComment = async (comment: string) => {
    if (!post) return;

    try {
      await addCommentMutation.mutateAsync({
        postId: post.id,
        userId: post.user_id,
        comment,
      });
    } catch (error) {
      // Error handled by the hook
    }
  };

  const handleClose = () => {
    if (isDirty) {
      handleSaveCaption();
    }
    onClose();
  };

  if (!isOpen) return null;

  if (isLoadingPost) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            <span className="ml-2 text-gray-600">Loading your post...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!post) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Oops! Couldn't find that post. It might have been deleted or moved.
            </AlertDescription>
          </Alert>
          <Button onClick={handleClose} className="mt-4">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const captionStatus = getCaptionLengthStatus(caption, post.platform);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Edit Post
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Make changes to your social media post. Changes are saved automatically as you type.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[70vh]">
            <div className="space-y-6 pr-4">
              {/* Platform header */}
              <PlatformHeader
                platform={post.platform}
                status={post.status}
                scheduledDate={post.scheduled_date}
              />

              {/* Caption editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Caption</h4>
                  {isDirty && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                      Auto-saving...
                    </div>
                  )}
                  {updateCaptionMutation.isSuccess && !isDirty && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      Saved
                    </div>
                  )}
                </div>

                <Textarea
                  value={caption}
                  onChange={(e) => handleCaptionChange(e.target.value)}
                  className={`min-h-[120px] resize-none ${captionStatus.isError ? 'border-red-500' : ''}`}
                  placeholder="Write your social media caption here..."
                />

                <CharacterCounter text={caption} platform={post.platform} />

                {captionStatus.isError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Your caption is too long for {platformLimits[post.platform].name}.
                      Try trimming it down a bit to fit the character limit.
                    </AlertDescription>
                  </Alert>
                )}

                {post.ai_generated && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-600 text-white">AI Generated</Badge>
                    </div>
                    <p className="text-sm text-blue-800">
                      This caption was created by AI. Feel free to edit it to match your voice and style.
                    </p>
                  </div>
                )}
              </div>

              {/* Images section */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Images</h4>

                {/* Existing images */}
                {post.images && post.images.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {post.images.map((image) => (
                      <div key={image.id} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={post.image_url || `https://via.placeholder.com/400x400?text=${encodeURIComponent(image.file_name)}`}
                            alt={image.file_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x400?text=${encodeURIComponent(image.file_name)}`;
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleImageDelete(image.id)}
                            disabled={deleteImageMutation.isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-white/90 backdrop-blur-sm rounded px-2 py-1">
                            <p className="text-xs font-medium text-gray-800 truncate">
                              {image.file_name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatFileSize(image.file_size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload zone */}
                <ImageUploadZone
                  onFileSelect={handleImageUpload}
                  isUploading={uploadImageMutation.isLoading}
                  uploadProgress={uploadProgress}
                />

                <p className="text-xs text-gray-500">
                  Perfect for social media • Images help your posts get more engagement
                </p>
              </div>

              {/* Accordions for revision history and comments */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="revisions">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Revision History ({revisions.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <RevisionHistory revisions={revisions} currentCaption={caption} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="comments">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Comments & Feedback ({comments.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CommentsSection
                      comments={comments}
                      onAddComment={handleAddComment}
                      isAddingComment={addCommentMutation.isLoading}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {isDirty ? (
              <span className="text-orange-600">Unsaved changes</span>
            ) : (
              'All changes saved'
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button
              onClick={handleSaveCaption}
              disabled={!isDirty || updateCaptionMutation.isLoading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {updateCaptionMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostEditorModal;