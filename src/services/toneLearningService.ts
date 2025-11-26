/**
 * Tone Learning Service
 * Aggregates user behaviour data to learn their unique brand voice and writing style
 * This service prepares data for future Claude API integration to personalise content generation
 */

import { supabase } from '@/lib/supabase';
import contentCalendarService from './contentCalendarService';
import type {
  ContentCalendarPost,
  ContentCalendarRevision,
  ContentCalendarComment,
  ContentPlatform,
} from '@/types/contentCalendar';
import type {
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
  ToneAnalysisConfig,
  EmojiUsagePattern,
  PunctuationStyle,
  CapitalizationStyle,
  CallToActionStyle,
  HashtagUsagePattern,
  QuestionUsagePattern,
  WordFrequency,
  PhraseFrequency,
  WordReplacement,
  PersonalityTrait,
} from '@/types/toneLearning';

// ============================================================================
// CONFIGURATION AND CONSTANTS
// ============================================================================

/**
 * Default configuration for tone analysis
 */
const DEFAULT_ANALYSIS_CONFIG: ToneAnalysisConfig = {
  minimumPosts: 5,
  minimumRevisions: 3,
  minimumTimeframe: 7, // days
  patternDetectionThreshold: 60,
  confidenceThreshold: 70,
  includeEmojis: true,
  includeHashtags: true,
  includeMentions: true,
  platformWeights: {
    facebook: 1.0,
    instagram: 1.2, // Weight Instagram higher for visual brands
    linkedin: 0.8,  // More formal, less representative of casual brand voice
    twitter: 1.1,   // Concise, representative of brand voice
  },
  enableTemporalAnalysis: true,
  enableSentimentAnalysis: true,
  enableAustralianTermDetection: true,
};

/**
 * Australian English terms and slang for detection
 */
const AUSTRALIAN_TERMS = [
  // Common Australian English
  'colour', 'favour', 'honour', 'labour', 'neighbour', 'flavour',
  'centre', 'theatre', 'metre', 'litre',
  'realise', 'organise', 'recognise', 'analyse',

  // Australian slang
  'mate', 'g\'day', 'no worries', 'fair dinkum', 'bloody', 'arvo',
  'barbie', 'brekkie', 'cuppa', 'mozzie', 'sunnies', 'thongs',
  'ute', 'tradie', 'sparkie', 'postie', 'ambo', 'garbo',
  'heaps', 'ripper', 'bonzer', 'beaut', 'too right', 'she\'ll be right',
  'crikey', 'blimey', 'strewth', 'stone the crows',

  // Australian expressions
  'how ya going', 'good on ya', 'you beauty', 'fair shake of the sauce bottle',
  'flat out like a lizard drinking', 'mad as a cut snake',
];

/**
 * Business and call-to-action phrases
 */
const BUSINESS_CTA_PATTERNS = [
  // Direct CTAs
  /book now/gi, /call now/gi, /contact us/gi, /get started/gi, /learn more/gi,
  /find out more/gi, /discover/gi, /explore/gi, /try now/gi, /shop now/gi,

  // Soft CTAs
  /check it out/gi, /take a look/gi, /see for yourself/gi, /what do you think/gi,

  // Question-based CTAs
  /interested\?/gi, /want to know more\?/gi, /ready to/gi,

  // Australian style CTAs
  /give us a bell/gi, /drop us a line/gi, /have a chat/gi, /no worries/gi,
];

/**
 * Emoji regex patterns for analysis
 */
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;

// ============================================================================
// TEXT ANALYSIS UTILITIES
// ============================================================================

/**
 * Calculate comprehensive style metrics for a piece of text
 */
export function calculateStyleMetrics(text: string): StyleMetrics {
  if (!text || text.trim().length === 0) {
    return getEmptyStyleMetrics();
  }

  const cleanText = text.trim();
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);

  // Basic counts
  const emojiMatches = cleanText.match(EMOJI_REGEX) || [];
  const hashtagMatches = cleanText.match(/#\w+/g) || [];
  const questionMatches = cleanText.match(/\?/g) || [];
  const exclamationMatches = cleanText.match(/!/g) || [];

  // Australian terms detection
  const australianTermMatches = AUSTRALIAN_TERMS.filter(term =>
    cleanText.toLowerCase().includes(term.toLowerCase())
  );

  // Business indicators
  let ctaCount = 0;
  BUSINESS_CTA_PATTERNS.forEach(pattern => {
    const matches = cleanText.match(pattern);
    if (matches) ctaCount += matches.length;
  });

  // Calculate scores
  const averageSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  const averageWordLength = words.length > 0 ?
    words.reduce((sum, word) => sum + word.replace(/[^\w]/g, '').length, 0) / words.length : 0;

  const formalityScore = calculateFormalityScore(cleanText, words);
  const enthusiasmScore = calculateEnthusiasmScore(cleanText, exclamationMatches.length, emojiMatches.length);
  const professionalismScore = calculateProfessionalismScore(cleanText, ctaCount);

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    averageSentenceLength,
    averageWordLength,
    readabilityScore: calculateReadabilityScore(sentences, words),
    formalityScore,
    enthusiasmScore,
    professionalismScore,
    personalityScore: calculatePersonalityScore(cleanText),
    emojiCount: emojiMatches.length,
    hashtagCount: hashtagMatches.length,
    questionCount: questionMatches?.length || 0,
    exclamationCount: exclamationMatches?.length || 0,
    australianTermCount: australianTermMatches.length,
    slangTermCount: countSlangTerms(cleanText),
    ctaCount,
    businessTermCount: countBusinessTerms(cleanText),
    benefitStatementCount: countBenefitStatements(cleanText),
  };
}

/**
 * Analyze differences between original and edited text
 */
export function analyzeEditPatterns(original: string, edited: string): EditAnalysis[] {
  if (!original || !edited) return [];

  const analyses: EditAnalysis[] = [];

  // Word-level analysis
  const originalWords = original.toLowerCase().split(/\s+/);
  const editedWords = edited.toLowerCase().split(/\s+/);

  // Find replacements
  const replacements = findWordReplacements(originalWords, editedWords);
  replacements.forEach(replacement => {
    analyses.push({
      editType: 'word_replacement',
      originalSegment: replacement.original,
      editedSegment: replacement.replacement,
      significance: replacement.significance,
      category: categorizeWordChange(replacement.original, replacement.replacement),
      insights: generateWordChangeInsights(replacement.original, replacement.replacement),
    });
  });

  // Sentence-level analysis
  const originalSentences = original.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const editedSentences = edited.split(/[.!?]+/).filter(s => s.trim().length > 0);

  if (editedSentences.length > originalSentences.length) {
    analyses.push({
      editType: 'sentence_addition',
      originalSegment: '',
      editedSegment: findAddedSentences(originalSentences, editedSentences).join('. '),
      significance: 80,
      category: 'content',
      insights: ['User tends to add more detail or explanation', 'Prefers longer, more comprehensive content'],
    });
  }

  if (editedSentences.length < originalSentences.length) {
    analyses.push({
      editType: 'sentence_deletion',
      originalSegment: findRemovedSentences(originalSentences, editedSentences).join('. '),
      editedSegment: '',
      significance: 85,
      category: 'structure',
      insights: ['User prefers more concise content', 'May find AI content too verbose'],
    });
  }

  // Style analysis
  const originalStyle = calculateStyleMetrics(original);
  const editedStyle = calculateStyleMetrics(edited);

  if (Math.abs(originalStyle.formalityScore - editedStyle.formalityScore) > 20) {
    analyses.push({
      editType: 'reformatting',
      originalSegment: `Formality: ${originalStyle.formalityScore}%`,
      editedSegment: `Formality: ${editedStyle.formalityScore}%`,
      significance: 70,
      category: 'tone',
      insights: editedStyle.formalityScore > originalStyle.formalityScore ?
        ['User prefers more formal tone', 'Professional communication style'] :
        ['User prefers more casual tone', 'Conversational communication style'],
    });
  }

  return analyses;
}

/**
 * Extract key phrases and vocabulary from text
 */
export function extractKeyPhrases(text: string): { phrases: string[]; keywords: string[] } {
  if (!text) return { phrases: [], keywords: [] };

  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, ' ');

  // Extract phrases (2-4 words)
  const words = cleanText.split(/\s+/).filter(w => w.length > 2);
  const phrases: string[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    // 2-word phrases
    if (i < words.length - 1) {
      phrases.push(words[i] + ' ' + words[i + 1]);
    }
    // 3-word phrases
    if (i < words.length - 2) {
      phrases.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
    }
  }

  // Extract keywords (filter out common words)
  const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'a', 'an', 'this', 'that', 'these', 'those']);

  const keywords = words.filter(word =>
    word.length > 3 &&
    !commonWords.has(word) &&
    !/^\d+$/.test(word)
  );

  return {
    phrases: [...new Set(phrases)].slice(0, 20), // Top 20 unique phrases
    keywords: [...new Set(keywords)].slice(0, 30), // Top 30 unique keywords
  };
}

// ============================================================================
// MAIN SERVICE FUNCTIONS
// ============================================================================

/**
 * Generate comprehensive tone profile for a user
 * This is the main function that aggregates all user data for AI training
 */
export async function getUserToneProfile(userId: string, timeframeStart?: Date, timeframeEnd?: Date): Promise<ToneProfile> {
  const startTime = Date.now();

  // Set default timeframe (last 90 days)
  const endDate = timeframeEnd || new Date();
  const startDate = timeframeStart || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  console.log(`Generating tone profile for user ${userId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

  try {
    // Gather all user data
    const userData = await gatherUserData(userId, startDate, endDate);

    if (!validateDataSufficiency(userData)) {
      throw new Error('Insufficient data for reliable tone analysis. User needs more posts and revisions.');
    }

    // Analyze the data
    const profile: ToneProfile = {
      userId,
      profileGeneratedAt: new Date().toISOString(),
      dataCollectionPeriod: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalDays: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      },

      // Calculate activity metrics
      activityMetrics: calculateActivityMetrics(userData),

      // Analyze writing style
      writingStyleProfile: analyzeWritingStyle(userData),

      // Platform-specific analysis
      platformPreferences: analyzePlatformPreferences(userData),

      // Edit pattern analysis
      editPatterns: analyzeUserEditPatterns(userData),

      // Vocabulary analysis
      vocabularyPreferences: analyzeVocabularyPreferences(userData),

      // Feedback analysis
      feedbackPatterns: analyzeFeedbackPatterns(userData),

      // Rejection patterns
      rejectionPatterns: analyzeRejectionPatterns(userData),

      // Temporal patterns
      temporalPatterns: analyzeTemporalPatterns(userData),

      // AI training recommendations
      trainingRecommendations: generateTrainingRecommendations(userData),
    };

    console.log(`Tone profile generated in ${Date.now() - startTime}ms`);
    return profile;

  } catch (error) {
    console.error('Error generating tone profile:', error);
    throw new Error(`Failed to generate tone profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gather all user data needed for tone analysis
 */
async function gatherUserData(userId: string, startDate: Date, endDate: Date): Promise<ToneLearningInput> {
  console.log('Gathering user data for tone analysis...');

  // Fetch posts in date range
  const { data: postsResponse } = await supabase
    .from('content_calendar_posts')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true });

  const posts = postsResponse || [];

  if (posts.length === 0) {
    throw new Error('No posts found in the specified timeframe');
  }

  // Fetch all revisions for these posts
  const postIds = posts.map(p => p.id);
  const { data: revisionsResponse } = await supabase
    .from('content_calendar_revisions')
    .select('*')
    .in('post_id', postIds)
    .order('created_at', { ascending: true });

  const revisions = revisionsResponse || [];

  // Fetch all comments for these posts
  const { data: commentsResponse } = await supabase
    .from('content_calendar_comments')
    .select('*')
    .in('post_id', postIds)
    .order('created_at', { ascending: true });

  const comments = commentsResponse || [];

  console.log(`Gathered ${posts.length} posts, ${revisions.length} revisions, ${comments.length} comments`);

  return {
    userId,
    posts,
    revisions,
    comments,
    timeframeStart: startDate.toISOString(),
    timeframeEnd: endDate.toISOString(),
  };
}

/**
 * Validate that we have sufficient data for reliable analysis
 */
function validateDataSufficiency(data: ToneLearningInput): boolean {
  const config = DEFAULT_ANALYSIS_CONFIG;

  return (
    data.posts.length >= config.minimumPosts &&
    data.revisions.length >= config.minimumRevisions &&
    data.posts.some(post => post.current_caption.length > 50) // At least one substantial post
  );
}

/**
 * Calculate activity metrics
 */
function calculateActivityMetrics(data: ToneLearningInput) {
  const postsPerPlatform = data.posts.reduce((acc, post) => {
    acc[post.platform] = (acc[post.platform] || 0) + 1;
    return acc;
  }, {} as Record<ContentPlatform, number>);

  // Ensure all platforms are represented
  const platformCounts: Record<ContentPlatform, number> = {
    facebook: postsPerPlatform.facebook || 0,
    instagram: postsPerPlatform.instagram || 0,
    linkedin: postsPerPlatform.linkedin || 0,
    twitter: postsPerPlatform.twitter || 0,
  };

  const avgRevisionsPerPost = data.posts.length > 0 ? data.revisions.length / data.posts.length : 0;

  // Calculate active days
  const postDates = data.posts.map(p => new Date(p.created_at).toDateString());
  const uniqueDays = new Set(postDates);

  return {
    totalPosts: data.posts.length,
    totalRevisions: data.revisions.length,
    totalComments: data.comments.length,
    postsPerPlatform: platformCounts,
    avgRevisionsPerPost: Number(avgRevisionsPerPost.toFixed(2)),
    daysActive: uniqueDays.size,
  };
}

/**
 * Analyze overall writing style
 */
function analyzeWritingStyle(data: ToneLearningInput): WritingStyleProfile {
  // Combine all captions for analysis
  const allCaptions = data.posts.map(p => p.current_caption).join(' ');
  const allOriginalCaptions = data.posts.map(p => p.original_caption).join(' ');
  const styleMetrics = calculateStyleMetrics(allCaptions);

  // Analyze emoji usage
  const emojiUsage = analyzeEmojiUsage(data.posts);

  // Analyze punctuation style
  const punctuationStyle = analyzePunctuationStyle(allCaptions);

  // Analyze capitalization
  const capitalizationStyle = analyzeCapitalizationStyle(allCaptions);

  // Analyze CTAs
  const ctaStyle = analyzeCallToActionStyle(data.posts);

  // Analyze hashtags
  const hashtagUsage = analyzeHashtagUsage(data.posts);

  // Analyze questions
  const questionUsage = analyzeQuestionUsage(data.posts);

  // Personality traits
  const personalityTraits = analyzePersonalityTraits(allCaptions);

  return {
    formalityScore: styleMetrics.formalityScore,
    conversationalScore: 100 - styleMetrics.formalityScore, // Inverse relationship
    enthusiasmScore: styleMetrics.enthusiasmScore,
    averageSentenceLength: styleMetrics.averageSentenceLength,
    averageWordLength: styleMetrics.averageWordLength,
    paragraphStyle: styleMetrics.averageSentenceLength > 20 ? 'long' :
                   styleMetrics.averageSentenceLength > 12 ? 'medium' : 'short',
    emojiUsage,
    punctuationStyle,
    capitalizationStyle,
    callToActionStyle: ctaStyle,
    hashtagUsage,
    questionUsage,
    australianSlangUsage: (styleMetrics.australianTermCount / styleMetrics.wordCount) * 100,
    localReferences: extractAustralianReferences(allCaptions),
    personalityTraits,
    brandValues: extractBrandValues(allCaptions),
    communicationApproach: determineCommunicationApproach(styleMetrics),
  };
}

/**
 * Analyze platform-specific preferences
 */
function analyzePlatformPreferences(data: ToneLearningInput): Record<ContentPlatform, PlatformToneProfile> {
  const platforms: ContentPlatform[] = ['facebook', 'instagram', 'linkedin', 'twitter'];

  const preferences: Record<ContentPlatform, PlatformToneProfile> = {} as Record<ContentPlatform, PlatformToneProfile>;

  platforms.forEach(platform => {
    const platformPosts = data.posts.filter(p => p.platform === platform);

    if (platformPosts.length === 0) {
      // Default empty profile for unused platforms
      preferences[platform] = createEmptyPlatformProfile(platform);
      return;
    }

    const platformCaptions = platformPosts.map(p => p.current_caption).join(' ');
    const platformMetrics = calculateStyleMetrics(platformCaptions);

    // Compare to overall style
    const overallCaptions = data.posts.map(p => p.current_caption).join(' ');
    const overallMetrics = calculateStyleMetrics(overallCaptions);

    preferences[platform] = {
      platform,
      postCount: platformPosts.length,
      adaptedStyle: {
        formalityAdjustment: platformMetrics.formalityScore - overallMetrics.formalityScore,
        lengthPreference: platformMetrics.averageSentenceLength > overallMetrics.averageSentenceLength ? 'longer' :
                         platformMetrics.averageSentenceLength < overallMetrics.averageSentenceLength ? 'shorter' : 'same',
        emojiUsageAdjustment: platformMetrics.emojiCount - overallMetrics.emojiCount,
        hashtagDensity: (platformMetrics.hashtagCount / platformMetrics.wordCount) * 100,
      },
      preferredTerms: extractTopTerms(platformCaptions),
      avoidedTerms: [], // Would need comparison data
      commonTopics: extractTopics(platformCaptions),
      contentTypes: classifyContentTypes(platformPosts),
    };
  });

  return preferences;
}

/**
 * Analyze edit patterns to understand user preferences
 */
function analyzeUserEditPatterns(data: ToneLearningInput): EditPattern[] {
  const patterns: EditPattern[] = [];

  // Group revisions by post to analyze edit patterns
  const revisionsByPost = data.revisions.reduce((acc, revision) => {
    if (!acc[revision.post_id]) acc[revision.post_id] = [];
    acc[revision.post_id].push(revision);
    return acc;
  }, {} as Record<string, ContentCalendarRevision[]>);

  Object.entries(revisionsByPost).forEach(([postId, revisions]) => {
    const post = data.posts.find(p => p.id === postId);
    if (!post || revisions.length === 0) return;

    // Sort revisions chronologically
    revisions.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Analyze changes from original to first revision
    if (revisions.length > 0) {
      const editAnalyses = analyzeEditPatterns(post.original_caption, revisions[0].caption);

      editAnalyses.forEach(analysis => {
        // Find existing pattern or create new one
        let existingPattern = patterns.find(p =>
          p.patternType === analysis.category &&
          p.description.includes(analysis.insights[0])
        );

        if (existingPattern) {
          existingPattern.frequency += 1;
          existingPattern.examples.push({
            postId,
            revisionId: revisions[0].id,
            platform: post.platform,
            originalText: analysis.originalSegment,
            editedText: analysis.editedSegment,
            changeType: 'replacement',
            editedAt: revisions[0].created_at,
          });
        } else {
          patterns.push({
            patternId: `${analysis.category}_${Date.now()}`,
            patternType: analysis.category,
            description: analysis.insights.join('; '),
            frequency: 1,
            confidence: analysis.significance,
            examples: [{
              postId,
              revisionId: revisions[0].id,
              platform: post.platform,
              originalText: analysis.originalSegment,
              editedText: analysis.editedSegment,
              changeType: 'replacement',
              editedAt: revisions[0].created_at,
            }],
            insights: analysis.insights,
            aiGuidance: generateAIGuidance(analysis),
          });
        }
      });
    }
  });

  // Calculate final frequency percentages
  const totalEdits = patterns.reduce((sum, p) => sum + p.frequency, 0);
  patterns.forEach(pattern => {
    pattern.frequency = totalEdits > 0 ? (pattern.frequency / totalEdits) * 100 : 0;
  });

  return patterns.filter(p => p.frequency >= DEFAULT_ANALYSIS_CONFIG.patternDetectionThreshold);
}

/**
 * Analyze vocabulary preferences
 */
function analyzeVocabularyPreferences(data: ToneLearningInput): VocabularyPreference {
  const allCaptions = data.posts.map(p => p.current_caption).join(' ');
  const { phrases, keywords } = extractKeyPhrases(allCaptions);

  // Count word frequencies
  const wordCounts = new Map<string, number>();
  const phraseCounts = new Map<string, number>();

  keywords.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });

  phrases.forEach(phrase => {
    phraseCounts.set(phrase, (phraseCounts.get(phrase) || 0) + 1);
  });

  // Convert to sorted arrays
  const favoriteWords: WordFrequency[] = Array.from(wordCounts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word, frequency]) => ({
      word,
      frequency,
      contexts: extractWordContexts(word, data.posts),
    }));

  const favoritePhrases: PhraseFrequency[] = Array.from(phraseCounts.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([phrase, frequency]) => ({
      phrase,
      frequency,
      usage: extractPhraseUsage(phrase, allCaptions),
    }));

  return {
    favoriteWords,
    favoritePhrases,
    avoidedWords: [], // Would need comparison with AI original vs edited
    businessTerminology: extractBusinessTerms(allCaptions),
    signaturePhrases: extractSignaturePhrases(data.posts),
    brandLanguage: extractBrandLanguage(allCaptions),
    australianTerms: extractAustralianTerms(allCaptions),
    slangTerms: extractSlangTerms(allCaptions),
    positiveWords: extractPositiveWords(allCaptions),
    urgencyWords: extractUrgencyWords(allCaptions),
    trustWords: extractTrustWords(allCaptions),
  };
}

/**
 * Analyze feedback patterns from comments
 */
function analyzeFeedbackPatterns(data: ToneLearningInput): FeedbackPattern[] {
  if (data.comments.length === 0) {
    return [];
  }

  const patterns: FeedbackPattern[] = [];

  // Categorize comments
  const praiseComments = data.comments.filter(c => isPraiseComment(c.comment));
  const concernComments = data.comments.filter(c => isConcernComment(c.comment));
  const suggestionComments = data.comments.filter(c => isSuggestionComment(c.comment));

  if (praiseComments.length > 0) {
    patterns.push({
      patternType: 'praise',
      commonThemes: extractCommentThemes(praiseComments.map(c => c.comment)),
      frequency: (praiseComments.length / data.comments.length) * 100,
      commonRequests: [],
      qualityIndicators: extractQualityIndicators(praiseComments.map(c => c.comment)),
      examples: praiseComments.slice(0, 3).map(c => ({
        comment: c.comment,
        postContext: findPostContext(c.post_id, data.posts),
        timestamp: c.created_at,
      })),
    });
  }

  // Similar for concerns and suggestions...

  return patterns;
}

/**
 * Analyze patterns of what users consistently reject or change
 */
function analyzeRejectionPatterns(data: ToneLearningInput): RejectionPattern[] {
  const patterns: RejectionPattern[] = [];

  // Analyze what gets consistently changed from AI original to user edit
  const editComparisons = data.posts.map(post => {
    const firstRevision = data.revisions.find(r => r.post_id === post.id && r.revision_number === 1);
    if (!firstRevision) return null;

    return {
      original: post.original_caption,
      edited: firstRevision.caption,
      platform: post.platform,
    };
  }).filter(Boolean);

  if (editComparisons.length > 0) {
    // Find consistently removed words/phrases
    const alwaysRemovedTerms = findConsistentlyRemovedTerms(editComparisons);
    const alwaysChangedPatterns = findConsistentlyChangedPatterns(editComparisons);

    if (alwaysRemovedTerms.length > 0) {
      patterns.push({
        rejectionType: 'vocabulary',
        description: 'Terms consistently removed from AI-generated content',
        frequency: 100, // If they always remove it, it's 100%
        alwaysChanged: alwaysRemovedTerms,
        neverUsed: alwaysRemovedTerms,
        avoidedStyles: [],
      });
    }

    if (alwaysChangedPatterns.length > 0) {
      patterns.push({
        rejectionType: 'structure',
        description: 'Writing patterns consistently modified',
        frequency: 90,
        alwaysChanged: alwaysChangedPatterns,
        neverUsed: [],
        avoidedStyles: alwaysChangedPatterns,
      });
    }
  }

  return patterns;
}

/**
 * Analyze temporal patterns in user behaviour
 */
function analyzeTemporalPatterns(data: ToneLearningInput): TemporalPattern[] {
  if (!DEFAULT_ANALYSIS_CONFIG.enableTemporalAnalysis) {
    return [];
  }

  // Group posts by month to see evolution
  const postsByMonth = data.posts.reduce((acc, post) => {
    const monthKey = new Date(post.created_at).toISOString().substring(0, 7); // YYYY-MM
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(post);
    return acc;
  }, {} as Record<string, ContentCalendarPost[]>);

  const patterns: TemporalPattern[] = [];

  // Analyze style evolution month by month
  const months = Object.keys(postsByMonth).sort();
  if (months.length >= 2) {
    const styleEvolution = months.map(month => {
      const monthPosts = postsByMonth[month];
      const monthCaptions = monthPosts.map(p => p.current_caption).join(' ');
      const monthStyle = calculateStyleMetrics(monthCaptions);

      return {
        period: month,
        characteristics: [
          `Formality: ${monthStyle.formalityScore.toFixed(0)}%`,
          `Enthusiasm: ${monthStyle.enthusiasmScore.toFixed(0)}%`,
          `Avg sentence length: ${monthStyle.averageSentenceLength.toFixed(1)} words`,
          `Emoji usage: ${monthStyle.emojiCount} emojis`,
        ],
        changes: [], // Would compare to previous month
      };
    });

    patterns.push({
      timeframe: 'monthly',
      pattern: 'Writing style evolution over time',
      confidence: 80,
      styleEvolution,
    });
  }

  return patterns;
}

/**
 * Generate AI training recommendations based on analysis
 */
function generateTrainingRecommendations(data: ToneLearningInput): TrainingRecommendation[] {
  const recommendations: TrainingRecommendation[] = [];

  const overallStyle = calculateStyleMetrics(data.posts.map(p => p.current_caption).join(' '));

  // Voice recommendations
  if (overallStyle.australianTermCount > 0) {
    recommendations.push({
      category: 'voice',
      priority: 'high',
      promptGuidance: 'Use Australian English spelling and incorporate casual Australian expressions when appropriate. The user prefers a mate-like, approachable tone.',
      examplePrompts: [
        'Write in Australian English with casual, friendly language',
        'Use Australian spelling (colour, centre, realise) and expressions like "no worries", "g\'day", "fair dinkum"',
      ],
      emphasise: ['Australian spelling', 'Casual tone', 'Local expressions'],
      avoid: ['American spelling', 'Overly formal language', 'Corporate jargon'],
      expectedOutcome: 'Content that feels authentically Australian and matches the user\'s natural communication style',
    });
  }

  // Style recommendations
  if (overallStyle.formalityScore < 40) {
    recommendations.push({
      category: 'style',
      priority: 'high',
      promptGuidance: 'Maintain a casual, conversational tone. Avoid formal business language.',
      examplePrompts: [
        'Write in a casual, friendly tone like talking to a mate',
        'Use simple, everyday language that feels natural and approachable',
      ],
      emphasise: ['Conversational language', 'Simple words', 'Personal connection'],
      avoid: ['Formal vocabulary', 'Corporate speak', 'Complex sentences'],
      expectedOutcome: 'Content that sounds natural and authentic to the user\'s voice',
    });
  }

  // Platform adaptation recommendations
  const platformCounts = data.posts.reduce((acc, post) => {
    acc[post.platform] = (acc[post.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const primaryPlatform = Object.entries(platformCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0] as ContentPlatform;

  if (primaryPlatform) {
    recommendations.push({
      category: 'platform-adaptation',
      priority: 'medium',
      promptGuidance: `Optimise content for ${primaryPlatform}. This user posts most frequently on this platform.`,
      examplePrompts: [
        `Write content optimised for ${primaryPlatform} best practices`,
        `Adapt tone and length for ${primaryPlatform} audience expectations`,
      ],
      emphasise: [`${primaryPlatform} optimisation`, 'Platform-appropriate length', 'Relevant hashtags'],
      avoid: ['One-size-fits-all content', 'Platform-inappropriate formatting'],
      expectedOutcome: `Content specifically tailored for ${primaryPlatform} that performs better`,
    });
  }

  return recommendations;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getEmptyStyleMetrics(): StyleMetrics {
  return {
    wordCount: 0,
    sentenceCount: 0,
    paragraphCount: 0,
    averageSentenceLength: 0,
    averageWordLength: 0,
    readabilityScore: 0,
    formalityScore: 0,
    enthusiasmScore: 0,
    professionalismScore: 0,
    personalityScore: 0,
    emojiCount: 0,
    hashtagCount: 0,
    questionCount: 0,
    exclamationCount: 0,
    australianTermCount: 0,
    slangTermCount: 0,
    ctaCount: 0,
    businessTermCount: 0,
    benefitStatementCount: 0,
  };
}

function calculateFormalityScore(text: string, words: string[]): number {
  let formalityIndicators = 0;
  const totalWords = words.length;

  // Formal indicators
  const formalWords = ['therefore', 'furthermore', 'consequently', 'nevertheless', 'however', 'moreover'];
  const contractionPattern = /\w+'\w+/g;
  const contractionsCount = (text.match(contractionPattern) || []).length;

  formalWords.forEach(word => {
    if (text.toLowerCase().includes(word)) formalityIndicators += 2;
  });

  // Subtract points for contractions (casual indicators)
  formalityIndicators -= contractionsCount;

  // Calculate percentage
  const score = Math.max(0, Math.min(100, (formalityIndicators / totalWords) * 100 + 50));
  return Math.round(score);
}

function calculateEnthusiasmScore(text: string, exclamationCount: number, emojiCount: number): number {
  const enthusiasmWords = ['amazing', 'awesome', 'fantastic', 'incredible', 'love', 'excited', 'thrilled'];
  let enthusiasmIndicators = exclamationCount * 10 + emojiCount * 5;

  enthusiasmWords.forEach(word => {
    if (text.toLowerCase().includes(word)) enthusiasmIndicators += 5;
  });

  return Math.min(100, enthusiasmIndicators);
}

function calculateProfessionalismScore(text: string, ctaCount: number): number {
  const professionalIndicators = ['service', 'quality', 'professional', 'expertise', 'experience'];
  let score = ctaCount * 10;

  professionalIndicators.forEach(word => {
    if (text.toLowerCase().includes(word)) score += 5;
  });

  return Math.min(100, score);
}

function calculatePersonalityScore(text: string): number {
  const personalWords = ['I', 'we', 'our', 'my', 'me', 'us'];
  let personalityCount = 0;

  personalWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) personalityCount += matches.length;
  });

  return Math.min(100, personalityCount * 5);
}

function calculateReadabilityScore(sentences: string[], words: string[]): number {
  // Simplified Flesch Reading Ease calculation
  if (sentences.length === 0 || words.length === 0) return 0;

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllables = 1.5; // Simplified assumption

  const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllables);
  return Math.max(0, Math.min(100, score));
}

function countSlangTerms(text: string): number {
  const slangTerms = ['mate', 'bloody', 'crikey', 'fair dinkum', 'no worries', 'g\'day'];
  return slangTerms.reduce((count, term) => {
    return count + (text.toLowerCase().includes(term) ? 1 : 0);
  }, 0);
}

function countBusinessTerms(text: string): number {
  const businessTerms = ['service', 'quality', 'professional', 'business', 'client', 'customer'];
  return businessTerms.reduce((count, term) => {
    return count + (text.toLowerCase().includes(term) ? 1 : 0);
  }, 0);
}

function countBenefitStatements(text: string): number {
  const benefitPatterns = [/save money/gi, /save time/gi, /improve/gi, /increase/gi, /better/gi];
  return benefitPatterns.reduce((count, pattern) => {
    const matches = text.match(pattern);
    return count + (matches ? matches.length : 0);
  }, 0);
}

// Additional helper functions for comprehensive analysis...
function findWordReplacements(original: string[], edited: string[]): { original: string; replacement: string; significance: number }[] {
  // Simplified word replacement detection
  const replacements: { original: string; replacement: string; significance: number }[] = [];

  // This would be more sophisticated in real implementation
  for (let i = 0; i < Math.min(original.length, edited.length); i++) {
    if (original[i] !== edited[i]) {
      replacements.push({
        original: original[i],
        replacement: edited[i],
        significance: 70,
      });
    }
  }

  return replacements;
}

function categorizeWordChange(original: string, replacement: string): 'vocabulary' | 'tone' | 'style' | 'structure' | 'content' {
  // Simple categorization logic
  if (original.length !== replacement.length) return 'structure';
  return 'vocabulary';
}

function generateWordChangeInsights(original: string, replacement: string): string[] {
  return [
    `User prefers "${replacement}" over "${original}"`,
    'Shows vocabulary preference pattern',
  ];
}

function findAddedSentences(original: string[], edited: string[]): string[] {
  // Simplified - would need more sophisticated diff algorithm
  return edited.slice(original.length);
}

function findRemovedSentences(original: string[], edited: string[]): string[] {
  // Simplified - would need more sophisticated diff algorithm
  return original.slice(edited.length);
}

function generateAIGuidance(analysis: EditAnalysis): string {
  return `When generating content, ${analysis.insights[0].toLowerCase()}`;
}

// Emoji analysis
function analyzeEmojiUsage(posts: ContentCalendarPost[]): EmojiUsagePattern {
  const allText = posts.map(p => p.current_caption).join(' ');
  const emojis = allText.match(EMOJI_REGEX) || [];
  const words = allText.split(/\s+/).length;

  const emojiCounts = emojis.reduce((acc, emoji) => {
    acc[emoji] = (acc[emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    frequency: words > 0 ? (emojis.length / words) * 100 : 0,
    preferredEmojis: Object.entries(emojiCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([emoji, frequency]) => ({ emoji, frequency })),
    emojiPlacement: 'mixed', // Would analyze actual placement
    emojiDensity: emojis.length === 0 ? 'none' :
                 emojis.length < words * 0.02 ? 'light' :
                 emojis.length < words * 0.05 ? 'moderate' : 'heavy',
    contextualUsage: {
      promotional: 0, // Would categorize posts and count
      celebratory: 0,
      informational: 0,
      emotional: 0,
    },
  };
}

function analyzePunctuationStyle(text: string): PunctuationStyle {
  const words = text.split(/\s+/).length;
  const exclamations = (text.match(/!/g) || []).length;
  const questions = (text.match(/\?/g) || []).length;
  const ellipsis = (text.match(/\.\.\./g) || []).length;
  const dashes = (text.match(/[-—]/g) || []).length;

  return {
    exclamationUsage: words > 0 ? (exclamations / words) * 100 : 0,
    questionUsage: words > 0 ? (questions / words) * 100 : 0,
    ellipsisUsage: ellipsis,
    dashUsage: dashes,
    commaStyle: 'standard', // Would need more analysis
    quotationStyle: 'double', // Would analyze quote patterns
  };
}

function analyzeCapitalizationStyle(text: string): CapitalizationStyle {
  const allCapsMatches = text.match(/\b[A-Z]{2,}\b/g) || [];
  const titleCaseMatches = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];

  return {
    titleCaseUsage: titleCaseMatches.length,
    allCapsUsage: allCapsMatches.length,
    sentenceCasePreference: 75, // Default assumption
    brandNameCapitalization: [], // Would extract from context
  };
}

function analyzeCallToActionStyle(posts: ContentCalendarPost[]): CallToActionStyle {
  const ctaCount = posts.reduce((count, post) => {
    let postCTAs = 0;
    BUSINESS_CTA_PATTERNS.forEach(pattern => {
      const matches = post.current_caption.match(pattern);
      if (matches) postCTAs += matches.length;
    });
    return count + postCTAs;
  }, 0);

  return {
    frequency: posts.length > 0 ? ctaCount / posts.length : 0,
    preferredCTAs: [], // Would analyze specific CTAs
    ctaPlacement: 'mixed',
    ctaStyle: 'friendly',
    urgencyLevel: 'medium',
  };
}

function analyzeHashtagUsage(posts: ContentCalendarPost[]): HashtagUsagePattern {
  const allHashtags = posts.flatMap(post =>
    post.current_caption.match(/#\w+/g) || []
  );

  return {
    frequency: posts.length > 0 ? allHashtags.length / posts.length : 0,
    averageHashtagsPerPost: posts.length > 0 ? allHashtags.length / posts.length : 0,
    hashtagPlacement: 'mixed',
    hashtagStyle: 'mixed',
    brandedHashtags: [],
    industryHashtags: [],
    locationHashtags: [],
  };
}

function analyzeQuestionUsage(posts: ContentCalendarPost[]): QuestionUsagePattern {
  const questionCount = posts.reduce((count, post) => {
    return count + (post.current_caption.match(/\?/g) || []).length;
  }, 0);

  return {
    frequency: posts.length > 0 ? questionCount / posts.length : 0,
    questionTypes: ['open-ended'], // Would categorize questions
    questionPlacement: 'mixed',
    engagementQuestions: [], // Would extract common questions
  };
}

function analyzePersonalityTraits(text: string): PersonalityTrait[] {
  // Simplified personality analysis
  const traits: PersonalityTrait[] = [];

  if (text.toLowerCase().includes('love') || text.toLowerCase().includes('passionate')) {
    traits.push({
      trait: 'Enthusiastic',
      strength: 80,
      examples: ['Uses words like "love" and "passionate"'],
      manifestations: ['Expressive language', 'Emotional connection'],
    });
  }

  if (text.toLowerCase().includes('help') || text.toLowerCase().includes('support')) {
    traits.push({
      trait: 'Helpful',
      strength: 75,
      examples: ['Frequently offers help and support'],
      manifestations: ['Service-oriented language', 'Customer focus'],
    });
  }

  return traits;
}

// Continue with remaining helper functions...
function createEmptyPlatformProfile(platform: ContentPlatform): PlatformToneProfile {
  return {
    platform,
    postCount: 0,
    adaptedStyle: {
      formalityAdjustment: 0,
      lengthPreference: 'same',
      emojiUsageAdjustment: 0,
      hashtagDensity: 0,
    },
    preferredTerms: [],
    avoidedTerms: [],
    commonTopics: [],
    contentTypes: [],
  };
}

function extractTopTerms(text: string): string[] {
  const { keywords } = extractKeyPhrases(text);
  return keywords.slice(0, 10);
}

function extractTopics(text: string): string[] {
  // Simplified topic extraction
  const topics = [];
  if (text.toLowerCase().includes('business')) topics.push('business');
  if (text.toLowerCase().includes('family')) topics.push('family');
  if (text.toLowerCase().includes('community')) topics.push('community');
  return topics;
}

function classifyContentTypes(posts: ContentCalendarPost[]): ('promotional' | 'educational' | 'personal' | 'news' | 'behind-the-scenes')[] {
  // Simplified classification
  return ['promotional', 'educational'];
}

function extractAustralianReferences(text: string): string[] {
  const references = [];
  if (text.toLowerCase().includes('australia')) references.push('Australia');
  if (text.toLowerCase().includes('sydney')) references.push('Sydney');
  if (text.toLowerCase().includes('melbourne')) references.push('Melbourne');
  return references;
}

function extractBrandValues(text: string): string[] {
  const values = [];
  if (text.toLowerCase().includes('quality')) values.push('Quality');
  if (text.toLowerCase().includes('trust')) values.push('Trust');
  if (text.toLowerCase().includes('community')) values.push('Community');
  return values;
}

function determineCommunicationApproach(metrics: StyleMetrics): 'professional' | 'friendly' | 'casual' | 'authoritative' | 'humorous' {
  if (metrics.formalityScore > 70) return 'professional';
  if (metrics.enthusiasmScore > 70) return 'friendly';
  if (metrics.formalityScore < 40) return 'casual';
  return 'friendly';
}

// Additional extraction functions...
function extractWordContexts(word: string, posts: ContentCalendarPost[]): string[] {
  const contexts = [];
  posts.forEach(post => {
    if (post.current_caption.toLowerCase().includes(word.toLowerCase())) {
      // Find the sentence containing the word
      const sentences = post.current_caption.split(/[.!?]/);
      const contextSentence = sentences.find(s => s.toLowerCase().includes(word.toLowerCase()));
      if (contextSentence) contexts.push(contextSentence.trim());
    }
  });
  return contexts.slice(0, 3); // Top 3 contexts
}

function extractPhraseUsage(phrase: string, text: string): string {
  // Simplified usage extraction
  return 'Common phrase usage';
}

function extractBusinessTerms(text: string): string[] {
  const businessTerms = ['service', 'quality', 'professional', 'business', 'client', 'customer', 'solution', 'expertise'];
  return businessTerms.filter(term => text.toLowerCase().includes(term));
}

function extractSignaturePhrases(posts: ContentCalendarPost[]): string[] {
  // Find phrases that appear in multiple posts
  const phraseCounts = new Map<string, number>();

  posts.forEach(post => {
    const sentences = post.current_caption.split(/[.!?]/).filter(s => s.trim().length > 0);
    sentences.forEach(sentence => {
      const cleaned = sentence.trim().toLowerCase();
      if (cleaned.length > 10) { // Only consider substantial phrases
        phraseCounts.set(cleaned, (phraseCounts.get(cleaned) || 0) + 1);
      }
    });
  });

  // Return phrases that appear more than once
  return Array.from(phraseCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([phrase]) => phrase)
    .slice(0, 5);
}

function extractBrandLanguage(text: string): string[] {
  // Extract capitalised terms that might be brand-related
  const brandTerms = text.match(/\b[A-Z][a-z]*(?:\s+[A-Z][a-z]*)*\b/g) || [];
  return [...new Set(brandTerms)].slice(0, 10);
}

function extractAustralianTerms(text: string): string[] {
  return AUSTRALIAN_TERMS.filter(term =>
    text.toLowerCase().includes(term.toLowerCase())
  );
}

function extractSlangTerms(text: string): string[] {
  const slangTerms = ['mate', 'bloody', 'crikey', 'fair dinkum', 'no worries', 'g\'day'];
  return slangTerms.filter(term => text.toLowerCase().includes(term));
}

function extractPositiveWords(text: string): string[] {
  const positiveWords = ['amazing', 'awesome', 'fantastic', 'great', 'wonderful', 'excellent', 'love', 'best'];
  return positiveWords.filter(word => text.toLowerCase().includes(word));
}

function extractUrgencyWords(text: string): string[] {
  const urgencyWords = ['now', 'today', 'hurry', 'limited', 'urgent', 'immediate', 'quick'];
  return urgencyWords.filter(word => text.toLowerCase().includes(word));
}

function extractTrustWords(text: string): string[] {
  const trustWords = ['guarantee', 'promise', 'reliable', 'trusted', 'proven', 'certified', 'licensed'];
  return trustWords.filter(word => text.toLowerCase().includes(word));
}

// Comment analysis helpers
function isPraiseComment(comment: string): boolean {
  const praiseWords = ['great', 'love', 'amazing', 'perfect', 'excellent', 'fantastic'];
  return praiseWords.some(word => comment.toLowerCase().includes(word));
}

function isConcernComment(comment: string): boolean {
  const concernWords = ['but', 'however', 'issue', 'problem', 'concern', 'worry'];
  return concernWords.some(word => comment.toLowerCase().includes(word));
}

function isSuggestionComment(comment: string): boolean {
  const suggestionWords = ['maybe', 'suggest', 'could', 'should', 'try', 'consider'];
  return suggestionWords.some(word => comment.toLowerCase().includes(word));
}

function extractCommentThemes(comments: string[]): string[] {
  // Simplified theme extraction
  const themes = [];
  const combinedComments = comments.join(' ').toLowerCase();

  if (combinedComments.includes('tone')) themes.push('tone concerns');
  if (combinedComments.includes('length')) themes.push('content length');
  if (combinedComments.includes('style')) themes.push('writing style');

  return themes;
}

function extractQualityIndicators(comments: string[]): string[] {
  const indicators = [];
  const combinedComments = comments.join(' ').toLowerCase();

  if (combinedComments.includes('clear')) indicators.push('clarity');
  if (combinedComments.includes('engaging')) indicators.push('engagement');
  if (combinedComments.includes('professional')) indicators.push('professionalism');

  return indicators;
}

function findPostContext(postId: string, posts: ContentCalendarPost[]): string {
  const post = posts.find(p => p.id === postId);
  return post ? post.current_caption.substring(0, 100) + '...' : 'Post context not available';
}

function findConsistentlyRemovedTerms(editComparisons: any[]): string[] {
  // Find terms that appear in original but never in edited versions
  const originalTerms = new Set<string>();
  const editedTerms = new Set<string>();

  editComparisons.forEach(comparison => {
    if (!comparison) return;

    comparison.original.toLowerCase().split(/\s+/).forEach((word: string) => {
      originalTerms.add(word.replace(/[^\w]/g, ''));
    });

    comparison.edited.toLowerCase().split(/\s+/).forEach((word: string) => {
      editedTerms.add(word.replace(/[^\w]/g, ''));
    });
  });

  // Terms that appear in original but never in edited
  return Array.from(originalTerms).filter(term =>
    term.length > 3 && !editedTerms.has(term)
  ).slice(0, 10);
}

function findConsistentlyChangedPatterns(editComparisons: any[]): string[] {
  // Simplified pattern detection
  const patterns = [];

  let formalToInformal = 0;
  let longToShort = 0;

  editComparisons.forEach(comparison => {
    if (!comparison) return;

    const originalMetrics = calculateStyleMetrics(comparison.original);
    const editedMetrics = calculateStyleMetrics(comparison.edited);

    if (editedMetrics.formalityScore < originalMetrics.formalityScore - 20) {
      formalToInformal++;
    }

    if (editedMetrics.wordCount < originalMetrics.wordCount * 0.8) {
      longToShort++;
    }
  });

  if (formalToInformal > editComparisons.length * 0.7) {
    patterns.push('makes content more casual');
  }

  if (longToShort > editComparisons.length * 0.7) {
    patterns.push('shortens content significantly');
  }

  return patterns;
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  getUserToneProfile,
  calculateStyleMetrics,
  analyzeEditPatterns,
  extractKeyPhrases,
};

export {
  getUserToneProfile,
  calculateStyleMetrics,
  analyzeEditPatterns,
  extractKeyPhrases,
  DEFAULT_ANALYSIS_CONFIG,
  AUSTRALIAN_TERMS,
};