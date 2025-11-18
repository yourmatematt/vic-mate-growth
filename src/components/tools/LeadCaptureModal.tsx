import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Loader2, Mail, Download, TrendingUp, Users } from 'lucide-react';

const emailCaptureSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().optional(),
  businessName: z.string().optional(),
});

type EmailCaptureData = z.infer<typeof emailCaptureSchema>;

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmailCaptureData) => Promise<void>;
  toolName: string;
  variant?: 'results' | 'pdf' | 'comparison' | 'action-plan';
  includeOptionalFields?: boolean;
  socialProofCount?: number;
}

const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  toolName,
  variant = 'results',
  includeOptionalFields = false,
  socialProofCount = 2500,
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailCaptureData>({
    resolver: zodResolver(emailCaptureSchema),
  });

  const handleFormSubmit = async (data: EmailCaptureData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    reset();
    onClose();
  };

  const getVariantContent = () => {
    switch (variant) {
      case 'pdf':
        return {
          icon: Download,
          title: 'Download Your Report',
          description: 'Get your detailed analysis as a PDF delivered instantly to your inbox',
          benefits: [
            'Downloadable PDF report',
            'Detailed visualizations',
            'Action plan checklist',
            'Save and share anytime',
          ],
        };
      case 'comparison':
        return {
          icon: TrendingUp,
          title: 'See How You Compare',
          description: 'Get your results plus industry benchmarks and competitor insights',
          benefits: [
            'Full results breakdown',
            'Industry benchmark comparison',
            'Competitor analysis',
            'Personalized recommendations',
          ],
        };
      case 'action-plan':
        return {
          icon: CheckCircle,
          title: 'Get Your Action Plan',
          description: 'Receive a personalized step-by-step strategy based on your results',
          benefits: [
            'Customized action plan',
            'Priority recommendations',
            'Implementation timeline',
            'Expert insights',
          ],
        };
      default: // 'results'
        return {
          icon: Mail,
          title: 'Your Results Are Ready!',
          description: 'Enter your email to receive your detailed analysis',
          benefits: [
            'Complete results breakdown',
            'Detailed visualizations',
            'Personalized insights',
            'Actionable recommendations',
          ],
        };
    }
  };

  const content = getVariantContent();
  const Icon = content.icon;

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Check Your Inbox!</h2>
            <p className="text-muted-foreground mb-6">
              We've sent your {toolName} results to your email. You should receive it within 60 seconds.
            </p>
            <div className="bg-accent-light p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="text-sm space-y-2">
                <li>✓ Check your email for detailed results</li>
                <li>✓ Review your personalized recommendations</li>
                <li>✓ Download your PDF report</li>
                <li>✓ Book a free strategy call if you need help</li>
              </ul>
            </div>
            <Button onClick={handleClose} className="mate-button-primary w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits List */}
          <div className="bg-accent-light p-4 rounded-lg">
            <h3 className="font-semibold mb-3">What you'll get:</h3>
            <ul className="space-y-2">
              {content.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="your@email.com"
                className={errors.email ? 'border-destructive' : ''}
                autoFocus
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {includeOptionalFields && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name (Optional)</Label>
                  <Input
                    {...register('firstName')}
                    id="firstName"
                    placeholder="Your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name (Optional)</Label>
                  <Input
                    {...register('businessName')}
                    id="businessName"
                    placeholder="Your business"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full mate-button-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Email My Results'
              )}
            </Button>

            {/* Trust Signals */}
            <div className="space-y-2 text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-3 h-3" />
                <span>Join {socialProofCount.toLocaleString()}+ Victorian businesses</span>
              </div>
              <p>🔒 Secure • No spam • Unsubscribe anytime</p>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
