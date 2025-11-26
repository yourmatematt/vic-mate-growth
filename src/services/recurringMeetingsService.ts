/**
 * Recurring Meetings Service
 * Handles CRUD operations and business logic for recurring meetings
 */

import { supabase } from '@/lib/supabase';
import {
  RecurringMeeting,
  MeetingInstance,
  UpcomingMeeting,
  RecurringMeetingFormData,
  RescheduleMeetingData,
  MeetingInstanceUpdate,
  SubscriptionTier,
  RecurringMeetingError,
  canAccessRecurringMeetings,
  getAllowedFrequencies
} from '@/types/recurring-meetings';
import { googleCalendarService } from './googleCalendarService';
import { createCalendarEventFromMeeting } from '@/templates/meeting-event-template';

class RecurringMeetingsService {

  /**
   * Create a new recurring meeting
   */
  async createRecurringMeeting(
    userId: string,
    subscriptionTier: SubscriptionTier,
    data: RecurringMeetingFormData
  ): Promise<RecurringMeeting> {
    // Validate subscription tier access
    if (!canAccessRecurringMeetings(subscriptionTier)) {
      throw new RecurringMeetingError(
        'Your subscription tier does not include recurring meetings',
        'INVALID_TIER'
      );
    }

    // Validate frequency is allowed for tier
    const allowedFrequencies = getAllowedFrequencies(subscriptionTier);
    if (!allowedFrequencies.includes(data.recurrence_frequency)) {
      throw new RecurringMeetingError(
        `${data.recurrence_frequency} meetings not allowed for ${subscriptionTier} tier`,
        'FREQUENCY_NOT_ALLOWED'
      );
    }

    // Check if user already has an active recurring meeting
    const { data: existingMeeting } = await supabase
      .from('recurring_meetings')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (existingMeeting) {
      throw new RecurringMeetingError(
        'You already have an active recurring meeting schedule',
        'ALREADY_EXISTS'
      );
    }

    const meetingData = {
      user_id: userId,
      subscription_tier: subscriptionTier,
      meeting_type: data.meeting_type || 'report_brief',
      title: data.title || 'Monthly Report Brief',
      recurrence_frequency: data.recurrence_frequency,
      day_of_week: data.day_of_week || null,
      day_of_month: data.day_of_month || null,
      week_of_month: data.week_of_month || null,
      preferred_time: data.preferred_time,
      start_date: data.start_date,
      end_date: data.end_date || null,
      duration_minutes: data.duration_minutes || 30
    };

    const { data: meeting, error } = await supabase
      .from('recurring_meetings')
      .insert([meetingData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create recurring meeting: ${error.message}`);
    }

    // Generate initial meeting instances
    await this.generateMeetingInstances(meeting.id);

    // Attempt to sync to Google Calendar if configured
    try {
      if (googleCalendarService.isConfigured() && googleCalendarService.isAuthenticated()) {
        await this.syncToGoogleCalendar(meeting.id);
      }
    } catch (calendarError) {
      console.warn('Failed to sync to Google Calendar:', calendarError);
      // Don't fail the entire operation for calendar sync issues
    }

    return meeting;
  }

  /**
   * Get user's recurring meetings
   */
  async getMyRecurringMeetings(userId: string): Promise<RecurringMeeting[]> {
    const { data, error } = await supabase
      .from('recurring_meetings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recurring meetings: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get user's upcoming meeting instances
   */
  async getMyUpcomingMeetings(
    userId: string,
    limit: number = 10
  ): Promise<UpcomingMeeting[]> {
    const { data, error } = await supabase
      .from('upcoming_meetings_view')
      .select('*')
      .eq('user_id', userId)
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch upcoming meetings: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update a recurring meeting
   */
  async updateRecurringMeeting(
    meetingId: string,
    updates: Partial<RecurringMeetingFormData>
  ): Promise<RecurringMeeting> {
    const { data: meeting, error } = await supabase
      .from('recurring_meetings')
      .update(updates)
      .eq('id', meetingId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update recurring meeting: ${error.message}`);
    }

    // If schedule changed, regenerate instances
    if (updates.recurrence_frequency || updates.day_of_week ||
        updates.day_of_month || updates.preferred_time) {

      // Cancel future instances
      await this.cancelFutureInstances(meetingId);

      // Generate new instances
      await this.generateMeetingInstances(meetingId);

      // Resync to calendar
      try {
        if (googleCalendarService.isConfigured() && googleCalendarService.isAuthenticated()) {
          await this.syncToGoogleCalendar(meetingId);
        }
      } catch (calendarError) {
        console.warn('Failed to resync to Google Calendar:', calendarError);
      }
    }

    return meeting;
  }

  /**
   * Cancel/deactivate a recurring meeting
   */
  async cancelRecurringMeeting(meetingId: string): Promise<void> {
    const { error } = await supabase
      .from('recurring_meetings')
      .update({ is_active: false })
      .eq('id', meetingId);

    if (error) {
      throw new Error(`Failed to cancel recurring meeting: ${error.message}`);
    }

    // Cancel all future instances
    await this.cancelFutureInstances(meetingId);

    // Remove from Google Calendar
    try {
      const { data: meeting } = await supabase
        .from('recurring_meetings')
        .select('google_calendar_event_ids')
        .eq('id', meetingId)
        .single();

      if (meeting?.google_calendar_event_ids?.length > 0) {
        await this.deleteCalendarEvents(meeting.google_calendar_event_ids);
      }
    } catch (calendarError) {
      console.warn('Failed to remove from Google Calendar:', calendarError);
    }
  }

  /**
   * Reschedule a specific meeting instance
   */
  async rescheduleInstance(
    instanceId: string,
    rescheduleData: RescheduleMeetingData
  ): Promise<MeetingInstance> {
    const { data: instance, error: fetchError } = await supabase
      .from('generated_meeting_instances')
      .select('*')
      .eq('id', instanceId)
      .single();

    if (fetchError || !instance) {
      throw new RecurringMeetingError(
        'Meeting instance not found',
        'INSTANCE_NOT_FOUND'
      );
    }

    // Store original date/time if not already rescheduled
    const updateData = {
      scheduled_date: rescheduleData.new_date,
      scheduled_time: rescheduleData.new_time,
      original_date: instance.original_date || instance.scheduled_date,
      original_time: instance.original_time || instance.scheduled_time,
      status: 'rescheduled' as const,
      reschedule_reason: rescheduleData.reason
    };

    const { data: updated, error } = await supabase
      .from('generated_meeting_instances')
      .update(updateData)
      .eq('id', instanceId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to reschedule meeting: ${error.message}`);
    }

    // Update Google Calendar event if it exists
    if (instance.google_calendar_event_id) {
      try {
        await this.updateCalendarEvent(instance.google_calendar_event_id, updated);
      } catch (calendarError) {
        console.warn('Failed to update calendar event:', calendarError);
      }
    }

    return updated;
  }

  /**
   * Update a meeting instance (status, notes, etc.)
   */
  async updateMeetingInstance(
    instanceId: string,
    updates: MeetingInstanceUpdate
  ): Promise<MeetingInstance> {
    const { data, error } = await supabase
      .from('generated_meeting_instances')
      .update(updates)
      .eq('id', instanceId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update meeting instance: ${error.message}`);
    }

    return data;
  }

  /**
   * Generate meeting instances for a recurring meeting
   */
  async generateMeetingInstances(
    recurringMeetingId: string,
    monthsAhead: number = 6
  ): Promise<number> {
    const { data, error } = await supabase
      .rpc('generate_meeting_instances', {
        p_recurring_meeting_id: recurringMeetingId,
        p_months_ahead: monthsAhead
      });

    if (error) {
      throw new RecurringMeetingError(
        `Failed to generate meeting instances: ${error.message}`,
        'GENERATION_FAILED'
      );
    }

    return data || 0;
  }

  /**
   * Get meeting instances for a recurring meeting
   */
  async getMeetingInstances(
    recurringMeetingId: string,
    includeCompleted: boolean = false
  ): Promise<MeetingInstance[]> {
    let query = supabase
      .from('generated_meeting_instances')
      .select('*')
      .eq('recurring_meeting_id', recurringMeetingId)
      .order('scheduled_date', { ascending: true });

    if (!includeCompleted) {
      query = query.in('status', ['scheduled', 'rescheduled']);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch meeting instances: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Cancel future meeting instances
   */
  private async cancelFutureInstances(recurringMeetingId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('generated_meeting_instances')
      .update({ status: 'cancelled' })
      .eq('recurring_meeting_id', recurringMeetingId)
      .gte('scheduled_date', today)
      .eq('status', 'scheduled');

    if (error) {
      console.error('Failed to cancel future instances:', error);
    }
  }

  /**
   * Sync recurring meeting to Google Calendar
   */
  async syncToGoogleCalendar(recurringMeetingId: string): Promise<void> {
    if (!googleCalendarService.isConfigured() || !googleCalendarService.isAuthenticated()) {
      console.warn('Google Calendar not configured or authenticated');
      return;
    }

    const { data: meeting } = await supabase
      .from('recurring_meetings')
      .select('*')
      .eq('id', recurringMeetingId)
      .single();

    if (!meeting) return;

    const { data: instances } = await supabase
      .from('generated_meeting_instances')
      .select('*')
      .eq('recurring_meeting_id', recurringMeetingId)
      .eq('status', 'scheduled')
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true });

    if (!instances?.length) return;

    const createdEventIds: string[] = [];

    // Create calendar events for each instance
    for (const instance of instances) {
      try {
        if (!instance.google_calendar_event_id) {
          const eventData = createCalendarEventFromMeeting(meeting, instance);
          const response = await googleCalendarService.createCalendarEvent(eventData);

          // Update instance with calendar info
          await supabase
            .from('generated_meeting_instances')
            .update({
              google_calendar_event_id: response.eventId,
              google_meet_link: response.meetLink,
              calendar_html_link: response.htmlLink
            })
            .eq('id', instance.id);

          createdEventIds.push(response.eventId);
        }
      } catch (error) {
        console.error(`Failed to create calendar event for instance ${instance.id}:`, error);
      }
    }

    // Update recurring meeting with event IDs
    if (createdEventIds.length > 0) {
      await supabase
        .from('recurring_meetings')
        .update({
          google_calendar_event_ids: [...(meeting.google_calendar_event_ids || []), ...createdEventIds]
        })
        .eq('id', recurringMeetingId);
    }
  }

  /**
   * Update a single calendar event
   */
  private async updateCalendarEvent(eventId: string, instance: MeetingInstance): Promise<void> {
    try {
      const { data: meeting } = await supabase
        .from('recurring_meetings')
        .select('*')
        .eq('id', instance.recurring_meeting_id)
        .single();

      if (meeting) {
        const eventData = createCalendarEventFromMeeting(meeting, instance);
        await googleCalendarService.updateCalendarEvent(eventId, eventData);
      }
    } catch (error) {
      console.error('Failed to update calendar event:', error);
    }
  }

  /**
   * Delete calendar events
   */
  private async deleteCalendarEvents(eventIds: string[]): Promise<void> {
    for (const eventId of eventIds) {
      try {
        await googleCalendarService.deleteCalendarEvent(eventId, '');
      } catch (error) {
        console.error(`Failed to delete calendar event ${eventId}:`, error);
      }
    }
  }

  /**
   * Admin function: Get all recurring meetings
   */
  async getAllRecurringMeetings(): Promise<RecurringMeeting[]> {
    const { data, error } = await supabase
      .from('recurring_meetings')
      .select(`
        *,
        user_profiles(email, full_name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch all recurring meetings: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Admin function: Get all upcoming meetings across all clients
   */
  async getAllUpcomingMeetings(): Promise<UpcomingMeeting[]> {
    const { data, error } = await supabase
      .from('upcoming_meetings_view')
      .select('*')
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch all upcoming meetings: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Admin function: Bulk generate instances for all active meetings
   */
  async bulkGenerateInstances(): Promise<{ recurringMeetingId: string; instancesCreated: number; }[]> {
    const { data, error } = await supabase
      .rpc('generate_all_meeting_instances');

    if (error) {
      throw new Error(`Failed to bulk generate instances: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Admin function: Mark meeting as completed with notes
   */
  async markMeetingCompleted(
    instanceId: string,
    attended: boolean,
    adminNotes?: string,
    summary?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('generated_meeting_instances')
      .update({
        status: 'completed',
        attended,
        admin_notes: adminNotes,
        meeting_summary: summary
      })
      .eq('id', instanceId);

    if (error) {
      throw new Error(`Failed to mark meeting as completed: ${error.message}`);
    }
  }

  /**
   * Get meetings that need reminders sent
   */
  async getMeetingsNeedingReminders(): Promise<{
    twentyFourHour: MeetingInstance[];
    oneHour: MeetingInstance[];
  }> {
    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const oneHourFromNow = new Date(now.getTime() + (60 * 60 * 1000));

    const { data: twentyFourHour, error: error24h } = await supabase
      .from('generated_meeting_instances')
      .select(`
        *,
        recurring_meetings(user_id, title, duration_minutes)
      `)
      .eq('status', 'scheduled')
      .eq('reminder_24h_sent', false)
      .gte('scheduled_date', now.toISOString().split('T')[0])
      .lte('scheduled_date', twentyFourHoursFromNow.toISOString().split('T')[0]);

    const { data: oneHour, error: error1h } = await supabase
      .from('generated_meeting_instances')
      .select(`
        *,
        recurring_meetings(user_id, title, duration_minutes)
      `)
      .eq('status', 'scheduled')
      .eq('reminder_1h_sent', false)
      .gte('scheduled_date', now.toISOString().split('T')[0])
      .lte('scheduled_date', oneHourFromNow.toISOString().split('T')[0]);

    if (error24h || error1h) {
      throw new Error('Failed to fetch meetings needing reminders');
    }

    return {
      twentyFourHour: twentyFourHour || [],
      oneHour: oneHour || []
    };
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(instanceId: string, reminderType: '24h' | '1h'): Promise<void> {
    const field = reminderType === '24h' ? 'reminder_24h_sent' : 'reminder_1h_sent';

    const { error } = await supabase
      .from('generated_meeting_instances')
      .update({ [field]: true })
      .eq('id', instanceId);

    if (error) {
      throw new Error(`Failed to mark ${reminderType} reminder as sent: ${error.message}`);
    }
  }
}

// Create and export singleton instance
export const recurringMeetingsService = new RecurringMeetingsService();
export default recurringMeetingsService;