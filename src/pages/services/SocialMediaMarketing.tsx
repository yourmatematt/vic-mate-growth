import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Youtube,
  Users, 
  Heart,
  MessageCircle,
  TrendingUp,
  Camera,
  CheckCircle,
  ArrowRight,
  Zap
} from 'lucide-react';

const SocialMediaMarketing = () => {
  const platforms = [
    {
      icon: <Facebook className="w-8 h-8" />,
      name: "Facebook",
      description: "Build community and drive engagement with targeted Facebook marketing",
      color: "text-blue-600"
    },
    {
      icon: <Instagram className="w-8 h-8" />,
      name: "Instagram",
      description: "Share your story visually and connect with customers through Instagram",
      color: "text-pink-600"
    },
    {
      icon: <Linkedin className="w-8 h-8" />,
      name: "LinkedIn",
      description: "Establish thought leadership and connect with professionals on LinkedIn",
      color: "text-blue-700"
    },
    {
      icon: <Twitter className="w-8 h-8" />,
      name: "Twitter/X",
      description: "Join conversations and share real-time updates with your audience",
      color: "text-gray-800"
    },
    {
      icon: <Youtube className="w-8 h-8" />,
      name: "YouTube",
      description: "Create engaging video content that educates and entertains your audience",
      color: "text-red-600"
    }
  ];

  const services = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Content Creation",
      description: "Professional photos, graphics, and videos that tell your brand story"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Management",
      description: "Engage with your audience and build a loyal community around your brand"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Social Media Strategy",
      description: "Data-driven strategies that align with your business goals"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Paid Social Advertising",
      description: "Targeted social media ads that drive traffic and conversions"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Influencer Partnerships",
      description: "Connect with relevant influencers to expand your reach"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Social Listening",
      description: "Monitor mentions and conversations about your brand online"
    }
  ];

  const packages = [
    {
      name: "Social Starter",
      price: "$699/month",
      description: "Perfect for small businesses starting their social media journey",
      features: [
        "2 social media platforms",
        "8 posts per month",
        "Basic content creation",
        "Community management",
        "Monthly analytics report"
      ]
    },
    {
      name: "Social Growth",
      price: "$1,199/month",
      description: "Comprehensive social media management for growing businesses",
      features: [
        "4 social media platforms",
        "20 posts per month",
        "Professional content creation",
        "Daily community management",
        "Paid social advertising",
        "Weekly performance reports",
        "Social media strategy"
      ],
      popular: true
    },
    {
      name: "Social Enterprise",
      price: "Custom",
      description: "Full-service social media solutions for large businesses",
      features: [
        "All major platforms",
        "Unlimited posts",
        "Video content creation",
        "Influencer partnerships",
        "Advanced analytics",
        "Dedicated account manager",
        "24/7 monitoring"
      ]
    }
  ];

  const results = [
    { metric: "Average Follower Growth", value: "150%" },
    { metric: "Engagement Rate Increase", value: "240%" },
    { metric: "Social Media Leads", value: "320%" },
    { metric: "Brand Mention Increase", value: "180%" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/10 text-white border-white/20">
              Social Media Marketing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Build Your Brand & Engage Your Audience
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Professional social media management that builds community, drives engagement, and grows your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Your Social Media Audit
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Our Social Portfolios
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              We Manage All Major Social Platforms
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From Facebook to TikTok, we help you connect with your audience wherever they are.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {platforms.map((platform, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`mx-auto mb-4 ${platform.color}`}>
                    {platform.icon}
                  </div>
                  <CardTitle className="text-xl">{platform.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {platform.description}
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
              Social Media Results That Matter
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our social media strategies have helped businesses build strong online communities and drive real business growth.
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
              See Social Media Case Studies
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
              Complete Social Media Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From strategy to execution, we handle every aspect of your social media presence.
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

      {/* Content Strategy */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Strategic Content That Converts
              </h2>
              <p className="text-xl text-muted-foreground">
                Our content strategy focuses on building authentic relationships with your audience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-heading font-bold mb-6">
                  Our Content Approach
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Brand-aligned content that reflects your unique voice</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Data-driven content calendar based on audience insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Mix of educational, entertaining, and promotional content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>User-generated content and community building</span>
                  </li>
                </ul>

                <Button className="mt-6" size="lg">
                  See Our Content Portfolio
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h4 className="text-xl font-bold mb-4">Content Creation Process</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span>Brand discovery & audience research</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span>Content strategy development</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span>Content creation & design</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <span>Scheduling & publishing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                    <span>Engagement & community management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">6</div>
                    <span>Performance analysis & optimization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Social Media Management Packages
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the social media package that fits your business goals and budget.
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
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
              Ready to Build Your Social Media Presence?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get a free social media audit and discover how we can help you connect with your audience and grow your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="mate-button-accent">
                Get Your Free Social Media Audit
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

export default SocialMediaMarketing;