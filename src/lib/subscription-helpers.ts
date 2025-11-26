/**
 * Subscription Tier Validation and Helper Functions
 * Manages subscription tier permissions and features
 */

import {
  SubscriptionTier,
  RecurrenceFrequency,
  SUBSCRIPTION_PERMISSIONS,
  canAccessRecurringMeetings,
  getAllowedFrequencies,
  getMaxMeetingsPerMonth
} from '@/types/recurring-meetings';

export interface SubscriptionFeatures {
  recurringMeetings: boolean;
  maxMeetingsPerMonth: number;
  allowedFrequencies: RecurrenceFrequency[];
  hasGoogleCalendar: boolean;
  hasEmailReminders: boolean;
  hasPhoneSupport: boolean;
  hasSlackSupport: boolean;
  hasPrioritySupport: boolean;
  description: string;
}

export interface SubscriptionLimits {
  maxActiveRecurringMeetings: number;
  maxReschedules: number;
  maxNotesLength: number;
  canCancelMeetings: boolean;
  canChangeMeetingType: boolean;
}

export interface PlanComparison {
  tier: SubscriptionTier;
  name: string;
  price: string;
  features: string[];
  meetingFeatures: string[];
  limitations?: string[];
  recommended?: boolean;
}

/**
 * Get subscription features for a tier
 */
export function getSubscriptionFeatures(tier: SubscriptionTier): SubscriptionFeatures {
  const permissions = SUBSCRIPTION_PERMISSIONS[tier];

  const baseFeatures = {
    recurringMeetings: permissions.canAccessRecurring,
    maxMeetingsPerMonth: permissions.maxMeetingsPerMonth,
    allowedFrequencies: permissions.allowedFrequencies,
    hasGoogleCalendar: true,
    hasEmailReminders: true,
    description: permissions.description
  };

  switch (tier) {
    case 'starter':
      return {
        ...baseFeatures,
        hasPhoneSupport: false,
        hasSlackSupport: false,
        hasPrioritySupport: false
      };

    case 'growth':
      return {
        ...baseFeatures,
        hasPhoneSupport: true,
        hasSlackSupport: false,
        hasPrioritySupport: false
      };

    case 'pro':
      return {
        ...baseFeatures,
        hasPhoneSupport: true,
        hasSlackSupport: true,
        hasPrioritySupport: true
      };

    default:
      return {
        ...baseFeatures,
        hasPhoneSupport: false,
        hasSlackSupport: false,
        hasPrioritySupport: false
      };
  }
}

/**
 * Get subscription limits for a tier
 */
export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  switch (tier) {
    case 'starter':
      return {
        maxActiveRecurringMeetings: 0,
        maxReschedules: 0,
        maxNotesLength: 0,
        canCancelMeetings: false,
        canChangeMeetingType: false
      };

    case 'growth':
      return {
        maxActiveRecurringMeetings: 1,
        maxReschedules: 2, // 2 reschedules per month
        maxNotesLength: 500,
        canCancelMeetings: true,
        canChangeMeetingType: false
      };

    case 'pro':
      return {
        maxActiveRecurringMeetings: 2, // Could have both monthly and bi-weekly
        maxReschedules: 5,
        maxNotesLength: 1000,
        canCancelMeetings: true,
        canChangeMeetingType: true
      };

    default:
      return {
        maxActiveRecurringMeetings: 0,
        maxReschedules: 0,
        maxNotesLength: 0,
        canCancelMeetings: false,
        canChangeMeetingType: false
      };
  }
}

/**
 * Check if a tier can access a specific feature
 */
export function hasFeature(tier: SubscriptionTier, feature: keyof SubscriptionFeatures): boolean {
  const features = getSubscriptionFeatures(tier);
  return Boolean(features[feature]);
}

/**
 * Validate if user can create a new recurring meeting
 */
export function canCreateRecurringMeeting(
  tier: SubscriptionTier,
  currentActiveCount: number = 0
): { allowed: boolean; reason?: string } {
  if (!canAccessRecurringMeetings(tier)) {
    return {
      allowed: false,
      reason: `Recurring meetings are not included in the ${tier} plan. Upgrade to Growth or Pro for this feature.`
    };
  }

  const limits = getSubscriptionLimits(tier);
  if (currentActiveCount >= limits.maxActiveRecurringMeetings) {
    return {
      allowed: false,
      reason: `You've reached the limit of ${limits.maxActiveRecurringMeetings} recurring meeting${limits.maxActiveRecurringMeetings > 1 ? 's' : ''} for the ${tier} plan.`
    };
  }

  return { allowed: true };
}

/**
 * Validate if user can reschedule a meeting
 */
export function canRescheduleMeeting(
  tier: SubscriptionTier,
  monthlyRescheduleCount: number = 0
): { allowed: boolean; reason?: string; remaining?: number } {
  const limits = getSubscriptionLimits(tier);

  if (monthlyRescheduleCount >= limits.maxReschedules) {
    return {
      allowed: false,
      reason: `You've reached the limit of ${limits.maxReschedules} reschedules per month for the ${tier} plan.`,
      remaining: 0
    };
  }

  return {
    allowed: true,
    remaining: limits.maxReschedules - monthlyRescheduleCount
  };
}

/**
 * Get plan comparison data for upgrade prompts
 */
export function getPlanComparisons(): PlanComparison[] {
  return [
    {
      tier: 'starter',
      name: 'Starter',
      price: '$29/month',
      features: [
        'Voice-to-content AI automation',
        'Social media posting',
        'Basic email support',
        'Monthly performance reports'
      ],
      meetingFeatures: [
        'No recurring meetings included',
        'One-off strategy calls available'
      ],
      limitations: [
        'No recurring report briefs',
        'Email support only'
      ]
    },
    {
      tier: 'growth',
      name: 'Growth',
      price: '$59/month',
      recommended: true,
      features: [
        'Everything in Starter',
        'Monthly report brief meetings',
        'Phone support',
        'Advanced analytics',
        'Custom content templates'
      ],
      meetingFeatures: [
        'Monthly report brief meetings',
        'Google Calendar integration',
        'Meeting recordings',
        'Up to 2 reschedules per month'
      ]
    },
    {
      tier: 'pro',
      name: 'Pro',
      price: '$89/month',
      features: [
        'Everything in Growth',
        'Bi-weekly report brief meetings',
        'Priority support',
        'Slack integration',
        'Advanced automation',
        'Custom reporting'
      ],
      meetingFeatures: [
        'Bi-weekly report brief meetings',
        'All Growth meeting features',
        'Up to 5 reschedules per month',
        'Custom meeting types',
        'Extended meeting notes'
      ]
    }
  ];
}

/**
 * Get upgrade suggestion based on current tier and desired feature
 */
export function getUpgradeSuggestion(
  currentTier: SubscriptionTier,
  desiredFeature: 'recurring_meetings' | 'bi_weekly' | 'priority_support'
): { shouldUpgrade: boolean; recommendedTier?: SubscriptionTier; benefits: string[] } {
  const plans = getPlanComparisons();

  switch (desiredFeature) {
    case 'recurring_meetings':
      if (currentTier === 'starter') {
        return {
          shouldUpgrade: true,
          recommendedTier: 'growth',
          benefits: [
            'Monthly report brief meetings with Matt',
            'Automatic Google Calendar integration',
            'Never miss your business check-ins',
            'Phone support included'
          ]
        };
      }
      break;

    case 'bi_weekly':
      if (currentTier !== 'pro') {
        return {
          shouldUpgrade: true,
          recommendedTier: 'pro',
          benefits: [
            'Bi-weekly meetings for faster progress',
            'More frequent business guidance',
            'Priority support',
            'Advanced automation features'
          ]
        };
      }
      break;

    case 'priority_support':
      if (currentTier !== 'pro') {
        return {
          shouldUpgrade: true,
          recommendedTier: 'pro',
          benefits: [
            'Priority email and phone support',
            'Slack integration for quick questions',
            'Same-day response guarantee',
            'Direct line to Matt'
          ]
        };
      }
      break;
  }

  return {
    shouldUpgrade: false,
    benefits: []
  };
}

/**
 * Format subscription tier display name
 */
export function formatTierName(tier: SubscriptionTier): string {
  switch (tier) {
    case 'starter':
      return 'Starter';
    case 'growth':
      return 'Growth';
    case 'pro':
      return 'Pro';
    default:
      return tier.charAt(0).toUpperCase() + tier.slice(1);
  }
}

/**
 * Get tier color for UI display
 */
export function getTierColor(tier: SubscriptionTier): string {
  switch (tier) {
    case 'starter':
      return 'bg-gray-100 text-gray-800';
    case 'growth':
      return 'bg-primary/10 text-primary';
    case 'pro':
      return 'bg-accent/10 text-accent-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

/**
 * Check if tier allows specific frequency
 */
export function isTierFrequencyAllowed(tier: SubscriptionTier, frequency: RecurrenceFrequency): boolean {
  const allowed = getAllowedFrequencies(tier);
  return allowed.includes(frequency);
}

/**
 * Get next billing date estimate (helper for display)
 */
export function getNextBillingDate(): string {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return nextMonth.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Calculate monthly meeting value for tier
 */
export function calculateMeetingValue(tier: SubscriptionTier): {
  meetingsPerMonth: number;
  valuePerMeeting: number;
  totalValue: number;
} {
  const plans = getPlanComparisons();
  const plan = plans.find(p => p.tier === tier);
  const price = plan ? parseFloat(plan.price.replace(/[^0-9.]/g, '')) : 0;
  const meetingsPerMonth = getMaxMeetingsPerMonth(tier);

  return {
    meetingsPerMonth,
    valuePerMeeting: meetingsPerMonth > 0 ? price / meetingsPerMonth : 0,
    totalValue: price
  };
}

/**
 * Subscription validation errors
 */
export class SubscriptionError extends Error {
  constructor(
    message: string,
    public code: 'TIER_REQUIRED' | 'FEATURE_NOT_AVAILABLE' | 'LIMIT_EXCEEDED' | 'UPGRADE_REQUIRED'
  ) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

// Export all functions as default object
export default {
  getSubscriptionFeatures,
  getSubscriptionLimits,
  hasFeature,
  canCreateRecurringMeeting,
  canRescheduleMeeting,
  getPlanComparisons,
  getUpgradeSuggestion,
  formatTierName,
  getTierColor,
  isTierFrequencyAllowed,
  getNextBillingDate,
  calculateMeetingValue,
  SubscriptionError
};