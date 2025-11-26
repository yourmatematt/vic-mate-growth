import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, getRelativeTime } from '@/lib/case-study-utils';
import { CaseStudy, CaseStudyStatus } from '@/types/case-studies';
import AdminLayout from '@/components/admin/AdminLayout';
import BookingQuickActions from '@/components/admin/BookingQuickActions';
import BookingStats from '@/components/admin/BookingStats';
import { useBookings, useUpdateBooking } from '@/hooks/useBookings';
import { BookingStatus } from '@/types/booking';

interface DashboardStats {
  total: number;
  published: number;
  drafts: number;
  archived: number;
  totalViews: number;
  thisMonthViews: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    published: 0,
    drafts: 0,
    archived: 0,
    totalViews: 0,
    thisMonthViews: 0
  });

  const [recentCaseStudies, setRecentCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  // Get booking data
  const {
    bookings,
    loading: bookingsLoading
  } = useBookings();
  const { updateStatus: updateBookingStatus } = useUpdateBooking();

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock stats data
        setStats({
          total: 12,
          published: 8,
          drafts: 3,
          archived: 1,
          totalViews: 15420,
          thisMonthViews: 2340
        });

        // Mock recent case studies
        const mockCaseStudies: CaseStudy[] = [
          {
            id: '1',
            title: 'Local Cafe Doubles Online Orders Through Social Media Strategy',
            slug: 'local-cafe-doubles-online-orders',
            client_name: 'Geelong Coffee Co.',
            client_industry: 'Hospitality & Tourism',
            client_location: 'Geelong, VIC',
            challenge: 'Low online visibility',
            solution: 'Social media strategy',
            results: 'Doubled online orders',
            testimonial: 'Amazing results!',
            testimonial_author: 'Sarah Mitchell',
            before_image_url: null,
            after_image_url: null,
            featured_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300',
            metrics: { revenue_increase: '100%' },
            tags: ['social-media', 'hospitality'],
            status: CaseStudyStatus.PUBLISHED,
            published_at: '2024-11-15T10:00:00Z',
            created_at: '2024-11-10T08:00:00Z',
            updated_at: '2024-11-15T10:00:00Z',
            author_id: 'admin-1'
          },
          {
            id: '2',
            title: 'Tradie Business Generates $50k in New Leads',
            slug: 'tradie-business-generates-50k-new-leads',
            client_name: 'Ballarat Plumbing Solutions',
            client_industry: 'Trades & Services',
            client_location: 'Ballarat, VIC',
            challenge: 'No online presence',
            solution: 'Website and SEO',
            results: '$50k in leads',
            testimonial: 'Phone hasn\'t stopped ringing!',
            testimonial_author: 'Mike Thompson',
            before_image_url: null,
            after_image_url: null,
            featured_image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300',
            metrics: { leads_value: '$50,000' },
            tags: ['local-seo', 'trades'],
            status: CaseStudyStatus.PUBLISHED,
            published_at: '2024-11-12T14:00:00Z',
            created_at: '2024-11-08T09:00:00Z',
            updated_at: '2024-11-12T14:00:00Z',
            author_id: 'admin-1'
          },
          {
            id: '3',
            title: 'E-commerce Store Increases Conversion Rate',
            slug: 'ecommerce-store-increases-conversion',
            client_name: 'Melbourne Activewear',
            client_industry: 'Retail & E-commerce',
            client_location: 'Melbourne, VIC',
            challenge: 'Low conversion rates',
            solution: 'UX improvements',
            results: '45% increase in conversions',
            testimonial: null,
            testimonial_author: null,
            before_image_url: null,
            after_image_url: null,
            featured_image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300',
            metrics: { conversion_increase: '45%' },
            tags: ['e-commerce', 'conversion-optimization'],
            status: CaseStudyStatus.DRAFT,
            published_at: null,
            created_at: '2024-11-16T11:00:00Z',
            updated_at: '2024-11-17T16:00:00Z',
            author_id: 'admin-1'
          }
        ];

        setRecentCaseStudies(mockCaseStudies);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate booking statistics
  const bookingStatistics = React.useMemo(() => {
    if (!bookings.length) {
      return {
        totalBookings: 0,
        pendingBookings: 0,
        confirmedBookings: 0,
        completedBookings: 0,
        thisWeekBookings: 0,
        thisMonthBookings: 0,
        trends: {
          totalChange: 0,
          pendingChange: 0,
          confirmedChange: 0,
          weekChange: 0
        }
      };
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeekBookings = bookings.filter(b =>
      new Date(b.created_at) >= startOfWeek
    ).length;

    const thisMonthBookings = bookings.filter(b =>
      new Date(b.created_at) >= startOfMonth
    ).length;

    const pendingBookings = bookings.filter(b =>
      b.status === BookingStatus.PENDING
    ).length;

    const confirmedBookings = bookings.filter(b =>
      b.status === BookingStatus.CONFIRMED
    ).length;

    const completedBookings = bookings.filter(b =>
      b.status === BookingStatus.COMPLETED
    ).length;

    return {
      totalBookings: bookings.length,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      thisWeekBookings,
      thisMonthBookings,
      trends: {
        totalChange: 12,
        pendingChange: -5,
        confirmedChange: 18,
        weekChange: 25
      }
    };
  }, [bookings]);

  const handleQuickStatusUpdate = async (bookingId: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, status);
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusBadge = (status: CaseStudyStatus) => {
    switch (status) {
      case CaseStudyStatus.PUBLISHED:
        return <Badge variant="default" className="bg-green-100 text-green-800">Published</Badge>;
      case CaseStudyStatus.DRAFT:
        return <Badge variant="secondary">Draft</Badge>;
      case CaseStudyStatus.ARCHIVED:
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          {/* Loading skeleton */}
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              G'day! Here's your business overview
            </h1>
            <p className="mt-2 text-muted-foreground">
              Track your bookings, manage your schedule, and monitor content performance
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button asChild variant="outline">
              <Link to="/admin/bookings">
                <Calendar className="mr-2 h-4 w-4" />
                View Bookings
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/case-studies/new">
                <Plus className="mr-2 h-4 w-4" />
                New Case Study
              </Link>
            </Button>
          </div>
        </div>

        {/* Booking Stats */}
        <BookingStats
          statistics={bookingStatistics}
          loading={bookingsLoading}
        />

        {/* Booking Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-heading font-bold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Booking Management
          </h2>
          <BookingQuickActions
            bookings={bookings}
            loading={bookingsLoading}
            onStatusUpdate={handleQuickStatusUpdate}
          />
        </div>

        {/* Content Management Section */}
        <div className="border-t pt-8">
          <h2 className="text-xl font-heading font-bold mb-6 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Content Management
          </h2>

          {/* Case Study Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Case Studies</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  All case studies in the system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                <p className="text-xs text-muted-foreground">
                  Live on your website
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.drafts}</div>
                <p className="text-xs text-muted-foreground">
                  Ready for review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.thisMonthViews.toLocaleString()} this month
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Case Studies & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Case Studies Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Case Studies</CardTitle>
                  <CardDescription>
                    Latest updates to your case studies
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/case-studies">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Study</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCaseStudies.map((caseStudy) => (
                    <TableRow key={caseStudy.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {caseStudy.featured_image_url && (
                            <img
                              src={caseStudy.featured_image_url}
                              alt={caseStudy.title}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-sm">
                              {caseStudy.title.length > 40
                                ? `${caseStudy.title.slice(0, 40)}...`
                                : caseStudy.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {caseStudy.client_name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(caseStudy.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {getRelativeTime(caseStudy.updated_at)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/case-studies/${caseStudy.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/admin/case-studies/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Case Study
                </Link>
              </Button>

              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/admin/case-studies">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  View All Case Studies
                </Link>
              </Button>

              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/admin/case-studies?status=draft">
                  <Clock className="mr-2 h-4 w-4" />
                  Review Drafts ({stats.drafts})
                </Link>
              </Button>

              <div className="border-t pt-4 mt-4">
                <p className="text-xs text-muted-foreground mb-3 font-medium">Booking Management</p>

                <Button asChild className="w-full justify-start mb-2" variant="outline">
                  <Link to="/admin/bookings">
                    <Calendar className="mr-2 h-4 w-4" />
                    All Bookings
                  </Link>
                </Button>

                <Button asChild className="w-full justify-start mb-2" variant="outline">
                  <Link to="/admin/time-slots">
                    <Clock className="mr-2 h-4 w-4" />
                    Time Slots
                  </Link>
                </Button>

                {bookingStatistics.pendingBookings > 0 && (
                  <Button asChild className="w-full justify-start mb-2" variant="outline">
                    <Link to="/admin/bookings?status=pending">
                      <AlertCircle className="mr-2 h-4 w-4" />
                      Pending ({bookingStatistics.pendingBookings})
                    </Link>
                  </Button>
                )}
              </div>

              <div className="border-t pt-4 mt-4">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link to="/admin/settings">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Performance Overview
            </CardTitle>
            <CardDescription>
              Your case studies are performing well! Here's a quick snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stats.published > 0 ? Math.round(stats.totalViews / stats.published) : 0}
                </div>
                <div className="text-sm text-muted-foreground">Average views per case study</div>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stats.published}
                </div>
                <div className="text-sm text-muted-foreground">Published case studies</div>
              </div>
              <div className="text-center p-4 bg-accent rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {stats.thisMonthViews > 0 ? '+' : ''}{stats.thisMonthViews.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Views this month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;