/**
 * Mock Case Studies Data
 *
 * Sample data for development and testing of the case studies CMS
 */

import { CaseStudy, CaseStudyStatus } from '@/types/case-studies';

export const mockCaseStudies: CaseStudy[] = [
  {
    id: '1',
    title: 'Local Cafe Doubles Online Orders Through Social Media Strategy',
    slug: 'local-cafe-doubles-online-orders',
    client_name: 'Geelong Coffee Co.',
    client_industry: 'Hospitality & Tourism',
    client_location: 'Geelong, VIC',
    challenge: 'Low online visibility and declining foot traffic during COVID lockdowns. The cafe had no social media presence and relied entirely on walk-in customers.',
    solution: 'Implemented comprehensive social media strategy with Instagram marketing, Google Ads for local searches, and website optimization for online ordering. Created engaging content showcasing coffee culture and local community.',
    results: 'Doubled online orders within 3 months, increased Instagram followers by 300%, and improved Google ranking to position 3 for "coffee Geelong". Monthly revenue increased by 85%.',
    testimonial: 'The team at Your Mate transformed our online presence. We went from struggling to stay afloat to having more orders than we can handle! Our Instagram is buzzing and customers are finding us online.',
    testimonial_author: 'Sarah Mitchell, Owner',
    before_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
    after_image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
    featured_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300',
    metrics: {
      revenue_increase: '85%',
      social_followers: '300%',
      google_ranking: 'Position 3',
      online_orders: '100%'
    },
    tags: ['social-media', 'google-ads', 'hospitality', 'local-seo'],
    status: CaseStudyStatus.PUBLISHED,
    published_at: '2024-11-15T10:00:00Z',
    created_at: '2024-11-10T08:00:00Z',
    updated_at: '2024-11-15T10:00:00Z',
    author_id: 'admin-1'
  },
  {
    id: '2',
    title: 'Tradie Business Generates $50k in New Leads with Local SEO',
    slug: 'tradie-business-generates-50k-new-leads',
    client_name: 'Ballarat Plumbing Solutions',
    client_industry: 'Trades & Services',
    client_location: 'Ballarat, VIC',
    challenge: 'Invisible online presence and relying entirely on word-of-mouth referrals. No website, no Google My Business listing, and competitors dominating search results.',
    solution: 'Built responsive website, optimized for local SEO, set up and optimized Google My Business profile, and launched targeted Google Ads campaign for emergency plumbing services.',
    results: 'Generated $50,000 in new leads within 6 months, ranking #1 for "plumber Ballarat", and booked solid for 3 months ahead. 40+ five-star Google reviews.',
    testimonial: 'We never thought we needed a website, but now we can\'t imagine business without it. The phone hasn\'t stopped ringing since we started working with Your Mate!',
    testimonial_author: 'Mike Thompson, Director',
    before_image_url: null,
    after_image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    featured_image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=300',
    metrics: {
      new_leads_value: '$50,000',
      google_ranking: 'Position 1',
      booking_pipeline: '3 months',
      google_reviews: '40+ five-star'
    },
    tags: ['local-seo', 'website-design', 'trades', 'google-ads'],
    status: CaseStudyStatus.PUBLISHED,
    published_at: '2024-11-12T14:00:00Z',
    created_at: '2024-11-08T09:00:00Z',
    updated_at: '2024-11-12T14:00:00Z',
    author_id: 'admin-1'
  },
  {
    id: '3',
    title: 'E-commerce Store Increases Conversion Rate by 45%',
    slug: 'ecommerce-store-increases-conversion',
    client_name: 'Melbourne Activewear',
    client_industry: 'Retail & E-commerce',
    client_location: 'Melbourne, VIC',
    challenge: 'Low conversion rates (1.2%), high cart abandonment, and poor mobile experience affecting sales. Website looked outdated and checkout process was confusing.',
    solution: 'Complete UX/UI redesign, mobile optimization, simplified checkout process, abandoned cart email sequence, and A/B tested product pages for better conversions.',
    results: '45% increase in conversion rates, 30% reduction in cart abandonment, and 60% increase in mobile sales. Average order value increased by $25.',
    testimonial: 'Our new website not only looks amazing but actually converts visitors into customers. The results speak for themselves - our best quarter ever!',
    testimonial_author: 'Jessica Chen, Founder',
    before_image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
    after_image_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400',
    featured_image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300',
    metrics: {
      conversion_increase: '45%',
      cart_abandonment_reduction: '30%',
      mobile_sales_increase: '60%',
      aov_increase: '$25'
    },
    tags: ['e-commerce', 'conversion-optimization', 'website-design', 'mobile-optimization'],
    status: CaseStudyStatus.DRAFT,
    published_at: null,
    created_at: '2024-11-16T11:00:00Z',
    updated_at: '2024-11-18T16:00:00Z',
    author_id: 'admin-1'
  },
  {
    id: '4',
    title: 'Gym Membership Sign-ups Triple with Facebook Ads',
    slug: 'gym-membership-signups-triple',
    client_name: 'FitZone Bendigo',
    client_industry: 'Sports & Fitness',
    client_location: 'Bendigo, VIC',
    challenge: 'Struggling to attract new members, relying on outdated marketing methods. Competition from chain gyms and limited marketing budget.',
    solution: 'Strategic Facebook and Instagram ad campaigns targeting local fitness enthusiasts, video content creation, and referral program implementation.',
    results: 'Tripled membership sign-ups, reduced cost per acquisition by 50%, and built community of 2,000+ engaged social media followers.',
    testimonial: 'Your Mate helped us compete with the big chains by showing locals what makes us special. Our community has never been stronger!',
    testimonial_author: 'Tom Rodriguez, Owner',
    before_image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    after_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    featured_image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300',
    metrics: {
      membership_increase: '200%',
      cpa_reduction: '50%',
      social_followers: '2,000+',
      community_engagement: 'High'
    },
    tags: ['facebook-ads', 'social-media', 'fitness', 'community-building'],
    status: CaseStudyStatus.PUBLISHED,
    published_at: '2024-11-10T09:00:00Z',
    created_at: '2024-11-05T10:00:00Z',
    updated_at: '2024-11-10T09:00:00Z',
    author_id: 'admin-1'
  },
  {
    id: '5',
    title: 'Real Estate Agent Dominates Local Property Market',
    slug: 'real-estate-agent-dominates-local-market',
    client_name: 'Peninsula Properties',
    client_industry: 'Real Estate',
    client_location: 'Mornington Peninsula, VIC',
    challenge: 'New to the area, competing against established agents with decades of local presence. Limited brand recognition and referral network.',
    solution: 'Comprehensive digital marketing strategy including SEO-optimized website, Google Ads for property searches, social media presence, and email marketing campaigns.',
    results: 'Became top-performing agent in the area within 18 months, increased listings by 400%, and established strong online presence with 95% of leads coming through digital channels.',
    testimonial: 'Moving to a new area was scary, but Your Mate\'s digital strategy helped me quickly establish credibility and attract quality listings. Best investment I ever made!',
    testimonial_author: 'Rachel Williams, Principal Agent',
    before_image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400',
    after_image_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400',
    featured_image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300',
    metrics: {
      listings_increase: '400%',
      digital_leads: '95%',
      market_position: 'Top agent',
      timeframe: '18 months'
    },
    tags: ['real-estate', 'seo', 'google-ads', 'email-marketing'],
    status: CaseStudyStatus.PUBLISHED,
    published_at: '2024-11-08T11:00:00Z',
    created_at: '2024-11-03T14:00:00Z',
    updated_at: '2024-11-08T11:00:00Z',
    author_id: 'admin-1'
  },
  {
    id: '6',
    title: 'Restaurant Recovers from Pandemic with Delivery Focus',
    slug: 'restaurant-recovers-pandemic-delivery',
    client_name: 'Nonna\'s Kitchen',
    client_industry: 'Hospitality & Tourism',
    client_location: 'Brunswick, VIC',
    challenge: 'Lost 80% of revenue during COVID-19 lockdowns. Traditional dine-in model no longer viable, needed to pivot to delivery and takeaway quickly.',
    solution: 'Rapid website development with online ordering, partnership with delivery platforms, social media marketing for takeaway menu, and email marketing to existing customers.',
    results: 'Recovered to 120% of pre-pandemic revenue, established profitable delivery model, and expanded customer base beyond local area.',
    testimonial: 'Your Mate didn\'t just help us survive - they helped us thrive! Our delivery business is now bigger than our restaurant ever was.',
    testimonial_author: 'Giuseppe Rossi, Owner',
    before_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
    after_image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    featured_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300',
    metrics: {
      revenue_recovery: '120%',
      delivery_orders: 'Daily average 45',
      customer_base: 'Expanded 60%',
      pivot_time: '3 weeks'
    },
    tags: ['hospitality', 'e-commerce', 'email-marketing', 'crisis-response'],
    status: CaseStudyStatus.PUBLISHED,
    published_at: '2024-11-05T13:00:00Z',
    created_at: '2024-11-01T12:00:00Z',
    updated_at: '2024-11-05T13:00:00Z',
    author_id: 'admin-1'
  },
  {
    id: '7',
    title: 'Accountancy Firm Attracts High-Value Clients Online',
    slug: 'accountancy-firm-attracts-high-value-clients',
    client_name: 'Strategic Financial Partners',
    client_industry: 'Accounting & Bookkeeping',
    client_location: 'Toorak, VIC',
    challenge: 'Difficulty attracting high-value business clients, competing with large firms. Traditional networking not generating enough qualified leads.',
    solution: 'Professional website redesign, LinkedIn marketing strategy, content marketing with financial insights, and Google Ads targeting business owners seeking accounting services.',
    results: 'Attracted 15 new high-value clients (avg. $10k+ annually), increased average client value by 150%, and established thought leadership in business advisory.',
    testimonial: null,
    testimonial_author: null,
    before_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
    after_image_url: null,
    featured_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300',
    metrics: {
      new_clients: '15 high-value',
      client_value_increase: '150%',
      annual_value_per_client: '$10,000+',
      thought_leadership: 'Established'
    },
    tags: ['professional-services', 'linkedin-marketing', 'content-marketing', 'b2b'],
    status: CaseStudyStatus.DRAFT,
    published_at: null,
    created_at: '2024-11-17T15:00:00Z',
    updated_at: '2024-11-18T10:00:00Z',
    author_id: 'admin-1'
  },
  {
    id: '8',
    title: 'Beauty Salon Builds Loyal Customer Base with Email Marketing',
    slug: 'beauty-salon-builds-loyal-customer-base',
    client_name: 'Glow Beauty Bar',
    client_industry: 'Beauty & Personal Care',
    client_location: 'South Yarra, VIC',
    challenge: 'High customer acquisition costs and low retention rates. Customers would visit once and not return, making it difficult to build profitable long-term relationships.',
    solution: 'Implemented automated email marketing sequences, loyalty program, social media showcasing transformations, and referral incentive system.',
    results: 'Increased customer retention by 70%, average customer lifetime value by $400, and referrals now account for 40% of new bookings.',
    testimonial: 'Our clients now feel like part of our beauty family. The email campaigns keep them engaged between visits and they love sharing their results!',
    testimonial_author: 'Emma Davidson, Owner',
    before_image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    after_image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
    featured_image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300',
    metrics: {
      retention_increase: '70%',
      customer_lifetime_value: '+$400',
      referral_percentage: '40%',
      email_engagement: 'High'
    },
    tags: ['beauty', 'email-marketing', 'retention', 'social-media'],
    status: CaseStudyStatus.ARCHIVED,
    published_at: '2024-10-20T10:00:00Z',
    created_at: '2024-10-15T09:00:00Z',
    updated_at: '2024-11-01T14:00:00Z',
    author_id: 'admin-2'
  }
];

// Helper function to get case studies by status
export const getCaseStudiesByStatus = (status: CaseStudyStatus) => {
  return mockCaseStudies.filter(cs => cs.status === status);
};

// Helper function to get case studies by industry
export const getCaseStudiesByIndustry = (industry: string) => {
  return mockCaseStudies.filter(cs => cs.client_industry === industry);
};

// Helper function to get published case studies
export const getPublishedCaseStudies = () => {
  return getCaseStudiesByStatus(CaseStudyStatus.PUBLISHED);
};

// Helper function to search case studies
export const searchCaseStudies = (query: string) => {
  const lowerQuery = query.toLowerCase();
  return mockCaseStudies.filter(cs =>
    cs.title.toLowerCase().includes(lowerQuery) ||
    cs.client_name.toLowerCase().includes(lowerQuery) ||
    (cs.client_location && cs.client_location.toLowerCase().includes(lowerQuery)) ||
    (cs.client_industry && cs.client_industry.toLowerCase().includes(lowerQuery))
  );
};