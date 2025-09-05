import React, { useState } from 'react';
import { CheckSquare, Square, ExternalLink, ArrowLeft, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'content' | 'local' | 'mobile';
  priority: 'high' | 'medium' | 'low';
  checked: boolean;
}

const SEOChecklistTool = () => {
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'Page Title Optimization',
      description: 'Check if your page titles are descriptive and under 60 characters',
      category: 'content',
      priority: 'high',
      checked: false
    },
    {
      id: '2', 
      title: 'Meta Description',
      description: 'Ensure meta descriptions are compelling and under 160 characters',
      category: 'content',
      priority: 'high',
      checked: false
    },
    {
      id: '3',
      title: 'Heading Structure (H1, H2, H3)',
      description: 'Check if your headings follow proper hierarchical structure',
      category: 'content',
      priority: 'high',
      checked: false
    },
    {
      id: '4',
      title: 'Page Loading Speed',
      description: 'Ensure your website loads in under 3 seconds',
      category: 'technical',
      priority: 'high',
      checked: false
    },
    {
      id: '5',
      title: 'Mobile Responsiveness',
      description: 'Check if your website works well on mobile devices',
      category: 'mobile',
      priority: 'high',
      checked: false
    },
    {
      id: '6',
      title: 'SSL Certificate',
      description: 'Ensure your website uses HTTPS for security',
      category: 'technical',
      priority: 'high',
      checked: false
    },
    {
      id: '7',
      title: 'Google My Business Profile',
      description: 'Claim and optimize your Google My Business listing',
      category: 'local',
      priority: 'high',
      checked: false
    },
    {
      id: '8',
      title: 'Local Contact Information',
      description: 'Include NAP (Name, Address, Phone) consistently across pages',
      category: 'local',
      priority: 'medium',
      checked: false
    },
    {
      id: '9',
      title: 'Image Alt Text',
      description: 'Add descriptive alt text to all images',
      category: 'content',
      priority: 'medium',
      checked: false
    },
    {
      id: '10',
      title: 'Internal Linking',
      description: 'Link to other relevant pages on your website',
      category: 'content',
      priority: 'medium',
      checked: false
    },
    {
      id: '11',
      title: 'XML Sitemap',
      description: 'Create and submit an XML sitemap to Google',
      category: 'technical',
      priority: 'medium',
      checked: false
    },
    {
      id: '12',
      title: 'Local Keywords',
      description: 'Include location-based keywords in your content',
      category: 'local',
      priority: 'medium',
      checked: false
    }
  ]);

  const handleAnalyze = async () => {
    if (!websiteUrl) return;
    
    setIsAnalyzing(true);
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const toggleItem = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'content': return 'bg-primary/10 text-primary border-primary/20';
      case 'local': return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'mobile': return 'bg-accent/10 text-accent-foreground border-accent/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-accent text-accent-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const completedItems = checklist.filter(item => item.checked).length;
  const totalItems = checklist.length;
  const completionPercentage = Math.round((completedItems / totalItems) * 100);

  if (!showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="mate-card">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 text-primary mb-4 mx-auto">
              <CheckSquare className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl font-bold">SEO Checklist Tool</CardTitle>
            <p className="text-muted-foreground">
              Get a comprehensive SEO checklist tailored for your website. 
              Enter your URL to get started with our free analysis.
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
                  {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                </Button>
              </div>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What you'll get:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Interactive SEO checklist with 12+ key items</li>
                <li>• Priority levels for each optimization</li>
                <li>• Category-based organization</li>
                <li>• Progress tracking as you complete tasks</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categories = ['technical', 'content', 'local', 'mobile'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Progress */}
      <Card className="mate-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">SEO Checklist for {websiteUrl}</h2>
              <p className="text-muted-foreground">Complete these items to improve your search rankings</p>
            </div>
            <Button variant="outline" onClick={() => setShowResults(false)} size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <div className="text-sm font-medium">
              {completedItems}/{totalItems} Complete ({completionPercentage}%)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist by Category */}
      {categories.map(category => {
        const categoryItems = checklist.filter(item => item.category === category);
        const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
        
        return (
          <Card key={category} className="mate-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={getCategoryColor(category)}>
                  {categoryTitle}
                </Badge>
                <span className="text-sm font-normal text-muted-foreground">
                  ({categoryItems.filter(item => item.checked).length}/{categoryItems.length} complete)
                </span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {categoryItems.map((item, index) => (
                <div key={item.id}>
                  <div 
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => toggleItem(item.id)}
                  >
                    <div className="mt-0.5">
                      {item.checked ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </h4>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </div>
                      <p className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {index < categoryItems.length - 1 && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {/* Action Buttons */}
      <Card className="mate-card">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Need Help Implementing These Changes?</h3>
          <p className="text-muted-foreground mb-4">
            Our SEO experts can handle all of these optimizations for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="mate-button-primary">
              Get Professional SEO Help
              <ExternalLink className="ml-2 w-4 h-4" />
            </Button>
            <Button variant="outline">
              Download Checklist PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOChecklistTool;