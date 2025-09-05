import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  DollarSign, 
  BarChart3, 
  Zap, 
  Users, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Clock,
  Award
} from 'lucide-react';

const GoogleAdsManagement = () => {
  const services = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Campaign Setup & Strategy",
      description: "Create targeted campaigns that reach your ideal customers at the right time"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Bid Management",
      description: "Optimize your bids to maximize ROI while controlling costs"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Performance Tracking",
      description: "Monitor and analyze campaign performance with detailed reporting"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Ad Copy Optimization",
      description: "Create compelling ads that drive clicks and conversions"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Audience Targeting",
      description: "Reach the right people with precise audience targeting"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Conversion Optimization",
      description: "Improve your conversion rates and maximize campaign ROI"
    }
  ];

  const packages = [
    {
      name: "Starter Ads Package",
      price: "$799/month",
      adSpend: "+ ad spend",
      description: "Perfect for small businesses starting with Google Ads",
      features: [
        "1-2 Google Ads campaigns",
        "Search & Display ads",
        "Basic keyword research",
        "Ad copy creation",
        "Monthly performance report",
        "$2,000 max monthly ad spend"
      ]
    },
    {
      name: "Growth Ads Package",
      price: "$1,299/month",
      adSpend: "+ ad spend",
      description: "Comprehensive Google Ads management for growing businesses",
      features: [
        "3-5 Google Ads campaigns",
        "Search, Display & Shopping ads",
        "Advanced keyword research",
        "A/B testing & optimization",
        "Conversion tracking setup",
        "Weekly reporting & optimization",
        "$10,000 max monthly ad spend"
      ],
      popular: true
    },
    {
      name: "Enterprise Ads Solution",
      price: "Custom",
      adSpend: "",
      description: "Full-service Google Ads management for large businesses",
      features: [
        "Unlimited campaigns",
        "All Google Ads formats",
        "Advanced audience targeting",
        "Custom landing page optimization",
        "Dedicated account manager",
        "Real-time reporting dashboard",
        "No ad spend limits"
      ]
    }
  ];

  const results = [
    { metric: "Average ROAS", value: "4.2x" },
    { metric: "Cost Per Click Reduction", value: "35%" },
    { metric: "Conversion Rate Increase", value: "127%" },
    { metric: "Average CTR Improvement", value: "89%" }
  ];

  const certifications = [
    "Google Ads Certified",
    "Google Shopping Certified", 
    "Google Display Certified",
    "Google Analytics Certified"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/10 text-white border-white/20">
              Google Ads Management
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Drive Immediate Results with Expert Google Ads
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Get qualified leads and customers with professionally managed Google Ads campaigns that deliver measurable ROI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Your Free Ads Audit
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Campaign Results
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
              Proven Google Ads Results
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our Google Ads experts have helped businesses across Australia achieve exceptional campaign performance.
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

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {certifications.map((cert, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                <Award className="w-4 h-4 mr-2" />
                {cert}
              </Badge>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg">
              See Detailed Case Studies
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
              Complete Google Ads Management
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We handle every aspect of your Google Ads campaigns so you can focus on running your business.
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

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Why Choose Our Google Ads Management?
              </h2>
              <p className="text-xl text-muted-foreground">
                Experience the difference of working with certified Google Ads experts.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-heading font-bold mb-6">
                  Expert Campaign Management
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Daily campaign monitoring and optimization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Advanced audience targeting and remarketing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <BarChart3 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Comprehensive performance tracking and reporting</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Budget optimization for maximum ROI</span>
                  </li>
                </ul>

                <Button className="mt-6" size="lg">
                  Schedule a Strategy Call
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h4 className="text-xl font-bold mb-4">Our Process</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span>Account audit & strategy development</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span>Campaign setup & keyword research</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span>Ad creation & audience targeting</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <span>Launch & continuous optimization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                    <span>Regular reporting & strategy refinement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Google Ads Management Packages
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional Google Ads management that fits your budget and goals.
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
                  {pkg.adSpend && (
                    <div className="text-sm text-muted-foreground">{pkg.adSpend}</div>
                  )}
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Ready to Maximize Your Google Ads ROI?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get a free Google Ads audit and discover how we can improve your campaign performance and reduce costs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="mate-button-accent">
                Get Your Free Ads Audit
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

export default GoogleAdsManagement;