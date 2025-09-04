import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Search, MousePointer, Share2, Mail, PenTool, Star, Users, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import WebsiteAnalysisCTA from '@/components/WebsiteAnalysisCTA';
import heroImage from '@/assets/hero-handshake.jpg';

const GrowMyBusiness = () => {
  const [showAnalysisCTA, setShowAnalysisCTA] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setShowFloatingCTA(scrollPercent > 30);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    {
      icon: Globe,
      title: 'Website Design & Development',
      description: 'Modern websites that convert visitors into customers',
      features: ['Mobile-responsive design', 'Fast loading speeds', 'SEO optimized', 'Easy to update']
    },
    {
      icon: Search,
      title: 'SEO & Local Search',
      description: 'Get found by locals searching for your services',
      features: ['Local SEO optimization', 'Google My Business setup', 'Keyword research', 'Monthly reporting']
    },
    {
      icon: MousePointer,
      title: 'Google Ads Management',
      description: 'Smart advertising that brings real results',
      features: ['Campaign setup & management', 'Keyword optimization', 'Ad copy testing', 'Conversion tracking']
    },
    {
      icon: Share2,
      title: 'Social Media Marketing',
      description: 'Build genuine connections with your community',
      features: ['Content creation', 'Community management', 'Targeted advertising', 'Performance analytics']
    },
    {
      icon: Mail,
      title: 'Email Marketing',
      description: 'Stay top-of-mind with your customers',
      features: ['Automated sequences', 'Newsletter campaigns', 'List management', 'Performance tracking']
    },
    {
      icon: PenTool,
      title: 'Content Creation',
      description: 'Tell your story in a way that resonates',
      features: ['Blog writing', 'Social media content', 'Video scripts', 'Marketing materials']
    }
  ];

  const regions = {
    'Geelong Region': ['Geelong', 'Newtown', 'Belmont', 'Highton', 'Grovedale'],
    'Ballarat Region': ['Ballarat Central', 'Wendouree', 'Alfredton', 'Delacombe'],
    'Bendigo Region': ['Bendigo', 'Eaglehawk', 'Kangaroo Flat', 'Strathdale'],
    'Surf Coast': ['Torquay', 'Anglesea', 'Lorne', 'Winchelsea'],
    'Bellarine Peninsula': ['Ocean Grove', 'Barwon Heads', 'Queenscliff', 'Drysdale']
  };

  const trustSignals = [
    {
      icon: Users,
      stat: '100+',
      description: 'Local Businesses Transformed'
    },
    {
      icon: Star,
      stat: '5-Star',
      description: 'Google Reviews'
    },
    {
      icon: Award,
      stat: '94%',
      description: 'Client Retention Rate'
    },
    {
      icon: Clock,
      stat: '24hrs',
      description: 'Average Response Time'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      business: 'Mitchell\'s Bakery, Geelong',
      content: 'Your Mate Agency helped us triple our online orders in just 3 months. They really understand local business!',
      rating: 5
    },
    {
      name: 'Dave Thompson', 
      business: 'Thompson Plumbing, Ballarat',
      content: 'Finally, a marketing team that speaks plain English! Our website leads have increased by 180%.',
      rating: 5
    },
    {
      name: 'Lisa Chen',
      business: 'Coastal Physio, Torquay', 
      content: 'The team at Your Mate Agency are absolute legends. Professional service with a personal touch.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-20 pb-16 hero-gradient text-primary-foreground relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight">
                Let's Grow Your Local Business Together, Mate
              </h1>
              
              <p className="text-xl text-primary-foreground/90 leading-relaxed">
                Honest digital marketing that actually works for regional Victorian businesses. 
                No confusing jargon, just real results.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setShowAnalysisCTA(true)}
                  className="mate-button-accent text-lg px-8 py-4"
                >
                  Get Your Free Website Analysis
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                
                <Button 
                  variant="outline"
                  className="text-lg px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Call 1300 YOUR MATE
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>No contracts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Fixed pricing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Local team</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroImage}
                alt="Local business partnership handshake" 
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Services That Actually Grow Your Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We focus on what matters most: getting you more customers and growing your revenue. 
              Here's how we help local businesses like yours thrive online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={service.title} className="mate-card group cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-primary-light group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <service.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        {service.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => setShowAnalysisCTA(true)}
              className="mate-button-primary text-lg px-8 py-4"
            >
              Start Growing Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Regional Coverage */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Proudly Serving Regional Victoria
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We know your local market inside and out. Click on your town to see how we're 
              helping businesses just like yours succeed online.
            </p>
          </div>

          <div className="space-y-8">
            {Object.entries(regions).map(([regionName, towns]) => (
              <div key={regionName} className="space-y-4">
                <h3 className="text-xl font-semibold text-primary">
                  {regionName}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {towns.map((town) => (
                    <Link
                      key={town}
                      to={`/locations/${town.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Badge 
                        variant="outline"
                        className="town-pill"
                      >
                        {town}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Don't see your town listed? We serve all of regional Victoria!
            </p>
            <Button variant="outline">
              Contact Us About Your Area
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustSignals.map((signal, index) => (
              <Card key={index} className="metric-card text-center">
                <CardContent className="pt-6">
                  <signal.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-2">
                    {signal.stat}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {signal.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              What Local Business Owners Say
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Don't just take our word for it - hear from businesses we've helped grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-primary-foreground text-foreground">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get your free website analysis and discover exactly what's holding your business back online.
          </p>
          
          <Button 
            onClick={() => setShowAnalysisCTA(true)}
            className="mate-button-secondary text-lg px-8 py-4"
          >
            Get My Free Analysis Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Floating CTA */}
      {showFloatingCTA && (
        <Button
          onClick={() => setShowAnalysisCTA(true)}
          className="floating-cta animate-mate-bounce"
        >
          Free Analysis
        </Button>
      )}

      {/* Website Analysis Modal */}
      <WebsiteAnalysisCTA
        isOpen={showAnalysisCTA}
        onClose={() => setShowAnalysisCTA(false)}
        sourcePage="grow-my-business"
      />
    </div>
  );
};

export default GrowMyBusiness;