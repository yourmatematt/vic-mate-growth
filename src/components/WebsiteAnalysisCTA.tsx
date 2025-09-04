import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { websiteAnalysisSchema, type WebsiteAnalysisFormData, australianIndustries, businessChallenges, hearAboutUsOptions } from '@/lib/validationSchemas';

interface WebsiteAnalysisCTAProps {
  isOpen: boolean;
  onClose: () => void;
  sourcePage?: string;
}

const WebsiteAnalysisCTA: React.FC<WebsiteAnalysisCTAProps> = ({ 
  isOpen, 
  onClose,
  sourcePage = 'unknown'
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<WebsiteAnalysisFormData>({
    resolver: zodResolver(websiteAnalysisSchema)
  });

  const watchedValues = watch();
  const progress = (currentStep / totalSteps) * 100;

  const onSubmit = async (data: WebsiteAnalysisFormData) => {
    try {
      // Here you would integrate with Supabase
      const submissionData = {
        ...data,
        sourcePage,
        submittedAt: new Date().toISOString()
      };
      
      console.log('Website analysis request:', submissionData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setIsSubmitted(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold mb-4">
              Thanks mate! We've got your details
            </h2>
            <p className="text-muted-foreground mb-6">
              One of our digital marketing experts will analyse your website and get back to you within 24 hours with a detailed report.
            </p>
            <Button onClick={handleClose} className="mate-button-primary">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-heading font-bold">
              Get Your Free Website Analysis
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Step 1: Business Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="text-lg font-semibold mb-4">
                Tell us about your business
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    {...register('firstName')}
                    id="firstName"
                    placeholder="Your first name"
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    {...register('lastName')}
                    id="lastName"
                    placeholder="Your last name"
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  {...register('businessName')}
                  id="businessName"
                  placeholder="Your business name"
                  className={errors.businessName ? 'border-destructive' : ''}
                />
                {errors.businessName && (
                  <p className="text-sm text-destructive">{errors.businessName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  {...register('location')}
                  id="location"
                  placeholder="e.g. Geelong, VIC"
                  className={errors.location ? 'border-destructive' : ''}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Industry *</Label>
                <Select onValueChange={(value) => setValue('industry', value)}>
                  <SelectTrigger className={errors.industry ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {australianIndustries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-destructive">{errors.industry.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Contact & Website */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="text-lg font-semibold mb-4">
                Your contact details & website
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  {...register('email')}
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  {...register('phone')}
                  id="phone"
                  placeholder="0423 456 789"
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  We'll call you to discuss your results
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Current Website URL</Label>
                <Input
                  {...register('websiteUrl')}
                  id="websiteUrl"
                  placeholder="https://www.yourwebsite.com.au (optional)"
                  className={errors.websiteUrl ? 'border-destructive' : ''}
                />
                {errors.websiteUrl && (
                  <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Don't have a website? No worries, we'll help you get one!
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Challenges & Preferences */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in-up">
              <h3 className="text-lg font-semibold mb-4">
                What's your biggest challenge?
              </h3>
              
              <div className="space-y-2">
                <Label>Biggest Digital Marketing Challenge *</Label>
                <Select onValueChange={(value) => setValue('biggestChallenge', value)}>
                  <SelectTrigger className={errors.biggestChallenge ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select your main challenge" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessChallenges.map((challenge) => (
                      <SelectItem key={challenge} value={challenge}>
                        {challenge}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.biggestChallenge && (
                  <p className="text-sm text-destructive">{errors.biggestChallenge.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>How did you hear about us?</Label>
                <Select onValueChange={(value) => setValue('hearAboutUs', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Optional - helps us improve" />
                  </SelectTrigger>
                  <SelectContent>
                    {hearAboutUsOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-accent-light p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What you'll get:</h4>
                <ul className="text-sm space-y-1">
                  <li>✓ Detailed website performance analysis</li>
                  <li>✓ SEO audit and improvement recommendations</li>
                  <li>✓ Competitor analysis</li>
                  <li>✓ Custom marketing strategy outline</li>
                  <li>✓ 15-minute consultation call</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={nextStep}
                className="mate-button-primary flex items-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mate-button-secondary flex items-center space-x-2"
              >
                <span>{isSubmitting ? 'Sending...' : 'Get My Free Analysis'}</span>
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WebsiteAnalysisCTA;