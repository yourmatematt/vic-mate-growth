import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  PenTool, 
  Camera, 
  Video, 
  FileText, 
  Mic, 
  Image,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';

const ContentCreation = () => {
  const contentTypes = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Blog Writing",
      description: "SEO-optimized blog posts that educate your audience and drive organic traffic",
      color: "text-blue-600"
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Photography",
      description: "Professional product and brand photography that showcases your business",
      color: "text-purple-600"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Video Production",
      description: "Engaging video content from social media clips to promotional videos",
      color: "text-red-600"
    },
    {
      icon: <PenTool className="w-8 h-8" />,
      title: "Copywriting",
      description: "Persuasive copy for websites, ads, and marketing materials that converts",
      color: "text-green-600"
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Graphic Design",
      description: "Eye-catching graphics for social media, marketing materials, and branding",
      color: "text-yellow-600"
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Podcast Production",
      description: "Full podcast production from recording to editing and distribution",
      color: "text-indigo-600"
    }
  ];

  const services = [
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Content Strategy",
      description: "Develop comprehensive content strategies aligned with your business goals"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Audience Research",
      description: "Understand your audience to create content that resonates and engages"
    },
    {
      icon: <PenTool className="w-6 h-6" />,
      title: "Content Creation",
      description: "Professional content creation across all formats and platforms"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "SEO Optimization",
      description: "SEO-optimized content that ranks well and drives organic traffic"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Content Distribution",
      description: "Strategic content distribution across multiple channels and platforms"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Content Calendar",
      description: "Organized content calendars to ensure consistent publishing schedules"
    }
  ];

  const packages = [
    {
      name: "Content Starter",
      price: "$899/month",
      description: "Essential content creation for small businesses",
      features: [
        "4 blog posts per month",
        "8 social media graphics",
        "Basic SEO optimization",
        "Content calendar",
        "Monthly performance report"
      ]
    },
    {
      name: "Content Growth",
      price: "$1,599/month",
      description: "Comprehensive content creation for growing businesses",
      features: [
        "8 blog posts per month",
        "16 social media graphics",
        "2 promotional videos",
        "Email newsletter content",
        "Advanced SEO optimization",
        "Content strategy consultation",
        "Weekly content calendar"
      ],
      popular: true
    },
    {
      name: "Content Enterprise",
      price: "Custom",
      description: "Full-service content solutions for large businesses",
      features: [
        "Unlimited blog posts",
        "Custom photography & videography",
        "Podcast production",
        "White paper & case studies",
        "Multi-platform content strategy",
        "Dedicated content manager",
        "Real-time collaboration tools"
      ]
    }
  ];

  const results = [
    { metric: "Average Content Engagement", value: "185%" },
    { metric: "Organic Traffic Increase", value: "240%" },
    { metric: "Lead Generation Growth", value: "167%" },
    { metric: "Brand Awareness Boost", value: "220%" }
  ];

  const process = [
    {
      step: "1",
      title: "Discovery & Strategy",
      description: "Understand your brand, audience, and goals to create a tailored content strategy"
    },
    {
      step: "2", 
      title: "Content Planning",
      description: "Develop detailed content calendars and topics that align with your marketing objectives"
    },
    {
      step: "3",
      title: "Creation & Production",
      description: "Create high-quality content using professional tools and proven processes"
    },
    {
      step: "4",
      title: "Review & Approval",
      description: "Collaborative review process to ensure content meets your standards and brand voice"
    },
    {
      step: "5",
      title: "Publishing & Distribution",
      description: "Strategic publishing and distribution across all relevant channels and platforms"
    },
    {
      step: "6",
      title: "Analysis & Optimization",
      description: "Monitor performance and continuously optimize content based on data insights"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/10 text-white border-white/20">
              Content Creation
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Content That Captivates & Converts
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Professional content creation services that tell your story, engage your audience, and drive business growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Your Content Strategy
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Our Content Portfolio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Types Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Content Creation Across All Formats
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From blog posts to video production, we create content that engages your audience and drives results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contentTypes.map((type, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`mx-auto mb-4 ${type.color}`}>
                    {type.icon}
                  </div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {type.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Content That Delivers Results
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our content creation services have helped businesses build stronger brands, engage audiences, and drive growth.
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
              See Content Creation Case Studies
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Complete Content Creation Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From strategy to distribution, we handle every aspect of your content marketing needs.
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

      {/* Process Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Our Content Creation Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A proven process that ensures every piece of content we create drives results for your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {process.map((step, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                    {step.step}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Content Matters */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Why Quality Content Matters
              </h2>
              <p className="text-xl text-muted-foreground">
                In today's digital landscape, content is the foundation of successful marketing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-heading font-bold mb-6">
                  The Power of Great Content
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Content marketing costs 62% less than traditional marketing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Quality content generates 3x more leads than paid advertising</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>70% of marketers actively invest in content marketing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Consistent content creation builds brand authority and trust</span>
                  </li>
                </ul>

                <Button className="mt-6" size="lg">
                  Start Your Content Strategy
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h4 className="text-xl font-bold mb-4">Content Creation Benefits</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <span>Increased organic search visibility</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <span>Enhanced audience engagement</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-primary" />
                    </div>
                    <span>Better lead generation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-primary" />
                    </div>
                    <span>Established thought leadership</span>
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
              Content Creation Packages
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional content creation services tailored to your business needs and budget.
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Ready to Create Content That Converts?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Let us help you develop a content strategy that engages your audience and drives business growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="mate-button-accent">
                Get Your Content Strategy
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

export default ContentCreation;