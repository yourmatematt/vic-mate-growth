import React, { useState, useEffect } from 'react';
import { ArrowRight, Filter, Loader2, AlertCircle, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import CaseStudyCard from '@/components/CaseStudyCard';
import WebsiteAnalysisCTA from '@/components/WebsiteAnalysisCTA';
import { useInfinitePublicCaseStudies, usePublicCaseStudyStats } from '@/hooks/usePublicCaseStudies';
import { Industry } from '@/types/case-studies';
import { generateExpertiseMetaTags } from '@/lib/seo-utils';

const Expertise = () => {
  const [showAnalysisCTA, setShowAnalysisCTA] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();

  // Fetch case studies with infinite loading
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfinitePublicCaseStudies({
    industry: selectedIndustry,
    tag: selectedTag
  });

  // Fetch stats for overview
  const { data: stats } = usePublicCaseStudyStats();

  // Flatten paginated results
  const caseStudies = data?.pages.flatMap(page => page.caseStudies) || [];
  const totalCaseStudies = data?.pages[0]?.total || 0;

  // SEO setup
  useEffect(() => {
    const metaTags = generateExpertiseMetaTags();
    document.title = metaTags.title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', metaTags.description || '');
    }
  }, []);

  // Available filter options
  const industries: Industry[] = ['Retail', 'Professional Services', 'Healthcare', 'Hospitality', 'Manufacturing'];
  const commonTags = ['Social Media', 'Website Design', 'SEO', 'Content Marketing', 'Branding', 'Email Marketing'];

  // Reset filters
  const clearFilters = () => {
    setSelectedIndustry(undefined);
    setSelectedTag(undefined);
  };

  const hasFilters = selectedIndustry || selectedTag;

  const defaultMetrics = [
    {
      number: '127+',
      label: 'Total Clients Served',
      description: 'Regional Australian businesses transformed'
    },
    {
      number: '156%',
      label: 'Average Traffic Increase',
      description: 'Within first 6 months'
    },
    {
      number: '10,000+',
      label: 'Total Leads Generated',
      description: 'For our clients this year'
    },
    {
      number: '94%',
      label: 'Client Satisfaction',
      description: 'Would recommend us to others'
    }
  ];

  // Use fetched stats or fallback to defaults
  const metrics = stats ? [
    {
      number: `${stats.total}+`,
      label: 'Published Case Studies',
      description: 'Success stories from regional Australia'
    },
    {
      number: '156%',
      label: 'Average Traffic Increase',
      description: 'Within first 6 months'
    },
    {
      number: '10,000+',
      label: 'Total Leads Generated',
      description: 'For our clients this year'
    },
    {
      number: '94%',
      label: 'Client Satisfaction',
      description: 'Would recommend us to others'
    }
  ] : defaultMetrics;

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              Success Stories from Regional Australia
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              See how we've helped local businesses like yours grow with simple, effective marketing.
              Every story represents real results from businesses across regional Australia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setShowAnalysisCTA(true)}
                className="text-lg px-8 py-4"
              >
                Get Your Free Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  const caseStudiesSection = document.getElementById('case-studies');
                  caseStudiesSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-lg px-8 py-4"
              >
                Browse Success Stories
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              The Numbers Don't Lie
            </h2>
            <p className="text-xl text-muted-foreground">
              Here's what we've achieved for regional Australian businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg border border-border hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-primary mb-2">
                  {metric.number}
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{metric.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section id="case-studies" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Success Stories From Regional Australia
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Real businesses, real challenges, real results
            </p>
          </div>

          {/* Filter Bar */}
          <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm border border-border rounded-lg p-4 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant={!hasFilters ? "default" : "outline"}
                  size="sm"
                  onClick={clearFilters}
                >
                  All Stories
                </Button>

                {/* Industry Filters */}
                {industries.map((industry) => (
                  <Button
                    key={industry}
                    variant={selectedIndustry === industry ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSelectedIndustry(selectedIndustry === industry ? undefined : industry);
                      setSelectedTag(undefined);
                    }}
                  >
                    {industry}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {totalCaseStudies > 0 && (
                  <span>
                    {caseStudies.length} of {totalCaseStudies} stories
                    {hasFilters && ' (filtered)'}
                  </span>
                )}
              </div>
            </div>

            {/* Tag Filters */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border">
              <span className="text-sm text-muted-foreground mr-2">Topics:</span>
              {commonTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? undefined : tag);
                    setSelectedIndustry(undefined);
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border border-border p-6">
                  <Skeleton className="aspect-video w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load case studies. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {/* Case Studies Grid */}
          {!isLoading && !error && (
            <>
              {caseStudies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {caseStudies.map((caseStudy) => (
                    <CaseStudyCard
                      key={caseStudy.id}
                      caseStudy={caseStudy}
                      showMetrics={true}
                      lazy={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Grid className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No case studies found</h3>
                  <p className="text-muted-foreground mb-4">
                    {hasFilters
                      ? 'Try adjusting your filters or clearing them to see all stories.'
                      : 'Check back soon for new success stories!'}
                  </p>
                  {hasFilters && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}

              {/* Load More Button */}
              {hasNextPage && (
                <div className="text-center mt-12">
                  <Button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    size="lg"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading More...
                      </>
                    ) : (
                      'Load More Case Studies'
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Want Similar Results for Your Business?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Let's have a yarn about how we can help you grow. Get your free website analysis
            and see exactly what opportunities exist for your business.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setShowAnalysisCTA(true)}
              variant="secondary"
              className="text-lg px-8 py-4"
            >
              Book a Free Chat
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Button
              variant="outline"
              className="text-lg px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              See Our Services
            </Button>
          </div>
        </div>
      </section>

      {/* Website Analysis Modal */}
      <WebsiteAnalysisCTA
        isOpen={showAnalysisCTA}
        onClose={() => setShowAnalysisCTA(false)}
        sourcePage="expertise"
      />
    </div>
  );
};

export default Expertise;