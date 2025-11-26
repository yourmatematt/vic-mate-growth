import React from 'react';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CaseStudyCard from '@/components/CaseStudyCard';
import { useRelatedCaseStudies } from '@/hooks/usePublicCaseStudies';
import { Industry } from '@/types/case-studies';

interface RelatedCaseStudiesProps {
  currentSlug: string;
  industry?: Industry;
  tags?: string[];
  title?: string;
  maxItems?: number;
  className?: string;
}

const RelatedCaseStudies: React.FC<RelatedCaseStudiesProps> = ({
  currentSlug,
  industry,
  tags = [],
  title = 'More Success Stories',
  maxItems = 3,
  className = ''
}) => {
  const {
    data: relatedCaseStudies,
    isLoading,
    error
  } = useRelatedCaseStudies(currentSlug, industry, tags, maxItems);

  const [scrollPosition, setScrollPosition] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle horizontal scroll for mobile
  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of container width
    const newScrollPosition = direction === 'left'
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount);

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });

    setScrollPosition(newScrollPosition);
  };

  // Update scroll position when user scrolls manually
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollLeft);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            {title}
          </h2>

          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Finding related success stories...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className={`py-12 ${className}`}>
        <div className="container mx-auto px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load related case studies. Please try again later.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  // Don't render if no related case studies
  if (!relatedCaseStudies || relatedCaseStudies.length === 0) {
    return null;
  }

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = containerRef.current
    ? scrollPosition < containerRef.current.scrollWidth - containerRef.current.clientWidth
    : false;

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {title}
            </h2>
            <p className="text-muted-foreground mt-1">
              Similar businesses we've helped grow
            </p>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Case Studies Grid/Carousel */}
        <div className="relative">
          <div
            ref={containerRef}
            className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible scrollbar-hide pb-4"
            style={{
              scrollSnapType: 'x mandatory'
            }}
            onScroll={handleScroll}
          >
            {relatedCaseStudies.map((caseStudy) => (
              <div
                key={caseStudy.id}
                className="flex-shrink-0 w-80 md:w-auto"
                style={{ scrollSnapAlign: 'start' }}
              >
                <CaseStudyCard
                  caseStudy={caseStudy}
                  showMetrics={true}
                  lazy={true}
                />
              </div>
            ))}
          </div>

          {/* Mobile scroll indicators */}
          <div className="md:hidden flex justify-center space-x-2 mt-4">
            {relatedCaseStudies.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(scrollPosition / 320) === index
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-center space-x-4 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Industry/Tags Context */}
        {(industry || tags.length > 0) && (
          <div className="text-center mt-8 text-sm text-muted-foreground">
            {industry && (
              <p>Related stories from the {industry.toLowerCase()} industry</p>
            )}
            {tags.length > 0 && (
              <p className="mt-1">
                Similar topics: {tags.slice(0, 3).join(', ')}
                {tags.length > 3 && ` +${tags.length - 3} more`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Custom scrollbar hide styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default RelatedCaseStudies;