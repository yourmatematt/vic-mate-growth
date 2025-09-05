import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, ArrowLeft, Target, Users, MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface CalculatorInputs {
  monthlyAdSpend: number;
  averageOrderValue: number;
  conversionRate: number;
  profitMargin: number;
  campaignDuration: number;
}

interface CalculatorResults {
  monthlyVisitors: number;
  monthlyConversions: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  roi: number;
  roas: number;
  costPerAcquisition: number;
}

const ROICalculator = () => {
  const [showCalculator, setShowCalculator] = useState(false);
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthlyAdSpend: 1000,
    averageOrderValue: 150,
    conversionRate: 2.5,
    profitMargin: 30,
    campaignDuration: 6
  });

  const [results, setResults] = useState<CalculatorResults | null>(null);

  const calculateROI = () => {
    // Estimate monthly visitors based on ad spend (rough industry average)
    const estimatedCostPerClick = 2.50; // Average CPC in Australia
    const monthlyClicks = inputs.monthlyAdSpend / estimatedCostPerClick;
    const monthlyVisitors = monthlyClicks;

    // Calculate conversions and revenue
    const monthlyConversions = (monthlyVisitors * inputs.conversionRate) / 100;
    const monthlyRevenue = monthlyConversions * inputs.averageOrderValue;
    const monthlyProfit = monthlyRevenue * (inputs.profitMargin / 100);

    // Calculate totals
    const totalCost = inputs.monthlyAdSpend * inputs.campaignDuration;
    const totalRevenue = monthlyRevenue * inputs.campaignDuration;
    const totalProfit = monthlyProfit * inputs.campaignDuration;

    // Calculate key metrics
    const roi = ((totalRevenue - totalCost) / totalCost) * 100;
    const roas = totalRevenue / totalCost;
    const costPerAcquisition = inputs.monthlyAdSpend / monthlyConversions;

    return {
      monthlyVisitors: Math.round(monthlyVisitors),
      monthlyConversions: Math.round(monthlyConversions * 10) / 10,
      monthlyRevenue: Math.round(monthlyRevenue),
      monthlyProfit: Math.round(monthlyProfit),
      totalCost: Math.round(totalCost),
      totalRevenue: Math.round(totalRevenue),
      totalProfit: Math.round(totalProfit),
      roi: Math.round(roi * 10) / 10,
      roas: Math.round(roas * 100) / 100,
      costPerAcquisition: Math.round(costPerAcquisition)
    };
  };

  useEffect(() => {
    setResults(calculateROI());
  }, [inputs]);

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setInputs(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getROIStatus = (roi: number) => {
    if (roi >= 300) return { label: 'Excellent', color: 'bg-secondary text-secondary-foreground' };
    if (roi >= 200) return { label: 'Good', color: 'bg-primary text-primary-foreground' };
    if (roi >= 100) return { label: 'Fair', color: 'bg-accent text-accent-foreground' };
    return { label: 'Poor', color: 'bg-destructive text-destructive-foreground' };
  };

  if (!showCalculator) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="mate-card">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-secondary/10 text-secondary mb-4 mx-auto">
              <Calculator className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Digital Marketing ROI Calculator</CardTitle>
            <p className="text-muted-foreground">
              Calculate your potential return on investment for digital marketing campaigns. 
              Get realistic projections based on your budget and goals.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">What it calculates:</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Return on Investment (ROI)</li>
                  <li>• Return on Ad Spend (ROAS)</li>
                  <li>• Cost Per Acquisition</li>
                  <li>• Projected revenue & profit</li>
                </ul>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  <h4 className="font-semibold">Perfect for:</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Google Ads campaigns</li>
                  <li>• Facebook & Instagram ads</li>
                  <li>• SEO investment planning</li>
                  <li>• Marketing budget allocation</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={() => setShowCalculator(true)}
              className="w-full mate-button-secondary text-lg py-6"
            >
              Start Calculating ROI
              <Calculator className="ml-2 w-5 h-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roiStatus = results ? getROIStatus(results.roi) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="mate-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Digital Marketing ROI Calculator</h2>
              <p className="text-muted-foreground">Adjust the inputs below to see your projected returns</p>
            </div>
            <Button variant="outline" onClick={() => setShowCalculator(false)} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="mate-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Campaign Inputs
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="monthlyAdSpend">Monthly Ad Spend (AUD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="monthlyAdSpend"
                  type="number"
                  value={inputs.monthlyAdSpend}
                  onChange={(e) => handleInputChange('monthlyAdSpend', e.target.value)}
                  className="pl-10"
                  placeholder="1000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageOrderValue">Average Order Value (AUD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="averageOrderValue"
                  type="number"
                  value={inputs.averageOrderValue}
                  onChange={(e) => handleInputChange('averageOrderValue', e.target.value)}
                  className="pl-10"
                  placeholder="150"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conversionRate">Conversion Rate (%)</Label>
              <div className="relative">
                <MousePointer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="conversionRate"
                  type="number"
                  step="0.1"
                  value={inputs.conversionRate}
                  onChange={(e) => handleInputChange('conversionRate', e.target.value)}
                  className="pl-10"
                  placeholder="2.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profitMargin">Profit Margin (%)</Label>
              <div className="relative">
                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="profitMargin"
                  type="number"
                  value={inputs.profitMargin}
                  onChange={(e) => handleInputChange('profitMargin', e.target.value)}
                  className="pl-10"
                  placeholder="30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaignDuration">Campaign Duration (months)</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="campaignDuration"
                  type="number"
                  value={inputs.campaignDuration}
                  onChange={(e) => handleInputChange('campaignDuration', e.target.value)}
                  className="pl-10"
                  placeholder="6"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Key Metrics */}
          <Card className="mate-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {results && (
                <>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Return on Investment</p>
                      <p className="text-2xl font-bold">{results.roi}%</p>
                    </div>
                    <Badge className={roiStatus?.color}>
                      {roiStatus?.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">ROAS</p>
                      <p className="text-xl font-bold">{results.roas}:1</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">Cost Per Sale</p>
                      <p className="text-xl font-bold">{formatCurrency(results.costPerAcquisition)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Monthly Projections */}
          <Card className="mate-card">
            <CardHeader>
              <CardTitle>Monthly Projections</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {results && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Visitors</span>
                    <span className="font-medium">{results.monthlyVisitors.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Conversions</span>
                    <span className="font-medium">{results.monthlyConversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue</span>
                    <span className="font-medium text-secondary">{formatCurrency(results.monthlyRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit</span>
                    <span className="font-medium text-primary">{formatCurrency(results.monthlyProfit)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total Campaign Results */}
          <Card className="mate-card">
            <CardHeader>
              <CardTitle>Total Campaign Results</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {results && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Investment</span>
                    <span className="font-medium">{formatCurrency(results.totalCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-medium text-secondary">{formatCurrency(results.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Profit</span>
                    <span className="text-primary">{formatCurrency(results.totalProfit)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Section */}
      <Card className="mate-card">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Ready to Achieve These Results?</h3>
          <p className="text-muted-foreground mb-4">
            Our digital marketing experts can help you reach these ROI targets with proven strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="mate-button-primary">
              Get Free Strategy Session
            </Button>
            <Button variant="outline">
              Download ROI Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ROICalculator;