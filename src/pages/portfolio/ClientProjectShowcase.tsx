import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Clock,
  Star,
  Quote,
  Calendar,
  Globe,
  Smartphone,
  Monitor
} from "lucide-react";
import { Link } from "react-router-dom";
import portfolioBeforeDesktop from "@/assets/portfolio-before-desktop.jpg";
import portfolioAfterDesktop from "@/assets/portfolio-after-desktop.jpg";
import portfolioBeforeMobile from "@/assets/portfolio-before-mobile.jpg";
import portfolioAfterMobile from "@/assets/portfolio-after-mobile.jpg";

const ClientProjectShowcase = () => {
  const [activeImageView, setActiveImageView] = useState<"desktop" | "mobile">("desktop");

  const bigWins = [
    {
      metric: "Conversion Rate",
      before: "2.1%",
      after: "8.7%",
      improvement: "+314%",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      metric: "Page Load Time",
      before: "4.8s",
      after: "1.2s",
      improvement: "-75%",
      icon: Clock,
      color: "text-blue-600"
    },
    {
      metric: "Monthly Visitors",
      before: "12,500",
      after: "47,200",
      improvement: "+278%",
      icon: Users,
      color: "text-purple-600"
    },
    {
      metric: "Revenue",
      before: "$18,400",
      after: "$67,800",
      improvement: "+269%",
      icon: ShoppingCart,
      color: "text-emerald-600"
    }
  ];

  const caseStudyDetails = {
    client: "TechFlow Solutions",
    industry: "B2B Software",
    projectDuration: "3 months",
    services: ["Website Redesign", "SEO Optimization", "Performance Enhancement", "Mobile Optimization"],
    challenge: "TechFlow Solutions had an outdated website that wasn't converting visitors into leads. Their bounce rate was 78%, and they were losing potential customers due to poor user experience and slow loading times.",
    solution: "We completely redesigned their website with a focus on user experience, implemented strategic SEO improvements, and optimized for mobile devices. Our approach included conversion-focused design, streamlined navigation, and performance optimization.",
    results: "Within 3 months of launch, TechFlow Solutions saw a 314% increase in conversion rates, 278% more monthly visitors, and a 269% boost in revenue. The new website now serves as their primary lead generation tool."
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CaseStudy",
    "name": "TechFlow Solutions Website Redesign Case Study",
    "description": "Complete website transformation resulting in 314% conversion rate increase and 269% revenue growth",
    "about": {
      "@type": "Organization",
      "name": "TechFlow Solutions",
      "industry": "B2B Software"
    },
    "author": {
      "@type": "LocalBusiness",
      "name": "Digital Marketing Agency",
      "url": "https://yoursite.com"
    },
    "datePublished": "2024-01-15",
    "result": [
      {
        "@type": "QuantitativeValue",
        "name": "Conversion Rate Increase",
        "value": "314",
        "unitCode": "PERCENT"
      },
      {
        "@type": "QuantitativeValue", 
        "name": "Revenue Growth",
        "value": "269",
        "unitCode": "PERCENT"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>TechFlow Solutions Case Study - 314% Conversion Increase</title>
        <meta 
          name="description" 
          content="See how we transformed TechFlow Solutions' website, achieving 314% conversion rate increase and 269% revenue growth in just 3 months." 
        />
        <meta name="keywords" content="website redesign case study, conversion rate optimization, B2B website design, digital marketing results" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="TechFlow Solutions Case Study - 314% Conversion Increase" />
        <meta property="og:description" content="See how we transformed TechFlow Solutions' website, achieving 314% conversion rate increase and 269% revenue growth in just 3 months." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://yoursite.com/portfolio/techflow-solutions" />
        <meta property="og:image" content={portfolioAfterDesktop} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="TechFlow Solutions Case Study - 314% Conversion Increase" />
        <meta name="twitter:description" content="See how we transformed TechFlow Solutions' website, achieving 314% conversion rate increase and 269% revenue growth in just 3 months." />
        <meta name="twitter:image" content={portfolioAfterDesktop} />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://yoursite.com/portfolio/techflow-solutions" />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4">
                <Star className="w-4 h-4 mr-2" />
                Success Story
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                TechFlow Solutions
                <span className="block text-primary">Website Transformation</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                How we transformed an underperforming website into a lead-generation powerhouse, 
                achieving 314% conversion rate increase and 269% revenue growth in just 3 months.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <Badge variant="outline" className="text-base py-2 px-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  3 Month Project
                </Badge>
                <Badge variant="outline" className="text-base py-2 px-4">
                  <Globe className="w-4 h-4 mr-2" />
                  B2B Software Industry
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Big Wins Section */}
        <section className="py-16 px-4 bg-card">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Remarkable Results Achieved
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bigWins.map((win, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <win.icon className={`w-12 h-12 mx-auto mb-4 ${win.color}`} />
                    <CardTitle className="text-lg text-muted-foreground">
                      {win.metric}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Before: <span className="font-medium text-foreground">{win.before}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        After: <span className="font-medium text-foreground">{win.after}</span>
                      </div>
                      <Badge variant="secondary" className={`${win.color} bg-transparent text-lg font-bold`}>
                        {win.improvement}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Before & After Gallery */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Visual Transformation
            </h2>
            
            {/* Device Toggle */}
            <div className="flex justify-center mb-8">
              <Tabs value={activeImageView} onValueChange={(value) => setActiveImageView(value as "desktop" | "mobile")}>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="desktop" className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </TabsTrigger>
                  <TabsTrigger value="mobile" className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Mobile
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Before */}
              <Card className="overflow-hidden">
                <CardHeader className="text-center bg-muted">
                  <CardTitle className="text-red-600 flex items-center justify-center gap-2">
                    Before Redesign
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={activeImageView === "desktop" ? portfolioBeforeDesktop : portfolioBeforeMobile}
                      alt={`TechFlow Solutions website before redesign - ${activeImageView} view showing outdated design, poor user experience, and conversion issues`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-red-600/10"></div>
                  </div>
                </CardContent>
              </Card>

              {/* After */}
              <Card className="overflow-hidden">
                <CardHeader className="text-center bg-muted">
                  <CardTitle className="text-green-600 flex items-center justify-center gap-2">
                    After Redesign
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <img
                      src={activeImageView === "desktop" ? portfolioAfterDesktop : portfolioAfterMobile}
                      alt={`TechFlow Solutions website after redesign - ${activeImageView} view showing modern design, excellent user experience, and optimized conversions`}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-green-600/10"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Case Study Details */}
        <section className="py-16 px-4 bg-card">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
              Complete Case Study
            </h2>
            
            <div className="space-y-8">
              {/* Project Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Client</h4>
                      <p className="text-muted-foreground">{caseStudyDetails.client}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Industry</h4>
                      <p className="text-muted-foreground">{caseStudyDetails.industry}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Duration</h4>
                      <p className="text-muted-foreground">{caseStudyDetails.projectDuration}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Services Provided</h4>
                      <div className="flex flex-wrap gap-2">
                        {caseStudyDetails.services.map((service, index) => (
                          <Badge key={index} variant="outline">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Challenge */}
              <Card>
                <CardHeader>
                  <CardTitle>The Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {caseStudyDetails.challenge}
                  </p>
                </CardContent>
              </Card>

              {/* Solution */}
              <Card>
                <CardHeader>
                  <CardTitle>Our Solution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {caseStudyDetails.solution}
                  </p>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle>The Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {caseStudyDetails.results}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Client Testimonial */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-12 text-center">
                <Quote className="w-16 h-16 text-primary mx-auto mb-6 opacity-20" />
                <blockquote className="text-2xl md:text-3xl font-medium text-foreground leading-relaxed mb-8">
                  "The transformation of our website exceeded all expectations. We went from struggling to generate 
                  leads to having more qualified prospects than we can handle. The team's expertise in both design 
                  and conversion optimization is truly remarkable. Our revenue has nearly tripled, and our website 
                  now serves as our most powerful sales tool."
                </blockquote>
                <footer className="space-y-2">
                  <cite className="text-lg font-semibold text-foreground not-italic">
                    Sarah Chen
                  </cite>
                  <p className="text-muted-foreground">
                    CEO, TechFlow Solutions
                  </p>
                  <div className="flex justify-center gap-1 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                </footer>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary to-primary/80">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Ready for Similar Results?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Let's discuss how we can transform your website and multiply your conversions. 
              Schedule a free consultation to explore your potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <Link to="/grow-my-business">
                  Start Your Transformation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
                <Link to="/grow-my-business/website-design-development">
                  View Our Services
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Related Work CTA */}
        <section className="py-12 px-4 bg-card border-t">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">
              Interested in learning more about our approach?
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/expertise">
                  View More Case Studies
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/blog/why-website-not-found">
                  Read Our Blog
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/about">
                  About Our Team
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ClientProjectShowcase;