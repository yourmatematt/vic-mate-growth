import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Users,
  MousePointer,
  ShoppingCart,
  DollarSign,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { mockDashboardStats, mockCampaigns } from '@/lib/mockData';

const Overview = () => {
  const stats = [
    {
      title: 'Total Visitors',
      value: mockDashboardStats.totalVisitors.toLocaleString(),
      change: mockDashboardStats.visitorChange,
      icon: Users,
      trend: 'up',
      description: 'vs. last 30 days'
    },
    {
      title: 'Leads Generated',
      value: mockDashboardStats.totalLeads.toLocaleString(),
      change: mockDashboardStats.leadChange,
      icon: MousePointer,
      trend: 'up',
      description: 'vs. last 30 days'
    },
    {
      title: 'Conversions',
      value: mockDashboardStats.totalConversions.toLocaleString(),
      change: mockDashboardStats.conversionChange,
      icon: ShoppingCart,
      trend: 'up',
      description: 'vs. last 30 days'
    },
    {
      title: 'Revenue Generated',
      value: `$${mockDashboardStats.totalRevenue.toLocaleString()}`,
      change: mockDashboardStats.revenueChange,
      icon: DollarSign,
      trend: 'up',
      description: 'vs. last 30 days'
    }
  ];

  const activeCampaigns = mockCampaigns.filter(c => c.status === 'active');

  const getCampaignProgress = (campaign: typeof mockCampaigns[0]) => {
    return (campaign.spent / campaign.budget) * 100;
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's what's happening with your marketing campaigns.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          const trendColor = stat.trend === 'up' ? 'text-green-600' : 'text-red-600';

          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendIcon className={`h-4 w-4 ${trendColor}`} />
                  <span className={`text-xs font-medium ${trendColor}`}>
                    {stat.change}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active Campaigns */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Your currently running campaigns</CardDescription>
              </div>
              <Link to="/dashboard/campaigns">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCampaigns.slice(0, 3).map((campaign) => (
              <div key={campaign.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getCampaignStatusColor(campaign.status)}`} />
                    <span className="font-medium text-sm">{campaign.name}</span>
                  </div>
                  <Badge variant="secondary">{campaign.type}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}</span>
                    <span>{Math.round(getCampaignProgress(campaign))}%</span>
                  </div>
                  <Progress value={getCampaignProgress(campaign)} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Impressions</p>
                    <p className="font-medium">{campaign.impressions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clicks</p>
                    <p className="font-medium">{campaign.clicks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conversions</p>
                    <p className="font-medium">{campaign.conversions}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/campaigns">
                <Megaphone className="mr-2 h-4 w-4" />
                View Campaign Performance
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/reports">
                <BarChart3 className="mr-2 h-4 w-4" />
                Download Latest Reports
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/invoices">
                <FileText className="mr-2 h-4 w-4" />
                View Invoices & Billing
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/dashboard/support">
                <HelpCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Main Website
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates from your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 pb-4 border-b">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Campaign performance improved</p>
                <p className="text-xs text-muted-foreground">
                  Your Google Ads campaign saw a 15% increase in conversions this week
                </p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 pb-4 border-b">
              <div className="bg-blue-100 p-2 rounded-full">
                <MousePointer className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">New leads generated</p>
                <p className="text-xs text-muted-foreground">
                  12 new leads from your SEO campaign this week
                </p>
                <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Invoice paid</p>
                <p className="text-xs text-muted-foreground">
                  Invoice #INV-2024-002 has been processed
                </p>
                <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Import missing icons at the top
import { Megaphone, BarChart3, FileText, HelpCircle } from 'lucide-react';

export default Overview;
