import React, { useState } from 'react';
import { ArrowRight, TrendingUp, Users, Clock, Target, Building, ShoppingBag, Heart, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import WebsiteAnalysisCTA from '@/components/WebsiteAnalysisCTA';

const Expertise = () => {
  const [showAnalysisCTA, setShowAnalysisCTA] = useState(false);

  const caseStudies = [
    {
      business: 'Thompson\'s Plumbing Services',
      industry: 'Trades & Services',
      location: 'Ballarat, VIC',
      challenge: 'Struggling to compete with larger plumbing companies online',
      solution: 'Complete local SEO overhaul, Google Ads campaign, and new responsive website',
      results: {
        trafficIncrease: '234%',
        leadIncrease: '156%', 
        roiImprovement: '320%',
        timeframe: '6 months'
      },
      testimonial: 'Your Mate Agency transformed our business. We\'re now the go-to plumbers in Ballarat!',
      beforeAfter: {
        before: 'Page 3 Google rankings, 5 leads per month',
        after: '#1 local rankings, 35+ leads per month'
      }
    },
    {
      business: 'Coastal Coffee Roasters',
      industry: 'Retail & E-commerce',
      location: 'Torquay, VIC',
      challenge: 'Online store not converting, social media not driving sales',
      solution: 'E-commerce optimization, Instagram marketing, email automation',
      results: {
        trafficIncrease: '189%',
        leadIncrease: '267%',
        roiImprovement: '445%',
        timeframe: '4 months'
      },
      testimonial: 'Our online coffee sales have absolutely exploded. We can barely keep up with demand!',
      beforeAfter: {
        before: '$2K monthly online sales, 200 email subscribers',
        after: '$11K monthly online sales, 2,400+ subscribers'
      }
    },
    {
      business: 'Wellness Works Physiotherapy',
      industry: 'Healthcare & Wellness',
      location: 'Geelong, VIC', 
      challenge: 'New clinic struggling to attract local patients',
      solution: 'Local SEO, Google My Business optimization, content marketing',
      results: {
        trafficIncrease: '298%',
        leadIncrease: '203%',
        roiImprovement: '387%',
        timeframe: '5 months'
      },
      testimonial: 'We went from empty appointment books to being fully booked 3 weeks out.',
      beforeAfter: {
        before: 'Unknown locally, 2-3 new patients per week',
        after: 'Top 3 local rankings, 20+ new patients per week'
      }
    },
    {
      business: 'The Grovedale Hotel',
      industry: 'Hospitality & Tourism', 
      location: 'Grovedale, VIC',
      challenge: 'Outdated website, poor online presence affecting bookings',
      solution: 'New website with booking system, social media management, Google Ads',
      results: {
        trafficIncrease: '145%',
        leadIncrease: '178%',
        roiImprovement: '256%',
        timeframe: '3 months'
      },
      testimonial: 'Direct bookings through our website have tripled. We\'re busier than ever!',
      beforeAfter: {
        before: '15% direct bookings, outdated website',
        after: '45% direct bookings, modern responsive site'
      }
    },
    {
      business: 'Mitchell Accounting Services',
      industry: 'Professional Services',
      location: 'Bendigo, VIC',
      challenge: 'Competing with larger accounting firms, low online visibility',
      solution: 'Professional website redesign, LinkedIn marketing, local SEO',
      results: {
        trafficIncrease: '167%',
        leadIncrease: '134%',
        roiImprovement: '289%',
        timeframe: '4 months'
      },
      testimonial: 'We\'ve doubled our client base and can now compete with the big firms.',
      beforeAfter: {
        before: '1-2 new clients per month, poor web presence',
        after: '8-10 new clients per month, strong online authority'
      }
    },
    {
      business: 'Bellarine Beauty Studio',
      industry: 'Beauty & Personal Care',
      location: 'Ocean Grove, VIC',
      challenge: 'Seasonal business needs year-round customers',
      solution: 'Instagram marketing, email campaigns, Google Ads for services',
      results: {
        trafficIncrease: '223%',
        leadIncrease: '195%',
        roiImprovement: '334%',
        timeframe: '6 months'
      },
      testimonial: 'We now have consistent bookings year-round, not just during summer.',
      beforeAfter: {
        before: 'Seasonal bookings only, quiet winters',
        after: 'Consistent year-round bookings, 85% capacity'
      }
    }
  ];

  const industries = [
    {
      id: 'trades',
      name: 'Trades & Services',
      icon: Building,
      description: 'Plumbers, electricians, builders, and other trade professionals',
      specialties: [
        'Local search optimization',
        'Emergency service advertising',
        'Review management',
        'Mobile-first websites'
      ],
      avgIncrease: '215%'
    },
    {
      id: 'retail',
      name: 'Retail & E-commerce',
      icon: ShoppingBag,
      description: 'Online stores, local retailers, and product-based businesses',
      specialties: [
        'E-commerce optimization',
        'Product photography',
        'Social commerce',
        'Inventory integration'
      ],
      avgIncrease: '187%'
    },
    {
      id: 'healthcare',
      name: 'Healthcare & Wellness',
      icon: Heart,
      description: 'Medical practices, allied health, fitness, and wellness services',
      specialties: [
        'Compliant healthcare marketing',
        'Patient education content',
        'Online booking systems',
        'AHPRA compliance'
      ],
      avgIncrease: '245%'
    },
    {
      id: 'hospitality',
      name: 'Hospitality & Tourism',
      icon: MapPin,
      description: 'Hotels, restaurants, cafes, and tourism businesses',
      specialties: [
        'Direct booking optimization',
        'Local tourism marketing', 
        'Event promotion',
        'Seasonal campaigns'
      ],
      avgIncrease: '176%'
    },
    {
      id: 'professional',
      name: 'Professional Services',
      icon: Briefcase,
      description: 'Lawyers, accountants, consultants, and B2B services',
      specialties: [
        'Authority building',
        'LinkedIn marketing',
        'Thought leadership',
        'Professional networking'
      ],
      avgIncrease: '198%'
    }
  ];

  const metrics = [
    {
      number: '127+',
      label: 'Total Clients Served',
      description: 'Regional Victorian businesses transformed'
    },
    {
      number: '156%',
      label: 'Average Traffic Increase',
      description: 'Within first 6 months'
    },
    {
      number: '10,000+',
      label: 'Total Leads Generated',
      description: 'For our clients in 2024'
    },
    {
      number: '94%',
      label: 'Client Retention Rate',
      description: 'Clients stay with us long-term'
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              Real Results for Real Local Businesses
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Check out how we've helped businesses just like yours thrive online. 
              Every case study represents a real Victorian business that trusted us to grow their digital presence.
            </p>
            <Button 
              onClick={() => setShowAnalysisCTA(true)}
              className="mate-button-primary text-lg px-8 py-4"
            >
              See How We Can Help You
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Results Dashboard */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              The Numbers Don't Lie
            </h2>
            <p className="text-xl text-muted-foreground">
              Here's what we've achieved for regional Victorian businesses in 2024
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <Card key={index} className="metric-card text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {metric.number}
                  </div>
                  <h3 className="font-semibold mb-2">{metric.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {metric.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Success Stories From Across Victoria
            </h2>
            <p className="text-xl text-muted-foreground">
              Real businesses, real challenges, real results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <Card key={index} className="mate-card h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {study.industry}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {study.location}
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold">
                    {study.business}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">The Challenge:</h4>
                    <p className="text-sm text-muted-foreground">
                      {study.challenge}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Our Solution:</h4>
                    <p className="text-sm text-muted-foreground">
                      {study.solution}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-secondary-light rounded-lg">
                      <div className="text-2xl font-bold text-secondary">
                        +{study.results.trafficIncrease}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Website Traffic
                      </div>
                    </div>
                    <div className="text-center p-3 bg-primary-light rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        +{study.results.leadIncrease}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Leads Generated
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent-light p-4 rounded-lg">
                    <p className="text-sm italic mb-2">
                      "{study.testimonial}"
                    </p>
                    <div className="text-xs font-semibold">
                      - {study.business} Owner
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold">Before: </span>
                      <span className="text-muted-foreground">{study.beforeAfter.before}</span>
                    </div>
                    <div>
                      <span className="font-semibold">After: </span>
                      <span className="text-muted-foreground">{study.beforeAfter.after}</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowAnalysisCTA(true)}
                  >
                    Get Similar Results
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Expertise Tabs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Industry Expertise That Delivers
            </h2>
            <p className="text-xl text-muted-foreground">
              We understand the unique challenges and opportunities in your industry
            </p>
          </div>

          <Tabs defaultValue="trades" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8">
              {industries.map((industry) => (
                <TabsTrigger 
                  key={industry.id} 
                  value={industry.id}
                  className="text-xs md:text-sm"
                >
                  <industry.icon className="w-4 h-4 mr-2" />
                  {industry.name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {industries.map((industry) => (
              <TabsContent key={industry.id} value={industry.id}>
                <Card className="mate-card">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-4 rounded-lg bg-primary-light">
                            <industry.icon className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-heading font-bold">
                              {industry.name}
                            </h3>
                            <p className="text-muted-foreground">
                              {industry.description}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-4">Our Specialties:</h4>
                          <ul className="space-y-2">
                            {industry.specialties.map((specialty, idx) => (
                              <li key={idx} className="flex items-center">
                                <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                                {specialty}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button 
                          onClick={() => setShowAnalysisCTA(true)}
                          className="mate-button-primary"
                        >
                          Get Industry-Specific Strategy
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-foreground mb-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold">+{industry.avgIncrease}</div>
                            <div className="text-sm">Avg Growth</div>
                          </div>
                        </div>
                        <p className="text-muted-foreground">
                          Average increase in online leads for {industry.name.toLowerCase()} clients
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Join Our Success Stories?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Let's create a case study for your business. Get your free website analysis 
            and see exactly how we can help you grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowAnalysisCTA(true)}
              className="mate-button-accent text-lg px-8 py-4"
            >
              Get My Free Analysis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button 
              variant="outline"
              className="text-lg px-8 py-4 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              View All Case Studies
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