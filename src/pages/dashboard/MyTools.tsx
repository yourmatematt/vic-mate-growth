import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calculator,
  Mail,
  CheckSquare,
  Download,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Calendar,
  PieChart
} from 'lucide-react';

interface ToolResult {
  tool: string;
  timestamp: string;
  email?: string;
  inputs?: any;
  results?: any;
  answers?: any;
}

const MyTools = () => {
  const [toolResults, setToolResults] = useState<ToolResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tool results from localStorage
    const results = JSON.parse(localStorage.getItem('toolResults') || '[]');
    setToolResults(results);
    setLoading(false);
  }, []);

  const toolNames: Record<string, string> = {
    'break-even-calculator': 'Break-Even Calculator',
    'subject-line-scorer': 'Email Subject Line Scorer',
    'marketing-assessment': 'Marketing Readiness Assessment',
    'budget-allocator': 'Marketing Budget Allocator',
    'roi-calculator': 'ROI Calculator',
    'seo-checklist': 'SEO Checklist',
    'website-speed': 'Website Speed Tracker',
  };

  const toolIcons: Record<string, any> = {
    'break-even-calculator': Calculator,
    'subject-line-scorer': Mail,
    'marketing-assessment': CheckSquare,
    'budget-allocator': PieChart,
    'roi-calculator': TrendingUp,
    'seo-checklist': CheckSquare,
    'website-speed': TrendingUp,
  };

  const toolPaths: Record<string, string> = {
    'break-even-calculator': '/tools/break-even-calculator',
    'subject-line-scorer': '/tools/subject-line-scorer',
    'marketing-assessment': '/tools/marketing-assessment',
    'budget-allocator': '/tools/budget-allocator',
    'roi-calculator': '/tools/roi-calculator',
    'seo-checklist': '/learn#seo-checklist',
    'website-speed': '/learn#website-speed',
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupByTool = (results: ToolResult[]) => {
    const grouped: Record<string, ToolResult[]> = {};
    results.forEach((result) => {
      if (!grouped[result.tool]) {
        grouped[result.tool] = [];
      }
      grouped[result.tool].push(result);
    });
    return grouped;
  };

  const groupedResults = groupByTool(toolResults);

  const exportResults = (result: ToolResult) => {
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.tool}-${new Date(result.timestamp).getTime()}.json`;
    link.click();
  };

  const clearAllResults = () => {
    if (confirm('Are you sure you want to clear all tool history? This cannot be undone.')) {
      localStorage.removeItem('toolResults');
      setToolResults([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (toolResults.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tools</h1>
          <p className="text-muted-foreground mt-2">
            Your tool usage history and saved results
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calculator className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tool Results Yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md">
              Start using our free marketing tools to calculate ROI, assess your marketing readiness, and more. Your results will appear here.
            </p>
            <Link to="/tools">
              <Button className="mate-button-primary">
                Browse Free Tools
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Tools</h1>
          <p className="text-muted-foreground mt-2">
            {toolResults.length} tool result{toolResults.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <div className="flex space-x-2">
          <Link to="/tools">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Browse All Tools
            </Button>
          </Link>
          <Button variant="outline" onClick={clearAllResults}>
            Clear History
          </Button>
        </div>
      </div>

      {/* Tools Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All Results ({toolResults.length})
          </TabsTrigger>
          {Object.keys(groupedResults).map((toolKey) => (
            <TabsTrigger key={toolKey} value={toolKey}>
              {toolNames[toolKey] || toolKey} ({groupedResults[toolKey].length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {toolResults
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((result, index) => {
              const Icon = toolIcons[result.tool] || Calculator;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {toolNames[result.tool] || result.tool}
                          </CardTitle>
                          <CardDescription className="flex items-center mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(result.timestamp)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportResults(result)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </Button>
                        {toolPaths[result.tool] && (
                          <Link to={toolPaths[result.tool]}>
                            <Button variant="outline" size="sm">
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Run Again
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Show specific results based on tool type */}
                    {result.tool === 'break-even-calculator' && result.results && (
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Leads Needed</p>
                          <p className="text-xl font-bold">{result.results.leadsNeeded}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Customers Needed</p>
                          <p className="text-xl font-bold">{result.results.customersNeeded}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Profit</p>
                          <p className="text-xl font-bold">${result.results.totalProfit?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Actual ROI</p>
                          <p className="text-xl font-bold">{Math.round(result.results.actualROI)}%</p>
                        </div>
                      </div>
                    )}

                    {result.tool === 'subject-line-scorer' && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Subject Line</p>
                        <p className="text-base font-medium mb-2">"{result.subjectLine}"</p>
                        <Badge variant="secondary">
                          Score: {result.score}/100
                        </Badge>
                      </div>
                    )}

                    {result.tool === 'marketing-assessment' && result.results && (
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Overall Score</p>
                          <p className="text-2xl font-bold">{result.results.totalScore}/100</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Rating</p>
                          <Badge variant="secondary" className="text-base">
                            {result.results.rating}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Priority Actions</p>
                          <p className="text-base">{result.results.priorityActions?.length || 0} recommended</p>
                        </div>
                      </div>
                    )}

                    {result.tool === 'budget-allocator' && result.results && (
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Budget</p>
                          <p className="text-2xl font-bold">${result.inputs?.totalBudget?.toLocaleString()}/mo</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Expected ROI</p>
                          <p className="text-2xl font-bold">{result.results.totalExpectedROI}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Est. Monthly Leads</p>
                          <p className="text-2xl font-bold">{result.results.totalEstimatedLeads}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>

        {/* Individual tool tabs */}
        {Object.keys(groupedResults).map((toolKey) => (
          <TabsContent key={toolKey} value={toolKey} className="space-y-4 mt-6">
            {groupedResults[toolKey]
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((result, index) => {
                const Icon = toolIcons[result.tool] || Calculator;
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {toolNames[result.tool] || result.tool}
                            </CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(result.timestamp)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportResults(result)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                          {toolPaths[result.tool] && (
                            <Link to={toolPaths[result.tool]}>
                              <Button variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Run Again
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Same result display as above */}
                      {result.tool === 'break-even-calculator' && result.results && (
                        <div className="grid md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Leads Needed</p>
                            <p className="text-xl font-bold">{result.results.leadsNeeded}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Customers Needed</p>
                            <p className="text-xl font-bold">{result.results.customersNeeded}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Profit</p>
                            <p className="text-xl font-bold">${result.results.totalProfit?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Actual ROI</p>
                            <p className="text-xl font-bold">{Math.round(result.results.actualROI)}%</p>
                          </div>
                        </div>
                      )}

                      {result.tool === 'subject-line-scorer' && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Subject Line</p>
                          <p className="text-base font-medium mb-2">"{result.subjectLine}"</p>
                          <Badge variant="secondary">
                            Score: {result.score}/100
                          </Badge>
                        </div>
                      )}

                      {result.tool === 'marketing-assessment' && result.results && (
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Overall Score</p>
                            <p className="text-2xl font-bold">{result.results.totalScore}/100</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Rating</p>
                            <Badge variant="secondary" className="text-base">
                              {result.results.rating}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Priority Actions</p>
                            <p className="text-base">{result.results.priorityActions?.length || 0} recommended</p>
                          </div>
                        </div>
                      )}

                      {result.tool === 'budget-allocator' && result.results && (
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Budget</p>
                            <p className="text-2xl font-bold">${result.inputs?.totalBudget?.toLocaleString()}/mo</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Expected ROI</p>
                            <p className="text-2xl font-bold">{result.results.totalExpectedROI}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Est. Monthly Leads</p>
                            <p className="text-2xl font-bold">{result.results.totalEstimatedLeads}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default MyTools;
