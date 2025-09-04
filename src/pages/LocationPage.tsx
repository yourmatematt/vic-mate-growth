import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Star, Users, TrendingUp, Globe, Search, MousePointer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WebsiteAnalysisCTA from '@/components/WebsiteAnalysisCTA';

const LocationPage = () => {
  const { location } = useParams<{ location: string }>();
  const [showAnalysisCTA, setShowAnalysisCTA] = useState(false);

  // Format location name for display
  const locationName = location?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ') || 'Your Location';

  // Sample local businesses data - in real app this would come from a database
  const localBusinessExamples = [
    'Local cafes and restaurants',
    'Trade professionals (plumbers, electricians, builders)',
    'Healthcare practices and allied health',
    'Retail stores and boutiques',
    'Professional services (accountants, lawyers)',
    'Beauty and wellness businesses'
  ];

  const localServices = [
    {
      icon: Globe,
      title: `${locationName} Website Design`,
      description: `Professional websites that attract local ${locationName} customers`
    },
    {
      icon: Search,
      title: `Local ${locationName} SEO`,
      description: `Get your business found when locals search online`
    },
    {
      icon: MousePointer,
      title: `${locationName} Google Ads`,
      description: `Targeted advertising that brings customers to your door`
    },
    {
      icon: Share2,
      title: `Social Media for ${locationName} Business`,
      description: `Connect with your local community on social media`
    }
  ];

  const localStats = [
    {
      icon: Users,
      stat: '25+',
      label: `${locationName} Businesses Served`
    },
    {
      icon: TrendingUp,
      stat: '180%',
      label: 'Average Lead Increase'
    },
    {
      icon: Star,
      stat: '5-Star',
      label: 'Local Client Reviews'
    }
  ];

  const whyChooseLocal = [
    {
      title: 'We Know Your Market',
      description: `We understand the ${locationName} community, your local competitors, and what works for businesses in your area.`
    },
    {
      title: 'Local Case Studies',
      description: `We've helped businesses just like yours in ${locationName} achieve real results with their digital marketing.`
    },
    {
      title: 'Community Connections',
      description: `As part of the regional Victorian business community, we're invested in the success of ${locationName}.`
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-16 hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 mr-3" />
              <Badge variant="outline" className="border-primary-foreground text-primary-foreground text-lg px-4 py-2">
                {locationName}, Victoria
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              Digital Marketing Services in {locationName}
            </h1>
            
            <p className="text-xl text-primary-foreground/90 mb-8">
              Help your {locationName} business grow online with honest digital marketing 
              from a team that understands your local market.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setShowAnalysisCTA(true)}
                className="mate-button-accent text-lg px-8 py-4"
              >
                Get Free {locationName} Website Analysis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline"
                className="text-lg px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Phone className="mr-2 w-5 h-5" />
                Call 1300 YOUR MATE
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Local Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {localStats.map((stat, index) => (
              <Card key={index} className="metric-card text-center">
                <CardContent className="pt-6">
                  <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stat.stat}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services for Location */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Digital Marketing Services for {locationName} Businesses
            </h2>
            <p className="text-xl text-muted-foreground">
              Tailored strategies that work for your local market
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {localServices.map((service, index) => (
              <Card key={index} className="mate-card">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-primary-light">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">
                      {service.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  <Button variant="outline" className="w-full">
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Types of Businesses We Help */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              {locationName} Businesses We Help
            </h2>
            <p className="text-xl text-muted-foreground">
              From tradies to tech companies, we help all types of local businesses grow online
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localBusinessExamples.map((business, index) => (
              <Card key={index} className="mate-card text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="font-semibold mb-2">{business}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Specialized strategies for your industry
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Case Studies
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us for Local Business */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Choose Your Mate Agency for Your {locationName} Business?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyChooseLocal.map((reason, index) => (
              <Card key={index} className="bg-primary-foreground text-foreground">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-3">
                    {reason.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {reason.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Local Testimonial */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="mate-card max-w-4xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-accent text-accent" />
                ))}
              </div>
              
              <blockquote className="text-xl italic mb-6">
                "Your Mate Agency transformed our local {locationName.toLowerCase()} business. 
                We went from struggling to find customers to being booked out weeks in advance. 
                They really understand what works in our area."
              </blockquote>
              
              <div className="text-center">
                <p className="font-semibold">Sarah Mitchell</p>
                <p className="text-sm text-muted-foreground">
                  Local {locationName} Business Owner
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-secondary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Grow Your {locationName} Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's create a custom digital marketing strategy for your {locationName} business. 
            Get your free website analysis and discover exactly what's holding you back online.
          </p>
          
          <Button 
            onClick={() => setShowAnalysisCTA(true)}
            className="mate-button-primary text-lg px-8 py-4"
          >
            Get My Free {locationName} Analysis
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span>5-star reviews</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Local experts</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>Always available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Website Analysis Modal */}
      <WebsiteAnalysisCTA
        isOpen={showAnalysisCTA}
        onClose={() => setShowAnalysisCTA(false)}
        sourcePage={`location-${location}`}
      />
    </div>
  );
};

export default LocationPage;