-- Google Calendar Integration Migration
-- Adds tables for storing Google OAuth tokens and calendar sync data

-- Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create table for storing Google OAuth tokens
CREATE TABLE google_auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  scope TEXT NOT NULL DEFAULT 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one token per user/email combination
  UNIQUE(user_id, email)
);

-- Add indexes for performance
CREATE INDEX idx_google_auth_tokens_user_id ON google_auth_tokens(user_id);
CREATE INDEX idx_google_auth_tokens_email ON google_auth_tokens(email);
CREATE INDEX idx_google_auth_tokens_expires_at ON google_auth_tokens(expires_at);

-- Enable RLS on the tokens table
ALTER TABLE google_auth_tokens ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can access tokens
CREATE POLICY "Admin users can manage Google tokens" ON google_auth_tokens
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Add Google Calendar fields to bookings table
ALTER TABLE bookings ADD COLUMN google_calendar_event_id TEXT;
ALTER TABLE bookings ADD COLUMN google_meet_link TEXT;
ALTER TABLE bookings ADD COLUMN calendar_sync_status TEXT DEFAULT 'pending' CHECK (calendar_sync_status IN ('pending', 'synced', 'failed', 'cancelled'));
ALTER TABLE bookings ADD COLUMN calendar_sync_error TEXT;
ALTER TABLE bookings ADD COLUMN calendar_synced_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN calendar_retry_count INTEGER DEFAULT 0;

-- Add indexes for calendar fields
CREATE INDEX idx_bookings_google_calendar_event_id ON bookings(google_calendar_event_id);
CREATE INDEX idx_bookings_calendar_sync_status ON bookings(calendar_sync_status);

-- Create table for Google Calendar webhook subscriptions (optional)
CREATE TABLE google_calendar_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  resource_uri TEXT NOT NULL,
  channel_id TEXT NOT NULL UNIQUE,
  expiration_time TIMESTAMPTZ NOT NULL,
  token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for webhook table
CREATE INDEX idx_google_calendar_webhooks_calendar_id ON google_calendar_webhooks(calendar_id);
CREATE INDEX idx_google_calendar_webhooks_channel_id ON google_calendar_webhooks(channel_id);
CREATE INDEX idx_google_calendar_webhooks_expiration ON google_calendar_webhooks(expiration_time);

-- Enable RLS on webhooks table
ALTER TABLE google_calendar_webhooks ENABLE ROW LEVEL SECURITY;

-- Only admins can manage webhooks
CREATE POLICY "Admin users can manage calendar webhooks" ON google_calendar_webhooks
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create table for tracking calendar sync operations
CREATE TABLE calendar_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('create', 'update', 'delete', 'sync')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  error_message TEXT,
  google_event_id TEXT,
  retry_count INTEGER DEFAULT 0,
  request_data JSONB,
  response_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add indexes for sync logs
CREATE INDEX idx_calendar_sync_logs_booking_id ON calendar_sync_logs(booking_id);
CREATE INDEX idx_calendar_sync_logs_status ON calendar_sync_logs(status);
CREATE INDEX idx_calendar_sync_logs_operation ON calendar_sync_logs(operation_type);
CREATE INDEX idx_calendar_sync_logs_created_at ON calendar_sync_logs(created_at);

-- Enable RLS on sync logs
ALTER TABLE calendar_sync_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view sync logs
CREATE POLICY "Admin users can view calendar sync logs" ON calendar_sync_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_google_auth_tokens_updated_at
    BEFORE UPDATE ON google_auth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_calendar_webhooks_updated_at
    BEFORE UPDATE ON google_calendar_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update booking calendar sync timestamp
CREATE OR REPLACE FUNCTION update_booking_calendar_sync()
RETURNS TRIGGER AS $$
BEGIN
    -- If calendar_sync_status changed to 'synced', update synced_at timestamp
    IF NEW.calendar_sync_status = 'synced' AND (OLD.calendar_sync_status IS NULL OR OLD.calendar_sync_status != 'synced') THEN
        NEW.calendar_synced_at = NOW();
    END IF;

    -- If sync status changed from synced to failed, increment retry count
    IF NEW.calendar_sync_status = 'failed' AND OLD.calendar_sync_status != 'failed' THEN
        NEW.calendar_retry_count = COALESCE(OLD.calendar_retry_count, 0) + 1;
    END IF;

    -- Reset retry count when successfully synced
    IF NEW.calendar_sync_status = 'synced' THEN
        NEW.calendar_retry_count = 0;
        NEW.calendar_sync_error = NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for booking calendar sync updates
CREATE TRIGGER update_booking_calendar_sync_trigger
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_calendar_sync();

-- Create view for calendar sync dashboard
CREATE OR REPLACE VIEW booking_calendar_sync_status AS
SELECT
    b.id as booking_id,
    b.customer_name,
    b.business_name,
    b.datetime,
    b.status as booking_status,
    b.calendar_sync_status,
    b.google_calendar_event_id,
    b.google_meet_link,
    b.calendar_sync_error,
    b.calendar_synced_at,
    b.calendar_retry_count,
    b.created_at as booking_created_at,
    -- Count related sync logs
    (
        SELECT COUNT(*)
        FROM calendar_sync_logs csl
        WHERE csl.booking_id = b.id
    ) as sync_log_count,
    -- Latest sync log
    (
        SELECT jsonb_build_object(
            'operation', csl.operation_type,
            'status', csl.status,
            'created_at', csl.created_at,
            'error', csl.error_message
        )
        FROM calendar_sync_logs csl
        WHERE csl.booking_id = b.id
        ORDER BY csl.created_at DESC
        LIMIT 1
    ) as latest_sync_log
FROM bookings b
ORDER BY b.created_at DESC;

-- Grant permissions to authenticated users
GRANT SELECT ON booking_calendar_sync_status TO authenticated;

-- Create function to get Google auth token for admin
CREATE OR REPLACE FUNCTION get_google_auth_token(user_email TEXT DEFAULT NULL)
RETURNS TABLE(
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    is_expired BOOLEAN
) AS $$
BEGIN
    -- Only admin users can call this function
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    -- Get the most recent token for the specified email or default admin email
    RETURN QUERY
    SELECT
        gat.access_token,
        gat.refresh_token,
        gat.expires_at,
        (gat.expires_at <= NOW()) as is_expired
    FROM google_auth_tokens gat
    WHERE gat.email = COALESCE(user_email, 'matt@yourmateagency.com.au')
    ORDER BY gat.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to store/update Google auth token
CREATE OR REPLACE FUNCTION store_google_auth_token(
    user_email TEXT,
    new_access_token TEXT,
    new_refresh_token TEXT,
    expires_in_seconds INTEGER,
    token_scope TEXT DEFAULT 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
)
RETURNS UUID AS $$
DECLARE
    token_id UUID;
BEGIN
    -- Only admin users can call this function
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    -- Insert or update the token
    INSERT INTO google_auth_tokens (
        user_id,
        email,
        access_token,
        refresh_token,
        expires_at,
        scope
    )
    VALUES (
        auth.uid(),
        user_email,
        new_access_token,
        new_refresh_token,
        NOW() + (expires_in_seconds || ' seconds')::INTERVAL,
        token_scope
    )
    ON CONFLICT (user_id, email)
    DO UPDATE SET
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        expires_at = EXCLUDED.expires_at,
        scope = EXCLUDED.scope,
        updated_at = NOW()
    RETURNING id INTO token_id;

    RETURN token_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log calendar sync operations
CREATE OR REPLACE FUNCTION log_calendar_sync_operation(
    booking_uuid UUID,
    operation TEXT,
    sync_status TEXT,
    event_id TEXT DEFAULT NULL,
    error_msg TEXT DEFAULT NULL,
    request_json JSONB DEFAULT NULL,
    response_json JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO calendar_sync_logs (
        booking_id,
        operation_type,
        status,
        google_event_id,
        error_message,
        request_data,
        response_data,
        completed_at
    )
    VALUES (
        booking_uuid,
        operation,
        sync_status,
        event_id,
        error_msg,
        request_json,
        response_json,
        CASE WHEN sync_status IN ('success', 'failed') THEN NOW() ELSE NULL END
    )
    RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments to tables for documentation
COMMENT ON TABLE google_auth_tokens IS 'Stores Google OAuth 2.0 tokens for calendar API access';
COMMENT ON TABLE google_calendar_webhooks IS 'Stores Google Calendar webhook subscriptions for real-time updates';
COMMENT ON TABLE calendar_sync_logs IS 'Logs all calendar synchronization operations for debugging and auditing';

COMMENT ON COLUMN bookings.google_calendar_event_id IS 'Google Calendar event ID for this booking';
COMMENT ON COLUMN bookings.google_meet_link IS 'Google Meet link generated for this booking';
COMMENT ON COLUMN bookings.calendar_sync_status IS 'Current synchronization status with Google Calendar';
COMMENT ON COLUMN bookings.calendar_sync_error IS 'Error message if calendar synchronization failed';
COMMENT ON COLUMN bookings.calendar_synced_at IS 'Timestamp when booking was successfully synced to calendar';
COMMENT ON COLUMN bookings.calendar_retry_count IS 'Number of times calendar sync has been retried';

-- Insert sample webhook placeholder (to be updated when webhooks are configured)
-- This is commented out since webhooks need to be set up manually
-- INSERT INTO google_calendar_webhooks (
--     calendar_id,
--     resource_id,
--     resource_uri,
--     channel_id,
--     expiration_time,
--     token
-- ) VALUES (
--     'matt@yourmateagency.com.au',
--     'placeholder',
--     'https://www.googleapis.com/calendar/v3/calendars/matt@yourmateagency.com.au/events',
--     gen_random_uuid()::text,
--     NOW() + INTERVAL '7 days',
--     gen_random_uuid()::text
-- );