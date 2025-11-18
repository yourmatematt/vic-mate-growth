import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ToolLayout from '@/components/tools/ToolLayout';
import LeadCaptureModal from '@/components/tools/LeadCaptureModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PieChart, DollarSign, Target, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';
import { australianIndustries } from '@/lib/validationSchemas';

const budgetAllocatorSchema = z.object({
  totalBudget: z.number().min(500, 'Minimum budget is $500').max(100000, 'Maximum budget is $100,000'),
  industry: z.string().min(1, 'Please select an industry'),
  primaryGoal: z.string().min(1, 'Please select a primary goal'),
  businessStage: z.string().min(1, 'Please select your business stage'),
  currentChannels: z.array(z.string()).min(1, 'Select at least one current channel'),
});

type BudgetAllocatorFormData = z.infer<typeof budgetAllocatorSchema>;

interface ChannelAllocation {
  channel: string;
  percentage: number;
  amount: number;
  expectedROI: number;
  estimatedLeads: number;
  reasoning: string;
}

interface BudgetResults {
  allocations: ChannelAllocation[];
  totalExpectedROI: number;
  totalEstimatedLeads: number;
  insights: string[];
  warnings: string[];
}

const CHANNELS = [
  { id: 'google-ads', name: 'Google Ads', icon: '🎯' },
  { id: 'facebook-ads', name: 'Facebook & Instagram Ads', icon: '📱' },
  { id: 'seo', name: 'SEO & Content Marketing', icon: '🔍' },
  { id: 'email', name: 'Email Marketing', icon: '📧' },
  { id: 'social-organic', name: 'Organic Social Media', icon: '💬' },
  { id: 'video', name: 'Video Marketing (YouTube)', icon: '🎥' },
];

const PRIMARY_GOALS = [
  'Generate Leads',
  'Increase Brand Awareness',
  'Drive Website Traffic',
  'Boost Sales',
  'Build Email List',
  'Improve Customer Retention',
];

const BUSINESS_STAGES = [
  'Just Starting (0-1 year)',
  'Growing (1-3 years)',
  'Established (3-5 years)',
  'Mature (5+ years)',
];

const BudgetAllocator = () => {
  const [results, setResults] = useState<BudgetResults | null>(null);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [customAllocations, setCustomAllocations] = useState<ChannelAllocation[]>([]);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BudgetAllocatorFormData>({
    resolver: zodResolver(budgetAllocatorSchema),
    defaultValues: {
      totalBudget: 3000,
      industry: '',
      primaryGoal: '',
      businessStage: '',
      currentChannels: [],
    },
  });

  const watchedValues = watch();

  // Calculate AI-recommended allocations
  const calculateAllocations = (data: BudgetAllocatorFormData): BudgetResults => {
    const { totalBudget, primaryGoal, businessStage, industry } = data;

    // Base allocation templates based on goal
    let baseAllocations: { [key: string]: number } = {};

    if (primaryGoal === 'Generate Leads') {
      baseAllocations = {
        'google-ads': 40,
        'facebook-ads': 25,
        'seo': 20,
        'email': 10,
        'social-organic': 5,
        'video': 0,
      };
    } else if (primaryGoal === 'Increase Brand Awareness') {
      baseAllocations = {
        'google-ads': 20,
        'facebook-ads': 30,
        'seo': 15,
        'email': 5,
        'social-organic': 15,
        'video': 15,
      };
    } else if (primaryGoal === 'Drive Website Traffic') {
      baseAllocations = {
        'google-ads': 35,
        'facebook-ads': 20,
        'seo': 30,
        'email': 10,
        'social-organic': 5,
        'video': 0,
      };
    } else if (primaryGoal === 'Boost Sales') {
      baseAllocations = {
        'google-ads': 45,
        'facebook-ads': 25,
        'seo': 10,
        'email': 15,
        'social-organic': 5,
        'video': 0,
      };
    } else if (primaryGoal === 'Build Email List') {
      baseAllocations = {
        'google-ads': 25,
        'facebook-ads': 35,
        'seo': 15,
        'email': 5,
        'social-organic': 10,
        'video': 10,
      };
    } else {
      baseAllocations = {
        'google-ads': 20,
        'facebook-ads': 20,
        'seo': 20,
        'email': 20,
        'social-organic': 10,
        'video': 10,
      };
    }

    // Adjust for business stage
    if (businessStage === 'Just Starting (0-1 year)') {
      // New businesses should focus more on paid ads for quick results
      baseAllocations['google-ads'] = Math.min(baseAllocations['google-ads'] + 10, 50);
      baseAllocations['seo'] = Math.max(baseAllocations['seo'] - 5, 10);
    } else if (businessStage === 'Mature (5+ years)') {
      // Mature businesses should invest more in SEO and retention
      baseAllocations['seo'] = Math.min(baseAllocations['seo'] + 10, 40);
      baseAllocations['email'] = Math.min(baseAllocations['email'] + 5, 20);
      baseAllocations['google-ads'] = Math.max(baseAllocations['google-ads'] - 10, 20);
    }

    // Normalize to 100%
    const total = Object.values(baseAllocations).reduce((sum, val) => sum + val, 0);
    Object.keys(baseAllocations).forEach(key => {
      baseAllocations[key] = Math.round((baseAllocations[key] / total) * 100);
    });

    // Calculate expected metrics per channel
    const allocations: ChannelAllocation[] = CHANNELS
      .filter(channel => baseAllocations[channel.id] > 0)
      .map(channel => {
        const percentage = baseAllocations[channel.id];
        const amount = Math.round((totalBudget * percentage) / 100);

        // Estimate ROI based on channel (industry averages)
        let expectedROI = 200; // 200% default
        let costPerLead = 50;

        switch (channel.id) {
          case 'google-ads':
            expectedROI = 300;
            costPerLead = 40;
            break;
          case 'facebook-ads':
            expectedROI = 250;
            costPerLead = 35;
            break;
          case 'seo':
            expectedROI = 500; // Higher ROI but slower
            costPerLead = 25;
            break;
          case 'email':
            expectedROI = 400;
            costPerLead = 10;
            break;
          case 'social-organic':
            expectedROI = 150;
            costPerLead = 60;
            break;
          case 'video':
            expectedROI = 200;
            costPerLead = 55;
            break;
        }

        const estimatedLeads = Math.round(amount / costPerLead);

        // Generate reasoning
        let reasoning = '';
        if (channel.id === 'google-ads') {
          reasoning = 'High-intent searches drive quality leads with fast results';
        } else if (channel.id === 'facebook-ads') {
          reasoning = 'Visual storytelling and precise targeting for brand building';
        } else if (channel.id === 'seo') {
          reasoning = 'Long-term investment with compounding returns over time';
        } else if (channel.id === 'email') {
          reasoning = 'Nurture existing leads and drive repeat business';
        } else if (channel.id === 'social-organic') {
          reasoning = 'Build community and maintain brand presence';
        } else if (channel.id === 'video') {
          reasoning = 'Engage audiences with educational and entertaining content';
        }

        return {
          channel: channel.name,
          percentage,
          amount,
          expectedROI,
          estimatedLeads,
          reasoning,
        };
      });

    const totalExpectedROI = Math.round(
      allocations.reduce((sum, a) => sum + (a.amount * (a.expectedROI / 100)), 0) / totalBudget * 100
    );

    const totalEstimatedLeads = allocations.reduce((sum, a) => sum + a.estimatedLeads, 0);

    // Generate insights
    const insights = [];
    if (totalBudget < 2000) {
      insights.push('With a smaller budget, focus on 2-3 channels max for better results');
    }
    if (businessStage === 'Just Starting (0-1 year)') {
      insights.push('As a new business, paid ads will deliver faster results than SEO');
    }
    if (primaryGoal === 'Generate Leads' && baseAllocations['google-ads'] >= 30) {
      insights.push('Google Ads is your strongest lead generation channel for local services');
    }
    insights.push(`Your expected blended ROI is ${totalExpectedROI}% across all channels`);

    // Generate warnings
    const warnings = [];
    if (totalBudget < 1000) {
      warnings.push('Monthly budgets under $1,000 may not deliver consistent results across multiple channels');
    }
    if (baseAllocations['seo'] > 30 && businessStage === 'Just Starting (0-1 year)') {
      warnings.push('SEO takes 4-6 months to show results. Consider balancing with paid ads for immediate leads');
    }

    return {
      allocations,
      totalExpectedROI,
      totalEstimatedLeads,
      insights,
      warnings,
    };
  };

  // Calculate results in real-time
  useEffect(() => {
    if (
      watchedValues.totalBudget &&
      watchedValues.industry &&
      watchedValues.primaryGoal &&
      watchedValues.businessStage &&
      watchedValues.currentChannels.length > 0
    ) {
      const calculatedResults = calculateAllocations(watchedValues);
      setResults(calculatedResults);
      setCustomAllocations(calculatedResults.allocations);
      setShowPreview(true);
    }
  }, [watchedValues]);

  const onSubmit = async (data: BudgetAllocatorFormData) => {
    const finalResults = isCustomMode
      ? { ...results!, allocations: customAllocations }
      : results;
    setResults(finalResults);
    setShowLeadCapture(true);
  };

  const handleLeadCapture = async (emailData: { email: string; firstName?: string; businessName?: string }) => {
    const toolResult = {
      tool: 'budget-allocator',
      timestamp: new Date().toISOString(),
      email: emailData.email,
      inputs: watchedValues,
      results: isCustomMode ? { ...results, allocations: customAllocations } : results,
    };

    const existingResults = JSON.parse(localStorage.getItem('toolResults') || '[]');
    existingResults.push(toolResult);
    localStorage.setItem('toolResults', JSON.stringify(existingResults));

    console.log('Budget allocator results submitted:', toolResult);
    // TODO: Send to backend API when ready
  };

  const handleSliderChange = (index: number, newPercentage: number) => {
    const newAllocations = [...customAllocations];
    const oldPercentage = newAllocations[index].percentage;
    const diff = newPercentage - oldPercentage;

    // Update the changed allocation
    newAllocations[index].percentage = newPercentage;
    newAllocations[index].amount = Math.round((watchedValues.totalBudget * newPercentage) / 100);

    // Distribute the difference across other channels proportionally
    const otherChannels = newAllocations.filter((_, i) => i !== index);
    const otherTotal = otherChannels.reduce((sum, a) => sum + a.percentage, 0);

    otherChannels.forEach((allocation, i) => {
      const actualIndex = customAllocations.findIndex(a => a.channel === allocation.channel);
      const proportion = allocation.percentage / otherTotal;
      const adjustment = -diff * proportion;
      newAllocations[actualIndex].percentage = Math.max(0, Math.round(allocation.percentage + adjustment));
      newAllocations[actualIndex].amount = Math.round(
        (watchedValues.totalBudget * newAllocations[actualIndex].percentage) / 100
      );
    });

    // Normalize to ensure total is exactly 100%
    const currentTotal = newAllocations.reduce((sum, a) => sum + a.percentage, 0);
    if (currentTotal !== 100) {
      const adjustment = 100 - currentTotal;
      const largestIndex = newAllocations.reduce((maxIdx, a, i) =>
        a.percentage > newAllocations[maxIdx].percentage ? i : maxIdx, 0
      );
      newAllocations[largestIndex].percentage += adjustment;
      newAllocations[largestIndex].amount = Math.round(
        (watchedValues.totalBudget * newAllocations[largestIndex].percentage) / 100
      );
    }

    setCustomAllocations(newAllocations);
    setIsCustomMode(true);
  };

  const toggleChannelSelection = (channelId: string) => {
    const current = watchedValues.currentChannels || [];
    const newSelection = current.includes(channelId)
      ? current.filter(id => id !== channelId)
      : [...current, channelId];
    setValue('currentChannels', newSelection);
  };

  return (
    <>
      <Helmet>
        <title>Marketing Budget Allocator | Free AI Tool | Your Mate Agency</title>
        <meta
          name="description"
          content="Get AI-powered recommendations on how to split your marketing budget across channels. Free tool for Australian businesses."
        />
      </Helmet>

      <ToolLayout
        title="Marketing Budget Allocator"
        description="Get AI-powered recommendations on how to split your marketing budget for maximum ROI"
        estimatedTime={5}
        helpText="Tell us about your business goals and budget, and we'll recommend the optimal allocation across Google Ads, SEO, social media, and more."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="totalBudget">Total Monthly Marketing Budget ($) *</Label>
                <Input
                  {...register('totalBudget', { valueAsNumber: true })}
                  id="totalBudget"
                  type="number"
                  step="100"
                  placeholder="3000"
                />
                {errors.totalBudget && (
                  <p className="text-sm text-destructive">{errors.totalBudget.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select onValueChange={(value) => setValue('industry', value)}>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label htmlFor="primaryGoal">Primary Marketing Goal *</Label>
                <Select onValueChange={(value) => setValue('primaryGoal', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIMARY_GOALS.map((goal) => (
                      <SelectItem key={goal} value={goal}>
                        {goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.primaryGoal && (
                  <p className="text-sm text-destructive">{errors.primaryGoal.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessStage">Business Stage *</Label>
                <Select onValueChange={(value) => setValue('businessStage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.businessStage && (
                  <p className="text-sm text-destructive">{errors.businessStage.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Current Marketing Channels (select all that apply) *</Label>
              <div className="grid md:grid-cols-3 gap-3">
                {CHANNELS.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => toggleChannelSelection(channel.id)}
                    className={`
                      border rounded-lg p-3 cursor-pointer transition-all
                      ${
                        watchedValues.currentChannels?.includes(channel.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{channel.icon}</span>
                      <span className="text-sm font-medium">{channel.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              {errors.currentChannels && (
                <p className="text-sm text-destructive">{errors.currentChannels.message}</p>
              )}
            </div>
          </div>

          {/* Preview Results */}
          {showPreview && results && (
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Your AI-Powered Budget Allocation</h3>
                <Badge variant="secondary" className="text-sm">
                  {isCustomMode ? 'Custom Mode' : 'AI Recommended'}
                </Badge>
              </div>

              {/* Summary Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Budget
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${watchedValues.totalBudget.toLocaleString()}/mo</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-green-100 text-green-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Expected ROI
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{results.totalExpectedROI}%</div>
                    <p className="text-xs text-muted-foreground mt-1">Blended across channels</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                        <Target className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        Est. Monthly Leads
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{results.totalEstimatedLeads}</div>
                    <p className="text-xs text-muted-foreground mt-1">Based on industry averages</p>
                  </CardContent>
                </Card>
              </div>

              {/* Channel Allocations */}
              <div className="space-y-4">
                <h4 className="font-semibold">Recommended Channel Breakdown</h4>
                {customAllocations.map((allocation, index) => (
                  <Card key={allocation.channel}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{allocation.channel}</h5>
                            <p className="text-sm text-muted-foreground">{allocation.reasoning}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{allocation.percentage}%</p>
                            <p className="text-sm text-muted-foreground">
                              ${allocation.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <Slider
                          value={[allocation.percentage]}
                          onValueChange={(value) => handleSliderChange(index, value[0])}
                          max={100}
                          step={5}
                          className="w-full"
                        />

                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Expected ROI: {allocation.expectedROI}%</span>
                          <span>Est. Leads: {allocation.estimatedLeads}/mo</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Insights */}
              {results.insights.length > 0 && (
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Key Insights:</strong>
                    <ul className="mt-2 space-y-1">
                      {results.insights.map((insight, index) => (
                        <li key={index}>• {insight}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Warnings */}
              {results.warnings.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important Considerations:</strong>
                    <ul className="mt-2 space-y-1">
                      {results.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* CTA to unlock full report */}
              <div className="bg-accent-light p-6 rounded-lg">
                <h4 className="font-semibold mb-3 flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  🔒 Unlock Your Complete Channel Strategy
                </h4>
                <ul className="space-y-2 text-sm mb-4">
                  <li>✓ 12-month budget projection with expected results</li>
                  <li>✓ Detailed implementation timeline for each channel</li>
                  <li>✓ KPI tracking spreadsheet template</li>
                  <li>✓ Monthly optimization recommendations</li>
                  <li>✓ Competitor budget benchmarking for your industry</li>
                </ul>
                <Button type="submit" className="w-full mate-button-primary">
                  Email My Complete Strategy Guide
                </Button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!showPreview && (
            <Button type="submit" className="w-full mate-button-primary" size="lg">
              Generate My Budget Allocation
            </Button>
          )}
        </form>
      </ToolLayout>

      <LeadCaptureModal
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        onSubmit={handleLeadCapture}
        toolName="Marketing Budget Allocator"
        variant="action-plan"
      />
    </>
  );
};

export default BudgetAllocator;
