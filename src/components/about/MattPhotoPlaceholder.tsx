import React from 'react';
import { User, Camera } from 'lucide-react';

interface MattPhotoPlaceholderProps {
  variant?: 'hero' | 'casual' | 'business';
  className?: string;
}

const MattPhotoPlaceholder: React.FC<MattPhotoPlaceholderProps> = ({
  variant = 'hero',
  className = ''
}) => {
  const getPlaceholderConfig = () => {
    switch (variant) {
      case 'hero':
        return {
          size: 'w-64 h-64 md:w-80 md:h-80',
          description: 'Professional headshot of Matt - friendly smile, approachable but professional',
          notes: 'Primary hero image - should show Matt as confident but approachable. Business casual attire (polo/button-down, no suit). Genuine smile, direct eye contact with camera.'
        };
      case 'casual':
        return {
          size: 'w-48 h-48 md:w-56 md:h-56',
          description: 'Casual photo of Matt working or with local business owners',
          notes: 'Action shot - Matt at laptop/phone, or chatting with local business owner. Shows the "accessible, real person" aspect. Maybe at a local cafe or business.'
        };
      case 'business':
        return {
          size: 'w-40 h-40 md:w-48 md:h-48',
          description: 'Matt with regional Victorian business backdrop',
          notes: 'Matt in a regional setting - could be main street of a country town, with local businesses in background. Shows connection to regional Victoria.'
        };
      default:
        return {
          size: 'w-48 h-48',
          description: 'Standard Matt photo',
          notes: 'General photo of Matt for various uses.'
        };
    }
  };

  const config = getPlaceholderConfig();

  return (
    <div className={`relative ${config.size} ${className}`}>
      {/* Placeholder Background */}
      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center p-4">
        <User className="w-16 h-16 text-primary/50 mb-2" />
        <Camera className="w-8 h-8 text-primary/30 mb-2" />
        <p className="text-xs text-center text-muted-foreground font-medium">
          {config.description}
        </p>
      </div>

      {/* Photo Specifications Tooltip */}
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg p-3 shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-200 max-w-xs z-10">
        <h4 className="font-semibold text-xs mb-1">Photo Specifications:</h4>
        <p className="text-xs text-muted-foreground mb-2">{config.notes}</p>
        <div className="text-xs space-y-1">
          <div><strong>Dimensions:</strong> {config.size.includes('64') ? '320x320px' : config.size.includes('48') ? '240x240px' : '400x400px'} minimum</div>
          <div><strong>Format:</strong> JPG/PNG, high quality</div>
          <div><strong>Style:</strong> {variant === 'hero' ? 'Professional headshot' : variant === 'casual' ? 'Candid/action shot' : 'Regional business setting'}</div>
        </div>
      </div>
    </div>
  );
};

export default MattPhotoPlaceholder;