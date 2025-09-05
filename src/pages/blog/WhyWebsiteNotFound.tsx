import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Eye, Target, TrendingUp, Clock, Users } from 'lucide-react';

const WhyWebsiteNotFound = () => {
  useEffect(() => {
    // Set meta tags
    document.title = "Why Your Website Isn't Getting Found | SEO Tips";
    
    // Create meta description
    const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', 'Discover the top reasons why your website isn\'t showing up in search results and learn actionable SEO strategies to improve your online visibility.');
    document.head.appendChild(metaDescription);

    // Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', 'Why Your Website Isn\'t Getting Found | SEO Guide');
    document.head.appendChild(ogTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', 'Learn why your website isn\'t visible in search results and get expert tips to boost your SEO rankings and drive more organic traffic.');
    document.head.appendChild(ogDescription);

    const ogType = document.querySelector('meta[property="og:type"]') || document.createElement('meta');
    ogType.setAttribute('property', 'og:type');
    ogType.setAttribute('content', 'article');
    document.head.appendChild(ogType);

    // Schema markup for Article
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Why Your Website Isn't Getting Found: The Ultimate SEO Guide",
      "description": "Discover the top reasons why your website isn't showing up in search results and learn actionable SEO strategies to improve your online visibility.",
      "author": {
        "@type": "Organization",
        "name": "Digital Marketing Agency"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Digital Marketing Agency"
      },
      "datePublished": "2024-01-15",
      "dateModified": "2024-01-15"
    };

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.textContent = JSON.stringify(schema);
    document.head.appendChild(schemaScript);

    return () => {
      // Cleanup function would remove added elements if needed
    };
  }, []);

  const reasons = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Poor Keyword Optimization",
      description: "Your website content doesn't target the right keywords that your potential customers are searching for."
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Technical SEO Issues",
      description: "Slow loading speeds, mobile unfriendly design, or crawling errors prevent search engines from properly indexing your site."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Weak Content Strategy",
      description: "Thin, duplicate, or irrelevant content that doesn't provide value to users or answer their questions."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Lack of Local SEO",
      description: "Missing Google Business Profile optimization and local citations for location-based searches."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Inconsistent Publishing",
      description: "Infrequent content updates signal to search engines that your website may not be actively maintained."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Poor User Experience",
      description: "High bounce rates and low engagement metrics tell search engines your site doesn't satisfy user intent."
    }
  ];

  const solutions = [
    {
      step: "1",
      title: "Conduct Keyword Research",
      description: "Identify high-value keywords your target audience uses and optimize your content around them."
    },
    {
      step: "2",
      title: "Fix Technical Issues",
      description: "Improve site speed, mobile responsiveness, and ensure proper crawling and indexing."
    },
    {
      step: "3",
      title: "Create Quality Content",
      description: "Develop comprehensive, valuable content that addresses your audience's pain points and questions."
    },
    {
      step: "4",
      title: "Optimize for Local Search",
      description: "Claim and optimize your Google Business Profile, build local citations, and gather reviews."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Your Website Isn't Getting Found
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover the hidden reasons your website remains invisible in search results and learn proven strategies to dramatically improve your online visibility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/grow-my-business/seo-local-search">
                <Button size="lg" className="w-full sm:w-auto">
                  Get SEO Help Now
                </Button>
              </Link>
              <Link to="/learn">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  More SEO Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">The Hidden Problem Costing You Customers</h2>
          <p className="text-lg text-muted-foreground mb-6">
            You've invested time and money into creating a beautiful website, but there's one major problem: nobody can find it. 
            You're not alone—over 90% of websites receive zero organic search traffic. The good news? This problem is entirely fixable.
          </p>
          <p className="text-lg text-muted-foreground mb-6">
            Search engines drive 53% of all website traffic, making SEO the most cost-effective way to attract new customers. 
            When your website isn't showing up in search results, you're essentially invisible to potential customers actively looking for your services.
          </p>
        </section>

        {/* Main Reasons */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8">6 Critical Reasons Your Website Stays Hidden</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {reasons.map((reason, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-primary">
                      {reason.icon}
                    </div>
                    <CardTitle className="text-xl">{reason.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{reason.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="mb-12 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">The Cost of Being Invisible</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">75%</div>
              <p className="text-muted-foreground">of users never scroll past the first page of search results</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">10X</div>
              <p className="text-muted-foreground">more traffic for first position vs. tenth position</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">$2.75</div>
              <p className="text-muted-foreground">average revenue per organic search visitor</p>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8">4-Step Action Plan to Get Found</h2>
          <div className="space-y-8">
            {solutions.map((solution, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                  {solution.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{solution.title}</h3>
                  <p className="text-muted-foreground">{solution.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical SEO Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">Technical SEO: The Foundation of Visibility</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Before search engines can rank your website, they need to find and understand it. Technical SEO ensures your site is crawlable, 
            fast, and user-friendly across all devices.
          </p>
          <div className="bg-card border rounded-lg p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">Essential Technical Fixes:</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Site Speed:</strong> Aim for loading times under 3 seconds</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Mobile Optimization:</strong> Ensure responsive design for all screen sizes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>SSL Certificate:</strong> Secure your site with HTTPS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>XML Sitemap:</strong> Help search engines discover all your pages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Meta Tags:</strong> Optimize title tags and meta descriptions</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Content Strategy Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">Content That Converts Visitors into Customers</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Quality content is what separates successful websites from invisible ones. Your content should answer questions, 
            solve problems, and guide visitors toward taking action.
          </p>
          <p className="text-lg text-muted-foreground mb-6">
            Focus on creating comprehensive, valuable content that demonstrates your expertise. Search engines reward websites 
            that provide genuine value to users with higher rankings and more visibility.
          </p>
        </section>

        {/* Local SEO Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">Local SEO: Dominate Your Geographic Market</h2>
          <p className="text-lg text-muted-foreground mb-6">
            For businesses serving local customers, local SEO is critical. 46% of all Google searches have local intent, 
            meaning people are looking for businesses "near me."
          </p>
          <p className="text-lg text-muted-foreground mb-6">
            Optimizing for local search involves claiming your Google Business Profile, building local citations, 
            gathering customer reviews, and creating location-specific content.
          </p>
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-6">
            <p className="text-secondary font-semibold">
              💡 Pro Tip: Businesses that appear in the local "map pack" receive 44% of clicks for local searches.
            </p>
          </div>
        </section>
      </article>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-6">
            Ready to Get Your Website Found?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Don't let your website remain invisible. Get a comprehensive SEO audit and custom strategy 
            to start attracting more customers today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/grow-my-business/seo-local-search">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get Your Free SEO Audit
              </Button>
            </Link>
            <Link to="/grow-my-business/website-design-development">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white/20 hover:bg-white/20">
                Improve Your Website
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Continue Learning
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link to="/grow-my-business/seo-local-search" className="hover:text-primary">
                    Complete SEO Services
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get professional SEO help to boost your rankings and drive more organic traffic.
                </p>
                <Link to="/grow-my-business/seo-local-search">
                  <Button variant="outline" size="sm">Learn More</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link to="/grow-my-business/content-creation" className="hover:text-primary">
                    Content Creation
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Professional content that engages your audience and improves search rankings.
                </p>
                <Link to="/grow-my-business/content-creation">
                  <Button variant="outline" size="sm">Learn More</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  <Link to="/learn" className="hover:text-primary">
                    Free SEO Tools
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Use our free SEO checklist and website analysis tools to audit your site.
                </p>
                <Link to="/learn">
                  <Button variant="outline" size="sm">Try Tools</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyWebsiteNotFound;