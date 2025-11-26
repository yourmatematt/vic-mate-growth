import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TestimonialCardProps {
  name: string;
  business: string;
  businessType: string;
  location: string;
  testimonial: string;
  rating: number;
  result?: string;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  business,
  businessType,
  location,
  testimonial,
  rating = 5,
  result,
  className = ''
}) => {
  return (
    <Card className={`mate-card h-full ${className}`}>
      <CardContent className="p-6">
        {/* Star Rating */}
        <div className="flex items-center mb-4">
          {Array.from({ length: rating }, (_, i) => (
            <Star key={i} className="w-4 h-4 fill-accent text-accent" />
          ))}
        </div>

        {/* Testimonial Quote */}
        <blockquote className="text-muted-foreground text-sm leading-relaxed mb-4 italic">
          "{testimonial}"
        </blockquote>

        {/* Result/Highlight */}
        {result && (
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-3 mb-4">
            <p className="text-xs font-medium text-secondary-foreground">
              <strong>Result:</strong> {result}
            </p>
          </div>
        )}

        {/* Business Info */}
        <div className="border-t pt-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-sm">{name}</h4>
              <p className="text-xs text-primary font-medium">{business}</p>
              <p className="text-xs text-muted-foreground">{businessType}</p>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1" />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;