import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  estimatedTime?: number; // in minutes
  currentStep?: number;
  totalSteps?: number;
  helpText?: string;
  showBackButton?: boolean;
}

const ToolLayout: React.FC<ToolLayoutProps> = ({
  children,
  title,
  description,
  estimatedTime,
  currentStep,
  totalSteps,
  helpText,
  showBackButton = true,
}) => {
  const progress = currentStep && totalSteps ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          {showBackButton && (
            <Link to="/tools" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Tools
            </Link>
          )}

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
              <p className="text-lg text-muted-foreground">{description}</p>
            </div>

            {helpText && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="ml-4">
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Need Help?</h4>
                    <p className="text-sm text-muted-foreground">{helpText}</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </div>

          {/* Meta info */}
          <div className="flex items-center space-x-4 mt-4">
            {estimatedTime && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-1" />
                <span>{estimatedTime} minute{estimatedTime !== 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-600">Free</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">No signup required</span>
            </div>
          </div>

          {/* Progress Bar */}
          {currentStep && totalSteps && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="font-medium">{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        {/* Main Content */}
        <Card className="p-6 md:p-8">
          {children}
        </Card>

        {/* Trust Signals */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center space-x-4 text-xs text-muted-foreground">
            <span>🔒 Your data is secure</span>
            <span>•</span>
            <span>✓ Trusted by 2,500+ businesses</span>
            <span>•</span>
            <span>⚡ Instant results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolLayout;
