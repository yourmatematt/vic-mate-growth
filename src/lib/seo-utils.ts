/**
 * SEO Utilities for Case Studies
 *
 * Generates meta tags, schema markup, and SEO data
 */

import { CaseStudy } from '@/types/case-studies';

export interface MetaTags {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Generate meta tags for case study listing page
 */
export const generateExpertiseMetaTags = (): MetaTags => {
  return {
    title: 'Case Studies | Your Mate Agency - Real Success Stories from Regional Australia',
    description: 'Real success stories from regional Australian businesses. See how we\'ve helped local companies grow with simple, effective marketing strategies.',
    keywords: 'case studies, success stories, regional australia marketing, local business growth, marketing agency results',
    ogTitle: 'Success Stories from Regional Australia | Your Mate Agency',
    ogDescription: 'See how we\'ve helped local businesses like yours grow with simple, effective marketing',
    ogImage: '/images/og-case-studies.jpg',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Success Stories from Regional Australia | Your Mate Agency',
    twitterDescription: 'See how we\'ve helped local businesses like yours grow with simple, effective marketing',
    twitterImage: '/images/twitter-case-studies.jpg'
  };
};

/**
 * Generate meta tags for individual case study page
 */
export const generateCaseStudyMetaTags = (caseStudy: CaseStudy): MetaTags => {
  // Create excerpt from challenge (first 160 chars)
  const excerpt = caseStudy.challenge.length > 160
    ? caseStudy.challenge.substring(0, 157) + '...'
    : caseStudy.challenge;

  const title = `${caseStudy.title} - Case Study | Your Mate Agency`;

  return {
    title,
    description: excerpt,
    keywords: [
      caseStudy.client_industry.toLowerCase(),
      ...caseStudy.tags.map(tag => tag.toLowerCase()),
      'case study',
      'success story',
      'regional australia',
      'marketing results'
    ].join(', '),
    canonical: `/expertise/${caseStudy.slug}`,
    ogTitle: caseStudy.title,
    ogDescription: excerpt,
    ogImage: caseStudy.featured_image_url || '/images/og-default.jpg',
    ogUrl: `/expertise/${caseStudy.slug}`,
    twitterCard: 'summary_large_image',
    twitterTitle: caseStudy.title,
    twitterDescription: excerpt,
    twitterImage: caseStudy.featured_image_url || '/images/twitter-default.jpg'
  };
};

/**
 * Generate JSON-LD schema for case study
 */
export const generateCaseStudySchema = (caseStudy: CaseStudy) => {
  const publishedDate = caseStudy.published_at || caseStudy.created_at;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `https://yourmateagency.com.au/expertise/${caseStudy.slug}`,
    headline: caseStudy.title,
    description: caseStudy.challenge.substring(0, 200),
    image: caseStudy.featured_image_url ? [caseStudy.featured_image_url] : [],
    datePublished: publishedDate,
    dateModified: caseStudy.updated_at,
    author: {
      '@type': 'Organization',
      name: 'Your Mate Agency',
      url: 'https://yourmateagency.com.au'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Your Mate Agency',
      url: 'https://yourmateagency.com.au',
      logo: {
        '@type': 'ImageObject',
        url: 'https://yourmateagency.com.au/images/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://yourmateagency.com.au/expertise/${caseStudy.slug}`
    },
    about: {
      '@type': 'Thing',
      name: caseStudy.client_industry
    },
    keywords: caseStudy.tags.join(', '),
    articleSection: 'Case Study',
    inLanguage: 'en-AU'
  };
};

/**
 * Generate breadcrumb schema markup
 */
export const generateBreadcrumbSchema = (breadcrumbs: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `https://yourmateagency.com.au${crumb.url}`
    }))
  };
};

/**
 * Generate organization schema for case studies page
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Your Mate Agency',
    url: 'https://yourmateagency.com.au',
    logo: 'https://yourmateagency.com.au/images/logo.png',
    description: 'Marketing agency specializing in helping regional Australian businesses grow',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AU',
      addressRegion: 'Regional Australia'
    },
    sameAs: [
      'https://facebook.com/yourmateagency',
      'https://linkedin.com/company/yourmateagency',
      'https://instagram.com/yourmateagency'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English'
    }
  };
};

/**
 * Generate FAQ schema for case study (if testimonial exists)
 */
export const generateCaseStudyFAQSchema = (caseStudy: CaseStudy) => {
  if (!caseStudy.testimonial_content) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What did ${caseStudy.client_name} say about working with Your Mate Agency?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: caseStudy.testimonial_content
        }
      }
    ]
  };
};

/**
 * Extract metrics for rich snippets
 */
export const extractKeyMetrics = (caseStudy: CaseStudy): Array<{ label: string; value: string }> => {
  const metrics: Array<{ label: string; value: string }> = [];

  if (caseStudy.metrics && caseStudy.metrics.length > 0) {
    // Take the first 3 most impressive metrics
    const sortedMetrics = caseStudy.metrics
      .filter(metric => metric.value && metric.label)
      .slice(0, 3);

    return sortedMetrics.map(metric => ({
      label: metric.label,
      value: metric.value
    }));
  }

  return metrics;
};

/**
 * Generate social share URLs
 */
export const generateShareUrls = (caseStudy: CaseStudy) => {
  const url = encodeURIComponent(`https://yourmateagency.com.au/expertise/${caseStudy.slug}`);
  const title = encodeURIComponent(caseStudy.title);
  const description = encodeURIComponent(
    `See how we helped ${caseStudy.client_name} achieve amazing results`
  );

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    email: `mailto:?subject=${title}&body=Check out this case study: ${url}`,
    copy: `https://yourmateagency.com.au/expertise/${caseStudy.slug}`
  };
};

/**
 * Format Australian date for display
 */
export const formatAustralianDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Generate reading time estimate
 */
export const calculateReadingTime = (caseStudy: CaseStudy): number => {
  const wordsPerMinute = 200;
  const textContent = [
    caseStudy.challenge,
    caseStudy.solution,
    caseStudy.results,
    caseStudy.testimonial_content || ''
  ].join(' ');

  const wordCount = textContent.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Generate canonical URL
 */
export const generateCanonicalUrl = (path: string): string => {
  const baseUrl = 'https://yourmateagency.com.au';
  return `${baseUrl}${path}`;
};

/**
 * Create meta tags HTML string for SSR
 */
export const generateMetaTagsHTML = (metaTags: MetaTags): string => {
  const tags = [];

  if (metaTags.title) {
    tags.push(`<title>${metaTags.title}</title>`);
  }

  if (metaTags.description) {
    tags.push(`<meta name="description" content="${metaTags.description}" />`);
  }

  if (metaTags.keywords) {
    tags.push(`<meta name="keywords" content="${metaTags.keywords}" />`);
  }

  if (metaTags.canonical) {
    tags.push(`<link rel="canonical" href="${generateCanonicalUrl(metaTags.canonical)}" />`);
  }

  // Open Graph tags
  if (metaTags.ogTitle) {
    tags.push(`<meta property="og:title" content="${metaTags.ogTitle}" />`);
  }

  if (metaTags.ogDescription) {
    tags.push(`<meta property="og:description" content="${metaTags.ogDescription}" />`);
  }

  if (metaTags.ogImage) {
    tags.push(`<meta property="og:image" content="${metaTags.ogImage}" />`);
  }

  if (metaTags.ogUrl) {
    tags.push(`<meta property="og:url" content="${generateCanonicalUrl(metaTags.ogUrl)}" />`);
  }

  tags.push(`<meta property="og:type" content="article" />`);
  tags.push(`<meta property="og:site_name" content="Your Mate Agency" />`);

  // Twitter tags
  if (metaTags.twitterCard) {
    tags.push(`<meta name="twitter:card" content="${metaTags.twitterCard}" />`);
  }

  if (metaTags.twitterTitle) {
    tags.push(`<meta name="twitter:title" content="${metaTags.twitterTitle}" />`);
  }

  if (metaTags.twitterDescription) {
    tags.push(`<meta name="twitter:description" content="${metaTags.twitterDescription}" />`);
  }

  if (metaTags.twitterImage) {
    tags.push(`<meta name="twitter:image" content="${metaTags.twitterImage}" />`);
  }

  return tags.join('\n');
};