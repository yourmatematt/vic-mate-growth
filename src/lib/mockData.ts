// Mock data for client dashboard

export interface Campaign {
  id: string;
  name: string;
  type: 'Google Ads' | 'Facebook Ads' | 'SEO' | 'Email Marketing' | 'Social Media';
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  startDate: string;
  endDate?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  description: string;
}

export interface AnalyticsData {
  date: string;
  visitors: number;
  leads: number;
  conversions: number;
  revenue: number;
}

export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Plumbing Services Campaign',
    type: 'Google Ads',
    status: 'active',
    budget: 2000,
    spent: 1450,
    impressions: 45230,
    clicks: 1823,
    conversions: 47,
    startDate: '2024-01-01',
  },
  {
    id: '2',
    name: 'Local SEO Optimization',
    type: 'SEO',
    status: 'active',
    budget: 1500,
    spent: 1500,
    impressions: 125000,
    clicks: 4200,
    conversions: 89,
    startDate: '2023-11-01',
  },
  {
    id: '3',
    name: 'Facebook Lead Generation',
    type: 'Facebook Ads',
    status: 'active',
    budget: 1000,
    spent: 780,
    impressions: 32100,
    clicks: 892,
    conversions: 23,
    startDate: '2024-01-15',
  },
  {
    id: '4',
    name: 'Monthly Newsletter Campaign',
    type: 'Email Marketing',
    status: 'active',
    budget: 500,
    spent: 500,
    impressions: 8500,
    clicks: 1240,
    conversions: 34,
    startDate: '2023-10-01',
  },
  {
    id: '5',
    name: 'Holiday Special Promotion',
    type: 'Social Media',
    status: 'completed',
    budget: 800,
    spent: 800,
    impressions: 28400,
    clicks: 1150,
    conversions: 18,
    startDate: '2023-12-01',
    endDate: '2023-12-31',
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    date: '2024-01-01',
    amount: 2450.00,
    status: 'paid',
    dueDate: '2024-01-15',
    description: 'Digital Marketing Services - January 2024',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    date: '2024-02-01',
    amount: 2450.00,
    status: 'paid',
    dueDate: '2024-02-15',
    description: 'Digital Marketing Services - February 2024',
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    date: '2024-03-01',
    amount: 2450.00,
    status: 'pending',
    dueDate: '2024-03-15',
    description: 'Digital Marketing Services - March 2024',
  },
];

export const mockAnalyticsData: AnalyticsData[] = [
  { date: '2024-01-01', visitors: 450, leads: 23, conversions: 8, revenue: 3200 },
  { date: '2024-01-02', visitors: 520, leads: 28, conversions: 12, revenue: 4800 },
  { date: '2024-01-03', visitors: 380, leads: 19, conversions: 7, revenue: 2800 },
  { date: '2024-01-04', visitors: 610, leads: 32, conversions: 15, revenue: 6000 },
  { date: '2024-01-05', visitors: 490, leads: 26, conversions: 11, revenue: 4400 },
  { date: '2024-01-06', visitors: 420, leads: 21, conversions: 9, revenue: 3600 },
  { date: '2024-01-07', visitors: 550, leads: 29, conversions: 13, revenue: 5200 },
  { date: '2024-01-08', visitors: 580, leads: 31, conversions: 14, revenue: 5600 },
  { date: '2024-01-09', visitors: 440, leads: 24, conversions: 10, revenue: 4000 },
  { date: '2024-01-10', visitors: 620, leads: 35, conversions: 16, revenue: 6400 },
  { date: '2024-01-11', visitors: 510, leads: 27, conversions: 12, revenue: 4800 },
  { date: '2024-01-12', visitors: 470, leads: 25, conversions: 11, revenue: 4400 },
  { date: '2024-01-13', visitors: 590, leads: 33, conversions: 15, revenue: 6000 },
  { date: '2024-01-14', visitors: 430, leads: 22, conversions: 9, revenue: 3600 },
];

export const mockDashboardStats = {
  totalVisitors: 7060,
  totalLeads: 375,
  totalConversions: 157,
  totalRevenue: 62800,
  visitorChange: 12.5,
  leadChange: 18.3,
  conversionChange: 8.7,
  revenueChange: 22.1,
};
