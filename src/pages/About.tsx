import React, { useState } from 'react';
import { ArrowRight, Users, Heart, Target, Handshake, Linkedin, Phone, Mail, Award, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import WebsiteAnalysisCTA from '@/components/WebsiteAnalysisCTA';

const About = () => {
  const [showAnalysisCTA, setShowAnalysisCTA] = useState(false);

  const teamMembers = [
    {
      name: 'Sarah Mitchell',
      role: 'Founder & Digital Strategy Director',
      bio: 'Born and raised in Geelong, Sarah started Your Mate Agency after seeing too many local businesses struggle with confusing digital marketing companies.',
      funFact: 'Volunteers at the Geelong Food Relief Centre every weekend',
      expertise: ['Digital Strategy', 'Local SEO', 'Business Growth'],
      linkedin: '#'
    },
    {
      name: 'Jake Thompson',
      role: 'Google Ads Specialist',
      bio: 'Former tradie turned digital marketing expert. Jake knows exactly what it\'s like to run a local business.',
      funFact: 'Still helps out his dad\'s plumbing business on weekends',
      expertise: ['Google Ads', 'PPC Management', 'Conversion Optimization'],
      linkedin: '#'
    },
    {
      name: 'Emma Chen',
      role: 'Social Media & Content Manager',
      bio: 'Ballarat local who understands regional communities. Emma creates content that actually connects with your customers.',
      funFact: 'Runs the social media for 3 local animal rescue groups (for free!)',
      expertise: ['Social Media', 'Content Creation', 'Community Management'],
      linkedin: '#'
    },
    {
      name: 'David Wilson',
      role: 'Web Developer & SEO Specialist',
      bio: 'Bendigo-born tech expert who builds websites that actually work for regional businesses.',
      funFact: 'Teaches coding workshops at the local library',
      expertise: ['Web Development', 'Technical SEO', 'Website Optimization'],
      linkedin: '#'
    }
  ];

  const values = [
    {
      icon: Heart,
      title: 'We Speak Your Language',
      description: 'No confusing tech talk or marketing jargon. We explain everything in plain English because that\'s how real conversations happen.',
      details: [
        'All strategy sessions in plain English',
        'Monthly reports you can actually understand', 
        'No locked-in contracts or hidden fees',
        'Direct access to your account manager'
      ]
    },
    {
      icon: Target,
      title: 'Fixed Monthly Pricing',
      description: 'You know exactly what you\'re paying each month. No surprises, no sudden price increases, no dodgy add-on fees.',
      details: [
        'Transparent pricing from day one',
        'No setup fees or hidden costs',
        'Price locks for first 12 months',
        'Easy monthly payment options'
      ]
    },
    {
      icon: MapPin,
      title: 'Local Market Knowledge',
      description: 'We live here too. We understand regional Victorian customers, local competition, and what actually works in smaller communities.',
      details: [
        'Deep understanding of regional markets',
        'Local competitor analysis included',
        'Community-focused marketing strategies',
        'Regional search optimization'
      ]
    },
    {
      icon: Award,
      title: 'Proven Track Record',
      description: 'Real results for real businesses. We\'ve helped over 100 regional Victorian businesses grow their online presence.',
      details: [
        '127+ successful client partnerships',
        '94% client retention rate',
        'Average 156% increase in online leads',
        '5-star Google reviews from real clients'
      ]
    },
    {
      icon: Phone,
      title: 'Always Available',
      description: 'Pick up the phone and call us. Seriously. We answer our phones and respond to emails because that\'s what mates do.',
      details: [
        'Direct phone line to your account manager',
        'Same-day email responses (usually within hours)',
        'Emergency support for website issues',
        'Regular check-in calls included'
      ]
    }
  ];

  const communityInvolvement = [
    {
      title: 'Geelong Chamber of Commerce',
      description: 'Active members supporting local business community',
      involvement: 'Monthly digital marketing workshops'
    },
    {
      title: 'Ballarat Business Network',
      description: 'Sponsoring quarterly networking events',
      involvement: 'Free website audits for members'
    },
    {
      title: 'Surf Coast Business Group',
      description: 'Supporting coastal tourism businesses',
      involvement: 'Seasonal marketing strategy sessions'
    },
    {
      title: 'Regional Victoria Small Business Week',
      description: 'Annual presenting sponsor',
      involvement: 'Free educational seminars'
    }
  ];

  const stats = [
    {
      number: '127+',
      label: 'Local Businesses Helped',
      description: 'Across regional Victoria'
    },
    {
      number: '5 Years',
      label: 'In Business',
      description: 'Serving regional Victoria'
    },
    {
      number: '94%',
      label: 'Client Retention Rate',
      description: 'Clients stay with us long-term'
    },
    {
      number: '$2.1M+',
      label: 'Revenue Generated',
      description: 'For our clients in 2024'
    }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              We're Your Local Digital Marketing Mates
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Born and raised in regional Victoria, we understand local business challenges. 
              Our mission is simple: make professional digital marketing accessible to every regional business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => setShowAnalysisCTA(true)}
                className="mate-button-primary text-lg px-8 py-4"
              >
                Work With Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" className="text-lg px-8 py-4">
                <Phone className="mr-2 w-5 h-5" />
                Call 1300 YOUR MATE
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-heading font-bold">
                Our Story
              </h2>
              
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Your Mate Agency started in 2019 when our founder, Sarah, got sick of watching 
                  brilliant local businesses get ripped off by slick city marketing agencies who 
                  didn't understand regional markets.
                </p>
                
                <p>
                  After seeing her mate Dave (a local electrician) pay $5,000 for a website that 
                  didn't generate a single lead, Sarah decided enough was enough. There had to be 
                  a better way to help regional businesses succeed online.
                </p>
                
                <p>
                  We started with one simple promise: honest digital marketing that actually works 
                  for regional Victorian businesses. No jargon, no rip-offs, no locked contracts. 
                  Just real results from people who actually understand your market.
                </p>
                
                <p>
                  Five years later, we've helped over 127 local businesses transform their online 
                  presence. From tradies in Ballarat to cafes in Torquay, we've proven that great 
                  digital marketing doesn't have to be complicated or expensive.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="metric-card text-center">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <h3 className="font-semibold mb-1">{stat.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Meet Your Marketing Mates
            </h2>
            <p className="text-xl text-muted-foreground">
              Real people with real local connections who genuinely care about your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="mate-card text-center">
                <CardContent className="p-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-3">
                    {member.role}
                  </p>
                  
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {member.bio}
                  </p>
                  
                  <div className="bg-accent-light p-3 rounded-lg mb-4">
                    <p className="text-xs font-medium mb-1">Fun Fact:</p>
                    <p className="text-xs text-muted-foreground">
                      {member.funFact}
                    </p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium">Expertise:</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {member.expertise.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex}
                          className="text-xs bg-primary-light text-primary px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    <Linkedin className="mr-2 w-4 h-4" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Accordion */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Choose Your Mate Agency?
            </h2>
            <p className="text-xl text-muted-foreground">
              Here's what makes us different from other digital marketing agencies
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {values.map((value, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="mate-card border-none"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 rounded-lg bg-primary-light">
                        <value.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold mb-1">
                          {value.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3">What this means for you:</h4>
                      <ul className="space-y-2">
                        {value.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Community Involvement */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Supporting Our Community
            </h2>
            <p className="text-xl text-primary-foreground/90">
              We believe in giving back to the communities that support us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {communityInvolvement.map((involvement, index) => (
              <Card key={index} className="bg-primary-foreground text-foreground">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                      <Handshake className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">
                        {involvement.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        {involvement.description}
                      </p>
                      <div className="bg-secondary-light text-secondary px-3 py-2 rounded-lg text-sm font-medium">
                        {involvement.involvement}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-primary-foreground/90 mb-4">
              Interested in partnering with us for a community event?
            </p>
            <Button 
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
            >
              <Mail className="mr-2 w-4 h-4" />
              Get in Touch
            </Button>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8">
              Our Mission & Values
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="mate-card text-center">
                <CardContent className="p-6">
                  <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">Honesty</h3>
                  <p className="text-sm text-muted-foreground">
                    We tell you exactly what we're doing and why. No smoke and mirrors, 
                    no confusing reports, just honest communication.
                  </p>
                </CardContent>
              </Card>

              <Card className="mate-card text-center">
                <CardContent className="p-6">
                  <Target className="w-12 h-12 text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">Results</h3>
                  <p className="text-sm text-muted-foreground">
                    Everything we do is focused on growing your business. 
                    If it doesn't help you get more customers, we don't do it.
                  </p>
                </CardContent>
              </Card>

              <Card className="mate-card text-center">
                <CardContent className="p-6">
                  <Users className="w-12 h-12 text-accent-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    We're part of this community too. Your success is our success, 
                    and we're invested in the long-term health of regional Victoria.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-br from-secondary/5 to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Work With Mates Who Actually Care?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Let's have a chat about your business goals. No sales pressure, 
            just a genuine conversation about how we can help you grow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowAnalysisCTA(true)}
              className="mate-button-primary text-lg px-8 py-4"
            >
              Get Your Free Website Analysis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4">
              <Phone className="mr-2 w-5 h-5" />
              Call 1300 YOUR MATE
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span>5-star Google reviews</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>127+ happy clients</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>94% retention rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Website Analysis Modal */}
      <WebsiteAnalysisCTA
        isOpen={showAnalysisCTA}
        onClose={() => setShowAnalysisCTA(false)}
        sourcePage="about"
      />
    </div>
  );
};

export default About;