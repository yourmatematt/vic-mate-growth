import React, { useState } from 'react';
import { Eye, ZoomIn, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BeforeAfterPreviewProps {
  beforeImageUrl?: string;
  afterImageUrl?: string;
  className?: string;
}

const BeforeAfterPreview: React.FC<BeforeAfterPreviewProps> = ({
  beforeImageUrl,
  afterImageUrl,
  className = ''
}) => {
  const [fullscreenImage, setFullscreenImage] = useState<{
    url: string;
    type: 'before' | 'after';
  } | null>(null);

  const hasBeforeImage = Boolean(beforeImageUrl);
  const hasAfterImage = Boolean(afterImageUrl);
  const hasBothImages = hasBeforeImage && hasAfterImage;

  if (!hasBeforeImage && !hasAfterImage) {
    return (
      <div className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Eye className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Before & After Preview
            </h3>
            <p className="text-sm text-muted-foreground">
              Upload before and after images to see a side-by-side comparison
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-foreground">
            Before & After Comparison
          </h3>
          {hasBothImages && (
            <Badge variant="secondary" className="text-xs">
              Both images uploaded
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Before</span>
              {hasBeforeImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setFullscreenImage({
                    url: beforeImageUrl!,
                    type: 'before'
                  })}
                >
                  <ZoomIn className="w-3 h-3 mr-1" />
                  View
                </Button>
              )}
            </div>

            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border">
              {hasBeforeImage ? (
                <div className="relative group h-full">
                  <img
                    src={beforeImageUrl}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors cursor-pointer"
                       onClick={() => setFullscreenImage({
                         url: beforeImageUrl!,
                         type: 'before'
                       })}
                  />
                  <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                    BEFORE
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted-foreground/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Eye className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No before image</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* After Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">After</span>
              {hasAfterImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => setFullscreenImage({
                    url: afterImageUrl!,
                    type: 'after'
                  })}
                >
                  <ZoomIn className="w-3 h-3 mr-1" />
                  View
                </Button>
              )}
            </div>

            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border">
              {hasAfterImage ? (
                <div className="relative group h-full">
                  <img
                    src={afterImageUrl}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors cursor-pointer"
                       onClick={() => setFullscreenImage({
                         url: afterImageUrl!,
                         type: 'after'
                       })}
                  />
                  <Badge className="absolute top-2 left-2 bg-green-600 text-white">
                    AFTER
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-muted-foreground/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Eye className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No after image</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comparison Stats */}
        {hasBothImages && (
          <div className="bg-accent/50 border rounded-lg p-4">
            <div className="text-center space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Visual Transformation Complete
              </h4>
              <p className="text-xs text-muted-foreground">
                Both before and after images uploaded. This comparison will be displayed on your case study page.
              </p>
            </div>
          </div>
        )}

        {/* Missing Image Alert */}
        {(hasBeforeImage || hasAfterImage) && !hasBothImages && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-center space-y-2">
              <h4 className="text-sm font-medium text-orange-800">
                {hasBeforeImage ? 'After image missing' : 'Before image missing'}
              </h4>
              <p className="text-xs text-orange-700">
                Upload both images to create a complete before & after comparison for your case study.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <Dialog open={true} onOpenChange={() => setFullscreenImage(null)}>
          <DialogContent className="max-w-4xl w-full h-[90vh] p-0">
            <DialogHeader className="p-4 pb-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center space-x-2">
                  <span>
                    {fullscreenImage.type === 'before' ? 'Before' : 'After'} Image
                  </span>
                  <Badge variant={fullscreenImage.type === 'before' ? 'destructive' : 'default'}>
                    {fullscreenImage.type.toUpperCase()}
                  </Badge>
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFullscreenImage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-1 p-4 pt-0">
              <div className="w-full h-full bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={fullscreenImage.url}
                  alt={`${fullscreenImage.type} image`}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default BeforeAfterPreview;