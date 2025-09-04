import { z } from 'zod';

// Australian phone number validation
const australianPhoneRegex = /^(\+61|0)[2-9]\d{8}$/;

// Australian postcode validation
const postcodeRegex = /^\d{4}$/;

// Australian ABN validation (basic format check)
const abnRegex = /^\d{2}\s?\d{3}\s?\d{3}\s?\d{3}$/;

// Website Analysis Form Schema
export const websiteAnalysisSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  websiteUrl: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().refine(
    (phone) => australianPhoneRegex.test(phone),
    'Please enter a valid Australian phone number'
  ),
  industry: z.string().min(1, 'Please select your industry'),
  biggestChallenge: z.string().min(1, 'Please select your biggest challenge'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  location: z.string().min(2, 'Please enter your location'),
  hearAboutUs: z.string().optional()
});

// Newsletter Signup Schema
export const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  businessName: z.string().optional()
});

// Contact Form Schema
export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().refine(
    (phone) => australianPhoneRegex.test(phone),
    'Please enter a valid Australian phone number'
  ),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  budget: z.string().optional(),
  timeframe: z.string().optional()
});

// SEO Tool Form Schema
export const seoToolSchema = z.object({
  websiteUrl: z.string().url('Please enter a valid website URL'),
  email: z.string().email('Please enter a valid email address'),
  targetKeywords: z.string().optional()
});

// ROI Calculator Schema
export const roiCalculatorSchema = z.object({
  monthlyRevenue: z.number().min(1, 'Monthly revenue must be greater than 0'),
  averageOrderValue: z.number().min(1, 'Average order value must be greater than 0'),
  currentConversionRate: z.number().min(0).max(100, 'Conversion rate must be between 0-100%'),
  monthlyWebsiteVisitors: z.number().min(1, 'Monthly visitors must be greater than 0'),
  industry: z.string().min(1, 'Please select your industry')
});

// Business Industries (Australian focused)
export const australianIndustries = [
  'Trades & Services',
  'Retail & E-commerce', 
  'Healthcare & Wellness',
  'Hospitality & Tourism',
  'Professional Services',
  'Real Estate',
  'Automotive',
  'Construction',
  'Education & Training',
  'Finance & Insurance',
  'Agriculture & Farming',
  'Manufacturing',
  'Technology',
  'Beauty & Personal Care',
  'Home & Garden Services',
  'Sports & Fitness',
  'Legal Services',
  'Accounting & Bookkeeping',
  'Other'
] as const;

// Business Challenges
export const businessChallenges = [
  'Not enough website traffic',
  'Website visitors not converting to customers',
  'Not showing up in Google searches',
  'Social media not generating leads',
  'Google Ads not profitable',
  'No time to manage digital marketing',
  'Not sure what\'s working and what\'s not',
  'Competitors outranking us online',
  'Need a new website',
  'Other'
] as const;

// How they heard about us
export const hearAboutUsOptions = [
  'Google Search',
  'Facebook/Instagram',
  'Word of mouth/Referral',
  'LinkedIn',
  'Local business network',
  'Trade publication',
  'Event/Conference',
  'Other'
] as const;

// Budget ranges (Australian market)
export const budgetRanges = [
  'Under $2,000/month',
  '$2,000 - $5,000/month', 
  '$5,000 - $10,000/month',
  '$10,000+ /month',
  'Let\'s discuss'
] as const;

// Project timeframes
export const timeframes = [
  'ASAP - within 2 weeks',
  'Within 1 month',
  'Within 3 months', 
  'Within 6 months',
  'Just researching for now'
] as const;

export type WebsiteAnalysisFormData = z.infer<typeof websiteAnalysisSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type SeoToolFormData = z.infer<typeof seoToolSchema>;
export type RoiCalculatorFormData = z.infer<typeof roiCalculatorSchema>;