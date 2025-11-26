import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Target,
  Lightbulb,
  TrendingUp,
  Share2,
  ExternalLink,
  Star,
  Copy,
  CheckCircle,
  Loader2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import MetricCard from '@/components/MetricCard';
import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import RelatedCaseStudies from '@/components/RelatedCaseStudies';
import WebsiteAnalysisCTA from '@/components/WebsiteAnalysisCTA';
import { usePublicCaseStudy } from '@/hooks/usePublicCaseStudies';
import {
  generateCaseStudyMetaTags,
  generateCaseStudySchema,
  generateBreadcrumbSchema,
  generateShareUrls,
  formatAustralianDate,
  calculateReadingTime
} from '@/lib/seo-utils';

const CaseStudy: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [showAnalysisCTA, setShowAnalysisCTA] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  // Fetch case study data
  const {
    data: caseStudy,
    isLoading,
    error
  } = usePublicCaseStudy(slug || '', Boolean(slug));

  // SEO and meta tags setup
  useEffect(() => {
    if (caseStudy) {
      const metaTags = generateCaseStudyMetaTags(caseStudy);
      document.title = metaTags.title;

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', metaTags.description || '');
      }

      // Add JSON-LD structured data
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify([
        generateCaseStudySchema(caseStudy),
        generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Expertise', url: '/expertise' },
          { name: caseStudy.title, url: `/expertise/${caseStudy.slug}` }
        ])
      ]);
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [caseStudy]);

  // Handle sharing
  const handleShare = async (platform: string) => {
    if (!caseStudy) return;

    const shareUrls = generateShareUrls(caseStudy);

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrls.copy);
        setShareMessage('Link copied to clipboard!');
        setTimeout(() => setShareMessage(''), 3000);
      } catch (err) {
        setShareMessage('Failed to copy link');
        setTimeout(() => setShareMessage(''), 3000);
      }
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading case study...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !caseStudy) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error?.message || 'Case study not found. It may have been moved or deleted.'}
            </AlertDescription>
          </Alert>

          <div className="mt-6 space-x-4">
            <Button onClick={() => navigate('/expertise')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Case Studies
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(caseStudy);
  const publishedDate = formatAustralianDate(caseStudy.published_at || caseStudy.created_at);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        {/* Background Image */}
        {caseStudy.featured_image_url && (
          <div className="absolute inset-0 h-96">
            <img
              src={caseStudy.featured_image_url}
              alt={caseStudy.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
          </div>
        )}

        <div className="relative pt-20 pb-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm">
                <li>
                  <Link to="/" className="text-white/80 hover:text-white transition-colors">
                    Home
                  </Link>
                </li>
                <li className="text-white/60">/</li>
                <li>
                  <Link to="/expertise" className="text-white/80 hover:text-white transition-colors">
                    Expertise
                  </Link>
                </li>
                <li className="text-white/60">/</li>
                <li className="text-white font-medium truncate max-w-xs">
                  {caseStudy.title}
                </li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              {/* Client Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Badge variant="secondary" className="bg-white/90 text-foreground">
                  {caseStudy.client_industry}
                </Badge>

                <div className="flex items-center text-white/90 text-sm">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{caseStudy.client_name}</span>
                  {caseStudy.client_location && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{caseStudy.client_location}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center text-white/90 text-sm">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>{publishedDate}</span>
                </div>

                <div className="flex items-center text-white/90 text-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{readingTime} min read</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
                {caseStudy.title}
              </h1>

              {/* Key Metrics Bar */}
              {caseStudy.metrics && caseStudy.metrics.length > 0 && (
                <div className="flex flex-wrap gap-4 mb-8">
                  {caseStudy.metrics.slice(0, 3).map((metric, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                      <div className="text-2xl font-bold text-white">
                        {metric.value}
                      </div>
                      <div className="text-white/80 text-sm">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Scroll Indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
                <div className="flex flex-col items-center">
                  <span className="text-xs mb-2">Scroll to read</span>
                  <div className="w-1 h-8 bg-white/40 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* Share Bar */}
            <div className="flex flex-wrap items-center justify-between mb-12 p-4 bg-muted/50 rounded-lg">
              <div className="flex flex-wrap items-center gap-4 mb-4 lg:mb-0">
                <span className="text-sm font-medium text-muted-foreground">Share this story:</span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('facebook')}
                  >
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('linkedin')}
                  >
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('twitter')}
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare('copy')}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Link
                  </Button>
                </div>
              </div>

              {shareMessage && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {shareMessage}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {caseStudy.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            <div className="prose prose-lg max-w-none">

              {/* The Challenge */}
              <section className="mb-16">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <Target className="w-6 h-6 text-red-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold m-0">
                    The Challenge
                  </h2>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-lg p-6">
                  <p className="text-lg leading-relaxed m-0 text-foreground">
                    {caseStudy.challenge}
                  </p>
                </div>
              </section>

              {/* Our Solution */}
              <section className="mb-16">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Lightbulb className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold m-0">
                    Our Solution
                  </h2>
                </div>

                <div className="bg-white border border-border rounded-lg p-6">
                  <div className="whitespace-pre-line text-lg leading-relaxed text-foreground">
                    {caseStudy.solution}
                  </div>
                </div>
              </section>

              {/* The Results */}
              <section className="mb-16">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading font-bold m-0">
                    The Results
                  </h2>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-lg p-6 mb-8">
                  <p className="text-lg leading-relaxed m-0 text-foreground">
                    {caseStudy.results}
                  </p>
                </div>

                {/* Metrics Grid */}
                {caseStudy.metrics && caseStudy.metrics.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {caseStudy.metrics.map((metric, index) => (
                      <MetricCard
                        key={index}
                        label={metric.label}
                        value={metric.value}
                        description={metric.description}
                        color={index % 2 === 0 ? 'success' : 'primary'}
                        animate={true}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Before/After Comparison */}
            {caseStudy.before_image_url && caseStudy.after_image_url && (
              <section className="mb-16">
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                    See The Transformation
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Visual proof of the impact we delivered
                  </p>
                </div>

                <BeforeAfterSlider
                  beforeImage={caseStudy.before_image_url}
                  afterImage={caseStudy.after_image_url}
                  height="h-96 md:h-[500px]"
                />
              </section>
            )}

            {/* Testimonial */}
            {caseStudy.testimonial_content && (
              <section className="mb-16">
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-8 md:p-12 text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <blockquote className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-6">
                    "{caseStudy.testimonial_content}"
                  </blockquote>

                  <footer className="flex flex-col items-center space-y-2">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-muted-foreground">
                        {caseStudy.testimonial_author?.charAt(0) || caseStudy.client_name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">
                        {caseStudy.testimonial_author || `${caseStudy.client_name} Representative`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {caseStudy.testimonial_role || 'Business Owner'}, {caseStudy.client_name}
                      </div>
                    </div>
                  </footer>
                </div>
              </section>
            )}

            <Separator className="my-16" />

            {/* Call to Action */}
            <section className="text-center mb-16">
              <div className="bg-primary text-primary-foreground rounded-xl p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
                  Want Similar Results for Your Business?
                </h2>
                <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
                  Let's have a yarn about how we can help you grow
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setShowAnalysisCTA(true)}
                    variant="secondary"
                    size="lg"
                  >
                    Book a Free Chat
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    See Our Services
                  </Button>
                </div>
              </div>
            </section>

            {/* Back Link */}
            <div className="text-center mb-8">
              <Link to="/expertise">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All Case Studies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Related Case Studies */}
      <RelatedCaseStudies
        currentSlug={caseStudy.slug}
        industry={caseStudy.client_industry}
        tags={caseStudy.tags}
        className="bg-muted/30"
      />

      {/* Website Analysis Modal */}
      <WebsiteAnalysisCTA
        isOpen={showAnalysisCTA}
        onClose={() => setShowAnalysisCTA(false)}
        sourcePage="case-study"
      />
    </div>
  );
};

export default CaseStudy;