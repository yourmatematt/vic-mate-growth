import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  PieChart,
  Search,
  BarChart3,
  CheckSquare,
  Share2,
  MapPin,
  Megaphone,
  Calendar,
  Mail,
  Star,
  Clock,
  Users,
  Zap
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'calculators' | 'audits' | 'predictors' | 'quick';
  path: string;
  icon: React.ElementType;
  estimatedTime: number; // minutes
  rating: number;
  usageCount: number;
  popular?: boolean;
  new?: boolean;
}

const Tools = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const tools: Tool[] = [
    // Calculators
    {
      id: 'roi-calculator',
      name: 'ROI Calculator',
      description: 'Calculate your return on investment for digital marketing campaigns',
      category: 'calculators',
      path: '/tools/roi-calculator',
      icon: Calculator,
      estimatedTime: 2,
      rating: 4.9,
      usageCount: 1847,
      popular: true,
    },
    {
      id: 'break-even',
      name: 'Break-Even Calculator',
      description: 'Find out how many customers you need to make your ads profitable',
      category: 'calculators',
      path: '/tools/break-even-calculator',
      icon: TrendingUp,
      estimatedTime: 3,
      rating: 4.8,
      usageCount: 1234,
      popular: true,
      new: true,
    },
    {
      id: 'ltv-calculator',
      name: 'Customer LTV Calculator',
      description: 'Calculate customer lifetime value and acceptable acquisition costs',
      category: 'calculators',
      path: '/tools/ltv-calculator',
      icon: DollarSign,
      estimatedTime: 4,
      rating: 4.7,
      usageCount: 892,
      new: true,
    },
    {
      id: 'budget-allocator',
      name: 'Marketing Budget Allocator',
      description: 'Get AI-powered recommendations for splitting your marketing budget',
      category: 'calculators',
      path: '/tools/budget-allocator',
      icon: PieChart,
      estimatedTime: 5,
      rating: 4.9,
      usageCount: 1456,
      popular: true,
      new: true,
    },

    // Audits & Assessments
    {
      id: 'marketing-assessment',
      name: 'Marketing Readiness Assessment',
      description: 'Take our 20-question quiz to assess your digital marketing maturity',
      category: 'audits',
      path: '/tools/marketing-assessment',
      icon: CheckSquare,
      estimatedTime: 8,
      rating: 4.9,
      usageCount: 2103,
      popular: true,
      new: true,
    },
    {
      id: 'seo-checklist',
      name: 'SEO Checklist',
      description: 'Audit your website SEO with our comprehensive 20-point checklist',
      category: 'audits',
      path: '/learn#seo-checklist',
      icon: Search,
      estimatedTime: 5,
      rating: 4.8,
      usageCount: 1678,
    },
    {
      id: 'social-audit',
      name: 'Social Media Audit',
      description: 'Get a detailed 42-point audit of your social media presence',
      category: 'audits',
      path: '/tools/social-media-audit',
      icon: Share2,
      estimatedTime: 4,
      rating: 4.7,
      usageCount: 923,
      new: true,
    },
    {
      id: 'gmb-scorecard',
      name: 'Google My Business Scorecard',
      description: 'Check your GMB listing completeness with our 15-point scorecard',
      category: 'audits',
      path: '/tools/gmb-scorecard',
      icon: MapPin,
      estimatedTime: 3,
      rating: 4.8,
      usageCount: 1156,
      new: true,
    },
    {
      id: 'citation-checker',
      name: 'Local Citation Checker',
      description: 'Find missing business directory listings across 20 Australian directories',
      category: 'audits',
      path: '/tools/citation-checker',
      icon: BarChart3,
      estimatedTime: 2,
      rating: 4.6,
      usageCount: 734,
      new: true,
    },

    // Predictors & Planners
    {
      id: 'ad-predictor',
      name: 'Ad Performance Predictor',
      description: 'Forecast your Google Ads results based on regional Victoria benchmarks',
      category: 'predictors',
      path: '/tools/ad-performance-predictor',
      icon: Megaphone,
      estimatedTime: 5,
      rating: 4.7,
      usageCount: 1089,
      new: true,
    },
    {
      id: 'content-calendar',
      name: 'Content Calendar Generator',
      description: 'Generate a 30-day social media content calendar for your industry',
      category: 'predictors',
      path: '/tools/content-calendar-generator',
      icon: Calendar,
      estimatedTime: 3,
      rating: 4.6,
      usageCount: 645,
      new: true,
    },

    // Quick Tools
    {
      id: 'subject-line',
      name: 'Email Subject Line Scorer',
      description: 'Test and score your email subject lines for maximum open rates',
      category: 'quick',
      path: '/tools/subject-line-scorer',
      icon: Mail,
      estimatedTime: 1,
      rating: 4.8,
      usageCount: 2456,
      popular: true,
      new: true,
    },
    {
      id: 'website-speed',
      name: 'Website Speed Tracker',
      description: 'Check your website performance and get optimization tips',
      category: 'quick',
      path: '/learn#website-speed',
      icon: Zap,
      estimatedTime: 2,
      rating: 4.7,
      usageCount: 1567,
    },
  ];

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularTools = tools.filter(tool => tool.popular);
  const calculatorTools = filteredTools.filter(tool => tool.category === 'calculators');
  const auditTools = filteredTools.filter(tool => tool.category === 'audits');
  const predictorTools = filteredTools.filter(tool => tool.category === 'predictors');
  const quickTools = filteredTools.filter(tool => tool.category === 'quick');

  const ToolCard = ({ tool }: { tool: Tool }) => {
    const Icon = tool.icon;

    return (
      <Link to={tool.path}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col items-end space-y-1">
                {tool.new && <Badge variant="secondary">New</Badge>}
                {tool.popular && <Badge className="bg-accent text-accent-foreground">Popular</Badge>}
              </div>
            </div>
            <CardTitle className="text-lg">{tool.name}</CardTitle>
            <CardDescription className="line-clamp-2">
              {tool.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {tool.estimatedTime} min
                </span>
                <span className="flex items-center">
                  <Star className="w-3 h-3 mr-1 fill-current text-yellow-500" />
                  {tool.rating}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {tool.usageCount.toLocaleString()} uses
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Free Marketing Tools | Your Mate Agency</title>
        <meta name="description" content="Free digital marketing tools for Victorian businesses. Calculate ROI, audit your marketing, and get actionable insights." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Free Marketing Tools for Victorian Businesses
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Calculate ROI, audit your marketing, and get actionable insights—no software required, no signup needed.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-6 text-lg"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>12,543 tools used this month</span>
            </div>
            <span className="hidden md:inline">•</span>
            <span>100% Free</span>
            <span className="hidden md:inline">•</span>
            <span>No Signup Required</span>
            <span className="hidden md:inline">•</span>
            <span>Instant Results</span>
          </div>
        </div>
      </section>

      {/* Popular Tools */}
      {!searchQuery && (
        <section className="py-12 px-4 border-b">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">🔥 Most Popular This Week</h2>
                <p className="text-muted-foreground">Tools our clients use most</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularTools.slice(0, 3).map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Tools by Category */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
              <TabsTrigger value="all">
                All ({filteredTools.length})
              </TabsTrigger>
              <TabsTrigger value="calculators">
                Calculators
              </TabsTrigger>
              <TabsTrigger value="audits">
                Audits
              </TabsTrigger>
              <TabsTrigger value="predictors">
                Planners
              </TabsTrigger>
              <TabsTrigger value="quick">
                Quick Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {/* Calculators */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculators & Planners
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {calculatorTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>

              {/* Audits */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <CheckSquare className="w-5 h-5 mr-2" />
                  Audits & Assessments
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {auditTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>

              {/* Predictors */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Predictors & Generators
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {predictorTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>

              {/* Quick Tools */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2" />
                  Quick Tools
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickTools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calculators">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {calculatorTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audits">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auditTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="predictors">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {predictorTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="quick">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need Help Implementing These Insights?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our tools give you the data—our team helps you take action. Book a free 15-minute strategy call.
          </p>
          <Link to="/about">
            <button className="mate-button-primary px-8 py-4 text-lg">
              Book Your Free Strategy Call
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Tools;
