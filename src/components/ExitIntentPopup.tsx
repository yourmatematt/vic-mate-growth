import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Gift, CheckCircle, Loader2 } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().optional(),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface ExitIntentPopupProps {
  enabled?: boolean;
  delay?: number; // milliseconds before showing after exit intent
  cookieDays?: number; // days to remember user dismissed
}

const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({
  enabled = true,
  delay = 500,
  cookieDays = 7,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  useEffect(() => {
    if (!enabled) return;

    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('exitIntentShown');
    const lastShown = localStorage.getItem('exitIntentDate');

    if (hasSeenPopup && lastShown) {
      const daysSinceShown = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      if (daysSinceShown < cookieDays) {
        return; // Don't show again
      }
    }

    let timeout: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of page (typical exit behavior)
      if (e.clientY <= 0 && !hasShown && !isOpen) {
        timeout = setTimeout(() => {
          setIsOpen(true);
          setHasShown(true);
          localStorage.setItem('exitIntentShown', 'true');
          localStorage.setItem('exitIntentDate', Date.now().toString());
        }, delay);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (timeout) clearTimeout(timeout);
    };
  }, [enabled, delay, cookieDays, hasShown, isOpen]);

  const onSubmit = async (data: EmailFormData) => {
    try {
      // Store in localStorage for now
      const exitIntentLead = {
        type: 'exit-intent',
        timestamp: new Date().toISOString(),
        email: data.email,
        firstName: data.firstName,
        sourcePage: window.location.pathname,
      };

      const existingLeads = JSON.parse(localStorage.getItem('exitIntentLeads') || '[]');
      existingLeads.push(exitIntentLead);
      localStorage.setItem('exitIntentLeads', JSON.stringify(existingLeads));

      console.log('Exit intent lead captured:', exitIntentLead);
      // TODO: Send to backend API when ready

      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting exit intent form:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Set a flag so we don't show again this session
    sessionStorage.setItem('exitIntentDismissed', 'true');
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're In!</h2>
            <p className="text-muted-foreground mb-6">
              Check your email in the next few minutes. We've sent you our exclusive Digital Marketing Toolkit.
            </p>
            <Button onClick={handleClose} className="mate-button-primary">
              Continue Exploring
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
          <div className="flex items-center justify-between mb-4">
            <div className="bg-accent/20 w-12 h-12 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-accent" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogTitle className="text-2xl font-bold">
            Wait! Before You Go...
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-lg mb-4">
              Get our <strong>FREE Digital Marketing Toolkit</strong> delivered to your inbox:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>50 High-Converting Email Subject Lines</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Marketing Budget Calculator Spreadsheet</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>30-Day Social Media Content Calendar</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>SEO Checklist for Local Businesses</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Weekly Marketing Tips from Experts</span>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name (Optional)</Label>
                <Input
                  {...register('firstName')}
                  id="firstName"
                  placeholder="Your first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mate-button-primary"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Send Me The Free Toolkit
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              🔒 We respect your privacy. Unsubscribe anytime. No spam, ever.
            </p>
          </form>

          <div className="text-center pt-4 border-t">
            <button
              onClick={handleClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              No thanks, I'll figure it out myself →
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
