import React, { useState } from 'react';
import {
  Calendar, Clock, Video, Edit, Pause, Play, Trash2, Download,
  AlertCircle, CheckCircle, Settings, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  RecurringMeeting,
  UpcomingMeeting,
  formatMeetingSchedule,
  formatMeetingDateTime,
  getTimeUntilMeeting,
  isUpcoming,
  isPastDue
} from '@/types/recurring-meetings';
import { createICSFile, createMeetingJoinUrl } from '@/templates/meeting-event-template';
import { recurringMeetingsService } from '@/services/recurringMeetingsService';
import ScheduleRecurringMeetingModal from './ScheduleRecurringMeetingModal';

interface ManageRecurringScheduleProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recurringMeeting: RecurringMeeting;
  upcomingMeetings: UpcomingMeeting[];
  subscriptionTier: 'starter' | 'growth' | 'pro';
}

const ManageRecurringSchedule: React.FC<ManageRecurringScheduleProps> = ({
  isOpen,
  onClose,
  onSuccess,
  recurringMeeting,
  upcomingMeetings,
  subscriptionTier
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});
  const [savingNotes, setSavingNotes] = useState<{ [key: string]: boolean }>({});

  const handlePauseSchedule = async () => {
    setLoading(true);
    setError(null);

    try {
      await recurringMeetingsService.updateRecurringMeeting(recurringMeeting.id, {
        end_date: new Date().toISOString().split('T')[0]
      });
      onSuccess();
    } catch (error) {
      setError('Failed to pause schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    setLoading(true);
    setError(null);

    try {
      await recurringMeetingsService.cancelRecurringMeeting(recurringMeeting.id);
      onSuccess();
      onClose();
    } catch (error) {
      setError('Failed to delete schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCalendar = (meeting: UpcomingMeeting) => {
    const icsContent = createICSFile(recurringMeeting, meeting);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${meeting.scheduled_date}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveNotes = async (meetingId: string, notes: string) => {
    setSavingNotes(prev => ({ ...prev, [meetingId]: true }));

    try {
      await recurringMeetingsService.updateMeetingInstance(meetingId, {
        client_notes: notes
      });
      setEditingNotes(prev => ({ ...prev, [meetingId]: notes }));
    } catch (error) {
      setError('Failed to save notes');
    } finally {
      setSavingNotes(prev => ({ ...prev, [meetingId]: false }));
    }
  };

  const getStatusBadge = (meeting: UpcomingMeeting) => {
    if (isPastDue(meeting)) {
      return <Badge variant="destructive">Past Due</Badge>;
    }

    const timeUntil = getTimeUntilMeeting(meeting);
    if (timeUntil.isToday) {
      return <Badge variant="default">Today</Badge>;
    }
    if (timeUntil.isTomorrow) {
      return <Badge variant="secondary">Tomorrow</Badge>;
    }
    if (timeUntil.days <= 7) {
      return <Badge variant="outline">This Week</Badge>;
    }

    return <Badge variant="outline">Upcoming</Badge>;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Manage Your Report Brief Schedule
            </DialogTitle>
            <DialogDescription>
              View and manage your recurring meeting schedule with Matt
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="meetings">Upcoming Meetings</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Current Schedule
                    <Badge variant="outline" className="text-primary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-medium">{formatMeetingSchedule(recurringMeeting)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {recurringMeeting.duration_minutes} minute {recurringMeeting.meeting_type.replace('_', ' ')} sessions
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Started: {new Date(recurringMeeting.start_date).toLocaleDateString('en-AU')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {upcomingMeetings.filter(m => isUpcoming(m)).length}
                      </div>
                      <div className="text-sm text-muted-foreground">Upcoming Meetings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">
                        {recurringMeeting.recurrence_frequency === 'monthly' ? '1' : '2'}
                      </div>
                      <div className="text-sm text-muted-foreground">Per Month</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent-foreground">
                        {upcomingMeetings.filter(m => m.google_meet_link).length}
                      </div>
                      <div className="text-sm text-muted-foreground">With Meet Links</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Meeting Preview */}
              {upcomingMeetings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Next Meeting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const nextMeeting = upcomingMeetings[0];
                      const timeUntil = getTimeUntilMeeting(nextMeeting);
                      return (
                        <div className="flex items-center justify-between p-4 bg-accent/5 rounded-lg">
                          <div>
                            <div className="font-medium">{formatMeetingDateTime(nextMeeting)}</div>
                            <div className="text-sm text-muted-foreground">
                              {timeUntil.isToday && `Today in ${timeUntil.hours}h ${timeUntil.minutes}m`}
                              {timeUntil.isTomorrow && `Tomorrow`}
                              {!timeUntil.isToday && !timeUntil.isTomorrow && `In ${timeUntil.days} days`}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {nextMeeting.google_meet_link && (
                              <Button
                                onClick={() => window.open(nextMeeting.google_meet_link!, '_blank')}
                                size="sm"
                              >
                                <Video className="h-4 w-4 mr-2" />
                                Join Meeting
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDownloadCalendar(nextMeeting)}
                              size="sm"
                              variant="outline"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Add to Calendar
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Upcoming Meetings Tab */}
            <TabsContent value="meetings" className="space-y-4">
              {upcomingMeetings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No Upcoming Meetings</h3>
                    <p className="text-muted-foreground">
                      New meetings will be generated automatically according to your schedule.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {upcomingMeetings.map((meeting) => (
                    <Card key={meeting.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{formatMeetingDateTime(meeting)}</span>
                              {getStatusBadge(meeting)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {meeting.duration_minutes} minutes • {meeting.meeting_type.replace('_', ' ')}
                            </div>
                            {(() => {
                              const timeUntil = getTimeUntilMeeting(meeting);
                              return (
                                <div className="text-xs text-muted-foreground">
                                  {timeUntil.isToday && `Today in ${timeUntil.hours}h ${timeUntil.minutes}m`}
                                  {timeUntil.isTomorrow && `Tomorrow`}
                                  {!timeUntil.isToday && !timeUntil.isTomorrow && `In ${timeUntil.days} days`}
                                </div>
                              );
                            })()}
                          </div>

                          <div className="flex space-x-2">
                            {meeting.google_meet_link ? (
                              <Button
                                onClick={() => window.open(meeting.google_meet_link!, '_blank')}
                                size="sm"
                              >
                                <Video className="h-4 w-4 mr-1" />
                                Join
                              </Button>
                            ) : (
                              <Button
                                onClick={() => window.open(createMeetingJoinUrl(meeting), '_blank')}
                                size="sm"
                                variant="outline"
                              >
                                <Phone className="h-4 w-4 mr-1" />
                                Contact
                              </Button>
                            )}
                            <Button
                              onClick={() => handleDownloadCalendar(meeting)}
                              size="sm"
                              variant="outline"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Meeting Notes */}
                        <div className="space-y-2">
                          <Label className="text-sm">Your notes for this meeting:</Label>
                          <div className="flex space-x-2">
                            <Textarea
                              placeholder="Add notes about topics you want to discuss, questions to ask, or updates to share..."
                              value={editingNotes[meeting.id] || meeting.client_notes || ''}
                              onChange={(e) => setEditingNotes(prev => ({
                                ...prev,
                                [meeting.id]: e.target.value
                              }))}
                              className="text-sm"
                              rows={2}
                            />
                            <Button
                              onClick={() => handleSaveNotes(
                                meeting.id,
                                editingNotes[meeting.id] || meeting.client_notes || ''
                              )}
                              disabled={savingNotes[meeting.id]}
                              size="sm"
                              variant="outline"
                            >
                              {savingNotes[meeting.id] ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      onClick={() => setShowEditModal(true)}
                      variant="outline"
                      className="flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Schedule
                    </Button>

                    <Button
                      onClick={handlePauseSchedule}
                      disabled={loading}
                      variant="outline"
                      className="flex items-center justify-center"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Future Meetings
                    </Button>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Changes to your schedule will only affect future meetings. Current scheduled meetings will remain unchanged.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Deleting your schedule will cancel all future meetings and remove them from your calendar.
                        This action cannot be undone.
                      </AlertDescription>
                    </Alert>

                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="destructive"
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Recurring Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Modal */}
      <ScheduleRecurringMeetingModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          onSuccess();
        }}
        subscriptionTier={subscriptionTier}
      />

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recurring Schedule?</DialogTitle>
            <DialogDescription>
              This will permanently delete your recurring meeting schedule and cancel all future meetings.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {upcomingMeetings.length} upcoming meetings will be cancelled and removed from your calendar.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteSchedule}
                disabled={loading}
                variant="destructive"
              >
                {loading ? 'Deleting...' : 'Yes, Delete Schedule'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageRecurringSchedule;