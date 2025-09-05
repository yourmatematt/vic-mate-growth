import React, { useState } from 'react';
import { Zap, Globe, ArrowLeft, Clock, Smartphone, Monitor, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface SpeedResults {
  url: string;
  desktopScore: number;
  mobileScore: number;
  desktopLoadTime: number;
  mobileLoadTime: number;
  recommendations: Array<{
    category: 'critical' | 'important' | 'minor';
    title: string;
    description: string;
    impact: string;
  }>;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    totalBlockingTime: number;
  };
}

const WebsiteSpeedTracker = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SpeedResults | null>(null);

  const handleAnalyze = async () => {
    if (!websiteUrl) return;
    
    setIsAnalyzing(true);
    
    // Simulate speed test analysis
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate mock results based on random but realistic data
    const mockResults: SpeedResults = {
      url: websiteUrl,
      desktopScore: Math.floor(Math.random() * 40) + 60, // 60-100
      mobileScore: Math.floor(Math.random() * 30) + 50, // 50-80 (typically lower)
      desktopLoadTime: Math.random() * 2 + 1.5, // 1.5-3.5 seconds
      mobileLoadTime: Math.random() * 3 + 2.5, // 2.5-5.5 seconds
      recommendations: [
        {
          category: 'critical',
          title: 'Optimize Images',
          description: 'Properly size images and serve them in next-gen formats',
          impact: 'Save 0.8s load time'
        },
        {
          category: 'critical',
          title: 'Eliminate Render-blocking Resources',
          description: 'Remove or defer non-essential CSS and JavaScript',
          impact: 'Save 0.6s load time'
        },
        {
          category: 'important',
          title: 'Enable Text Compression',
          description: 'Use gzip or brotli compression for text-based resources',
          impact: 'Save 0.3s load time'
        },
        {
          category: 'important',
          title: 'Reduce Server Response Time',
          description: 'Optimize your server configuration and hosting',
          impact: 'Save 0.4s load time'
        },
        {
          category: 'minor',
          title: 'Minify CSS and JavaScript',
          description: 'Remove unnecessary characters from code files',
          impact: 'Save 0.1s load time'
        }
      ],
      metrics: {
        firstContentfulPaint: Math.random() * 1.5 + 1.2,
        largestContentfulPaint: Math.random() * 2 + 2.5,
        cumulativeLayoutShift: Math.random() * 0.1 + 0.05,
        totalBlockingTime: Math.random() * 200 + 150
      }
    };
    
    setResults(mockResults);
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-secondary';
    if (score >= 50) return 'text-accent-foreground'; 
    return 'text-destructive';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return { label: 'Good', color: 'bg-secondary text-secondary-foreground' };
    if (score >= 50) return { label: 'Needs Work', color: 'bg-accent text-accent-foreground' };
    return { label: 'Poor', color: 'bg-destructive text-destructive-foreground' };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'critical': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'important': return <AlertTriangle className="w-4 h-4 text-accent-foreground" />;
      case 'minor': return <CheckCircle className="w-4 h-4 text-secondary" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'important': return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'minor': return 'bg-secondary/10 text-secondary border-secondary/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (!showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="mate-card">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-accent/10 text-accent-foreground mb-4 mx-auto">
              <Zap className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">Website Speed Tracker</CardTitle>
            <p className="text-muted-foreground">
              Test your website's loading speed on both desktop and mobile. 
              Get actionable recommendations to improve performance.
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="website-url">Website URL</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="website-url"
                    type="url"
                    placeholder="https://yourwebsite.com.au"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={handleAnalyze}
                  disabled={!websiteUrl || isAnalyzing}
                  className="mate-button-primary px-6"
                >
                  {isAnalyzing ? 'Testing...' : 'Test Speed'}
                </Button>
              </div>
            </div>

            {isAnalyzing && (
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-accent-foreground animate-pulse" />
                  <h4 className="font-semibold">Analyzing your website...</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  This may take a few moments as we test your site's performance on multiple devices.
                </p>
                <Progress value={Math.random() * 100} className="w-full" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">Desktop Testing</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Page load speed analysis</li>
                  <li>• Core Web Vitals assessment</li>
                  <li>• Performance optimization tips</li>
                </ul>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-5 h-5 text-secondary" />
                  <h4 className="font-semibold">Mobile Testing</h4>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Mobile-specific performance</li>
                  <li>• 3G/4G network simulation</li>
                  <li>• Mobile usability insights</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) return null;

  const desktopStatus = getScoreStatus(results.desktopScore);
  const mobileStatus = getScoreStatus(results.mobileScore);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="mate-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Speed Test Results</h2>
              <p className="text-muted-foreground">{results.url}</p>
            </div>
            <Button variant="outline" onClick={() => setShowResults(false)} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Speed Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="mate-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Desktop Performance
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(results.desktopScore)}`}>
                {results.desktopScore}
              </div>
              <Badge className={desktopStatus.color}>
                {desktopStatus.label}
              </Badge>
            </div>
            
            <Progress value={results.desktopScore} className="w-full" />
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Load Time</span>
              </div>
              <span className="font-medium">{results.desktopLoadTime.toFixed(1)}s</span>
            </div>
          </CardContent>
        </Card>

        <Card className="mate-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-secondary" />
              Mobile Performance
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(results.mobileScore)}`}>
                {results.mobileScore}
              </div>
              <Badge className={mobileStatus.color}>
                {mobileStatus.label}
              </Badge>
            </div>
            
            <Progress value={results.mobileScore} className="w-full" />
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Load Time</span>
              </div>
              <span className="font-medium">{results.mobileLoadTime.toFixed(1)}s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <Card className="mate-card">
        <CardHeader>
          <CardTitle>Core Web Vitals</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">First Contentful Paint</h4>
              <div className="text-2xl font-bold text-primary">{results.metrics.firstContentfulPaint.toFixed(1)}s</div>
              <p className="text-xs text-muted-foreground">Time to first text/image</p>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Largest Contentful Paint</h4>
              <div className="text-2xl font-bold text-secondary">{results.metrics.largestContentfulPaint.toFixed(1)}s</div>
              <p className="text-xs text-muted-foreground">Main content load time</p>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Cumulative Layout Shift</h4>
              <div className="text-2xl font-bold text-accent-foreground">{results.metrics.cumulativeLayoutShift.toFixed(3)}</div>
              <p className="text-xs text-muted-foreground">Visual stability score</p>
            </div>
            
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-sm mb-1">Total Blocking Time</h4>
              <div className="text-2xl font-bold text-destructive">{Math.round(results.metrics.totalBlockingTime)}ms</div>
              <p className="text-xs text-muted-foreground">Main thread blocking</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="mate-card">
        <CardHeader>
          <CardTitle>Optimization Recommendations</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {results.recommendations.map((rec, index) => (
            <div key={index}>
              <div className="flex items-start gap-3 p-4 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="mt-0.5">
                  {getCategoryIcon(rec.category)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge className={getCategoryColor(rec.category)}>
                      {rec.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <p className="text-sm font-medium text-primary">
                    Potential improvement: {rec.impact}
                  </p>
                </div>
              </div>
              
              {index < results.recommendations.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Section */}
      <Card className="mate-card">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Need Help Optimizing Your Website Speed?</h3>
          <p className="text-muted-foreground mb-4">
            Our web development team can implement these optimizations to improve your site's performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="mate-button-primary">
              Get Professional Speed Optimization
            </Button>
            <Button variant="outline">
              Download Speed Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteSpeedTracker;