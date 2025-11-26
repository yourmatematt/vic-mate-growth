import React, { useState } from 'react';
import { ArrowRight, Phone, Mail, DollarSign, Zap, MessageCircle, CheckCircle, Users, Heart, Clock, ThumbsUp, Star, MapPin, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import MattPhotoPlaceholder from '@/components/about/MattPhotoPlaceholder';
import ValuePropCard from '@/components/about/ValuePropCard';
import TestimonialCard from '@/components/about/TestimonialCard';
import WebsiteAnalysisCTA from '@/components/WebsiteAnalysisCTA';

const About = () => {
  const [showAnalysisCTA, setShowAnalysisCTA] = useState(false);

  // The problems Matt identified
  const problemCards = [
    {
      icon: DollarSign,
      title: "Too Expensive",
      description: "Melbourne agencies charge $5k/month minimum. That's your whole marketing budget, mate.",
      highlight: "I charge $29-$89/month. Pricing a tradie can actually afford."
    },
    {
      icon: Zap,
      title: "Too Complicated",
      description: "You don't need a 50-page strategy deck or complicated dashboards. You need posts that work.",
      highlight: "Record a voice note. I'll handle the rest. That's it."
    },
    {
      icon: MessageCircle,
      title: "Too Impersonal",
      description: "Cookie-cutter solutions don't work for your cafe in Ballarat or your gym in Geelong.",
      highlight: "Direct line to me, not a junior account manager three levels down."
    }
  ];

  // How Matt is different
  const differencePoints = [
    {
      icon: MessageCircle,
      title: "Voice-First",
      description: "Record a voice note about your business, I'll turn it into professional content"
    },
    {
      icon: DollarSign,
      title: "Subscription Pricing",
      description: "$29-$89/month, not $5k contracts with lock-in periods"
    },
    {
      icon: MapPin,
      title: "Built for Regional",
      description: "I understand Geelong ≠ Melbourne. Regional markets need different approaches"
    },
    {
      icon: Heart,
      title: "Plain English",
      description: "No marketing wank or tech jargon. Just what works, explained simply"
    },
    {
      icon: CheckCircle,
      title: "Actually Affordable",
      description: "Pricing designed for real Australian small businesses, not corporate giants"
    },
    {
      icon: Phone,
      title: "Real Human",
      description: "Text me, call me, email me. You get me, not a call center in the Philippines"
    }
  ];

  // Testimonials from regional Victorian businesses
  const testimonials = [
    {
      name: "Dave Mitchell",
      business: "Mitchell Electrical",
      businessType: "Electrical Contractor",
      location: "Ballarat, VIC",
      testimonial: "Matt gets it. I tried those fancy Melbourne agencies - paid $3k for a website that got me zero jobs. Matt's system actually works, and I can afford it.",
      rating: 5,
      result: "6 new jobs in first month"
    },
    {
      name: "Sarah Chen",
      business: "Grind Coffee Co",
      businessType: "Cafe",
      location: "Geelong, VIC",
      testimonial: "I was spending hours trying to post on social media. Now I just send Matt a voice message about our daily specials and he sorts it. Game changer.",
      rating: 5,
      result: "40% increase in weekday customers"
    },
    {
      name: "Jake Thompson",
      business: "Surf Coast Fitness",
      businessType: "Gym",
      location: "Torquay, VIC",
      testimonial: "Finally, someone who understands regional businesses. Matt's not trying to sell me stuff I don't need. Just honest marketing that actually brings in members.",
      rating: 5,
      result: "25 new memberships in 2 months"
    }
  ];

  // Matt's credentials (casual style)
  const credentials = [
    "Built marketing automation systems for 5+ years",
    "Worked with 50+ regional Victorian businesses",
    "Actually understands the constraints you're working with",
    "ABN: 37179872328 (sole trader, not some faceless agency)",
    "Based in regional Victoria (not Melbourne CBD)"
  ];

  return (
    <>
      <Helmet>
        <title>Meet Your Mate Matt | Your Mate Agency - Marketing for Regional Victoria</title>
        <meta
          name="description"
          content="Meet Matt, the bloke behind Your Mate Agency. Affordable marketing automation built specifically for regional Victorian small businesses. No BS, no contracts."
        />
        <meta name="keywords" content="regional victoria marketing, affordable marketing for small business, marketing for tradies, small business marketing australia" />
      </Helmet>

      <div className="min-h-screen pt-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold">
                  Meet Your Mate{' '}
                  <span className="text-primary">Matt</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  The bloke who actually gets what regional Aussie businesses need
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I got sick of watching brilliant local businesses get ripped off by expensive Melbourne agencies who didn't understand regional markets. So I built something different.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => setShowAnalysisCTA(true)}
                    className="mate-button-primary text-lg px-8 py-4"
                  >
                    Book a Free Strategy Call
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button variant="outline" className="text-lg px-8 py-4">
                    <Phone className="mr-2 w-5 h-5" />
                    +61 478 101 521
                  </Button>
                </div>

                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span>50+ happy regional businesses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Regional Victoria</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <MattPhotoPlaceholder variant="hero" />
              </div>
            </div>
          </div>
        </section>

        {/* Matt's Story */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
                Why I Started Your Mate Agency
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-6 text-muted-foreground leading-relaxed">
                  <p>
                    I grew up in regional Victoria and watched too many talented business owners
                    struggle with marketing tech they didn't need and couldn't afford.
                  </p>

                  <p>
                    Saw my mate Dave the electrician pay $5,000 to a Melbourne agency for a website
                    that didn't generate a single job. Watched Sarah from the local cafe spend
                    hours every day trying to figure out social media posting schedules.
                  </p>

                  <p>
                    These agencies would rock up with fancy presentations, charge ridiculous money,
                    then deliver cookie-cutter solutions that didn't work for regional businesses.
                  </p>

                  <p className="text-foreground font-medium">
                    So I decided to build something different. No fancy jargon, no overpriced packages.
                    Just affordable, automated marketing that actually works for regional Aussie businesses.
                  </p>

                  <p>
                    <strong>Bottom line:</strong> I'm not here to sell you on stuff you don't need.
                    I'm here to make marketing simple and affordable so you can focus on what you do best.
                  </p>
                </div>

                <div className="flex justify-center">
                  <MattPhotoPlaceholder variant="casual" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem I'm Solving */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                The Problem I'm Solving
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                These are the pain points I kept seeing with regional businesses and traditional marketing agencies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {problemCards.map((problem, index) => (
                <ValuePropCard
                  key={index}
                  icon={problem.icon}
                  title={problem.title}
                  description={problem.description}
                  highlight={problem.highlight}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How I'm Different */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                The Mate-Not-Agency Approach
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Here's what makes working with me different from those big-city agencies
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {differencePoints.map((point, index) => (
                <Card key={index} className="mate-card hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <point.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">{point.title}</h3>
                        <p className="text-sm text-muted-foreground">{point.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* What I Actually Do */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8">
                What I Actually Do
              </h2>

              <div className="space-y-6 text-lg leading-relaxed">
                <p>
                  I built an AI agent (called "Your Mate") that turns your voice notes into professional social media content.
                </p>

                <p>
                  You yarn about your business - what you're working on, your daily specials, a job you just completed.
                  I make sure it looks professional online.
                </p>

                <p>
                  No complicated dashboards, no 10-person marketing team needed, no monthly strategy meetings you don't have time for.
                </p>

                <p className="text-xl font-medium bg-primary-foreground/10 p-6 rounded-lg">
                  Just you, your business knowledge, and smart automation that actually works.
                </p>
              </div>

              <div className="mt-8">
                <Button
                  onClick={() => setShowAnalysisCTA(true)}
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-4"
                >
                  See How It Works
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Credentials (But Make It Casual) */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-8">
                Why Trust This Bloke?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <ul className="space-y-4">
                    {credentials.map((cred, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{cred}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 p-6 bg-accent/10 rounded-lg">
                    <h3 className="font-semibold mb-2">Direct Contact</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      No call centers, no account managers. Just me.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Badge variant="outline" className="justify-start">
                        <Mail className="w-3 h-3 mr-2" />
                        matt@yourmateagency.com.au
                      </Badge>
                      <Badge variant="outline" className="justify-start">
                        <Phone className="w-3 h-3 mr-2" />
                        +61 478 101 521
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <MattPhotoPlaceholder variant="business" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                What Regional Businesses Say
              </h2>
              <p className="text-xl text-muted-foreground">
                Real feedback from real Victorian small business owners
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <TestimonialCard
                  key={index}
                  {...testimonial}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Personal Touch Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-8">
                Outside of Work
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4 text-left">
                  <p className="text-muted-foreground">
                    When I'm not helping businesses with their marketing, you'll find me at local cafes
                    working on new features, or catching up with the business owners I work with.
                  </p>

                  <p className="text-muted-foreground">
                    Regional Victoria isn't just where I work - it's home. I love the community spirit,
                    the fact that everyone knows everyone, and how local businesses are the heartbeat
                    of these towns.
                  </p>

                  <p className="text-muted-foreground">
                    That's why I only work with regional businesses. You deserve marketing solutions
                    built for your reality, not some cookie-cutter Melbourne approach.
                  </p>
                </div>

                <Card className="mate-card">
                  <CardContent className="p-6 text-center">
                    <Coffee className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Local Coffee Enthusiast</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Always happy to meet over coffee to chat about your business
                    </p>
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-2" />
                      Regional Victoria
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-br from-secondary/5 to-accent/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Let's Have a Yarn
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              No sales pitch, just an honest chat about whether I can actually help your business.
              If I can't help, I'll tell you straight up.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={() => setShowAnalysisCTA(true)}
                className="mate-button-primary text-lg px-8 py-4"
              >
                Book a Strategy Call
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" className="text-lg px-8 py-4">
                <Mail className="mr-2 w-5 h-5" />
                Just Shoot Me a Message
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Usually respond within hours</span>
              </div>
              <div className="flex items-center space-x-2">
                <ThumbsUp className="w-4 h-4" />
                <span>No lock-in contracts</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Regional Victoria focused</span>
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
    </>
  );
};

export default About;