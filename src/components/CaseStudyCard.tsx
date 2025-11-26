import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CaseStudy } from '@/types/case-studies';
import { formatAustralianDate } from '@/lib/seo-utils';

interface CaseStudyCardProps {
  caseStudy: CaseStudy;
  className?: string;
  showMetrics?: boolean;
  lazy?: boolean;
}

const CaseStudyCard: React.FC<CaseStudyCardProps> = ({
  caseStudy,
  className = '',
  showMetrics = true,
  lazy = true
}) => {
  // Create excerpt from challenge
  const excerpt = caseStudy.challenge.length > 150
    ? caseStudy.challenge.substring(0, 147) + '...'
    : caseStudy.challenge;

  // Get the first metric for highlight (if available)
  const highlightMetric = showMetrics && caseStudy.metrics && caseStudy.metrics.length > 0
    ? caseStudy.metrics[0]
    : null;

  // Get location from client info
  const location = caseStudy.client_location || 'Regional Australia';

  return (
    <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white border border-border ${className}`}>
      <div className="relative">
        {/* Featured Image */}
        <div className="aspect-video bg-muted overflow-hidden">
          {caseStudy.featured_image_url ? (
            <img
              src={caseStudy.featured_image_url}
              alt={`${caseStudy.client_name} case study`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading={lazy ? 'lazy' : 'eager'}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">Success Story</p>
              </div>
            </div>
          )}
        </div>

        {/* Metric Highlight Badge */}
        {highlightMetric && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-600 text-white shadow-md">
              {highlightMetric.value}
            </Badge>
          </div>
        )}

        {/* Industry Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-foreground">
            {caseStudy.client_industry}
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Client Info */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{caseStudy.client_name}</span>
            <span>•</span>
            <span>{location}</span>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {caseStudy.title}
            </h3>
          </div>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {caseStudy.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {caseStudy.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{caseStudy.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">
              {formatAustralianDate(caseStudy.published_at || caseStudy.created_at)}
            </div>

            <Link
              to={`/expertise/${caseStudy.slug}`}
              className="inline-flex items-center space-x-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <span>Read Case Study</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseStudyCard;