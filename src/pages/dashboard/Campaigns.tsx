import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockCampaigns } from '@/lib/mockData';
import { TrendingUp, Eye, MousePointer, Target } from 'lucide-react';

const Campaigns = () => {
  const activeCampaigns = mockCampaigns.filter(c => c.status === 'active');
  const completedCampaigns = mockCampaigns.filter(c => c.status === 'completed');
  const allCampaigns = mockCampaigns;

  const getCampaignProgress = (campaign: typeof mockCampaigns[0]) => {
    return (campaign.spent / campaign.budget) * 100;
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'completed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getCTR = (clicks: number, impressions: number) => {
    return ((clicks / impressions) * 100).toFixed(2);
  };

  const getConversionRate = (conversions: number, clicks: number) => {
    return ((conversions / clicks) * 100).toFixed(2);
  };

  const getCPA = (spent: number, conversions: number) => {
    return (spent / conversions).toFixed(2);
  };

  const CampaignCard = ({ campaign }: { campaign: typeof mockCampaigns[0] }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{campaign.name}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={getCampaignStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
              <Badge variant="outline">{campaign.type}</Badge>
            </div>
          </div>
          <Button size="sm" variant="outline">View Details</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Used</span>
            <span className="font-medium">
              ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
            </span>
          </div>
          <Progress value={getCampaignProgress(campaign)} />
          <p className="text-xs text-muted-foreground">
            {Math.round(getCampaignProgress(campaign))}% of budget used
          </p>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span className="text-xs">Impressions</span>
            </div>
            <p className="text-xl font-bold">{campaign.impressions.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <MousePointer className="h-3 w-3" />
              <span className="text-xs">Clicks</span>
            </div>
            <p className="text-xl font-bold">{campaign.clicks.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              CTR: {getCTR(campaign.clicks, campaign.impressions)}%
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Target className="h-3 w-3" />
              <span className="text-xs">Conversions</span>
            </div>
            <p className="text-xl font-bold">{campaign.conversions}</p>
            <p className="text-xs text-muted-foreground">
              Rate: {getConversionRate(campaign.conversions, campaign.clicks)}%
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">Cost Per Action</span>
            </div>
            <p className="text-xl font-bold">${getCPA(campaign.spent, campaign.conversions)}</p>
          </div>
        </div>

        {/* Date Range */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Started: {new Date(campaign.startDate).toLocaleDateString()}
            {campaign.endDate && ` • Ended: ${new Date(campaign.endDate).toLocaleDateString()}`}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all your marketing campaigns
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeCampaigns.length}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Running campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ${activeCampaigns.reduce((sum, c) => sum + c.budget, 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Across active campaigns
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {activeCampaigns.reduce((sum, c) => sum + c.conversions, 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({allCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeCampaigns.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCampaigns.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {allCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {activeCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedCampaigns.length > 0 ? (
            completedCampaigns.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">No completed campaigns</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Campaigns;
