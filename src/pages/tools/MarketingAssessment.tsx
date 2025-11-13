import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ToolLayout from '@/components/tools/ToolLayout';
import LeadCaptureModal from '@/components/tools/LeadCaptureModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Globe,
  Search,
  Share2,
  Mail as MailIcon,
  MousePointer,
  TrendingUp,
  AlertTriangle,
  Target
} from 'lucide-react';

interface Question {
  id: string;
  category: 'website' | 'seo' | 'ads' | 'social' | 'email';
  question: string;
  options: { value: number; label: string }[];
}

interface AssessmentResults {
  totalScore: number;
  categoryScores: {
    website: number;
    seo: number;
    ads: number;
    social: number;
    email: number;
  };
  rating: string;
  recommendations: string[];
  priorityActions: string[];
}

const questions: Question[] = [
  // Website (4 questions)
  { id: 'w1', category: 'website', question: 'Does your business have a professional website?', options: [
    { value: 0, label: 'No website' },
    { value: 2, label: 'Basic website (template/DIY)' },
    { value: 4, label: 'Professional custom website' },
    { value: 5, label: 'Professional + regularly updated' }
  ]},
  { id: 'w2', category: 'website', question: 'Is your website mobile-responsive?', options: [
    { value: 0, label: 'Not sure' },
    { value: 1, label: 'Partially responsive' },
    { value: 3, label: 'Fully mobile-optimized' },
    { value: 5, label: 'Mobile-first design' }
  ]},
  { id: 'w3', category: 'website', question: 'How fast does your website load?', options: [
    { value: 0, label: 'Not sure / Slow (>5s)' },
    { value: 2, label: 'Average (3-5s)' },
    { value: 4, label: 'Fast (1-3s)' },
    { value: 5, label: 'Very fast (<1s)' }
  ]},
  { id: 'w4', category: 'website', question: 'Do you have clear calls-to-action (CTAs) on your website?', options: [
    { value: 0, label: 'No CTAs' },
    { value: 2, label: 'Some CTAs' },
    { value: 4, label: 'CTAs on every page' },
    { value: 5, label: 'Optimized CTAs with tracking' }
  ]},

  // SEO (4 questions)
  { id: 's1', category: 'seo', question: 'Do you have a Google My Business listing?', options: [
    { value: 0, label: 'No' },
    { value: 2, label: 'Yes, but incomplete' },
    { value: 4, label: 'Yes, complete with photos' },
    { value: 5, label: 'Optimized + actively managed' }
  ]},
  { id: 's2', category: 'seo', question: 'How many online reviews do you have?', options: [
    { value: 0, label: '0-5 reviews' },
    { value: 2, label: '6-20 reviews' },
    { value: 4, label: '21-50 reviews' },
    { value: 5, label: '50+ reviews (4+ stars)' }
  ]},
  { id: 's3', category: 'seo', question: 'Have you done keyword research for your business?', options: [
    { value: 0, label: 'No' },
    { value: 2, label: 'Basic research' },
    { value: 4, label: 'Comprehensive research' },
    { value: 5, label: 'Regular keyword tracking' }
  ]},
  { id: 's4', category: 'seo', question: 'Is your business listed in online directories?', options: [
    { value: 0, label: 'No / Not sure' },
    { value: 2, label: '1-5 directories' },
    { value: 4, label: '6-15 directories' },
    { value: 5, label: '15+ directories with consistent NAP' }
  ]},

  // Paid Ads (4 questions)
  { id: 'a1', category: 'ads', question: 'Are you currently running any paid advertising?', options: [
    { value: 0, label: 'No' },
    { value: 2, label: 'Tried but stopped' },
    { value: 4, label: 'Yes, actively running' },
    { value: 5, label: 'Multiple channels optimized' }
  ]},
  { id: 'a2', category: 'ads', question: 'Do you track ROI from your advertising?', options: [
    { value: 0, label: 'No tracking' },
    { value: 2, label: 'Basic tracking' },
    { value: 4, label: 'Conversion tracking setup' },
    { value: 5, label: 'Full attribution model' }
  ]},
  { id: 'a3', category: 'ads', question: 'What\'s your monthly ad spend?', options: [
    { value: 0, label: '$0' },
    { value: 2, label: '$1-$500' },
    { value: 4, label: '$501-$2,000' },
    { value: 5, label: '$2,000+' }
  ]},
  { id: 'a4', category: 'ads', question: 'How often do you optimize your ad campaigns?', options: [
    { value: 0, label: 'Never / Not applicable' },
    { value: 2, label: 'Occasionally' },
    { value: 4, label: 'Monthly' },
    { value: 5, label: 'Weekly or more' }
  ]},

  // Social Media (4 questions)
  { id: 'sm1', category: 'social', question: 'How many social media platforms are you active on?', options: [
    { value: 0, label: 'None' },
    { value: 2, label: '1 platform' },
    { value: 4, label: '2-3 platforms' },
    { value: 5, label: '3+ platforms actively managed' }
  ]},
  { id: 'sm2', category: 'social', question: 'How often do you post on social media?', options: [
    { value: 0, label: 'Rarely / Never' },
    { value: 2, label: 'Few times per month' },
    { value: 4, label: 'Weekly' },
    { value: 5, label: '3+ times per week' }
  ]},
  { id: 'sm3', category: 'social', question: 'Do you engage with your social media followers?', options: [
    { value: 0, label: 'No' },
    { value: 2, label: 'Occasionally' },
    { value: 4, label: 'Regularly respond' },
    { value: 5, label: 'Active community management' }
  ]},
  { id: 'sm4', category: 'social', question: 'Do you use social media advertising?', options: [
    { value: 0, label: 'No' },
    { value: 2, label: 'Tried it once' },
    { value: 4, label: 'Regular campaigns' },
    { value: 5, label: 'Advanced targeting + retargeting' }
  ]},

  // Email Marketing (4 questions)
  { id: 'e1', category: 'email', question: 'Do you collect email addresses from customers?', options: [
    { value: 0, label: 'No' },
    { value: 2, label: 'Informally' },
    { value: 4, label: 'Yes, with opt-in forms' },
    { value: 5, label: 'Multiple lead magnets' }
  ]},
  { id: 'e2', category: 'email', question: 'How large is your email list?', options: [
    { value: 0, label: 'No list' },
    { value: 2, label: '1-100 contacts' },
    { value: 4, label: '101-500 contacts' },
    { value: 5, label: '500+ contacts' }
  ]},
  { id: 'e3', category: 'email', question: 'How often do you send emails to your list?', options: [
    { value: 0, label: 'Never' },
    { value: 2, label: 'Rarely / Irregularly' },
    { value: 4, label: 'Monthly' },
    { value: 5, label: 'Weekly or automated' }
  ]},
  { id: 'e4', category: 'email', question: 'Do you use email marketing automation?', options: [
    { value: 0, label: 'No' },
    { value: 2, label: 'Basic welcome email' },
    { value: 4, label: 'Multiple automated sequences' },
    { value: 5, label: 'Advanced segmentation + automation' }
  ]},
];

const answerSchema = z.record(z.number());

const MarketingAssessment = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);

  const questionsPerPage = 5;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(answerSchema),
    defaultValues: questions.reduce((acc, q) => ({ ...acc, [q.id]: undefined }), {}),
  });

  const answers = watch();
  const answeredOnPage = currentQuestions.filter(q => answers[q.id] !== undefined).length;
  const totalAnswered = Object.keys(answers).filter(k => answers[k] !== undefined).length;

  const calculateResults = (data: Record<string, number>): AssessmentResults => {
    const categoryScores = {
      website: 0,
      seo: 0,
      ads: 0,
      social: 0,
      email: 0,
    };

    questions.forEach(q => {
      if (data[q.id] !== undefined) {
        categoryScores[q.category] += data[q.id];
      }
    });

    const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
    const maxScore = questions.length * 5;
    const percentageScore = Math.round((totalScore / maxScore) * 100);

    let rating: string;
    let recommendations: string[] = [];
    let priorityActions: string[] = [];

    if (percentageScore >= 81) {
      rating = 'Marketing Mature';
      recommendations = [
        'Focus on advanced optimization and A/B testing',
        'Explore new marketing channels',
        'Implement marketing automation at scale',
      ];
      priorityActions = ['Optimize conversion rates', 'Scale successful campaigns', 'Test new platforms'];
    } else if (percentageScore >= 61) {
      rating = 'Growing Strong';
      recommendations = [
        'Expand successful channels',
        'Improve tracking and analytics',
        'Increase content production',
      ];
      priorityActions = ['Set up advanced tracking', 'Increase posting frequency', 'Launch retargeting campaigns'];
    } else if (percentageScore >= 41) {
      rating = 'Building Momentum';
      recommendations = [
        'Complete your Google My Business profile',
        'Start consistent social media posting',
        'Set up basic email automation',
      ];
      priorityActions = ['Complete GMB setup', 'Create content calendar', 'Build email list'];
    } else {
      rating = 'Getting Started';
      recommendations = [
        'Create or improve your website',
        'Claim your Google My Business listing',
        'Start building an email list',
      ];
      priorityActions = ['Get a professional website', 'Claim GMB listing', 'Set up email collection'];
    }

    // Add category-specific recommendations
    if (categoryScores.website < 10) priorityActions.unshift('Improve website quality and speed');
    if (categoryScores.seo < 10) priorityActions.unshift('Focus on local SEO basics');
    if (categoryScores.email < 5) recommendations.push('Start email list building immediately');

    return {
      totalScore: percentageScore,
      categoryScores,
      rating,
      recommendations,
      priorityActions: priorityActions.slice(0, 3),
    };
  };

  const handleNext = () => {
    if (currentPage === Math.floor(questions.length / 2 / questionsPerPage) && !emailCaptured) {
      setShowLeadCapture(true);
    } else if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const onSubmit = (data: Record<string, number>) => {
    const calculatedResults = calculateResults(data);
    setResults(calculatedResults);

    // Store results
    const toolResult = {
      tool: 'marketing-assessment',
      timestamp: new Date().toISOString(),
      answers: data,
      results: calculatedResults,
    };

    const existingResults = JSON.parse(localStorage.getItem('toolResults') || '[]');
    existingResults.push(toolResult);
    localStorage.setItem('toolResults', JSON.stringify(existingResults));
  };

  const handleLeadCapture = async (emailData: { email: string; firstName?: string; businessName?: string }) => {
    setEmailCaptured(true);
    console.log('Mid-assessment email captured:', emailData);
    // TODO: Send to backend
  };

  const handleFinalLeadCapture = async (emailData: { email: string }) => {
    console.log('Final results email:', emailData);
    // TODO: Send full report via email
  };

  const categoryIcons = {
    website: Globe,
    seo: Search,
    ads: MousePointer,
    social: Share2,
    email: MailIcon,
  };

  const categoryNames = {
    website: 'Website',
    seo: 'Local SEO',
    ads: 'Paid Ads',
    social: 'Social Media',
    email: 'Email Marketing',
  };

  if (results) {
    return (
      <>
        <Helmet>
          <title>Your Marketing Assessment Results | Your Mate Agency</title>
        </Helmet>

        <ToolLayout
          title="Your Marketing Readiness Results"
          description={`You scored ${results.totalScore}/100 - ${results.rating}`}
          showBackButton={false}
        >
          <div className="space-y-8">
            {/* Overall Score */}
            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary mb-4">
                    {results.totalScore}<span className="text-3xl">/100</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{results.rating}</h2>
                  <Badge variant="secondary" className="text-base px-4 py-1">
                    {results.rating === 'Marketing Mature' && '🎉 Excellent!'}
                    {results.rating === 'Growing Strong' && '👍 Well Done!'}
                    {results.rating === 'Building Momentum' && '📈 Making Progress!'}
                    {results.rating === 'Getting Started' && '🌱 Room to Grow!'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <div>
              <h3 className="text-xl font-bold mb-4">Category Breakdown</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(results.categoryScores).map(([category, score]) => {
                  const Icon = categoryIcons[category as keyof typeof categoryIcons];
                  const maxScore = questions.filter(q => q.category === category).length * 5;
                  const percentage = Math.round((score / maxScore) * 100);

                  return (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <Icon className="w-5 h-5 text-primary" />
                          <CardTitle className="text-sm">{categoryNames[category as keyof typeof categoryNames]}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">
                            {score}/{maxScore}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-blue-500' : percentage >= 25 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{percentage}% complete</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Priority Actions */}
            <Card className="bg-accent-light">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle>Your Top 3 Priority Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  {results.priorityActions.map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-bold text-primary mr-3">{index + 1}.</span>
                      <span className="font-medium">{action}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle>Recommended Next Steps</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Final CTA */}
            <div className="bg-primary/10 p-8 rounded-lg text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Take Action?</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Book a free 15-minute strategy call to create your personalized marketing roadmap
              </p>
              <Button className="mate-button-primary px-8 py-6 text-lg" size="lg">
                Book Your Free Strategy Call
              </Button>
            </div>
          </div>
        </ToolLayout>

        <LeadCaptureModal
          isOpen={showLeadCapture && !emailCaptured}
          onClose={() => setShowLeadCapture(false)}
          onSubmit={handleFinalLeadCapture}
          toolName="Marketing Assessment"
          variant="pdf"
          includeOptionalFields
        />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Marketing Readiness Assessment | Free Marketing Tool | Your Mate Agency</title>
        <meta name="description" content="Take our free 20-question marketing assessment to discover your digital marketing maturity level and get personalized recommendations." />
      </Helmet>

      <ToolLayout
        title="Marketing Readiness Assessment"
        description="Discover your digital marketing maturity level and get a personalized action plan"
        estimatedTime={8}
        currentStep={currentPage + 1}
        totalSteps={totalPages}
        helpText="Answer honestly to get the most accurate assessment. There are no wrong answers—this helps us understand where you are and where you can improve."
      >
        <form className="space-y-8">
          <div className="space-y-6">
            {currentQuestions.map((question, index) => {
              const Icon = categoryIcons[question.category];
              return (
                <Card key={question.id} className={answers[question.id] !== undefined ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <Badge variant="outline">{categoryNames[question.category]}</Badge>
                        </div>
                        <CardTitle className="text-base">
                          {currentPage * questionsPerPage + index + 1}. {question.question}
                        </CardTitle>
                      </div>
                      {answers[question.id] !== undefined && (
                        <CheckCircle className="w-5 h-5 text-green-600 ml-4" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={answers[question.id]?.toString()}
                      onValueChange={(value) => setValue(question.id, parseInt(value))}
                    >
                      <div className="space-y-3">
                        {question.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value.toString()} id={`${question.id}-${option.value}`} />
                            <Label htmlFor={`${question.id}-${option.value}`} className="cursor-pointer flex-1">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Progress Indicator */}
          <div className="bg-accent-light p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">
                {totalAnswered} of {questions.length} questions answered
              </span>
              <span className="text-muted-foreground">
                {Math.round((totalAnswered / questions.length) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(totalAnswered / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentPage === 0}
            >
              ← Back
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={answeredOnPage < currentQuestions.length}
              className="mate-button-primary"
            >
              {currentPage === totalPages - 1 ? 'See My Results' : 'Continue →'}
            </Button>
          </div>
        </form>
      </ToolLayout>

      <LeadCaptureModal
        isOpen={showLeadCapture && !emailCaptured}
        onClose={() => {
          setShowLeadCapture(false);
          setCurrentPage(prev => prev + 1);
        }}
        onSubmit={handleLeadCapture}
        toolName="Marketing Assessment"
        variant="results"
        includeOptionalFields
        socialProofCount={2100}
      />
    </>
  );
};

export default MarketingAssessment;
