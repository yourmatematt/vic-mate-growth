import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Users, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Zap,
  CheckCircle,
  ArrowRight,
  Clock,
  Heart,
  Send,
  Filter
} from 'lucide-react';

const EmailMarketing = () => {
  const services = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Campaign Design",
      description: "Beautiful, responsive email templates that represent your brand perfectly"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "List Building & Segmentation",
      description: "Grow your email list and segment subscribers for targeted messaging"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Marketing Automation",
      description: "Set up automated email sequences that nurture leads and drive sales"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Performance Analytics",
      description: "Track opens, clicks, conversions and optimize your campaigns"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Newsletter Management",
      description: "Regular newsletters that keep your audience engaged and informed"
    },
    {
      icon: <Filter className="w-6 h-6" />,
      title: "A/B Testing",
      description: "Test different subject lines, content, and designs for optimal results"
    }
  ];

  const packages = [
    {
      name: "Email Starter",
      price: "$399/month",
      description: "Perfect for small businesses starting with email marketing",
      features: [
        "Up to 2,500 subscribers",
        "4 email campaigns per month",
        "Basic email templates",
        "List management",
        "Monthly performance report"
      ]
    },
    {
      name: "Email Growth",
      price: "$699/month",
      description: "Comprehensive email marketing for growing businesses",
      features: [
        "Up to 10,000 subscribers",
        "8 email campaigns per month",
        "Custom email design",
        "Marketing automation setup",
        "Segmentation & targeting",
        "A/B testing",
        "Weekly performance reports"
      ],
      popular: true
    },
    {
      name: "Email Enterprise",
      price: "Custom",
      description: "Advanced email marketing solutions for large businesses",
      features: [
        "Unlimited subscribers",
        "Unlimited campaigns",
        "Advanced automation workflows",
        "Custom integrations",
        "Dedicated account manager",
        "Real-time analytics dashboard"
      ]
    }
  ];

  const results = [
    { metric: "Average Open Rate", value: "32%" },
    { metric: "Click-Through Rate", value: "8.5%" },
    { metric: "ROI Improvement", value: "420%" },
    { metric: "List Growth Rate", value: "25%" }
  ];

  const emailTypes = [
    {
      icon: <Send className="w-6 h-6" />,
      title: "Welcome Series",
      description: "Nurture new subscribers with automated welcome sequences"
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Newsletter Campaigns",
      description: "Regular newsletters to keep your audience engaged"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Promotional Emails",
      description: "Drive sales with targeted promotional campaigns"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Abandoned Cart Recovery",
      description: "Win back customers who left items in their cart"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/10 text-white border-white/20">
              Email Marketing
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Turn Subscribers Into Loyal Customers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Professional email marketing campaigns that drive engagement, build relationships, and boost sales.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Your Email Marketing Audit
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Campaign Examples
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
              Email Marketing That Delivers Results
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our email marketing strategies consistently outperform industry averages and drive real business growth.
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
            <p className="text-muted-foreground mb-4">
              Industry average open rate: 21.33% | Industry average CTR: 2.62%
            </p>
            <Button variant="outline" size="lg">
              See Detailed Campaign Results
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Email Types Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Email Campaigns That Work
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From welcome series to promotional campaigns, we create emails that your subscribers actually want to read.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {emailTypes.map((type, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {type.icon}
                  </div>
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {type.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Complete Email Marketing Services
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From strategy to execution, we handle every aspect of your email marketing campaigns.
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

      {/* Strategy Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                Strategic Email Marketing That Converts
              </h2>
              <p className="text-xl text-muted-foreground">
                Our data-driven approach to email marketing ensures every campaign delivers maximum ROI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-heading font-bold mb-6">
                  Why Email Marketing Works
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Average ROI of $42 for every $1 spent</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>3x more effective than social media for customer acquisition</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Personalized emails generate 6x higher transaction rates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>Email subscribers are 3x more likely to share content</span>
                  </li>
                </ul>

                <Button className="mt-6" size="lg">
                  Start Your Email Strategy
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h4 className="text-xl font-bold mb-4">Our Email Marketing Process</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <span>Audience research & strategy development</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <span>Email design & template creation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <span>List building & segmentation setup</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                    <span>Campaign creation & automation setup</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                    <span>Testing, monitoring & optimization</span>
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
              Email Marketing Packages
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Professional email marketing services that fit your business size and goals.
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
              Ready to Boost Your Email Marketing ROI?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get a free email marketing audit and discover how we can help you turn subscribers into loyal customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="mate-button-accent">
                Get Your Free Email Audit
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

export default EmailMarketing;