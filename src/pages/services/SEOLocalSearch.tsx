import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Globe,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';

const SEOLocalSearch = () => {
  const services = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Technical SEO",
      description: "Optimize your website's technical foundation for better search rankings"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Local SEO",
      description: "Dominate local search results and attract nearby customers"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Keyword Research",
      description: "Find and target the right keywords for your business"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Content Optimization",
      description: "Create SEO-friendly content that ranks and converts"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics & Reporting",
      description: "Track your SEO progress with detailed monthly reports"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Link Building",
      description: "Build high-quality backlinks to boost your authority"
    }
  ];

  const packages = [
    {
      name: "Local SEO Starter",
      price: "$899/month",
      description: "Perfect for local businesses getting started with SEO",
      features: [
        "Google My Business optimization",
        "Local keyword research",
        "Citation building",
        "Monthly local SEO report",
        "Review management setup"
      ]
    },
    {
      name: "SEO Growth Package",
      price: "$1,499/month",
      description: "Comprehensive SEO for growing businesses",
      features: [
        "Everything in Starter",
        "Technical SEO audit & fixes",
        "Content optimization",
        "Link building campaign",
        "Competitor analysis",
        "Weekly progress reports"
      ],
      popular: true
    },
    {
      name: "Enterprise SEO",
      price: "Custom",
      description: "Advanced SEO solutions for large businesses",
      features: [
        "Everything in Growth",
        "Advanced technical SEO",
        "Multiple location optimization",
        "Custom SEO strategy",
        "Dedicated SEO manager",
        "Priority support"
      ]
    }
  ];

  const results = [
    { metric: "Average Ranking Improvement", value: "245%" },
    { metric: "Organic Traffic Increase", value: "180%" },
    { metric: "Local Visibility Boost", value: "320%" },
    { metric: "Lead Generation Growth", value: "156%" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/10 text-white border-white/20">
              SEO & Local Search
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Dominate Search Results & Attract More Customers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Boost your online visibility with proven SEO strategies that drive organic traffic and local customers to your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Your Free SEO Audit
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View SEO Case Studies
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Proven SEO Results for Australian Businesses
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our SEO strategies have helped hundreds of businesses improve their search rankings and grow their revenue.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
            {results.map((result, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {result.value}
                </div>
                <div className="text-muted-foreground">
                  {result.metric}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg">
              See All Success Stories
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Comprehensive SEO Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We provide end-to-end SEO solutions to help your business rank higher and attract more customers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {service.icon}
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              SEO Packages & Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the SEO package that fits your business goals and budget.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <Card key={index} className={`relative ${pkg.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                {pkg.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{pkg.price}</div>
                  <CardDescription className="text-base">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant={pkg.popular ? "default" : "outline"}>
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Local SEO Focus */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Local SEO That Gets You Found
              </h2>
              <p className="text-xl text-muted-foreground">
                Specialized in helping Australian businesses dominate local search results.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-heading font-bold mb-6">
                  Why Local SEO Matters
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>76% of people search for local businesses online</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Local searches lead to purchases 18% of the time</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>97% of consumers read online reviews for local businesses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Local SEO drives 5x more traffic than traditional marketing</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h4 className="text-xl font-bold mb-4">Our Local SEO Process</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span>Google My Business optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span>Local keyword research & mapping</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span>Citation building & consistency</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <span>Review management & optimization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Ready to Dominate Search Results?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get a free SEO audit and discover how we can help your business rank higher and attract more customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="mate-button-accent">
                Get Your Free SEO Audit
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/grow-my-business">
                  View All Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SEOLocalSearch;