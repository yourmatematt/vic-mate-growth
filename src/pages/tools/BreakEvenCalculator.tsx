import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ToolLayout from '@/components/tools/ToolLayout';
import LeadCaptureModal from '@/components/tools/LeadCaptureModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, DollarSign, Target, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { australianIndustries } from '@/lib/validationSchemas';

const breakEvenSchema = z.object({
  adSpend: z.number().min(100, 'Minimum ad spend is $100').max(100000, 'Maximum ad spend is $100,000'),
  costPerLead: z.number().min(1, 'Cost per lead must be at least $1').max(1000, 'Maximum cost per lead is $1,000'),
  conversionRate: z.number().min(0.1, 'Conversion rate must be at least 0.1%').max(100, 'Conversion rate cannot exceed 100%'),
  profitPerSale: z.number().min(10, 'Profit per sale must be at least $10').max(100000, 'Maximum profit per sale is $100,000'),
  targetROI: z.number().min(100, 'Target ROI must be at least 100% (break-even)').max(2000, 'Maximum target ROI is 2000%'),
  industry: z.string().min(1, 'Please select an industry'),
});

type BreakEvenFormData = z.infer<typeof breakEvenSchema>;

interface BreakEvenResults {
  leadsNeeded: number;
  customersNeeded: number;
  breakEvenCustomers: number;
  totalRevenue: number;
  totalProfit: number;
  actualROI: number;
  monthsToBreakEven: number;
  recommendedBudget: number;
}

const BreakEvenCalculator = () => {
  const [results, setResults] = useState<BreakEvenResults | null>(null);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BreakEvenFormData>({
    resolver: zodResolver(breakEvenSchema),
    defaultValues: {
      adSpend: 2000,
      costPerLead: 50,
      conversionRate: 20,
      profitPerSale: 500,
      targetROI: 400,
      industry: '',
    },
  });

  const watchedValues = watch();

  // Calculate results in real-time
  useEffect(() => {
    if (watchedValues.adSpend && watchedValues.costPerLead && watchedValues.conversionRate && watchedValues.profitPerSale && watchedValues.targetROI) {
      calculateResults(watchedValues);
    }
  }, [watchedValues]);

  const calculateResults = (data: BreakEvenFormData) => {
    const leadsNeeded = Math.ceil(data.adSpend / data.costPerLead);
    const customersNeeded = Math.ceil(leadsNeeded * (data.conversionRate / 100));
    const breakEvenCustomers = Math.ceil(data.adSpend / data.profitPerSale);
    const totalRevenue = customersNeeded * data.profitPerSale;
    const totalProfit = totalRevenue - data.adSpend;
    const actualROI = ((totalProfit / data.adSpend) * 100);
    const monthsToBreakEven = data.adSpend / (customersNeeded * data.profitPerSale / 12);
    const recommendedBudget = (data.profitPerSale * customersNeeded) / (data.targetROI / 100);

    setResults({
      leadsNeeded,
      customersNeeded,
      breakEvenCustomers,
      totalRevenue,
      totalProfit,
      actualROI,
      monthsToBreakEven: parseFloat(monthsToBreakEven.toFixed(1)),
      recommendedBudget: Math.round(recommendedBudget),
    });

    setShowPreview(true);
  };

  const onSubmit = async (data: BreakEvenFormData) => {
    calculateResults(data);
    setShowLeadCapture(true);
  };

  const handleLeadCapture = async (emailData: { email: string; firstName?: string; businessName?: string }) => {
    // Store results in localStorage for later retrieval
    const toolResult = {
      tool: 'break-even-calculator',
      timestamp: new Date().toISOString(),
      email: emailData.email,
      inputs: watchedValues,
      results: results,
    };

    const existingResults = JSON.parse(localStorage.getItem('toolResults') || '[]');
    existingResults.push(toolResult);
    localStorage.setItem('toolResults', JSON.stringify(existingResults));

    console.log('Break-even calculator results submitted:', toolResult);
    // TODO: Send to backend API when ready
  };

  const ResultCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  return (
    <>
      <Helmet>
        <title>Break-Even Calculator | Free Marketing Tool | Your Mate Agency</title>
        <meta name="description" content="Calculate how many customers you need to make your marketing campaigns profitable. Free break-even calculator for Australian businesses." />
      </Helmet>

      <ToolLayout
        title="Break-Even Calculator"
        description="Find out exactly how many customers you need to make your advertising profitable"
        estimatedTime={3}
        helpText="Enter your marketing budget, expected costs, and profit margins to calculate when your campaigns will break even and become profitable."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="adSpend">Monthly Ad Spend ($) *</Label>
                <Input
                  {...register('adSpend', { valueAsNumber: true })}
                  id="adSpend"
                  type="number"
                  step="100"
                  placeholder="2000"
                />
                {errors.adSpend && (
                  <p className="text-sm text-destructive">{errors.adSpend.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPerLead">Cost Per Lead ($) *</Label>
                <Input
                  {...register('costPerLead', { valueAsNumber: true })}
                  id="costPerLead"
                  type="number"
                  step="1"
                  placeholder="50"
                />
                <p className="text-xs text-muted-foreground">Average: $25-$75 for local services</p>
                {errors.costPerLead && (
                  <p className="text-sm text-destructive">{errors.costPerLead.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversionRate">Lead-to-Customer Rate (%) *</Label>
                <Input
                  {...register('conversionRate', { valueAsNumber: true })}
                  id="conversionRate"
                  type="number"
                  step="0.1"
                  placeholder="20"
                />
                <p className="text-xs text-muted-foreground">Typical range: 15-25% for quality leads</p>
                {errors.conversionRate && (
                  <p className="text-sm text-destructive">{errors.conversionRate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="profitPerSale">Average Profit Per Sale ($) *</Label>
                <Input
                  {...register('profitPerSale', { valueAsNumber: true })}
                  id="profitPerSale"
                  type="number"
                  step="10"
                  placeholder="500"
                />
                {errors.profitPerSale && (
                  <p className="text-sm text-destructive">{errors.profitPerSale.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetROI">Target ROI (%) *</Label>
                <Input
                  {...register('targetROI', { valueAsNumber: true })}
                  id="targetROI"
                  type="number"
                  step="10"
                  placeholder="400"
                />
                <p className="text-xs text-muted-foreground">100% = break-even, 400% = 4x return</p>
                {errors.targetROI && (
                  <p className="text-sm text-destructive">{errors.targetROI.message}</p>
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
            </div>
          </div>

          {/* Preview Results */}
          {showPreview && results && (
            <div className="space-y-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Your Results Preview</h3>
                {results.actualROI >= watchedValues.targetROI ? (
                  <div className="flex items-center text-green-600 font-semibold">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    On Target!
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600 font-semibold">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Below Target
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ResultCard
                  icon={Users}
                  title="Leads Needed"
                  value={results.leadsNeeded.toLocaleString()}
                  subtitle="From your ad spend"
                  color="bg-blue-100 text-blue-600"
                />
                <ResultCard
                  icon={Target}
                  title="Customers Needed"
                  value={results.customersNeeded.toLocaleString()}
                  subtitle={`${watchedValues.conversionRate}% conversion rate`}
                  color="bg-green-100 text-green-600"
                />
                <ResultCard
                  icon={DollarSign}
                  title="Total Profit"
                  value={`$${results.totalProfit.toLocaleString()}`}
                  subtitle="After ad spend"
                  color="bg-purple-100 text-purple-600"
                />
                <ResultCard
                  icon={TrendingUp}
                  title="Actual ROI"
                  value={`${Math.round(results.actualROI)}%`}
                  subtitle={`Target: ${watchedValues.targetROI}%`}
                  color={results.actualROI >= watchedValues.targetROI ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}
                />
              </div>

              {/* Key Insights */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Quick Insight:</strong> You need {results.breakEvenCustomers} customer{results.breakEvenCustomers !== 1 ? 's' : ''} to break even.
                  {results.actualROI < watchedValues.targetROI && (
                    <> To hit your target ROI of {watchedValues.targetROI}%, consider reducing your ad spend to ${results.recommendedBudget.toLocaleString()} or improving your conversion rate.</>
                  )}
                </AlertDescription>
              </Alert>

              <div className="bg-accent-light p-6 rounded-lg">
                <h4 className="font-semibold mb-3">🔒 Unlock Your Complete Analysis</h4>
                <ul className="space-y-2 text-sm mb-4">
                  <li>✓ 12-month profitability projection</li>
                  <li>✓ Industry benchmark comparison</li>
                  <li>✓ Budget optimization recommendations</li>
                  <li>✓ Downloadable PDF report</li>
                </ul>
                <Button type="submit" className="w-full mate-button-primary">
                  Email My Full Report
                </Button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!showPreview && (
            <Button type="submit" className="w-full mate-button-primary" size="lg">
              Calculate Break-Even Point
            </Button>
          )}
        </form>
      </ToolLayout>

      <LeadCaptureModal
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        onSubmit={handleLeadCapture}
        toolName="Break-Even Calculator"
        variant="pdf"
      />
    </>
  );
};

export default BreakEvenCalculator;
