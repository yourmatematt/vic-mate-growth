-- Recurring Meetings Migration
-- Adds recurring meeting scheduling for client report brief meetings

-- Create recurring_meetings table
CREATE TABLE recurring_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Client & Subscription
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('growth', 'pro')),

  -- Meeting Details
  meeting_type TEXT DEFAULT 'report_brief' CHECK (meeting_type IN ('report_brief', 'strategy', 'consultation')),
  title TEXT DEFAULT 'Monthly Report Brief',

  -- Recurrence Pattern
  recurrence_frequency TEXT NOT NULL CHECK (recurrence_frequency IN ('weekly', 'bi-weekly', 'monthly')),
  day_of_week INTEGER CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)), -- 0=Sunday, 6=Saturday
  day_of_month INTEGER CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)), -- 1-31
  week_of_month INTEGER CHECK (week_of_month IS NULL OR (week_of_month >= 1 AND week_of_month <= 4)), -- 1st, 2nd, 3rd, 4th week
  preferred_time TIME NOT NULL, -- e.g., '14:00'
  timezone TEXT DEFAULT 'Australia/Melbourne',

  -- Duration & Links
  duration_minutes INTEGER DEFAULT 30 CHECK (duration_minutes > 0),
  google_calendar_event_ids JSONB DEFAULT '[]'::jsonb, -- Array of created event IDs
  google_meet_link TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE NOT NULL,
  end_date DATE, -- Optional end date (null = ongoing)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_generated_at TIMESTAMPTZ, -- Last time instances were auto-generated

  -- Ensure proper recurrence configuration
  CONSTRAINT valid_monthly_config CHECK (
    (recurrence_frequency = 'monthly' AND day_of_month IS NOT NULL AND day_of_week IS NULL) OR
    (recurrence_frequency IN ('weekly', 'bi-weekly') AND day_of_week IS NOT NULL AND day_of_month IS NULL) OR
    (recurrence_frequency = 'monthly' AND day_of_week IS NOT NULL AND week_of_month IS NOT NULL AND day_of_month IS NULL)
  )
);

-- Create generated_meeting_instances table
CREATE TABLE generated_meeting_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recurring_meeting_id UUID REFERENCES recurring_meetings(id) ON DELETE CASCADE NOT NULL,

  -- Meeting Details
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  timezone TEXT DEFAULT 'Australia/Melbourne',
  google_calendar_event_id TEXT UNIQUE,
  google_meet_link TEXT,
  calendar_html_link TEXT,

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no-show')),
  attended BOOLEAN,

  -- Rescheduling
  original_date DATE, -- If rescheduled, store original date
  original_time TIME,
  reschedule_reason TEXT,

  -- Notes
  client_notes TEXT,
  admin_notes TEXT,
  meeting_summary TEXT, -- Post-meeting summary

  -- Notifications
  reminder_24h_sent BOOLEAN DEFAULT FALSE,
  reminder_1h_sent BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint to prevent duplicate instances
  UNIQUE(recurring_meeting_id, scheduled_date)
);

-- Create indexes for performance
CREATE INDEX idx_recurring_meetings_user ON recurring_meetings(user_id);
CREATE INDEX idx_recurring_meetings_active ON recurring_meetings(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_recurring_meetings_subscription ON recurring_meetings(subscription_tier);
CREATE INDEX idx_recurring_meetings_next_generation ON recurring_meetings(last_generated_at, is_active) WHERE is_active = TRUE;

CREATE INDEX idx_meeting_instances_recurring ON generated_meeting_instances(recurring_meeting_id);
CREATE INDEX idx_meeting_instances_date ON generated_meeting_instances(scheduled_date);
CREATE INDEX idx_meeting_instances_status ON generated_meeting_instances(status);
CREATE INDEX idx_meeting_instances_upcoming ON generated_meeting_instances(scheduled_date, status) WHERE status = 'scheduled';
CREATE INDEX idx_meeting_instances_reminders ON generated_meeting_instances(scheduled_date, reminder_24h_sent, reminder_1h_sent) WHERE status = 'scheduled';

-- Enable Row Level Security
ALTER TABLE recurring_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_meeting_instances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recurring_meetings
CREATE POLICY "Users manage own recurring meetings" ON recurring_meetings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins view all recurring meetings" ON recurring_meetings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- RLS Policies for generated_meeting_instances
CREATE POLICY "Users view own meeting instances" ON generated_meeting_instances
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recurring_meetings
      WHERE recurring_meetings.id = generated_meeting_instances.recurring_meeting_id
      AND recurring_meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users update own meeting instances" ON generated_meeting_instances
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM recurring_meetings
      WHERE recurring_meetings.id = generated_meeting_instances.recurring_meeting_id
      AND recurring_meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage all meeting instances" ON generated_meeting_instances
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_recurring_meeting_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recurring_meetings_updated_at
  BEFORE UPDATE ON recurring_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_meeting_updated_at();

CREATE TRIGGER meeting_instances_updated_at
  BEFORE UPDATE ON generated_meeting_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_meeting_updated_at();

-- Function to generate meeting instances for a recurring meeting
CREATE OR REPLACE FUNCTION generate_meeting_instances(
  p_recurring_meeting_id UUID,
  p_months_ahead INTEGER DEFAULT 6
)
RETURNS INTEGER AS $$
DECLARE
  v_meeting RECORD;
  v_current_date DATE;
  v_end_date DATE;
  v_next_date DATE;
  v_instances_created INTEGER := 0;
  v_temp_date DATE;
  v_month_start DATE;
  v_target_day INTEGER;
BEGIN
  -- Get recurring meeting details
  SELECT * INTO v_meeting
  FROM recurring_meetings
  WHERE id = p_recurring_meeting_id AND is_active = TRUE;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  v_current_date := GREATEST(v_meeting.start_date, CURRENT_DATE);
  v_end_date := COALESCE(v_meeting.end_date, (CURRENT_DATE + (p_months_ahead || ' months')::INTERVAL)::DATE);

  -- Generate instances based on frequency
  WHILE v_current_date <= v_end_date LOOP
    v_next_date := NULL;

    IF v_meeting.recurrence_frequency = 'monthly' THEN
      IF v_meeting.day_of_month IS NOT NULL THEN
        -- Monthly on specific day of month (e.g., 15th of each month)
        v_month_start := DATE_TRUNC('month', v_current_date)::DATE;
        v_next_date := v_month_start + (v_meeting.day_of_month - 1 || ' days')::INTERVAL;

        -- If target date has passed this month, go to next month
        IF v_next_date < v_current_date THEN
          v_month_start := (v_month_start + '1 month'::INTERVAL)::DATE;
          v_next_date := v_month_start + (v_meeting.day_of_month - 1 || ' days')::INTERVAL;
        END IF;

        -- Handle edge case: Feb 31st doesn't exist, use last day of month
        IF EXTRACT(DAY FROM v_next_date) != v_meeting.day_of_month THEN
          v_next_date := (DATE_TRUNC('month', v_next_date) + '1 month'::INTERVAL - '1 day'::INTERVAL)::DATE;
        END IF;

        v_current_date := (DATE_TRUNC('month', v_next_date) + '1 month'::INTERVAL)::DATE;

      ELSIF v_meeting.day_of_week IS NOT NULL AND v_meeting.week_of_month IS NOT NULL THEN
        -- Monthly on specific week and day (e.g., 2nd Tuesday of each month)
        v_month_start := DATE_TRUNC('month', v_current_date)::DATE;

        -- Find first occurrence of target day in the month
        v_temp_date := v_month_start;
        WHILE EXTRACT(DOW FROM v_temp_date) != v_meeting.day_of_week LOOP
          v_temp_date := v_temp_date + '1 day'::INTERVAL;
        END LOOP;

        -- Add weeks to get to target week
        v_next_date := v_temp_date + ((v_meeting.week_of_month - 1) * 7 || ' days')::INTERVAL;

        -- If target date has passed this month, go to next month
        IF v_next_date < v_current_date THEN
          v_month_start := (v_month_start + '1 month'::INTERVAL)::DATE;
          v_temp_date := v_month_start;
          WHILE EXTRACT(DOW FROM v_temp_date) != v_meeting.day_of_week LOOP
            v_temp_date := v_temp_date + '1 day'::INTERVAL;
          END LOOP;
          v_next_date := v_temp_date + ((v_meeting.week_of_month - 1) * 7 || ' days')::INTERVAL;
        END IF;

        v_current_date := (DATE_TRUNC('month', v_next_date) + '1 month'::INTERVAL)::DATE;
      END IF;

    ELSIF v_meeting.recurrence_frequency = 'bi-weekly' THEN
      -- Every 14 days from start date
      v_next_date := v_current_date;
      WHILE v_next_date < v_current_date OR EXTRACT(DOW FROM v_next_date) != v_meeting.day_of_week LOOP
        v_next_date := v_next_date + '1 day'::INTERVAL;
      END LOOP;
      v_current_date := v_next_date + '14 days'::INTERVAL;

    ELSIF v_meeting.recurrence_frequency = 'weekly' THEN
      -- Every 7 days on specific day
      v_next_date := v_current_date;
      WHILE v_next_date < v_current_date OR EXTRACT(DOW FROM v_next_date) != v_meeting.day_of_week LOOP
        v_next_date := v_next_date + '1 day'::INTERVAL;
      END LOOP;
      v_current_date := v_next_date + '7 days'::INTERVAL;
    END IF;

    -- Insert instance if it doesn't exist and is within our range
    IF v_next_date IS NOT NULL AND v_next_date <= v_end_date THEN
      INSERT INTO generated_meeting_instances (
        recurring_meeting_id,
        scheduled_date,
        scheduled_time,
        timezone
      )
      VALUES (
        p_recurring_meeting_id,
        v_next_date,
        v_meeting.preferred_time,
        v_meeting.timezone
      )
      ON CONFLICT (recurring_meeting_id, scheduled_date) DO NOTHING;

      IF FOUND THEN
        v_instances_created := v_instances_created + 1;
      END IF;
    END IF;
  END LOOP;

  -- Update last_generated_at timestamp
  UPDATE recurring_meetings
  SET last_generated_at = NOW()
  WHERE id = p_recurring_meeting_id;

  RETURN v_instances_created;
END;
$$ LANGUAGE plpgsql;

-- Function to generate instances for all active recurring meetings
CREATE OR REPLACE FUNCTION generate_all_meeting_instances(p_months_ahead INTEGER DEFAULT 6)
RETURNS TABLE(recurring_meeting_id UUID, instances_created INTEGER) AS $$
DECLARE
  v_meeting_record RECORD;
  v_instances INTEGER;
BEGIN
  FOR v_meeting_record IN
    SELECT id FROM recurring_meetings
    WHERE is_active = TRUE
    AND (last_generated_at IS NULL OR last_generated_at < NOW() - '1 week'::INTERVAL)
  LOOP
    SELECT generate_meeting_instances(v_meeting_record.id, p_months_ahead) INTO v_instances;

    recurring_meeting_id := v_meeting_record.id;
    instances_created := v_instances;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- View for easy querying of upcoming meetings with user info
CREATE VIEW upcoming_meetings_view AS
SELECT
  gmi.id,
  gmi.recurring_meeting_id,
  gmi.scheduled_date,
  gmi.scheduled_time,
  gmi.timezone,
  gmi.status,
  gmi.google_meet_link,
  gmi.calendar_html_link,
  gmi.client_notes,
  rm.user_id,
  rm.subscription_tier,
  rm.meeting_type,
  rm.title,
  rm.duration_minutes,
  up.email,
  up.full_name
FROM generated_meeting_instances gmi
JOIN recurring_meetings rm ON rm.id = gmi.recurring_meeting_id
LEFT JOIN user_profiles up ON up.id = rm.user_id
WHERE gmi.status = 'scheduled'
  AND gmi.scheduled_date >= CURRENT_DATE
ORDER BY gmi.scheduled_date ASC, gmi.scheduled_time ASC;

-- Grant permissions
GRANT SELECT ON upcoming_meetings_view TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE recurring_meetings IS 'Recurring meeting schedules for client report briefs and consultations';
COMMENT ON TABLE generated_meeting_instances IS 'Individual meeting instances generated from recurring schedules';
COMMENT ON FUNCTION generate_meeting_instances(UUID, INTEGER) IS 'Generates future meeting instances for a recurring meeting';
COMMENT ON FUNCTION generate_all_meeting_instances(INTEGER) IS 'Batch generates instances for all active recurring meetings';

-- Create function to check if user can access recurring meetings based on subscription
CREATE OR REPLACE FUNCTION user_can_access_recurring_meetings(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
BEGIN
  -- Get user's subscription tier (you may need to adjust this based on your subscription table structure)
  -- For now, we'll assume it's stored in user_profiles or a subscription table
  SELECT subscription_tier INTO v_tier
  FROM user_profiles
  WHERE id = p_user_id;

  RETURN v_tier IN ('growth', 'pro');
END;
$$ LANGUAGE plpgsql;

-- Create function to get allowed frequencies for subscription tier
CREATE OR REPLACE FUNCTION get_allowed_frequencies(p_tier TEXT)
RETURNS TEXT[] AS $$
BEGIN
  CASE p_tier
    WHEN 'growth' THEN
      RETURN ARRAY['monthly'];
    WHEN 'pro' THEN
      RETURN ARRAY['monthly', 'bi-weekly'];
    ELSE
      RETURN ARRAY[]::TEXT[];
  END CASE;
END;
$$ LANGUAGE plpgsql;