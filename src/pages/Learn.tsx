import React, { useState } from 'react';
import { ArrowRight, Download, Clock, Star, Search, MousePointer, Share2, Mail, PenTool, Calculator, CheckSquare, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { newsletterSchema, type NewsletterFormData } from '@/lib/validationSchemas';

const Learn = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema)
  });

  const categories = [
    { id: 'all', name: 'All Resources', count: 24 },
    { id: 'seo', name: 'SEO Basics', count: 8 },
    { id: 'ads', name: 'Google Ads Tips', count: 6 },
    { id: 'social', name: 'Social Media', count: 5 },
    { id: 'website', name: 'Website Optimization', count: 7 },
    { id: 'email', name: 'Email Marketing', count: 4 },
    { id: 'content', name: 'Content Creation', count: 6 }
  ];

  const featuredGuides = [
    {
      title: 'The Complete Local SEO Guide for Australian Businesses',
      description: 'Everything you need to dominate local search results in your area. From Google My Business to local citations.',
      thumbnail: '📍',
      readTime: '15 min read',
      downloads: '2.1K',
      category: 'seo',
      tags: ['Local SEO', 'Google My Business', 'Citations']
    },
    {
      title: 'Google Ads Secrets: ROI Strategies That Actually Work',
      description: 'Stop wasting money on Google Ads. Learn the insider strategies we use for our clients.',
      thumbnail: '💰',
      readTime: '12 min read', 
      downloads: '1.8K',
      category: 'ads',
      tags: ['Google Ads', 'PPC', 'ROI', 'Conversion Tracking']
    },
    {
      title: 'Social Media Marketing for Regional Businesses',
      description: 'How to build a genuine local following that actually converts to customers.',
      thumbnail: '📱',
      readTime: '10 min read',
      downloads: '1.5K',
      category: 'social',
      tags: ['Social Media', 'Content Strategy', 'Local Marketing']
    }
  ];

  const resources = [
    {
      title: 'Why Your Website Isn\'t Getting Found (And How to Fix It)',
      description: 'The 5 most common SEO mistakes local businesses make',
      readTime: '8 min read',
      category: 'seo',
      tags: ['SEO', 'Website Audit']
    },
    {
      title: 'Google Ads Budget Calculator for Small Business',
      description: 'Work out exactly how much you should spend on Google Ads',
      readTime: '5 min read',
      category: 'ads', 
      tags: ['Google Ads', 'Budget Planning']
    },
    {
      title: '10 Instagram Post Ideas That Generate Leads',
      description: 'Proven content templates that turn followers into customers',
      readTime: '7 min read',
      category: 'social',
      tags: ['Instagram', 'Content Ideas', 'Lead Generation']
    },
    {
      title: 'Website Speed: Why Every Second Costs You Money',
      description: 'How to test and improve your website\'s loading speed',
      readTime: '6 min read',
      category: 'website',
      tags: ['Website Speed', 'User Experience']
    },
    {
      title: 'Email Marketing That Doesn\'t Annoy Your Customers',
      description: 'Build email campaigns people actually want to receive',
      readTime: '9 min read',
      category: 'email',
      tags: ['Email Marketing', 'Customer Retention']
    },
    {
      title: 'Content Marketing on a Shoestring Budget',
      description: 'Create engaging content without breaking the bank',
      readTime: '11 min read',
      category: 'content',
      tags: ['Content Marketing', 'Budget Marketing']
    }
  ];

  const tools = [
    {
      id: 'seo-checklist',
      title: 'SEO Checklist Tool',
      description: 'Interactive checklist to audit your website\'s SEO',
      icon: CheckSquare,
      color: 'bg-primary-light text-primary'
    },
    {
      id: 'roi-calculator',
      title: 'Digital Marketing ROI Calculator',
      description: 'Calculate potential returns from digital marketing',
      icon: Calculator,
      color: 'bg-secondary-light text-secondary'
    },
    {
      id: 'speed-tester',
      title: 'Website Speed Tester',
      description: 'Test your website\'s loading speed instantly',
      icon: Zap,
      color: 'bg-accent-light text-accent-foreground'
    }
  ];

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === selectedCategory);

  const onNewsletterSubmit = async (data: NewsletterFormData) => {
    try {
      // Here you would integrate with Supabase
      console.log('Newsletter signup:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNewsletterSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting newsletter:', error);
    }
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-secondary/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              Free Digital Marketing Resources for Aussie Businesses
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              No fluff, just practical tips you can actually use to grow your business online. 
              Everything you need to know about digital marketing in plain English.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="mate-button-primary text-lg px-8 py-4">
                Browse All Resources
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" className="text-lg px-8 py-4">
                Download Free Guides
                <Download className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Most Popular Free Guides
            </h2>
            <p className="text-xl text-muted-foreground">
              Our most downloaded resources - trusted by thousands of Australian business owners
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredGuides.map((guide, index) => (
              <Card key={index} className="mate-card h-full">
                <CardHeader>
                  <div className="text-6xl mb-4 text-center">
                    {guide.thumbnail}
                  </div>
                  <CardTitle className="text-xl font-bold mb-2">
                    {guide.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {guide.readTime}
                    </div>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      {guide.downloads} downloads
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {guide.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {guide.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button className="w-full mate-button-secondary">
                    Download Free Guide
                    <Download className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Resource Categories & Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Browse by Topic
            </h2>
            <p className="text-xl text-muted-foreground">
              Find exactly what you're looking for
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "mate-button-primary" : ""}
              >
                {category.name}
                <Badge 
                  variant="secondary" 
                  className="ml-2 text-xs"
                >
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Resource Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource, index) => (
              <Card key={index} className="mate-card group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="text-xs">
                      {categories.find(cat => cat.id === resource.category)?.name}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      {resource.readTime}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {resource.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    Read More
                    <ArrowRight className="ml-2 w-3 h-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Tools */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Free Interactive Tools
            </h2>
            <p className="text-xl text-muted-foreground">
              Hands-on tools to help you improve your digital marketing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <Card key={tool.id} className="mate-card text-center group cursor-pointer">
                <CardContent className="p-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${tool.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3">
                    {tool.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6">
                    {tool.description}
                  </p>
                  
                  <Button className="mate-button-primary">
                    Try It Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {!newsletterSubmitted ? (
              <>
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                  Get Weekly Digital Marketing Tips
                </h2>
                <p className="text-xl text-primary-foreground/90 mb-8">
                  Join 2,500+ Australian business owners getting practical tips delivered every Tuesday. 
                  No spam, just actionable advice you can use right away.
                </p>

                <form onSubmit={handleSubmit(onNewsletterSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-primary-foreground">
                        First Name *
                      </Label>
                      <Input
                        {...register('firstName')}
                        id="firstName"
                        placeholder="Your first name"
                        className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-accent">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-primary-foreground">
                        Email Address *
                      </Label>
                      <Input
                        {...register('email')}
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                      />
                      {errors.email && (
                        <p className="text-sm text-accent">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-primary-foreground">
                      Business Name (Optional)
                    </Label>
                    <Input
                      {...register('businessName')}
                      id="businessName"
                      placeholder="Your business name"
                      className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mate-button-accent text-lg px-8 py-4"
                  >
                    {isSubmitting ? 'Subscribing...' : 'Send Me Weekly Tips'}
                    {!isSubmitting && <Mail className="ml-2 w-5 h-5" />}
                  </Button>

                  <p className="text-sm text-primary-foreground/70">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </form>
              </>
            ) : (
              <div className="py-8">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-heading font-bold mb-4">
                  You're All Set, Mate!
                </h2>
                <p className="text-xl text-primary-foreground/90">
                  Check your inbox for your first weekly tip. It should arrive next Tuesday!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Need More Personalised Help?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            While our free resources are great, sometimes you need a custom strategy. 
            Let's chat about your specific challenges.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="mate-button-primary text-lg px-8 py-4">
              Get Your Free Website Analysis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4">
              Book a Free Strategy Call
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Learn;