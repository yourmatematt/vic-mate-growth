/**
 * Admin API Endpoint for Tone Profile Analysis
 * GET /api/tone-profile/:userId
 *
 * Returns comprehensive tone learning data for a specific user
 * This data will be used to train Claude on their unique brand voice
 */

import { getUserToneProfile, calculateStyleMetrics } from '@/services/toneLearningService';
import type { ToneProfileApiResponse } from '@/types/toneLearning';

/**
 * GET /api/tone-profile/:userId
 * Retrieve comprehensive tone profile for a user
 */
export async function getToneProfile(userId: string, timeframeStart?: string, timeframeEnd?: string): Promise<ToneProfileApiResponse> {
  const startTime = Date.now();

  try {
    console.log(`API: Generating tone profile for user ${userId}`);

    // Validate user ID
    if (!userId || typeof userId !== 'string' || userId.length === 0) {
      return {
        success: false,
        error: {
          message: 'Invalid user ID provided',
          code: 'INVALID_USER_ID',
        },
        meta: {
          generatedAt: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
          dataQuality: 'poor',
          recommendedMinimumData: 'User ID must be a valid string',
        },
      };
    }

    // Parse timeframe parameters
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (timeframeStart) {
      startDate = new Date(timeframeStart);
      if (isNaN(startDate.getTime())) {
        return {
          success: false,
          error: {
            message: 'Invalid start date format. Use ISO 8601 format (YYYY-MM-DD)',
            code: 'INVALID_START_DATE',
          },
          meta: {
            generatedAt: new Date().toISOString(),
            processingTimeMs: Date.now() - startTime,
            dataQuality: 'poor',
            recommendedMinimumData: 'Start date must be in ISO 8601 format',
          },
        };
      }
    }

    if (timeframeEnd) {
      endDate = new Date(timeframeEnd);
      if (isNaN(endDate.getTime())) {
        return {
          success: false,
          error: {
            message: 'Invalid end date format. Use ISO 8601 format (YYYY-MM-DD)',
            code: 'INVALID_END_DATE',
          },
          meta: {
            generatedAt: new Date().toISOString(),
            processingTimeMs: Date.now() - startTime,
            dataQuality: 'poor',
            recommendedMinimumData: 'End date must be in ISO 8601 format',
          },
        };
      }
    }

    // Validate date range
    if (startDate && endDate && startDate >= endDate) {
      return {
        success: false,
        error: {
          message: 'Start date must be before end date',
          code: 'INVALID_DATE_RANGE',
        },
        meta: {
          generatedAt: new Date().toISOString(),
          processingTimeMs: Date.now() - startTime,
          dataQuality: 'poor',
          recommendedMinimumData: 'Valid date range with start date before end date',
        },
      };
    }

    // Generate tone profile
    const profile = await getUserToneProfile(userId, startDate, endDate);

    // Determine data quality based on activity metrics
    let dataQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
    const { activityMetrics } = profile;

    if (activityMetrics.totalPosts >= 20 && activityMetrics.totalRevisions >= 10 && activityMetrics.daysActive >= 14) {
      dataQuality = 'excellent';
    } else if (activityMetrics.totalPosts >= 10 && activityMetrics.totalRevisions >= 5 && activityMetrics.daysActive >= 7) {
      dataQuality = 'good';
    } else if (activityMetrics.totalPosts >= 5 && activityMetrics.totalRevisions >= 2 && activityMetrics.daysActive >= 3) {
      dataQuality = 'fair';
    }

    // Generate recommendations for minimum data
    let recommendedMinimumData = '';
    if (dataQuality === 'poor') {
      const needsPosts = Math.max(0, 5 - activityMetrics.totalPosts);
      const needsRevisions = Math.max(0, 2 - activityMetrics.totalRevisions);
      const needsDays = Math.max(0, 3 - activityMetrics.daysActive);

      const recommendations = [];
      if (needsPosts > 0) recommendations.push(`${needsPosts} more posts`);
      if (needsRevisions > 0) recommendations.push(`${needsRevisions} more revisions`);
      if (needsDays > 0) recommendations.push(`${needsDays} more active days`);

      recommendedMinimumData = `For reliable tone analysis, user needs: ${recommendations.join(', ')}`;
    } else {
      recommendedMinimumData = 'Sufficient data available for reliable tone analysis';
    }

    const processingTime = Date.now() - startTime;

    console.log(`API: Tone profile generated successfully in ${processingTime}ms with ${dataQuality} quality`);

    return {
      success: true,
      data: profile,
      meta: {
        generatedAt: new Date().toISOString(),
        processingTimeMs: processingTime,
        dataQuality,
        recommendedMinimumData,
      },
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;

    console.error('API: Error generating tone profile:', error);

    // Handle specific error types
    let errorMessage = 'An unexpected error occurred while generating the tone profile';
    let errorCode = 'UNKNOWN_ERROR';

    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.message.includes('Insufficient data')) {
        errorCode = 'INSUFFICIENT_DATA';
      } else if (error.message.includes('No posts found')) {
        errorCode = 'NO_POSTS_FOUND';
      } else if (error.message.includes('Database')) {
        errorCode = 'DATABASE_ERROR';
      }
    }

    return {
      success: false,
      error: {
        message: errorMessage,
        code: errorCode,
      },
      meta: {
        generatedAt: new Date().toISOString(),
        processingTimeMs: processingTime,
        dataQuality: 'poor',
        recommendedMinimumData: 'Unable to determine due to error. Please ensure user has at least 5 posts with 2 revisions over 3+ days.',
      },
    };
  }
}

/**
 * POST /api/tone-profile/batch
 * Generate tone profiles for multiple users
 */
export async function getBatchToneProfiles(userIds: string[], timeframeStart?: string, timeframeEnd?: string) {
  const startTime = Date.now();
  const results = [];

  console.log(`API: Generating batch tone profiles for ${userIds.length} users`);

  for (const userId of userIds) {
    try {
      const profile = await getUserToneProfile(
        userId,
        timeframeStart ? new Date(timeframeStart) : undefined,
        timeframeEnd ? new Date(timeframeEnd) : undefined
      );

      results.push({
        userId,
        success: true,
        profile,
      });

    } catch (error) {
      console.error(`API: Error generating tone profile for user ${userId}:`, error);

      results.push({
        userId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const executionTime = Date.now() - startTime;
  const successfulAnalyses = results.filter(r => r.success).length;
  const failedAnalyses = results.filter(r => !r.success).length;

  console.log(`API: Batch tone profile generation completed in ${executionTime}ms. ${successfulAnalyses} successful, ${failedAnalyses} failed.`);

  return {
    totalUsers: userIds.length,
    successfulAnalyses,
    failedAnalyses,
    results,
    executionTime,
  };
}

/**
 * GET /api/tone-profile/:userId/summary
 * Get a lightweight summary of user's tone profile
 */
export async function getToneProfileSummary(userId: string) {
  try {
    const profile = await getUserToneProfile(userId);

    // Create a lightweight summary for quick reference
    return {
      userId: profile.userId,
      activityLevel: profile.activityMetrics.totalPosts >= 20 ? 'high' :
                    profile.activityMetrics.totalPosts >= 10 ? 'medium' : 'low',
      primaryStyle: {
        formality: profile.writingStyleProfile.formalityScore,
        enthusiasm: profile.writingStyleProfile.enthusiasmScore,
        conversational: profile.writingStyleProfile.conversationalScore,
        communicationApproach: profile.writingStyleProfile.communicationApproach,
      },
      topPlatform: Object.entries(profile.activityMetrics.postsPerPlatform)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none',
      keyTraits: profile.writingStyleProfile.personalityTraits.map(t => t.trait),
      australianLanguage: {
        slangUsage: profile.writingStyleProfile.australianSlangUsage,
        localReferences: profile.writingStyleProfile.localReferences.length > 0,
      },
      dataQuality: profile.activityMetrics.totalPosts >= 10 ? 'good' : 'limited',
      lastUpdated: profile.profileGeneratedAt,
    };

  } catch (error) {
    console.error('Error generating tone profile summary:', error);
    throw error;
  }
}

/**
 * GET /api/tone-profile/:userId/claude-prompt
 * Generate a Claude AI prompt based on user's tone profile
 * This is the key function that prepares data for AI training
 */
export async function getClaudeTrainingPrompt(userId: string) {
  try {
    const profile = await getUserToneProfile(userId);

    // Build comprehensive prompt for Claude based on tone profile
    const prompt = generateClaudePrompt(profile);

    return {
      userId: profile.userId,
      prompt,
      promptLength: prompt.length,
      dataQuality: profile.activityMetrics.totalPosts >= 10 ? 'good' : 'limited',
      generatedAt: new Date().toISOString(),
      recommendations: profile.trainingRecommendations.map(r => ({
        category: r.category,
        priority: r.priority,
        guidance: r.promptGuidance,
      })),
    };

  } catch (error) {
    console.error('Error generating Claude training prompt:', error);
    throw error;
  }
}

/**
 * Generate a comprehensive Claude AI prompt based on tone profile
 * This is the core function that converts user data into AI training instructions
 */
function generateClaudePrompt(profile: ToneProfile): string {
  const {
    writingStyleProfile,
    editPatterns,
    vocabularyPreferences,
    platformPreferences,
    trainingRecommendations,
  } = profile;

  let prompt = `# Brand Voice Guidelines for ${profile.userId}

## Core Writing Style
- **Formality Level**: ${writingStyleProfile.formalityScore}% formal (${writingStyleProfile.communicationApproach} approach)
- **Enthusiasm Level**: ${writingStyleProfile.enthusiasmScore}% enthusiastic
- **Conversational Score**: ${writingStyleProfile.conversationalScore}% conversational
- **Average Sentence Length**: ${writingStyleProfile.averageSentenceLength.toFixed(1)} words
- **Paragraph Style**: ${writingStyleProfile.paragraphStyle}

## Australian Language Preferences
`;

  if (writingStyleProfile.australianSlangUsage > 0) {
    prompt += `- **Australian Slang Usage**: ${writingStyleProfile.australianSlangUsage.toFixed(1)}% - Use authentic Australian expressions
- **Preferred Australian Terms**: ${vocabularyPreferences.australianTerms.join(', ')}
- **Slang Terms**: ${vocabularyPreferences.slangTerms.join(', ')}
`;
  }

  if (writingStyleProfile.localReferences.length > 0) {
    prompt += `- **Local References**: Comfortable mentioning ${writingStyleProfile.localReferences.join(', ')}
`;
  }

  prompt += `
## Vocabulary and Language Patterns
`;

  if (vocabularyPreferences.favoriteWords.length > 0) {
    prompt += `- **Favorite Words**: ${vocabularyPreferences.favoriteWords.slice(0, 10).map(w => w.word).join(', ')}
`;
  }

  if (vocabularyPreferences.favoritePhrases.length > 0) {
    prompt += `- **Signature Phrases**: ${vocabularyPreferences.favoritePhrases.slice(0, 5).map(p => `"${p.phrase}"`).join(', ')}
`;
  }

  if (vocabularyPreferences.signaturePhrases.length > 0) {
    prompt += `- **Brand Expressions**: ${vocabularyPreferences.signaturePhrases.map(p => `"${p}"`).join(', ')}
`;
  }

  prompt += `
## Communication Style Elements
- **Emoji Usage**: ${writingStyleProfile.emojiUsage.emojiDensity} density (${writingStyleProfile.emojiUsage.frequency.toFixed(1)} per 100 words)
`;

  if (writingStyleProfile.emojiUsage.preferredEmojis.length > 0) {
    prompt += `- **Preferred Emojis**: ${writingStyleProfile.emojiUsage.preferredEmojis.slice(0, 5).map(e => e.emoji).join(' ')}
`;
  }

  prompt += `- **Question Usage**: ${writingStyleProfile.questionUsage.frequency.toFixed(1)} questions per post
- **Call-to-Action Style**: ${writingStyleProfile.callToActionStyle.ctaStyle} with ${writingStyleProfile.callToActionStyle.urgencyLevel} urgency
- **Hashtag Density**: ${writingStyleProfile.hashtagUsage.frequency.toFixed(1)} hashtags per post
`;

  if (writingStyleProfile.personalityTraits.length > 0) {
    prompt += `
## Personality Traits
${writingStyleProfile.personalityTraits.map(trait =>
  `- **${trait.trait}**: ${trait.strength}% strength - ${trait.manifestations.join(', ')}`
).join('\n')}
`;
  }

  if (Object.keys(platformPreferences).some(platform => platformPreferences[platform as keyof typeof platformPreferences].postCount > 0)) {
    prompt += `
## Platform-Specific Adaptations
`;

    Object.entries(platformPreferences).forEach(([platform, prefs]) => {
      if (prefs.postCount > 0) {
        prompt += `### ${platform.charAt(0).toUpperCase() + platform.slice(1)}
- **Post Count**: ${prefs.postCount} posts
- **Formality Adjustment**: ${prefs.adaptedStyle.formalityAdjustment > 0 ? '+' : ''}${prefs.adaptedStyle.formalityAdjustment}%
- **Length Preference**: ${prefs.adaptedStyle.lengthPreference}
- **Hashtag Density**: ${prefs.adaptedStyle.hashtagDensity.toFixed(1)}%
${prefs.commonTopics.length > 0 ? `- **Common Topics**: ${prefs.commonTopics.join(', ')}` : ''}

`;
      }
    });
  }

  if (editPatterns.length > 0) {
    prompt += `## User Edit Patterns (What They Consistently Change)
${editPatterns.slice(0, 5).map(pattern =>
  `- **${pattern.patternType.charAt(0).toUpperCase() + pattern.patternType.slice(1)}**: ${pattern.description} (${pattern.frequency.toFixed(0)}% frequency)
  - AI Guidance: ${pattern.aiGuidance}`
).join('\n')}

`;
  }

  if (trainingRecommendations.length > 0) {
    prompt += `## Key Training Recommendations
${trainingRecommendations.filter(r => r.priority === 'high').map(rec =>
  `- **${rec.category.charAt(0).toUpperCase() + rec.category.slice(1)}**: ${rec.promptGuidance}
  - Emphasise: ${rec.emphasise.join(', ')}
  - Avoid: ${rec.avoid.join(', ')}`
).join('\n')}

`;
  }

  prompt += `## Content Generation Instructions
When writing content for this user:

1. **Tone**: Use a ${writingStyleProfile.communicationApproach} tone with ${writingStyleProfile.conversationalScore}% conversational style
2. **Language**: ${writingStyleProfile.australianSlangUsage > 5 ? 'Include Australian expressions and slang naturally' : 'Use standard Australian English'}
3. **Structure**: Aim for ${writingStyleProfile.averageSentenceLength.toFixed(0)}-word average sentences in ${writingStyleProfile.paragraphStyle} paragraphs
4. **Voice**: Match their ${writingStyleProfile.enthusiasmScore}% enthusiasm level and personality traits
5. **Vocabulary**: Use their preferred words and phrases while avoiding overly complex terminology

## Data Quality
- **Total Posts Analysed**: ${profile.activityMetrics.totalPosts}
- **Total Revisions**: ${profile.activityMetrics.totalRevisions}
- **Analysis Period**: ${profile.dataCollectionPeriod.totalDays} days
- **Profile Generated**: ${new Date(profile.profileGeneratedAt).toLocaleDateString('en-AU')}

---
*This profile represents ${profile.dataCollectionPeriod.totalDays} days of writing behaviour analysis to ensure authentic brand voice replication.*`;

  return prompt;
}

/**
 * Export all functions
 */
export default {
  getToneProfile,
  getBatchToneProfiles,
  getToneProfileSummary,
  getClaudeTrainingPrompt,
  generateClaudePrompt,
};