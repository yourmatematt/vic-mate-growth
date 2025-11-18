import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import ToolLayout from '@/components/tools/ToolLayout';
import LeadCaptureModal from '@/components/tools/LeadCaptureModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, XCircle, Mail, TrendingUp, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScoreBreakdown {
  score: number;
  emoji: string;
  rating: string;
  color: string;
  suggestions: string[];
  strengths: string[];
  warnings: string[];
}

const SubjectLineScorer = () => {
  const [subjectLine, setSubjectLine] = useState('');
  const [score, setScore] = useState<ScoreBreakdown | null>(null);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  useEffect(() => {
    if (subjectLine.trim().length > 0) {
      calculateScore(subjectLine);
    } else {
      setScore(null);
    }
  }, [subjectLine]);

  const powerWords = [
    'free', 'new', 'proven', 'save', 'exclusive', 'limited', 'secret', 'amazing',
    'discover', 'boost', 'guaranteed', 'instant', 'unlock', 'ultimate', 'breakthrough',
    'revolutionary', 'powerful', 'essential', 'incredible', 'special'
  ];

  const spamWords = [
    'buy now', 'click here', 'order now', 'urgent', 'act now', 'winner',
    'congratulations', 'prize', 'cash', 'bonus', '100%', '!!!', '$$$'
  ];

  const calculateScore = (text: string) => {
    let totalScore = 0;
    const suggestions: string[] = [];
    const strengths: string[] = [];
    const warnings: string[] = [];

    const length = text.length;
    const wordCount = text.split(' ').length;
    const lowerText = text.toLowerCase();

    // Length scoring (30-50 characters is optimal)
    if (length >= 30 && length <= 50) {
      totalScore += 25;
      strengths.push('Perfect length (30-50 characters)');
    } else if (length < 30) {
      totalScore += 10;
      suggestions.push('Too short - aim for 30-50 characters for better impact');
    } else if (length > 50 && length <= 70) {
      totalScore += 15;
      warnings.push('Slightly long - some email clients may truncate');
    } else {
      totalScore += 5;
      warnings.push('Too long - likely to be cut off on mobile devices');
    }

    // Power words (up to 20 points)
    const foundPowerWords = powerWords.filter(word => lowerText.includes(word));
    if (foundPowerWords.length > 0) {
      totalScore += Math.min(foundPowerWords.length * 10, 20);
      strengths.push(`Contains ${foundPowerWords.length} power word(s): ${foundPowerWords.join(', ')}`);
    } else {
      suggestions.push('Add power words like "free", "new", "proven", or "exclusive"');
    }

    // Personalization (15 points)
    if (text.includes('[Name]') || text.includes('{name}') || text.includes('{{name}}')) {
      totalScore += 15;
      strengths.push('Includes personalization token');
    } else {
      suggestions.push('Add personalization like [Name] or {First Name} to boost opens');
    }

    // Urgency/Scarcity (10 points)
    if (text.match(/today|now|limited|ending|last chance|hurry|soon/i)) {
      totalScore += 10;
      strengths.push('Creates urgency or scarcity');
    } else {
      suggestions.push('Consider adding time-sensitive language (e.g., "today", "limited time")');
    }

    // Question format (10 points)
    if (text.includes('?')) {
      totalScore += 10;
      strengths.push('Uses engaging question format');
    }

    // Numbers (10 points)
    if (text.match(/\d+/)) {
      totalScore += 10;
      strengths.push('Includes specific number(s)');
    } else {
      suggestions.push('Numbers often improve open rates (e.g., "5 Ways" or "Save 20%")');
    }

    // Emoji usage (5 points for 1-2 emojis, -5 for 3+)
    const emojiCount = (text.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length;
    if (emojiCount === 1 || emojiCount === 2) {
      totalScore += 5;
      strengths.push('Good emoji usage');
    } else if (emojiCount > 2) {
      totalScore -= 5;
      warnings.push('Too many emojis - keep it to 1-2');
    }

    // Spam trigger words (heavy penalty)
    const foundSpamWords = spamWords.filter(word => lowerText.includes(word));
    if (foundSpamWords.length > 0) {
      totalScore -= foundSpamWords.length * 15;
      warnings.push(`Contains spam triggers: ${foundSpamWords.join(', ')}`);
    }

    // Excessive punctuation
    if (text.match(/!{2,}/) || text.match(/\?{2,}/)) {
      totalScore -= 10;
      warnings.push('Excessive punctuation looks spammy');
    }

    // All caps
    if (text === text.toUpperCase() && text.length > 5) {
      totalScore -= 20;
      warnings.push('ALL CAPS looks like spam');
    }

    // Ensure score is between 0-100
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Determine rating
    let rating: string;
    let emoji: string;
    let color: string;

    if (totalScore >= 80) {
      rating = 'Excellent';
      emoji = '🎉';
      color = 'text-green-600';
    } else if (totalScore >= 60) {
      rating = 'Good';
      emoji = '😊';
      color = 'text-blue-600';
    } else if (totalScore >= 40) {
      rating = 'Fair';
      emoji = '😐';
      color = 'text-yellow-600';
    } else {
      rating = 'Needs Work';
      emoji = '😬';
      color = 'text-red-600';
    }

    setScore({
      score: Math.round(totalScore),
      emoji,
      rating,
      color,
      suggestions,
      strengths,
      warnings,
    });
  };

  const handleUnlockTemplates = () => {
    setShowLeadCapture(true);
  };

  const handleLeadCapture = async (emailData: { email: string }) => {
    const toolResult = {
      tool: 'subject-line-scorer',
      timestamp: new Date().toISOString(),
      email: emailData.email,
      subjectLine: subjectLine,
      score: score?.score,
      attempts: attemptCount + 1,
    };

    const existingResults = JSON.parse(localStorage.getItem('toolResults') || '[]');
    existingResults.push(toolResult);
    localStorage.setItem('toolResults', JSON.stringify(existingResults));

    console.log('Subject line scorer results submitted:', toolResult);
    // TODO: Send to backend API when ready
  };

  const handleTryAnother = () => {
    setAttemptCount(prev => prev + 1);
    setSubjectLine('');
    setScore(null);
  };

  const exampleSubjectLines = [
    '[Name], your exclusive 20% discount ends today',
    '5 proven ways to boost your sales this month',
    'Quick question about your marketing goals',
    'Don\'t miss out: Limited spots remaining',
  ];

  return (
    <>
      <Helmet>
        <title>Email Subject Line Scorer | Free Marketing Tool | Your Mate Agency</title>
        <meta name="description" content="Test and score your email subject lines for maximum open rates. Get instant feedback with our free subject line analyzer." />
      </Helmet>

      <ToolLayout
        title="Email Subject Line Scorer"
        description="Test your email subject lines and get instant scores with actionable improvement tips"
        estimatedTime={1}
        helpText="Enter your email subject line to get an instant score based on length, power words, personalization, and spam triggers. Our algorithm analyzes what works best for email opens."
      >
        <div className="space-y-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="subjectLine" className="text-lg font-semibold">
                Enter Your Subject Line
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Type or paste your email subject line below to get instant feedback
              </p>
              <Input
                id="subjectLine"
                value={subjectLine}
                onChange={(e) => setSubjectLine(e.target.value)}
                placeholder="e.g., [Name], your exclusive discount ends today"
                className="text-lg py-6"
                autoFocus
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{subjectLine.length} characters</span>
                <span className={subjectLine.length >= 30 && subjectLine.length <= 50 ? 'text-green-600' : ''}>
                  Optimal: 30-50 characters
                </span>
              </div>
            </div>

            {/* Examples */}
            {!subjectLine && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {exampleSubjectLines.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setSubjectLine(example)}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Score Display */}
          {score && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Main Score */}
              <Card className="border-2">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-6xl mb-2">{score.emoji}</div>
                    <div className={`text-5xl font-bold mb-2 ${score.color}`}>
                      {score.score}/100
                    </div>
                    <div className="text-xl font-semibold text-muted-foreground mb-4">
                      {score.rating}
                    </div>
                    <Progress value={score.score} className="h-3 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Your subject line scored {score.score} out of 100
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Breakdown */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* Strengths */}
                {score.strengths.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center text-green-600">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Strengths ({score.strengths.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {score.strengths.map((strength, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="text-green-600 mr-2">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Suggestions */}
                {score.suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center text-blue-600">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Improvements ({score.suggestions.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {score.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="text-blue-600 mr-2">→</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Warnings */}
                {score.warnings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium flex items-center text-amber-600">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Warnings ({score.warnings.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {score.warnings.map((warning, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <span className="text-amber-600 mr-2">⚠</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Lead Capture CTA */}
              {attemptCount < 3 && (
                <div className="bg-accent-light p-6 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">🎁 Get 50 High-Converting Subject Line Templates</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Plus our Email Marketing Best Practices Guide and A/B testing framework
                      </p>
                      <Button onClick={handleUnlockTemplates} className="mate-button-primary">
                        Email Me The Templates
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {attemptCount >= 3 && (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Great progress!</strong> You've tested {attemptCount + 1} subject lines.
                    Want to save all your scores and get personalized templates? <Button variant="link" className="p-0 h-auto" onClick={handleUnlockTemplates}>Get your free templates →</Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex justify-center space-x-4">
                <Button onClick={handleTryAnother} variant="outline">
                  Test Another Subject Line
                </Button>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!subjectLine && (
            <Card className="bg-accent-light">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Mail className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="font-semibold text-lg">What Makes a Great Subject Line?</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                    <div className="space-y-2 text-sm">
                      <p><strong>✓ Optimal length:</strong> 30-50 characters</p>
                      <p><strong>✓ Power words:</strong> Free, new, proven, exclusive</p>
                      <p><strong>✓ Personalization:</strong> Include [Name] or {'{First Name}'}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><strong>✓ Urgency:</strong> Limited time, ending today</p>
                      <p><strong>✓ Numbers:</strong> "5 ways" or "Save 20%"</p>
                      <p><strong>✓ Questions:</strong> Engage curiosity</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ToolLayout>

      <LeadCaptureModal
        isOpen={showLeadCapture}
        onClose={() => setShowLeadCapture(false)}
        onSubmit={handleLeadCapture}
        toolName="Subject Line Scorer"
        variant="action-plan"
        socialProofCount={2800}
      />
    </>
  );
};

export default SubjectLineScorer;
