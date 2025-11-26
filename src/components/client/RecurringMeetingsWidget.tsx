import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Settings, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import {
  RecurringMeeting,
  UpcomingMeeting,
  formatMeetingSchedule,
  formatMeetingDateTime,
  getTimeUntilMeeting,
  canAccessRecurringMeetings
} from '@/types/recurring-meetings';
import { recurringMeetingsService } from '@/services/recurringMeetingsService';
import ScheduleRecurringMeetingModal from './ScheduleRecurringMeetingModal';
import ManageRecurringSchedule from './ManageRecurringSchedule';

interface RecurringMeetingsWidgetProps {
  subscriptionTier: 'starter' | 'growth' | 'pro';
}

const RecurringMeetingsWidget: React.FC<RecurringMeetingsWidgetProps> = ({
  subscriptionTier
}) => {
  const { user } = useAuth();
  const [recurringMeeting, setRecurringMeeting] = useState<RecurringMeeting | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  const canAccess = canAccessRecurringMeetings(subscriptionTier);

  useEffect(() => {
    if (user && canAccess) {
      loadMeetingData();
    } else {
      setLoading(false);
    }
  }, [user, canAccess]);

  const loadMeetingData = async () => {
    if (!user) return;

    try {
      setError(null);
      const [meetings, upcoming] = await Promise.all([
        recurringMeetingsService.getMyRecurringMeetings(user.id),
        recurringMeetingsService.getMyUpcomingMeetings(user.id, 5)
      ]);

      const activeMeeting = meetings.find(m => m.is_active) || null;
      setRecurringMeeting(activeMeeting);
      setUpcomingMeetings(upcoming);
    } catch (error) {
      console.error('Failed to load meeting data:', error);
      setError('Failed to load meeting information');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSuccess = () => {
    setShowScheduleModal(false);
    loadMeetingData();
  };

  const handleManageSuccess = () => {
    setShowManageModal(false);
    loadMeetingData();
  };

  if (!canAccess) {
    return (
      <Card className="mate-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Report Brief Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Upgrade for Report Briefs</h3>
            <p className="text-muted-foreground mb-4">
              Regular check-ins with Matt are available with Growth and Pro plans
            </p>
            <Button className="mate-button-primary">
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="mate-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Report Brief Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse bg-muted rounded h-4 w-3/4"></div>
            <div className="animate-pulse bg-muted rounded h-4 w-1/2"></div>
            <div className="animate-pulse bg-muted rounded h-8 w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mate-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Report Brief Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={loadMeetingData}
            variant="outline"
            className="mt-4 w-full"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mate-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Report Brief Meetings
            </div>
            {recurringMeeting && (
              <Button
                onClick={() => setShowManageModal(true)}
                variant="outline"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Manage
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!recurringMeeting ? (
            <div className="text-center py-6">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Schedule Your Report Briefs</h3>
              <p className="text-muted-foreground mb-4">
                Never miss your monthly check-in with Matt. Set it and forget it - your report briefs happen automatically.
              </p>
              <Button
                onClick={() => setShowScheduleModal(true)}
                className="mate-button-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Recurring Meetings
              </Button>
            </div>
          ) : (
            <>
              {/* Current Schedule */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Current Schedule</h4>
                  <Badge variant="outline" className="text-primary">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="bg-primary/5 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">{formatMeetingSchedule(recurringMeeting)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {recurringMeeting.duration_minutes} minute {recurringMeeting.meeting_type.replace('_', ' ')} sessions
                  </p>
                </div>
              </div>

              {/* Upcoming Meetings */}
              {upcomingMeetings.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Upcoming Meetings</h4>
                  <div className="space-y-3">
                    {upcomingMeetings.slice(0, 3).map((meeting, index) => {
                      const timeUntil = getTimeUntilMeeting(meeting);
                      return (
                        <div
                          key={meeting.id}
                          className={`border rounded-lg p-3 ${
                            index === 0 ? 'bg-accent/5 border-accent' : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">
                              {formatMeetingDateTime(meeting)}
                            </span>
                            {index === 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Next Meeting
                              </Badge>
                            )}
                          </div>

                          {index === 0 && (
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {timeUntil.isToday && `Today in ${timeUntil.hours}h ${timeUntil.minutes}m`}
                              {timeUntil.isTomorrow && `Tomorrow`}
                              {!timeUntil.isToday && !timeUntil.isTomorrow && `In ${timeUntil.days} days`}
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              {meeting.duration_minutes} minutes
                            </div>
                            {meeting.google_meet_link && index === 0 && (
                              <Button
                                onClick={() => window.open(meeting.google_meet_link!, '_blank')}
                                size="sm"
                                variant="outline"
                                className="text-xs h-7"
                              >
                                <Video className="h-3 w-3 mr-1" />
                                Join Meeting
                              </Button>
                            )}
                          </div>

                          {meeting.client_notes && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                              <strong>Your notes:</strong> {meeting.client_notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {upcomingMeetings.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setShowManageModal(true)}
                    >
                      View all {upcomingMeetings.length} upcoming meetings
                    </Button>
                  )}
                </div>
              )}

              {upcomingMeetings.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No upcoming meetings scheduled. New meetings will be generated automatically.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Tier-specific messaging */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                {subscriptionTier === 'growth' && 'Growth Plan: Monthly meetings'}
                {subscriptionTier === 'pro' && 'Pro Plan: Bi-weekly meetings available'}
              </div>
              {recurringMeeting && (
                <div className="text-primary font-medium">
                  {recurringMeeting.recurrence_frequency === 'monthly' ? 'Monthly' : 'Bi-weekly'} schedule
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ScheduleRecurringMeetingModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={handleScheduleSuccess}
        subscriptionTier={subscriptionTier}
      />

      {recurringMeeting && (
        <ManageRecurringSchedule
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          onSuccess={handleManageSuccess}
          recurringMeeting={recurringMeeting}
          upcomingMeetings={upcomingMeetings}
          subscriptionTier={subscriptionTier}
        />
      )}
    </>
  );
};

export default RecurringMeetingsWidget;