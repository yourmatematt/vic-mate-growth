import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Support = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Message sent!',
      description: 'Our team will get back to you within 24 hours.',
    });

    setIsSubmitting(false);
  };

  const faqs = [
    {
      question: 'How do I view my campaign performance?',
      answer: 'Navigate to the Campaigns page from the sidebar to view detailed performance metrics for all your active campaigns including impressions, clicks, conversions, and budget usage.'
    },
    {
      question: 'When will I be billed?',
      answer: 'Billing occurs on the first of each month. You can view all invoices and payment history on the Invoices page. We accept credit cards and direct debit.'
    },
    {
      question: 'How can I update my marketing goals?',
      answer: 'Contact your dedicated account manager through this support page or call us directly. We\'ll schedule a consultation to review and adjust your marketing strategy.'
    },
    {
      question: 'What reports are available?',
      answer: 'We provide comprehensive reports including visitor analytics, lead generation metrics, conversion tracking, and ROI analysis. All reports can be downloaded as PDFs from the Reports page.'
    },
    {
      question: 'How do I pause a campaign?',
      answer: 'While campaign management is handled by our team, you can request campaign changes through this support page or by contacting your account manager directly.'
    },
    {
      question: 'Can I add additional services?',
      answer: 'Absolutely! Contact us through this form or call us to discuss adding services like social media management, content creation, or additional ad campaigns.'
    }
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone Support',
      description: '1300 YOUR MATE',
      details: 'Mon-Fri, 9am-5pm AEST',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@yourmate.agency',
      details: 'Response within 24 hours',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our team',
      details: 'Available during business hours',
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support & Help</h1>
        <p className="text-muted-foreground mt-2">
          Get help from our support team or browse FAQs
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid gap-4 md:grid-cols-3">
        {contactMethods.map((method) => {
          const Icon = method.icon;
          return (
            <Card key={method.title}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full ${method.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{method.title}</h3>
                    <p className="text-sm font-medium mt-1">{method.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{method.details}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Support Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send us a Message</CardTitle>
          <CardDescription>
            Fill out the form below and we'll get back to you within 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What can we help you with?"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Please describe your issue or question in detail..."
                className="min-h-[150px]"
                required
              />
            </div>

            <Button
              type="submit"
              className="mate-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Quick answers to common questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Support Tickets</CardTitle>
          <CardDescription>
            Your recent support conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Campaign Performance Question</h4>
                  <Badge variant="outline">Resolved</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Question about Google Ads CTR improvement strategies
                </p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Resolved 2 days ago
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Invoice Payment Confirmation</h4>
                  <Badge variant="outline">Resolved</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Confirmation of payment received for January invoice
                </p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Resolved 1 week ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Helpful Resources</CardTitle>
          <CardDescription>
            Additional resources to help you get the most out of your campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/learn" target="_blank">
                View Learning Resources
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/expertise" target="_blank">
                See Case Studies
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/grow-my-business" target="_blank">
                Explore Our Services
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/about" target="_blank">
                About Your Mate Agency
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
