/**
 * Booking Statistics Dashboard Component
 * Displays key booking metrics with trends and filters
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react';
import { BookingStatus } from '@/types/booking';

interface BookingStatistics {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  thisWeekBookings: number;
  thisMonthBookings: number;
  trends: {
    totalChange: number;
    pendingChange: number;
    confirmedChange: number;
    weekChange: number;
  };
}

interface BookingStatsProps {
  statistics: BookingStatistics | null;
  loading?: boolean;
  onFilterClick?: (filter: { status?: BookingStatus; period?: string }) => void;
}

const BookingStats: React.FC<BookingStatsProps> = ({
  statistics,
  loading = false,
  onFilterClick
}) => {
  if (loading || !statistics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatTrend = (change: number) => {
    const isPositive = change > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className={`flex items-center text-xs ${colorClass}`}>
        <TrendIcon className="h-3 w-3 mr-1" />
        {Math.abs(change)}% from last period
      </div>
    );
  };

  const statsCards = [
    {
      title: 'Total Bookings',
      value: statistics.totalBookings,
      icon: Users,
      trend: statistics.trends.totalChange,
      onClick: () => onFilterClick?.({})
    },
    {
      title: 'Pending',
      value: statistics.pendingBookings,
      icon: AlertCircle,
      trend: statistics.trends.pendingChange,
      color: 'text-yellow-600',
      onClick: () => onFilterClick?.({ status: BookingStatus.PENDING })
    },
    {
      title: 'Confirmed',
      value: statistics.confirmedBookings,
      icon: CheckCircle,
      trend: statistics.trends.confirmedChange,
      color: 'text-green-600',
      onClick: () => onFilterClick?.({ status: BookingStatus.CONFIRMED })
    },
    {
      title: 'This Week',
      value: statistics.thisWeekBookings,
      icon: Calendar,
      trend: statistics.trends.weekChange,
      color: 'text-blue-600',
      onClick: () => onFilterClick?.({ period: 'week' })
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => {
        const IconComponent = stat.icon;

        return (
          <Card
            key={index}
            className={`cursor-pointer transition-all hover:shadow-md ${onFilterClick ? 'hover:bg-accent/50' : ''}`}
            onClick={stat.onClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <IconComponent
                className={`h-4 w-4 ${stat.color || 'text-muted-foreground'}`}
              />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {formatTrend(stat.trend)}
                </div>
                {onFilterClick && (
                  <Filter className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default BookingStats;