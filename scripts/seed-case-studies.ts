#!/usr/bin/env tsx

/**
 * Case Studies Data Seeding Script
 *
 * Seeds the database with sample case study data for development and testing.
 * Run with: tsx scripts/seed-case-studies.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  header: (msg: string) => console.log(`\n${colors.bold}${colors.blue}🌱 ${msg}${colors.reset}\n`)
};

// Load environment variables
const envFiles = ['.env.local', '.env'];
for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    log.info(`Loaded environment from ${envFile}`);
    break;
  }
}

// Sample case study data
const sampleCaseStudies = [
  {
    title: 'Digital Transformation for Melbourne Tech Startup',
    slug: 'melbourne-tech-startup-transformation',
    client_name: 'InnovateTech Solutions',
    industry: 'Technology',
    project_type: 'Digital Transformation',
    challenge: `InnovateTech Solutions, a growing Melbourne-based startup, was struggling with fragmented systems and manual processes that were hindering their rapid growth. With a team of 50+ employees, they needed to streamline operations, improve customer experience, and establish scalable business processes.

Key challenges included:
- Disconnected software systems causing data silos
- Manual customer onboarding taking 5+ days
- No centralized project management system
- Inconsistent brand presentation across channels
- Limited visibility into business performance metrics`,

    solution: `We implemented a comprehensive digital transformation strategy focusing on process automation and system integration:

**Phase 1: System Integration**
- Migrated to Salesforce CRM with custom integrations
- Implemented Slack for internal communication
- Set up automated workflows using Zapier
- Created centralized document management system

**Phase 2: Process Optimization**
- Redesigned customer onboarding flow
- Automated invoice generation and payment processing
- Established project management workflows in Asana
- Created standard operating procedures (SOPs)

**Phase 3: Brand Consistency**
- Developed comprehensive brand guidelines
- Redesigned website with conversion optimization
- Created templates for proposals and presentations
- Implemented brand asset management system`,

    results: `The digital transformation delivered significant improvements across all key metrics:

**Operational Efficiency:**
- 70% reduction in customer onboarding time (5 days → 1.5 days)
- 50% decrease in manual data entry
- 80% faster invoice processing
- 90% improvement in project visibility

**Business Growth:**
- 40% increase in customer satisfaction scores
- 25% boost in sales conversion rates
- 35% reduction in operational costs
- 60% faster time-to-market for new features

**Team Productivity:**
- 45% reduction in time spent on administrative tasks
- 30% improvement in cross-team collaboration
- 85% of employees report improved job satisfaction
- 50% decrease in project delivery delays`,

    testimonial: "Your Mate Agency transformed how we operate. The seamless integration of our systems and the automated workflows have allowed us to focus on what we do best - innovating and serving our customers. The results speak for themselves.",
    client_role: 'CEO',
    tags: ['Digital Transformation', 'Process Automation', 'CRM Integration', 'Workflow Optimization'],
    metrics: {
      conversion_improvement: '25%',
      efficiency_gain: '70%',
      cost_reduction: '35%',
      time_saved: '5 days → 1.5 days'
    },
    duration_months: 6,
    team_size: 4,
    budget_range: 'enterprise',
    complexity_score: 8,
    status: 'published',
    featured: true
  },
  {
    title: 'E-commerce Platform Migration for Retail Chain',
    slug: 'retail-chain-ecommerce-migration',
    client_name: 'Aussie Fashion Co.',
    industry: 'Retail',
    project_type: 'Platform Migration',
    challenge: `Aussie Fashion Co., an established retail chain with 15 physical stores across Australia, needed to rapidly expand their online presence. Their existing e-commerce platform was outdated, slow, and couldn't handle peak traffic during sales events.

Critical issues included:
- Website crashes during Black Friday sales
- Limited mobile optimization (70% mobile traffic)
- Poor inventory management integration
- Slow page load times (8+ seconds)
- Limited payment options for customers
- No advanced analytics or customer insights`,

    solution: `We executed a complete e-commerce platform migration with performance and conversion optimization:

**Technical Migration:**
- Migrated from legacy platform to Shopify Plus
- Implemented advanced caching and CDN
- Optimized images and implemented lazy loading
- Created responsive, mobile-first design
- Integrated with existing POS and inventory systems

**User Experience Enhancement:**
- Redesigned checkout flow (reduced from 5 to 2 steps)
- Added multiple payment options (Afterpay, PayPal, Apple Pay)
- Implemented advanced search and filtering
- Created personalized product recommendations
- Added customer reviews and social proof elements

**Performance Optimization:**
- Achieved sub-2-second page load times
- Implemented progressive web app features
- Added advanced analytics and heat mapping
- Set up automated performance monitoring
- Created comprehensive SEO optimization`,

    results: `The platform migration exceeded all performance and business objectives:

**Technical Performance:**
- 75% improvement in page load speed (8s → 2s)
- 99.9% uptime during peak traffic events
- 0 crashes during Black Friday (previously crashed for 6+ hours)
- 60% reduction in bounce rate

**Business Impact:**
- 150% increase in online revenue within 6 months
- 45% improvement in mobile conversion rates
- 30% increase in average order value
- 200% growth in online customer base

**Customer Experience:**
- 80% reduction in cart abandonment rate
- 40% increase in customer satisfaction scores
- 90% of customers now complete purchases on mobile
- 65% increase in repeat purchase rate`,

    testimonial: "The new platform has revolutionized our online business. We went from dreading sales events to embracing them. The performance during Black Friday was flawless, and our online revenue has more than doubled.",
    client_role: 'Digital Marketing Manager',
    tags: ['E-commerce', 'Platform Migration', 'Performance Optimization', 'Mobile Commerce'],
    metrics: {
      conversion_improvement: '45%',
      performance_gain: '75%',
      revenue_increase: '150%',
      uptime: '99.9%'
    },
    duration_months: 4,
    team_size: 5,
    budget_range: 'large',
    complexity_score: 7,
    status: 'published',
    featured: true
  },
  {
    title: 'Marketing Automation for Professional Services Firm',
    slug: 'professional-services-marketing-automation',
    client_name: 'Sydney Legal Partners',
    industry: 'Professional Services',
    project_type: 'Marketing Automation',
    challenge: `Sydney Legal Partners, a mid-sized law firm specializing in corporate law, was losing potential clients due to slow response times and manual lead management processes. With growing competition, they needed to modernize their client acquisition and retention strategies.

Key challenges:
- Manual lead follow-up taking 2-3 days
- No lead scoring or qualification system
- Inconsistent communication across partners
- Limited visibility into marketing ROI
- Difficulty nurturing long-term relationships
- Compliance requirements for client communications`,

    solution: `We designed and implemented a comprehensive marketing automation system tailored for legal services:

**Lead Management System:**
- Implemented HubSpot CRM with legal-specific customizations
- Created automated lead scoring based on engagement and fit
- Set up instant notifications for high-value prospects
- Designed compliance-friendly email templates
- Integrated with website forms and contact points

**Nurture Campaigns:**
- Developed content marketing strategy with legal insights
- Created automated email sequences for different practice areas
- Set up personalized follow-up workflows
- Implemented social media automation for thought leadership
- Created client onboarding automation sequences

**Performance Tracking:**
- Built comprehensive reporting dashboards
- Implemented conversion tracking across all touchpoints
- Set up ROI measurement for marketing activities
- Created partner performance visibility tools
- Established KPI monitoring and alerting`,

    results: `The marketing automation implementation transformed their client acquisition process:

**Response Time & Efficiency:**
- 90% reduction in initial response time (2-3 days → 30 minutes)
- 65% increase in lead qualification efficiency
- 40% reduction in manual administrative tasks
- 80% improvement in follow-up consistency

**Business Growth:**
- 120% increase in qualified leads
- 35% improvement in lead-to-client conversion rate
- 50% increase in client lifetime value
- 25% growth in annual revenue

**Marketing Performance:**
- 300% improvement in marketing ROI measurement
- 70% increase in email engagement rates
- 45% more social media leads
- 85% of partners actively using the new system`,

    testimonial: "The automation system has transformed how we handle prospects. We're responding faster, following up consistently, and converting more leads into clients. It's given us a competitive edge in a crowded market.",
    client_role: 'Managing Partner',
    tags: ['Marketing Automation', 'CRM Integration', 'Lead Generation', 'Legal Tech'],
    metrics: {
      response_improvement: '90%',
      lead_increase: '120%',
      conversion_improvement: '35%',
      roi_improvement: '300%'
    },
    duration_months: 3,
    team_size: 3,
    budget_range: 'medium',
    complexity_score: 6,
    status: 'published',
    featured: false
  },
  {
    title: 'Digital Brand Launch for Healthcare Startup',
    slug: 'healthcare-startup-brand-launch',
    client_name: 'WellnessConnect',
    industry: 'Healthcare',
    project_type: 'Brand Launch',
    challenge: `WellnessConnect, a telehealth startup, needed to establish credibility and trust in the competitive Australian healthcare market. As a new entrant, they faced challenges in patient acquisition, brand recognition, and compliance with healthcare regulations.

Primary challenges:
- No brand recognition in crowded telehealth market
- Strict healthcare advertising compliance requirements
- Patient trust and credibility concerns
- Complex appointment booking system needed
- Integration with healthcare providers required
- Need for patient data security and privacy`,

    solution: `We developed a comprehensive digital brand launch strategy focused on trust-building and compliance:

**Brand Development:**
- Created trustworthy, professional brand identity
- Developed healthcare-compliant messaging framework
- Designed patient-centric website with accessibility features
- Created educational content library for health topics
- Established thought leadership through expert content

**Digital Platform:**
- Built secure, HIPAA-compliant telehealth platform
- Implemented easy appointment booking system
- Created patient portal with medical history access
- Integrated with existing healthcare provider systems
- Added secure video consultation features

**Marketing & Compliance:**
- Developed TGA-compliant marketing campaigns
- Created trust signals (certifications, testimonials, security badges)
- Implemented SEO strategy for health-related searches
- Set up patient referral and review systems
- Established ongoing compliance monitoring`,

    results: `The brand launch successfully established WellnessConnect as a trusted healthcare provider:

**Brand Recognition:**
- Achieved 40% brand awareness in target demographics within 6 months
- 95% patient satisfaction scores from day one
- Featured in 3 major healthcare publications
- 85% of patients would recommend to family/friends

**Business Metrics:**
- 500+ active patients within first quarter
- 25% month-over-month patient growth
- 15% patient acquisition cost reduction
- 90% appointment completion rate

**Platform Performance:**
- 99.8% system uptime for critical healthcare functions
- 2-minute average appointment booking time
- 95% patient portal adoption rate
- Zero compliance violations or security incidents`,

    testimonial: "Your Mate Agency understood the unique challenges of launching in healthcare. They built a platform and brand that patients trust, providers respect, and regulators approve of. The results exceeded our expectations.",
    client_role: 'Founder & CEO',
    tags: ['Brand Launch', 'Healthcare Technology', 'Compliance', 'Telehealth'],
    metrics: {
      brand_awareness: '40%',
      patient_satisfaction: '95%',
      growth_rate: '25% MoM',
      uptime: '99.8%'
    },
    duration_months: 5,
    team_size: 6,
    budget_range: 'large',
    complexity_score: 9,
    status: 'published',
    featured: false
  },
  {
    title: 'Analytics Implementation for Education Platform',
    slug: 'education-platform-analytics',
    client_name: 'LearnSmart Australia',
    industry: 'Education',
    project_type: 'Analytics & Optimization',
    challenge: `LearnSmart Australia, an online learning platform with 10,000+ students, had limited visibility into user behavior and learning outcomes. They needed comprehensive analytics to improve course completion rates and student engagement.

Key issues:
- No visibility into student learning patterns
- 35% course completion rate (industry average 60%)
- Limited understanding of content effectiveness
- No personalization or adaptive learning features
- Difficulty identifying at-risk students
- Manual reporting taking days to complete`,

    solution: `We implemented a comprehensive analytics and optimization system for educational outcomes:

**Learning Analytics Platform:**
- Integrated advanced analytics tracking across all course interactions
- Created student engagement scoring algorithms
- Implemented predictive models for completion likelihood
- Built real-time dashboards for educators and administrators
- Added automated early warning systems for at-risk students

**Content Optimization:**
- A/B tested course structures and content delivery methods
- Implemented adaptive learning pathways
- Created personalized content recommendations
- Added interactive elements and gamification
- Established content performance measurement

**Reporting & Insights:**
- Built comprehensive student progress tracking
- Created automated weekly performance reports
- Implemented cohort analysis and retention tracking
- Added ROI measurement for course development
- Established benchmark reporting against industry standards`,

    results: `The analytics implementation dramatically improved learning outcomes and platform performance:

**Student Success:**
- 85% increase in course completion rates (35% → 65%)
- 50% improvement in student engagement scores
- 40% reduction in time-to-completion for successful students
- 70% improvement in knowledge retention (measured via assessments)

**Operational Efficiency:**
- 90% reduction in manual reporting time (days → hours)
- 60% improvement in early identification of at-risk students
- 45% increase in instructor efficiency
- 30% reduction in student support tickets

**Business Impact:**
- 25% increase in student lifetime value
- 40% improvement in course recommendation accuracy
- 55% reduction in student churn rate
- 200% improvement in content development ROI`,

    testimonial: "The analytics platform has revolutionized how we understand and serve our students. We can now identify and help struggling students before they drop out, and our completion rates have nearly doubled.",
    client_role: 'Head of Product',
    tags: ['Learning Analytics', 'Educational Technology', 'Data Science', 'Student Success'],
    metrics: {
      completion_improvement: '85%',
      engagement_increase: '50%',
      retention_improvement: '70%',
      efficiency_gain: '90%'
    },
    duration_months: 4,
    team_size: 4,
    budget_range: 'medium',
    complexity_score: 7,
    status: 'published',
    featured: false
  }
];

class CaseStudySeeder {
  private supabase: any;
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }

    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async checkExistingData(): Promise<boolean> {
    log.header('Checking for Existing Data');

    try {
      const { data, error } = await this.supabase
        .from('case_studies')
        .select('count', { count: 'exact', head: true });

      if (error) {
        this.errors.push(`Error checking existing data: ${error.message}`);
        log.error(`Error checking existing data: ${error.message}`);
        return false;
      }

      const count = data?.[0]?.count || 0;
      log.info(`Found ${count} existing case studies`);

      if (count > 0) {
        log.warning('Database already contains case studies. Use --force to overwrite.');
        return false;
      }

      return true;
    } catch (error: any) {
      this.errors.push(`Error checking existing data: ${error.message}`);
      log.error(`Error checking existing data: ${error.message}`);
      return false;
    }
  }

  async clearExistingData(force: boolean = false): Promise<boolean> {
    if (!force) {
      return true;
    }

    log.header('Clearing Existing Data');

    try {
      // Delete case study images first (foreign key constraint)
      const { error: imagesError } = await this.supabase
        .from('case_study_images')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (imagesError) {
        log.warning(`Could not clear images: ${imagesError.message}`);
      } else {
        log.success('Cleared existing case study images');
      }

      // Delete case studies
      const { error: studiesError } = await this.supabase
        .from('case_studies')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (studiesError) {
        this.errors.push(`Error clearing case studies: ${studiesError.message}`);
        log.error(`Error clearing case studies: ${studiesError.message}`);
        return false;
      }

      log.success('Cleared existing case studies');
      return true;
    } catch (error: any) {
      this.errors.push(`Error clearing data: ${error.message}`);
      log.error(`Error clearing data: ${error.message}`);
      return false;
    }
  }

  async seedCaseStudies(): Promise<boolean> {
    log.header('Seeding Case Studies Data');

    let successCount = 0;

    for (const caseStudy of sampleCaseStudies) {
      try {
        log.info(`Creating case study: ${caseStudy.title}`);

        const { data, error } = await this.supabase
          .from('case_studies')
          .insert([{
            title: caseStudy.title,
            slug: caseStudy.slug,
            client_name: caseStudy.client_name,
            industry: caseStudy.industry,
            project_type: caseStudy.project_type,
            challenge: caseStudy.challenge,
            solution: caseStudy.solution,
            results: caseStudy.results,
            testimonial: caseStudy.testimonial,
            client_role: caseStudy.client_role,
            tags: caseStudy.tags,
            metrics: caseStudy.metrics,
            duration_months: caseStudy.duration_months,
            team_size: caseStudy.team_size,
            budget_range: caseStudy.budget_range,
            complexity_score: caseStudy.complexity_score,
            status: caseStudy.status,
            featured: caseStudy.featured,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select();

        if (error) {
          this.errors.push(`Error creating case study "${caseStudy.title}": ${error.message}`);
          log.error(`Failed to create: ${caseStudy.title}`);
          continue;
        }

        log.success(`Created: ${caseStudy.title}`);
        successCount++;

      } catch (error: any) {
        this.errors.push(`Error creating case study "${caseStudy.title}": ${error.message}`);
        log.error(`Failed to create: ${caseStudy.title}`);
      }
    }

    log.info(`Successfully created ${successCount}/${sampleCaseStudies.length} case studies`);
    return successCount > 0;
  }

  async verifySeeding(): Promise<boolean> {
    log.header('Verifying Seeded Data');

    try {
      const { data, error } = await this.supabase
        .from('case_studies')
        .select('id, title, status, featured, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        this.errors.push(`Error verifying data: ${error.message}`);
        log.error(`Error verifying data: ${error.message}`);
        return false;
      }

      log.success(`Verified ${data?.length || 0} case studies in database`);

      // Show summary
      const publishedCount = data?.filter(cs => cs.status === 'published').length || 0;
      const featuredCount = data?.filter(cs => cs.featured).length || 0;

      log.info(`Published case studies: ${publishedCount}`);
      log.info(`Featured case studies: ${featuredCount}`);

      return true;
    } catch (error: any) {
      this.errors.push(`Error verifying data: ${error.message}`);
      log.error(`Error verifying data: ${error.message}`);
      return false;
    }
  }

  generateReport(): number {
    log.header('Seeding Report');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      log.success('🎉 Case studies seeded successfully!');
      console.log(`\n${colors.green}Next steps:${colors.reset}`);
      console.log(`1. Start the development server: ${colors.bold}pnpm dev${colors.reset}`);
      console.log(`2. View case studies at: ${colors.bold}http://localhost:5173/expertise${colors.reset}`);
      console.log(`3. Manage case studies at: ${colors.bold}http://localhost:5173/admin/case-studies${colors.reset}`);
      return 0;
    }

    if (this.errors.length > 0) {
      log.error(`Found ${this.errors.length} error(s):`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    if (this.warnings.length > 0) {
      log.warning(`Found ${this.warnings.length} warning(s):`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }

    return this.errors.length > 0 ? 1 : 0;
  }

  async run(force: boolean = false): Promise<number> {
    console.log(`${colors.bold}${colors.blue}Case Studies Data Seeding${colors.reset}\n`);

    try {
      // Check if data already exists
      const canProceed = await this.checkExistingData();
      if (!canProceed && !force) {
        log.warning('Seeding cancelled. Use --force to overwrite existing data.');
        return 0;
      }

      // Clear existing data if force flag is set
      const cleared = await this.clearExistingData(force);
      if (!cleared) {
        return 1;
      }

      // Seed the case studies
      const seeded = await this.seedCaseStudies();
      if (!seeded) {
        return 1;
      }

      // Verify the seeded data
      const verified = await this.verifySeeding();
      if (!verified) {
        return 1;
      }

      return this.generateReport();
    } catch (error: any) {
      log.error(`Seeding failed: ${error.message}`);
      return 1;
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const force = args.includes('--force') || args.includes('-f');

// Main execution
if (require.main === module) {
  const seeder = new CaseStudySeeder();
  seeder.run(force)
    .then(exitCode => {
      process.exit(exitCode);
    })
    .catch(error => {
      console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
      process.exit(1);
    });
}

export default CaseStudySeeder;