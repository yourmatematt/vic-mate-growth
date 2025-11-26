/**
 * Tone Learning TypeScript Definitions
 * Data structures for aggregating user behaviour to learn their brand voice
 * This data will be used to train Claude on individual user preferences
 */

import type {
  ContentPlatform,
  ContentCalendarPost,
  ContentCalendarRevision,
  ContentCalendarComment,
} from './contentCalendar';

// ============================================================================
// CORE TONE PROFILE TYPES
// ============================================================================

/**
 * Comprehensive tone profile for a user/brand
 * Contains all data needed to understand their unique voice and style
 */
export interface ToneProfile {
  userId: string;
  profileGeneratedAt: string;
  dataCollectionPeriod: {
    startDate: string;
    endDate: string;
    totalDays: number;
  };

  // Content volume and activity
  activityMetrics: {
    totalPosts: number;
    totalRevisions: number;
    totalComments: number;
    postsPerPlatform: Record<ContentPlatform, number>;
    avgRevisionsPerPost: number;
    daysActive: number;
  };

  // Core writing style characteristics
  writingStyleProfile: WritingStyleProfile;

  // Platform-specific preferences
  platformPreferences: Record<ContentPlatform, PlatformToneProfile>;

  // Edit patterns showing what they consistently change
  editPatterns: EditPattern[];

  // Vocabulary and phrases they prefer
  vocabularyPreferences: VocabularyPreference;

  // Common feedback patterns from comments
  feedbackPatterns: FeedbackPattern[];

  // Rejection patterns - what they consistently avoid
  rejectionPatterns: RejectionPattern[];

  // Temporal patterns - how their style changes over time
  temporalPatterns: TemporalPattern[];

  // AI training recommendations
  trainingRecommendations: TrainingRecommendation[];
}

/**
 * Overall writing style characteristics
 */
export interface WritingStyleProfile {
  // Language formality and tone
  formalityScore: number; // 0-100, higher = more formal
  conversationalScore: number; // 0-100, higher = more conversational
  enthusiasmScore: number; // 0-100, based on exclamation marks, caps, etc.

  // Structural preferences
  averageSentenceLength: number;
  averageWordLength: number;
  paragraphStyle: 'short' | 'medium' | 'long'; // Based on avg paragraph length

  // Punctuation and formatting patterns
  emojiUsage: EmojiUsagePattern;
  punctuationStyle: PunctuationStyle;
  capitalizationStyle: CapitalizationStyle;

  // Content preferences
  callToActionStyle: CallToActionStyle;
  hashtagUsage: HashtagUsagePattern;
  questionUsage: QuestionUsagePattern;

  // Australian-specific patterns
  australianSlangUsage: number; // 0-100, frequency of Aussie terms
  localReferences: string[]; // Mentions of Australian places, culture, etc.

  // Brand voice characteristics
  personalityTraits: PersonalityTrait[];
  brandValues: string[]; // Extracted from consistent themes
  communicationApproach: 'professional' | 'friendly' | 'casual' | 'authoritative' | 'humorous';
}

/**
 * Platform-specific tone preferences
 */
export interface PlatformToneProfile {
  platform: ContentPlatform;
  postCount: number;

  // Style adaptations for this platform
  adaptedStyle: {
    formalityAdjustment: number; // -50 to +50, relative to base style
    lengthPreference: 'shorter' | 'longer' | 'same';
    emojiUsageAdjustment: number; // -50 to +50
    hashtagDensity: number; // hashtags per 100 words
  };

  // Platform-specific vocabulary
  preferredTerms: string[];
  avoidedTerms: string[];

  // Content themes for this platform
  commonTopics: string[];
  contentTypes: ('promotional' | 'educational' | 'personal' | 'news' | 'behind-the-scenes')[];
}

/**
 * Pattern of edits made to AI-generated content
 */
export interface EditPattern {
  patternId: string;
  patternType: 'vocabulary' | 'structure' | 'tone' | 'length' | 'formatting' | 'content';
  description: string;
  frequency: number; // How often this pattern occurs (0-100)
  confidence: number; // How confident we are this is a real pattern (0-100)

  examples: EditExample[];

  // What this tells us about user preferences
  insights: string[];

  // How to apply this in future AI generation
  aiGuidance: string;
}

/**
 * Specific example of an edit pattern
 */
export interface EditExample {
  postId: string;
  revisionId: string;
  platform: ContentPlatform;
  originalText: string;
  editedText: string;
  changeType: 'replacement' | 'addition' | 'deletion' | 'reordering';
  editedAt: string;
}

/**
 * User's vocabulary preferences and patterns
 */
export interface VocabularyPreference {
  // Words/phrases they consistently use
  favoriteWords: WordFrequency[];
  favoritePhrases: PhraseFrequency[];

  // Words/phrases they avoid or replace
  avoidedWords: WordReplacement[];

  // Industry/business specific terminology
  businessTerminology: string[];

  // Personal/brand expressions
  signaturePhrases: string[]; // Phrases unique to this user
  brandLanguage: string[]; // Consistent brand-related terms

  // Australian English preferences
  australianTerms: string[]; // Colour vs color, etc.
  slangTerms: string[]; // Fair dinkum, no worries, etc.

  // Sentiment vocabulary
  positiveWords: string[];
  urgencyWords: string[];
  trustWords: string[];
}

/**
 * Patterns from user feedback and comments
 */
export interface FeedbackPattern {
  patternType: 'praise' | 'concern' | 'suggestion' | 'instruction';
  commonThemes: string[];
  frequency: number;

  // What they commonly ask for
  commonRequests: string[];

  // Quality indicators they mention
  qualityIndicators: string[];

  // Examples of feedback
  examples: {
    comment: string;
    postContext: string;
    timestamp: string;
  }[];
}

/**
 * Things users consistently reject or change
 */
export interface RejectionPattern {
  rejectionType: 'vocabulary' | 'tone' | 'structure' | 'length' | 'topic';
  description: string;
  frequency: number;

  // Specific things they always change
  alwaysChanged: string[];

  // Things they never use
  neverUsed: string[];

  // Style elements they avoid
  avoidedStyles: string[];
}

/**
 * How their style changes over time
 */
export interface TemporalPattern {
  timeframe: 'weekly' | 'monthly' | 'seasonal';
  pattern: string;
  confidence: number;

  // Examples of how style evolves
  styleEvolution: {
    period: string;
    characteristics: string[];
    changes: string[];
  }[];
}

/**
 * Recommendations for AI training and prompts
 */
export interface TrainingRecommendation {
  category: 'voice' | 'style' | 'structure' | 'vocabulary' | 'platform-adaptation';
  priority: 'high' | 'medium' | 'low';

  // Specific guidance for Claude prompts
  promptGuidance: string;

  // Examples to include in training
  examplePrompts: string[];

  // What to emphasise or avoid
  emphasise: string[];
  avoid: string[];

  // Expected improvement
  expectedOutcome: string;
}

// ============================================================================
// DETAILED STYLE COMPONENT TYPES
// ============================================================================

export interface EmojiUsagePattern {
  frequency: number; // emojis per 100 words
  preferredEmojis: { emoji: string; frequency: number }[];
  emojiPlacement: 'beginning' | 'middle' | 'end' | 'mixed';
  emojiDensity: 'none' | 'light' | 'moderate' | 'heavy';
  contextualUsage: {
    promotional: number;
    celebratory: number;
    informational: number;
    emotional: number;
  };
}

export interface PunctuationStyle {
  exclamationUsage: number; // per 100 words
  questionUsage: number; // per 100 words
  ellipsisUsage: number;
  dashUsage: number; // em-dash or hyphen preference
  commaStyle: 'oxford' | 'standard';
  quotationStyle: 'single' | 'double';
}

export interface CapitalizationStyle {
  titleCaseUsage: number; // frequency of Title Case
  allCapsUsage: number; // frequency of ALL CAPS for emphasis
  sentenceCasePreference: number; // 0-100
  brandNameCapitalization: string[]; // How they capitalize their brand terms
}

export interface CallToActionStyle {
  frequency: number; // CTAs per post
  preferredCTAs: { phrase: string; frequency: number }[];
  ctaPlacement: 'beginning' | 'middle' | 'end' | 'mixed';
  ctaStyle: 'direct' | 'soft' | 'question-based' | 'benefit-focused';
  urgencyLevel: 'low' | 'medium' | 'high';
}

export interface HashtagUsagePattern {
  frequency: number; // hashtags per post
  averageHashtagsPerPost: number;
  hashtagPlacement: 'inline' | 'end' | 'mixed';
  hashtagStyle: 'CamelCase' | 'lowercase' | 'mixed';
  brandedHashtags: string[];
  industryHashtags: string[];
  locationHashtags: string[];
}

export interface QuestionUsagePattern {
  frequency: number; // questions per post
  questionTypes: ('open-ended' | 'yes-no' | 'multiple-choice' | 'rhetorical')[];
  questionPlacement: 'beginning' | 'middle' | 'end' | 'mixed';
  engagementQuestions: string[]; // Common engagement questions they use
}

export interface PersonalityTrait {
  trait: string;
  strength: number; // 0-100
  examples: string[];
  manifestations: string[]; // How this trait shows up in their writing
}

export interface WordFrequency {
  word: string;
  frequency: number;
  contexts: string[]; // Where they typically use this word
}

export interface PhraseFrequency {
  phrase: string;
  frequency: number;
  usage: string; // How they typically use this phrase
}

export interface WordReplacement {
  originalWord: string;
  replacementWord: string;
  frequency: number; // How often this replacement happens
  context: string; // When this replacement typically happens
}

// ============================================================================
// ANALYSIS INPUT TYPES
// ============================================================================

/**
 * Raw data input for tone analysis
 */
export interface ToneLearningInput {
  userId: string;
  posts: ContentCalendarPost[];
  revisions: ContentCalendarRevision[];
  comments: ContentCalendarComment[];
  timeframeStart: string;
  timeframeEnd: string;
}

/**
 * Individual edit analysis result
 */
export interface EditAnalysis {
  editType: 'word_replacement' | 'sentence_addition' | 'sentence_deletion' | 'reordering' | 'reformatting';
  originalSegment: string;
  editedSegment: string;
  significance: number; // 0-100, how significant this edit is
  category: 'vocabulary' | 'tone' | 'structure' | 'style' | 'content';
  insights: string[];
}

/**
 * Style metrics for a piece of text
 */
export interface StyleMetrics {
  // Basic metrics
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;

  // Readability
  averageSentenceLength: number;
  averageWordLength: number;
  readabilityScore: number; // Flesch-Kincaid or similar

  // Style indicators
  formalityScore: number;
  enthusiasmScore: number;
  professionalismScore: number;
  personalityScore: number;

  // Content analysis
  emojiCount: number;
  hashtagCount: number;
  questionCount: number;
  exclamationCount: number;

  // Australian specific
  australianTermCount: number;
  slangTermCount: number;

  // Business indicators
  ctaCount: number;
  businessTermCount: number;
  benefitStatementCount: number;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * API response for tone profile data
 */
export interface ToneProfileApiResponse {
  success: boolean;
  data?: ToneProfile;
  error?: {
    message: string;
    code: string;
  };
  meta: {
    generatedAt: string;
    processingTimeMs: number;
    dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
    recommendedMinimumData: string;
  };
}

/**
 * Batch analysis result for multiple users
 */
export interface BatchToneAnalysis {
  totalUsers: number;
  successfulAnalyses: number;
  failedAnalyses: number;
  results: {
    userId: string;
    success: boolean;
    profile?: ToneProfile;
    error?: string;
  }[];
  executionTime: number;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Configuration for tone analysis algorithms
 */
export interface ToneAnalysisConfig {
  // Minimum data requirements
  minimumPosts: number;
  minimumRevisions: number;
  minimumTimeframe: number; // days

  // Analysis sensitivity
  patternDetectionThreshold: number; // 0-100
  confidenceThreshold: number; // 0-100

  // Text processing options
  includeEmojis: boolean;
  includeHashtags: boolean;
  includeMentions: boolean;

  // Platform weighting
  platformWeights: Record<ContentPlatform, number>;

  // Feature flags
  enableTemporalAnalysis: boolean;
  enableSentimentAnalysis: boolean;
  enableAustralianTermDetection: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type ToneAnalysisQuality = 'excellent' | 'good' | 'fair' | 'poor';

export type EditPatternType = 'vocabulary' | 'structure' | 'tone' | 'length' | 'formatting' | 'content';

export type ChangeType = 'replacement' | 'addition' | 'deletion' | 'reordering';

export type PlatformAdaptation = 'formal_to_casual' | 'casual_to_formal' | 'shorter' | 'longer' | 'more_emojis' | 'fewer_emojis';

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  ToneProfile,
  WritingStyleProfile,
  PlatformToneProfile,
  EditPattern,
  EditExample,
  VocabularyPreference,
  FeedbackPattern,
  RejectionPattern,
  TemporalPattern,
  TrainingRecommendation,
  ToneLearningInput,
  EditAnalysis,
  StyleMetrics,
  ToneProfileApiResponse,
  BatchToneAnalysis,
  ToneAnalysisConfig,
};