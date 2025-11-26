import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
  height?: string;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className = '',
  height = 'h-96'
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Handle mouse/touch movement
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percentage = ((clientX - rect.left) / rect.width) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(clampedPercentage);
  }, [isDragging]);

  // Mouse events
  const handleMouseDown = () => setIsDragging(true);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleMouseUp = () => setIsDragging(false);

  // Touch events
  const handleTouchStart = () => setIsDragging(true);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleMove(touch.clientX);
  }, [handleMove]);

  const handleTouchEnd = () => setIsDragging(false);

  // Click to position slider
  const handleContainerClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percentage = ((e.clientX - rect.left) / rect.width) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    setSliderPosition(clampedPercentage);
  };

  // Set up global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  const SliderComponent = ({ isModal = false }: { isModal?: boolean }) => (
    <div
      ref={containerRef}
      className={`relative ${height} ${isModal ? 'h-[70vh]' : ''} bg-gray-100 rounded-lg overflow-hidden select-none ${className}`}
      onClick={handleContainerClick}
    >
      {/* Before Image (Full) */}
      <div className="absolute inset-0">
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-red-600 text-white">
            {beforeLabel.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* After Image (Clipped) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `polygon(${sliderPosition}% 0%, 100% 0%, 100% 100%, ${sliderPosition}% 100%)`
        }}
      >
        <img
          src={afterImage}
          alt={afterLabel}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-green-600 text-white">
            {afterLabel.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Slider Handle */}
      <div
        ref={sliderRef}
        className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize select-none"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Handle Icon */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center cursor-col-resize">
          <div className="flex space-x-0.5">
            <div className="w-0.5 h-4 bg-gray-400 rounded"></div>
            <div className="w-0.5 h-4 bg-gray-400 rounded"></div>
          </div>
        </div>
      </div>

      {/* Fullscreen Button */}
      {!isModal && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="bg-white/90 hover:bg-white text-gray-700 shadow-md"
          >
            <Maximize2 className="w-4 h-4 mr-1" />
            View Full Size
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/70 text-white text-xs px-3 py-1 rounded-full">
          Drag the slider or click to compare
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SliderComponent />

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <Dialog open={true} onOpenChange={() => setIsFullscreen(false)}>
          <DialogContent className="max-w-6xl w-full p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center justify-between">
                <span>Before & After Comparison</span>
                <div className="flex space-x-2">
                  <Badge variant="destructive">{beforeLabel}</Badge>
                  <span className="text-muted-foreground">vs</span>
                  <Badge className="bg-green-600 text-white">{afterLabel}</Badge>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="p-6 pt-0">
              <SliderComponent isModal={true} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default BeforeAfterSlider;