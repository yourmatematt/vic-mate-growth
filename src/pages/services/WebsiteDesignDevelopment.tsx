import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Smartphone, 
  Zap, 
  Shield, 
  Search, 
  Users,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const WebsiteDesignDevelopment = () => {
  const features = [
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "Responsive Design",
      description: "Perfect display across all devices and screen sizes"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Loading",
      description: "Optimized for speed and performance"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Built with security best practices"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "SEO Optimized",
      description: "Built for search engine visibility"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile First",
      description: "Designed with mobile users in mind"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "User Focused",
      description: "Intuitive user experience design"
    }
  ];

  const packages = [
    {
      name: "Starter Website",
      price: "$2,999",
      description: "Perfect for small businesses getting started online",
      features: [
        "5-page responsive website",
        "Mobile-optimized design",
        "Basic SEO setup",
        "Contact form integration",
        "1 month support"
      ]
    },
    {
      name: "Professional Website",
      price: "$4,999",
      description: "Comprehensive solution for growing businesses",
      features: [
        "10-page responsive website",
        "Custom design & branding",
        "Advanced SEO optimization",
        "E-commerce integration",
        "Analytics setup",
        "3 months support"
      ],
      popular: true
    },
    {
      name: "Enterprise Solution",
      price: "Custom",
      description: "Tailored solutions for large organizations",
      features: [
        "Unlimited pages",
        "Custom functionality",
        "Advanced integrations",
        "Performance optimization",
        "Ongoing maintenance",
        "Priority support"
      ]
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="mb-6 bg-white/10 text-white border-white/20">
              Website Design & Development
            </Badge>
            <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">
              Beautiful Websites That Drive Results
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Custom-designed websites that convert visitors into customers and grow your business online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Get Your Free Website Quote
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                View Our Portfolio
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Why Choose Our Web Development Services?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We create websites that not only look amazing but also perform exceptionally well for your business goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Website Development Packages
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose the perfect package for your business needs and budget.
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
              Ready to Build Your Dream Website?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Let's discuss your project and create a website that drives real results for your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="mate-button-accent">
                Start Your Project Today
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

export default WebsiteDesignDevelopment;