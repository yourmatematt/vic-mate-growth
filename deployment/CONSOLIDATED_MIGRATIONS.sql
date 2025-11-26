-- ============================================================================
-- YOUR MATE AGENCY - CONSOLIDATED MIGRATIONS FOR MANUAL DEPLOYMENT
-- ============================================================================
-- Generated: 2025-11-26
-- Purpose: Run all pending migrations via Supabase Dashboard SQL Editor
--
-- ALREADY DEPLOYED (DO NOT RUN):
--   - 20241120140000_create_content_calendar_schema.sql
--   - 20241120150000_content_calendar_standalone.sql
--
-- THIS FILE CONSOLIDATES:
--   1. Case Studies Schema (20251118211022)
--   2. Case Studies Storage (20251118212750)
--   3. Booking System (20251119122057)
--   4. Google Calendar Integration (20251119145000)
--   5. Recurring Meetings (20241119160000)
--   6. Billing Schema (20251121000000)
--   7. Admin User Functions (99999999999999)
--
-- DEPENDENCY ORDER:
--   1. Extensions (uuid-ossp, pgcrypto)
--   2. Core types (case_study_status, plan_change_type)
--   3. user_profiles table (already exists from content_calendar)
--   4. Case studies tables
--   5. Booking tables
--   6. Google Calendar tables (depends on bookings, user_profiles)
--   7. Recurring meetings tables (depends on user_profiles)
--   8. Billing tables (depends on user_profiles, subscription_tier)
--   9. Admin functions (depends on user_profiles)
--
-- ============================================================================


-- ============================================================================
-- SECTION 0: PRE-FLIGHT CHECKS
-- ============================================================================
-- Verify what already exists before running

-- Run this SELECT first to see current state:
-- SELECT
--     table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;


-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================
-- These are idempotent - safe to run multiple times

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================================
-- SECTION 2: CUSTOM TYPES
-- ============================================================================
-- Note: subscription_tier, content_platform, post_status already exist from content_calendar

DO $$ BEGIN
    CREATE TYPE case_study_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_change_type AS ENUM ('upgrade', 'downgrade', 'trial_start', 'trial_convert', 'cancellation');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================================
-- SECTION 3: USER_PROFILES TABLE UPDATES
-- ============================================================================
-- user_profiles exists from content_calendar, but we need to ensure all columns exist

-- Add full_name column if not exists (needed by recurring_meetings view)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- Add subscription_tier column if not exists (needed by billing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'user_profiles' AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN subscription_tier subscription_tier DEFAULT 'starter';
    END IF;
END $$;

-- Create index on role if not exists
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Additional RLS policies for user_profiles (if not exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'user_profiles' AND policyname = 'Admins can read all profiles'
    ) THEN
        CREATE POLICY "Admins can read all profiles" ON user_profiles
            FOR SELECT
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM user_profiles up
                    WHERE up.id = auth.uid()
                    AND up.role = 'admin'
                )
            );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON user_profiles
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = id)
            WITH CHECK (auth.uid() = id);
    END IF;
END $$;


-- ============================================================================
-- SECTION 4: CASE STUDIES TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS case_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    client_name TEXT NOT NULL,
    client_industry TEXT,
    client_location TEXT,
    challenge TEXT,
    solution TEXT,
    results TEXT,
    testimonial TEXT,
    testimonial_author TEXT,
    before_image_url TEXT,
    after_image_url TEXT,
    featured_image_url TEXT,
    metrics JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    status case_study_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS case_study_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_study_id UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Case studies indexes
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_status_published ON case_studies(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_case_studies_tags ON case_studies USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_case_studies_author ON case_studies(author_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_industry ON case_studies(client_industry);
CREATE INDEX IF NOT EXISTS idx_case_studies_metrics ON case_studies USING GIN(metrics);
CREATE INDEX IF NOT EXISTS idx_case_study_images_case_study ON case_study_images(case_study_id, display_order);

-- Case studies updated_at trigger
DROP TRIGGER IF EXISTS update_case_studies_updated_at ON case_studies;
CREATE TRIGGER update_case_studies_updated_at
    BEFORE UPDATE ON case_studies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_study_images ENABLE ROW LEVEL SECURITY;

-- Case studies RLS policies
DROP POLICY IF EXISTS "Public can read published case studies" ON case_studies;
CREATE POLICY "Public can read published case studies" ON case_studies
    FOR SELECT
    USING (status = 'published');

DROP POLICY IF EXISTS "Authenticated users can read all case studies" ON case_studies;
CREATE POLICY "Authenticated users can read all case studies" ON case_studies
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authors can create case studies" ON case_studies;
CREATE POLICY "Authors can create case studies" ON case_studies
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can update own case studies" ON case_studies;
CREATE POLICY "Authors can update own case studies" ON case_studies
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Authors can delete own case studies" ON case_studies;
CREATE POLICY "Authors can delete own case studies" ON case_studies
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Case study images RLS policies
DROP POLICY IF EXISTS "Public can read images for published case studies" ON case_study_images;
CREATE POLICY "Public can read images for published case studies" ON case_study_images
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM case_studies
            WHERE case_studies.id = case_study_images.case_study_id
            AND case_studies.status = 'published'
        )
    );

DROP POLICY IF EXISTS "Authenticated users can read all images" ON case_study_images;
CREATE POLICY "Authenticated users can read all images" ON case_study_images
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authors can insert images for own case studies" ON case_study_images;
CREATE POLICY "Authors can insert images for own case studies" ON case_study_images
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM case_studies
            WHERE case_studies.id = case_study_images.case_study_id
            AND (
                case_studies.author_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE user_profiles.id = auth.uid()
                    AND user_profiles.role = 'admin'
                )
            )
        )
    );

DROP POLICY IF EXISTS "Authors can update images for own case studies" ON case_study_images;
CREATE POLICY "Authors can update images for own case studies" ON case_study_images
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM case_studies
            WHERE case_studies.id = case_study_images.case_study_id
            AND (
                case_studies.author_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE user_profiles.id = auth.uid()
                    AND user_profiles.role = 'admin'
                )
            )
        )
    );

DROP POLICY IF EXISTS "Authors can delete images for own case studies" ON case_study_images;
CREATE POLICY "Authors can delete images for own case studies" ON case_study_images
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM case_studies
            WHERE case_studies.id = case_study_images.case_study_id
            AND (
                case_studies.author_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM user_profiles
                    WHERE user_profiles.id = auth.uid()
                    AND user_profiles.role = 'admin'
                )
            )
        )
    );

-- Case studies views
CREATE OR REPLACE VIEW published_case_studies AS
SELECT
    cs.*,
    COALESCE(img_count.count, 0) as additional_image_count
FROM case_studies cs
LEFT JOIN (
    SELECT
        case_study_id,
        COUNT(*) as count
    FROM case_study_images
    GROUP BY case_study_id
) img_count ON cs.id = img_count.case_study_id
WHERE cs.status = 'published'
ORDER BY cs.published_at DESC NULLS LAST;

CREATE OR REPLACE VIEW case_studies_by_industry AS
SELECT
    client_industry,
    COUNT(*) as case_count,
    ARRAY_AGG(DISTINCT tags) as all_tags
FROM case_studies
WHERE status = 'published'
    AND client_industry IS NOT NULL
GROUP BY client_industry
ORDER BY case_count DESC;

COMMENT ON TABLE case_studies IS 'Main table storing case study content and metadata';
COMMENT ON TABLE case_study_images IS 'Additional images gallery for each case study';


-- ============================================================================
-- SECTION 5: CASE STUDIES STORAGE BUCKET
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'case-studies',
    'case-studies',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS policies for case-studies bucket
DROP POLICY IF EXISTS "Public can view case study images" ON storage.objects;
CREATE POLICY "Public can view case study images" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'case-studies');

DROP POLICY IF EXISTS "Authenticated users can upload case study images" ON storage.objects;
CREATE POLICY "Authenticated users can upload case study images" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'case-studies'
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can update their own case study images" ON storage.objects;
CREATE POLICY "Users can update their own case study images" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'case-studies'
        AND (
            auth.uid() = owner
            OR EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
            )
        )
    );

DROP POLICY IF EXISTS "Users can delete their own case study images" ON storage.objects;
CREATE POLICY "Users can delete their own case study images" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'case-studies'
        AND (
            auth.uid() = owner
            OR EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_profiles.id = auth.uid()
                AND user_profiles.role = 'admin'
            )
        )
    );

-- Helper functions for case study storage
CREATE OR REPLACE FUNCTION get_case_study_image_url(file_path TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    base_url TEXT;
BEGIN
    base_url := 'https://wcawetkkyfhmvgfrfbpi.supabase.co/storage/v1/object/public/case-studies/';
    RETURN base_url || file_path;
END;
$$;

CREATE OR REPLACE FUNCTION generate_case_study_file_path(
    case_study_id UUID,
    file_type TEXT,
    file_extension TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    timestamp_str TEXT;
BEGIN
    timestamp_str := EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT;
    RETURN case_study_id::TEXT || '/' || file_type || '_' || timestamp_str || '.' || file_extension;
END;
$$;


-- ============================================================================
-- SECTION 6: BOOKING SYSTEM TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    business_name TEXT NOT NULL,
    business_type TEXT,
    business_location TEXT,
    current_marketing TEXT[],
    biggest_challenge TEXT NOT NULL,
    monthly_revenue_range TEXT,
    preferred_date DATE NOT NULL,
    preferred_time_slot TEXT NOT NULL,
    additional_notes TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    google_calendar_event_id TEXT,
    google_meet_link TEXT,
    confirmation_sent_at TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show')),
    CONSTRAINT valid_email CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Note: We'll rename available_time_slots to booking_time_slots for consistency
CREATE TABLE IF NOT EXISTS booking_time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    max_bookings_per_slot INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_day CHECK (day_of_week >= 0 AND day_of_week <= 6),
    CONSTRAINT valid_time CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS booking_blackout_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_bookings_calendar_event ON bookings(google_calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_day ON booking_time_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_blackout_dates ON booking_blackout_dates(start_date);

-- Booking triggers
CREATE OR REPLACE FUNCTION update_booking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_updated_at ON bookings;
CREATE TRIGGER bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_updated_at();

DROP TRIGGER IF EXISTS booking_time_slots_updated_at ON booking_time_slots;
CREATE TRIGGER booking_time_slots_updated_at
    BEFORE UPDATE ON booking_time_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_updated_at();

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_blackout_dates ENABLE ROW LEVEL SECURITY;

-- Booking RLS policies
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
CREATE POLICY "Public can create bookings" ON bookings
    FOR INSERT TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
CREATE POLICY "Admins can update bookings" ON bookings
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can delete bookings" ON bookings;
CREATE POLICY "Admins can delete bookings" ON bookings
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Time slots RLS policies
DROP POLICY IF EXISTS "Public can view time slots" ON booking_time_slots;
CREATE POLICY "Public can view time slots" ON booking_time_slots
    FOR SELECT TO anon, authenticated
    USING (is_available = TRUE);

DROP POLICY IF EXISTS "Admins can manage time slots" ON booking_time_slots;
CREATE POLICY "Admins can manage time slots" ON booking_time_slots
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Blackout dates RLS policies
DROP POLICY IF EXISTS "Public can view blackout dates" ON booking_blackout_dates;
CREATE POLICY "Public can view blackout dates" ON booking_blackout_dates
    FOR SELECT TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage blackout dates" ON booking_blackout_dates;
CREATE POLICY "Admins can manage blackout dates" ON booking_blackout_dates
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Get available slots function
CREATE OR REPLACE FUNCTION get_available_slots(
    date_start DATE,
    date_end DATE
)
RETURNS TABLE (
    slot_date DATE,
    day_name TEXT,
    start_time TIME,
    end_time TIME,
    available_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.date AS slot_date,
        TO_CHAR(d.date, 'Day') AS day_name,
        bts.start_time,
        bts.end_time,
        bts.max_bookings_per_slot - COALESCE(COUNT(b.id)::INTEGER, 0) AS available_count
    FROM generate_series(date_start, date_end, '1 day'::interval) AS d(date)
    CROSS JOIN booking_time_slots bts
    LEFT JOIN bookings b ON
        b.preferred_date = d.date AND
        b.status IN ('pending', 'confirmed')
    WHERE
        bts.is_available = TRUE AND
        EXTRACT(DOW FROM d.date) = bts.day_of_week AND
        NOT EXISTS (
            SELECT 1 FROM booking_blackout_dates bbd
            WHERE d.date >= bbd.start_date
            AND d.date <= COALESCE(bbd.end_date, bbd.start_date)
        )
    GROUP BY d.date, bts.start_time, bts.end_time, bts.max_bookings_per_slot
    HAVING bts.max_bookings_per_slot - COALESCE(COUNT(b.id)::INTEGER, 0) > 0
    ORDER BY d.date, bts.start_time;
END;
$$ LANGUAGE plpgsql;

-- Booking summary view
CREATE OR REPLACE VIEW booking_summary AS
SELECT
    b.id,
    b.customer_name,
    b.customer_email,
    b.business_name,
    b.business_type,
    b.business_location,
    b.preferred_date,
    b.preferred_time_slot,
    b.status,
    b.google_calendar_event_id IS NOT NULL as calendar_synced,
    b.google_meet_link IS NOT NULL as meet_link_created,
    b.confirmation_sent_at IS NOT NULL as confirmation_sent,
    b.reminder_sent_at IS NOT NULL as reminder_sent,
    b.created_at,
    b.updated_at
FROM bookings b
ORDER BY b.preferred_date DESC, b.created_at DESC;

-- Seed default time slots (Monday to Friday, 9 AM - 5 PM)
INSERT INTO booking_time_slots (day_of_week, start_time, end_time) VALUES
    (1, '09:00', '10:00'), (1, '10:00', '11:00'), (1, '11:00', '12:00'),
    (1, '13:00', '14:00'), (1, '14:00', '15:00'), (1, '15:00', '16:00'), (1, '16:00', '17:00'),
    (2, '09:00', '10:00'), (2, '10:00', '11:00'), (2, '11:00', '12:00'),
    (2, '13:00', '14:00'), (2, '14:00', '15:00'), (2, '15:00', '16:00'), (2, '16:00', '17:00'),
    (3, '09:00', '10:00'), (3, '10:00', '11:00'), (3, '11:00', '12:00'),
    (3, '13:00', '14:00'), (3, '14:00', '15:00'), (3, '15:00', '16:00'), (3, '16:00', '17:00'),
    (4, '09:00', '10:00'), (4, '10:00', '11:00'), (4, '11:00', '12:00'),
    (4, '13:00', '14:00'), (4, '14:00', '15:00'), (4, '15:00', '16:00'), (4, '16:00', '17:00'),
    (5, '09:00', '10:00'), (5, '10:00', '11:00'), (5, '11:00', '12:00'),
    (5, '13:00', '14:00'), (5, '14:00', '15:00'), (5, '15:00', '16:00'), (5, '16:00', '17:00')
ON CONFLICT DO NOTHING;

-- Seed Victorian public holidays 2025
INSERT INTO booking_blackout_dates (start_date, reason) VALUES
    ('2025-01-01', 'New Year''s Day'),
    ('2025-01-27', 'Australia Day'),
    ('2025-04-18', 'Good Friday'),
    ('2025-04-21', 'Easter Monday'),
    ('2025-04-25', 'ANZAC Day'),
    ('2025-06-09', 'Queen''s Birthday (VIC)'),
    ('2025-11-04', 'Melbourne Cup Day (VIC)'),
    ('2025-12-25', 'Christmas Day'),
    ('2025-12-26', 'Boxing Day')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON booking_time_slots TO anon;
GRANT SELECT ON booking_blackout_dates TO anon;
GRANT INSERT ON bookings TO anon;
GRANT SELECT ON booking_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_slots(DATE, DATE) TO anon, authenticated;


-- ============================================================================
-- SECTION 7: GOOGLE CALENDAR INTEGRATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS google_auth_tokens (
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
    UNIQUE(user_id, email)
);

CREATE TABLE IF NOT EXISTS google_calendar_webhooks (
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

CREATE TABLE IF NOT EXISTS calendar_sync_logs (
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

-- Add calendar sync columns to bookings if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'calendar_sync_status') THEN
        ALTER TABLE bookings ADD COLUMN calendar_sync_status TEXT DEFAULT 'pending' CHECK (calendar_sync_status IN ('pending', 'synced', 'failed', 'cancelled'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'calendar_sync_error') THEN
        ALTER TABLE bookings ADD COLUMN calendar_sync_error TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'calendar_synced_at') THEN
        ALTER TABLE bookings ADD COLUMN calendar_synced_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'calendar_retry_count') THEN
        ALTER TABLE bookings ADD COLUMN calendar_retry_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'datetime') THEN
        ALTER TABLE bookings ADD COLUMN datetime TIMESTAMPTZ;
    END IF;
END $$;

-- Google Calendar indexes
CREATE INDEX IF NOT EXISTS idx_google_auth_tokens_user_id ON google_auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_auth_tokens_email ON google_auth_tokens(email);
CREATE INDEX IF NOT EXISTS idx_google_auth_tokens_expires_at ON google_auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_google_calendar_webhooks_calendar_id ON google_calendar_webhooks(calendar_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_webhooks_channel_id ON google_calendar_webhooks(channel_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_webhooks_expiration ON google_calendar_webhooks(expiration_time);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_logs_booking_id ON calendar_sync_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_logs_status ON calendar_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_logs_operation ON calendar_sync_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_calendar_sync_logs_created_at ON calendar_sync_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_calendar_sync_status ON bookings(calendar_sync_status);

-- Enable RLS
ALTER TABLE google_auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_logs ENABLE ROW LEVEL SECURITY;

-- Google Calendar RLS policies
DROP POLICY IF EXISTS "Admin users can manage Google tokens" ON google_auth_tokens;
CREATE POLICY "Admin users can manage Google tokens" ON google_auth_tokens
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin users can manage calendar webhooks" ON google_calendar_webhooks;
CREATE POLICY "Admin users can manage calendar webhooks" ON google_calendar_webhooks
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admin users can view calendar sync logs" ON calendar_sync_logs;
CREATE POLICY "Admin users can view calendar sync logs" ON calendar_sync_logs
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Google Calendar triggers
DROP TRIGGER IF EXISTS update_google_auth_tokens_updated_at ON google_auth_tokens;
CREATE TRIGGER update_google_auth_tokens_updated_at
    BEFORE UPDATE ON google_auth_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_google_calendar_webhooks_updated_at ON google_calendar_webhooks;
CREATE TRIGGER update_google_calendar_webhooks_updated_at
    BEFORE UPDATE ON google_calendar_webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Calendar sync trigger for bookings
CREATE OR REPLACE FUNCTION update_booking_calendar_sync()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.calendar_sync_status = 'synced' AND (OLD.calendar_sync_status IS NULL OR OLD.calendar_sync_status != 'synced') THEN
        NEW.calendar_synced_at = NOW();
    END IF;
    IF NEW.calendar_sync_status = 'failed' AND OLD.calendar_sync_status != 'failed' THEN
        NEW.calendar_retry_count = COALESCE(OLD.calendar_retry_count, 0) + 1;
    END IF;
    IF NEW.calendar_sync_status = 'synced' THEN
        NEW.calendar_retry_count = 0;
        NEW.calendar_sync_error = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_booking_calendar_sync_trigger ON bookings;
CREATE TRIGGER update_booking_calendar_sync_trigger
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_calendar_sync();

-- Google Calendar helper functions
CREATE OR REPLACE FUNCTION get_google_auth_token(user_email TEXT DEFAULT NULL)
RETURNS TABLE(
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    is_expired BOOLEAN
) AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

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
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin role required.';
    END IF;

    INSERT INTO google_auth_tokens (
        user_id, email, access_token, refresh_token, expires_at, scope
    )
    VALUES (
        auth.uid(), user_email, new_access_token, new_refresh_token,
        NOW() + (expires_in_seconds || ' seconds')::INTERVAL, token_scope
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
        booking_id, operation_type, status, google_event_id,
        error_message, request_data, response_data, completed_at
    )
    VALUES (
        booking_uuid, operation, sync_status, event_id,
        error_msg, request_json, response_json,
        CASE WHEN sync_status IN ('success', 'failed') THEN NOW() ELSE NULL END
    )
    RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Calendar sync status view
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
    (SELECT COUNT(*) FROM calendar_sync_logs csl WHERE csl.booking_id = b.id) as sync_log_count,
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

GRANT SELECT ON booking_calendar_sync_status TO authenticated;


-- ============================================================================
-- SECTION 8: RECURRING MEETINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS recurring_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    subscription_tier TEXT NOT NULL CHECK (subscription_tier IN ('growth', 'pro')),
    meeting_type TEXT DEFAULT 'report_brief' CHECK (meeting_type IN ('report_brief', 'strategy', 'consultation')),
    title TEXT DEFAULT 'Monthly Report Brief',
    recurrence_frequency TEXT NOT NULL CHECK (recurrence_frequency IN ('weekly', 'bi-weekly', 'monthly')),
    day_of_week INTEGER CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
    day_of_month INTEGER CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)),
    week_of_month INTEGER CHECK (week_of_month IS NULL OR (week_of_month >= 1 AND week_of_month <= 4)),
    preferred_time TIME NOT NULL,
    timezone TEXT DEFAULT 'Australia/Melbourne',
    duration_minutes INTEGER DEFAULT 30 CHECK (duration_minutes > 0),
    google_calendar_event_ids JSONB DEFAULT '[]'::jsonb,
    google_meet_link TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_generated_at TIMESTAMPTZ,
    CONSTRAINT valid_monthly_config CHECK (
        (recurrence_frequency = 'monthly' AND day_of_month IS NOT NULL AND day_of_week IS NULL) OR
        (recurrence_frequency IN ('weekly', 'bi-weekly') AND day_of_week IS NOT NULL AND day_of_month IS NULL) OR
        (recurrence_frequency = 'monthly' AND day_of_week IS NOT NULL AND week_of_month IS NOT NULL AND day_of_month IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS generated_meeting_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recurring_meeting_id UUID REFERENCES recurring_meetings(id) ON DELETE CASCADE NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    timezone TEXT DEFAULT 'Australia/Melbourne',
    google_calendar_event_id TEXT UNIQUE,
    google_meet_link TEXT,
    calendar_html_link TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled', 'no-show')),
    attended BOOLEAN,
    original_date DATE,
    original_time TIME,
    reschedule_reason TEXT,
    client_notes TEXT,
    admin_notes TEXT,
    meeting_summary TEXT,
    reminder_24h_sent BOOLEAN DEFAULT FALSE,
    reminder_1h_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(recurring_meeting_id, scheduled_date)
);

-- Recurring meetings indexes
CREATE INDEX IF NOT EXISTS idx_recurring_meetings_user ON recurring_meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_meetings_active ON recurring_meetings(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_recurring_meetings_subscription ON recurring_meetings(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_recurring_meetings_next_generation ON recurring_meetings(last_generated_at, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_meeting_instances_recurring ON generated_meeting_instances(recurring_meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_instances_date ON generated_meeting_instances(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_meeting_instances_status ON generated_meeting_instances(status);
CREATE INDEX IF NOT EXISTS idx_meeting_instances_upcoming ON generated_meeting_instances(scheduled_date, status) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_meeting_instances_reminders ON generated_meeting_instances(scheduled_date, reminder_24h_sent, reminder_1h_sent) WHERE status = 'scheduled';

-- Enable RLS
ALTER TABLE recurring_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_meeting_instances ENABLE ROW LEVEL SECURITY;

-- Recurring meetings RLS policies
DROP POLICY IF EXISTS "Users manage own recurring meetings" ON recurring_meetings;
CREATE POLICY "Users manage own recurring meetings" ON recurring_meetings
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all recurring meetings" ON recurring_meetings;
CREATE POLICY "Admins view all recurring meetings" ON recurring_meetings
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users view own meeting instances" ON generated_meeting_instances;
CREATE POLICY "Users view own meeting instances" ON generated_meeting_instances
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM recurring_meetings
            WHERE recurring_meetings.id = generated_meeting_instances.recurring_meeting_id
            AND recurring_meetings.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users update own meeting instances" ON generated_meeting_instances;
CREATE POLICY "Users update own meeting instances" ON generated_meeting_instances
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM recurring_meetings
            WHERE recurring_meetings.id = generated_meeting_instances.recurring_meeting_id
            AND recurring_meetings.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins manage all meeting instances" ON generated_meeting_instances;
CREATE POLICY "Admins manage all meeting instances" ON generated_meeting_instances
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Recurring meetings triggers
CREATE OR REPLACE FUNCTION update_recurring_meeting_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS recurring_meetings_updated_at ON recurring_meetings;
CREATE TRIGGER recurring_meetings_updated_at
    BEFORE UPDATE ON recurring_meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_recurring_meeting_updated_at();

DROP TRIGGER IF EXISTS meeting_instances_updated_at ON generated_meeting_instances;
CREATE TRIGGER meeting_instances_updated_at
    BEFORE UPDATE ON generated_meeting_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_recurring_meeting_updated_at();

-- Generate meeting instances function
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
BEGIN
    SELECT * INTO v_meeting
    FROM recurring_meetings
    WHERE id = p_recurring_meeting_id AND is_active = TRUE;

    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    v_current_date := GREATEST(v_meeting.start_date, CURRENT_DATE);
    v_end_date := COALESCE(v_meeting.end_date, (CURRENT_DATE + (p_months_ahead || ' months')::INTERVAL)::DATE);

    WHILE v_current_date <= v_end_date LOOP
        v_next_date := NULL;

        IF v_meeting.recurrence_frequency = 'monthly' THEN
            IF v_meeting.day_of_month IS NOT NULL THEN
                v_month_start := DATE_TRUNC('month', v_current_date)::DATE;
                v_next_date := v_month_start + (v_meeting.day_of_month - 1 || ' days')::INTERVAL;
                IF v_next_date < v_current_date THEN
                    v_month_start := (v_month_start + '1 month'::INTERVAL)::DATE;
                    v_next_date := v_month_start + (v_meeting.day_of_month - 1 || ' days')::INTERVAL;
                END IF;
                IF EXTRACT(DAY FROM v_next_date) != v_meeting.day_of_month THEN
                    v_next_date := (DATE_TRUNC('month', v_next_date) + '1 month'::INTERVAL - '1 day'::INTERVAL)::DATE;
                END IF;
                v_current_date := (DATE_TRUNC('month', v_next_date) + '1 month'::INTERVAL)::DATE;
            ELSIF v_meeting.day_of_week IS NOT NULL AND v_meeting.week_of_month IS NOT NULL THEN
                v_month_start := DATE_TRUNC('month', v_current_date)::DATE;
                v_temp_date := v_month_start;
                WHILE EXTRACT(DOW FROM v_temp_date) != v_meeting.day_of_week LOOP
                    v_temp_date := v_temp_date + '1 day'::INTERVAL;
                END LOOP;
                v_next_date := v_temp_date + ((v_meeting.week_of_month - 1) * 7 || ' days')::INTERVAL;
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
            v_next_date := v_current_date;
            WHILE v_next_date < v_current_date OR EXTRACT(DOW FROM v_next_date) != v_meeting.day_of_week LOOP
                v_next_date := v_next_date + '1 day'::INTERVAL;
            END LOOP;
            v_current_date := v_next_date + '14 days'::INTERVAL;
        ELSIF v_meeting.recurrence_frequency = 'weekly' THEN
            v_next_date := v_current_date;
            WHILE v_next_date < v_current_date OR EXTRACT(DOW FROM v_next_date) != v_meeting.day_of_week LOOP
                v_next_date := v_next_date + '1 day'::INTERVAL;
            END LOOP;
            v_current_date := v_next_date + '7 days'::INTERVAL;
        END IF;

        IF v_next_date IS NOT NULL AND v_next_date <= v_end_date THEN
            INSERT INTO generated_meeting_instances (
                recurring_meeting_id, scheduled_date, scheduled_time, timezone
            )
            VALUES (
                p_recurring_meeting_id, v_next_date, v_meeting.preferred_time, v_meeting.timezone
            )
            ON CONFLICT (recurring_meeting_id, scheduled_date) DO NOTHING;

            IF FOUND THEN
                v_instances_created := v_instances_created + 1;
            END IF;
        END IF;
    END LOOP;

    UPDATE recurring_meetings
    SET last_generated_at = NOW()
    WHERE id = p_recurring_meeting_id;

    RETURN v_instances_created;
END;
$$ LANGUAGE plpgsql;

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

-- Upcoming meetings view
CREATE OR REPLACE VIEW upcoming_meetings_view AS
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

GRANT SELECT ON upcoming_meetings_view TO authenticated;

-- Helper functions for recurring meetings
CREATE OR REPLACE FUNCTION user_can_access_recurring_meetings(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_tier TEXT;
BEGIN
    SELECT subscription_tier::TEXT INTO v_tier
    FROM user_profiles
    WHERE id = p_user_id;

    RETURN v_tier IN ('growth', 'pro');
END;
$$ LANGUAGE plpgsql;

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


-- ============================================================================
-- SECTION 9: BILLING SCHEMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS plan_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_tier subscription_tier,
    to_tier subscription_tier,
    change_type plan_change_type NOT NULL,
    effective_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_change_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_tier subscription_tier,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_change_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_tier subscription_tier NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS upgrade_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_tier subscription_tier NOT NULL,
    trial_tier subscription_tier NOT NULL,
    trial_start_date TIMESTAMPTZ NOT NULL,
    trial_end_date TIMESTAMPTZ NOT NULL,
    converted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Billing indexes
CREATE INDEX IF NOT EXISTS idx_plan_changes_user_id ON plan_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_changes_created_at ON plan_changes(created_at);
CREATE INDEX IF NOT EXISTS idx_plan_change_views_user_id ON plan_change_views(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_change_attempts_user_id ON plan_change_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_trials_user_id ON upgrade_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_upgrade_trials_end_date ON upgrade_trials(trial_end_date);

-- Enable RLS
ALTER TABLE plan_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_change_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_change_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrade_trials ENABLE ROW LEVEL SECURITY;

-- Billing RLS policies
DROP POLICY IF EXISTS "Users can view own plan changes" ON plan_changes;
CREATE POLICY "Users can view own plan changes" ON plan_changes
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all plan changes" ON plan_changes;
CREATE POLICY "Admins can view all plan changes" ON plan_changes
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can insert own plan views" ON plan_change_views;
CREATE POLICY "Users can insert own plan views" ON plan_change_views
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all plan views" ON plan_change_views;
CREATE POLICY "Admins can view all plan views" ON plan_change_views
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can insert own plan attempts" ON plan_change_attempts;
CREATE POLICY "Users can insert own plan attempts" ON plan_change_attempts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all plan attempts" ON plan_change_attempts;
CREATE POLICY "Admins can view all plan attempts" ON plan_change_attempts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can view own trials" ON upgrade_trials;
CREATE POLICY "Users can view own trials" ON upgrade_trials
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all trials" ON upgrade_trials;
CREATE POLICY "Admins can manage all trials" ON upgrade_trials
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

COMMENT ON TABLE plan_changes IS 'Tracks history of subscription changes (upgrades, downgrades, cancellations)';
COMMENT ON TABLE plan_change_views IS 'Analytics: Tracks when users view the plan change/upgrade page';
COMMENT ON TABLE plan_change_attempts IS 'Analytics: Tracks when users click Upgrade but might not complete payment';
COMMENT ON TABLE upgrade_trials IS 'Manages the 3-month upgrade trial system';


-- ============================================================================
-- SECTION 10: ADMIN USER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION make_user_admin(user_email TEXT)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    role TEXT,
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
    existing_profile RECORD;
BEGIN
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE auth.users.email = user_email
    LIMIT 1;

    IF target_user_id IS NULL THEN
        RETURN QUERY SELECT
            NULL::UUID as user_id,
            user_email as email,
            NULL::TEXT as role,
            FALSE as success,
            'User not found with email: ' || user_email as message;
        RETURN;
    END IF;

    SELECT * INTO existing_profile
    FROM user_profiles
    WHERE id = target_user_id;

    IF existing_profile IS NOT NULL THEN
        UPDATE user_profiles
        SET role = 'admin', updated_at = NOW()
        WHERE id = target_user_id;

        RETURN QUERY SELECT
            target_user_id as user_id,
            user_email as email,
            'admin'::TEXT as role,
            TRUE as success,
            'User role updated to admin successfully' as message;
    ELSE
        INSERT INTO user_profiles (id, email, role, created_at, updated_at)
        VALUES (target_user_id, user_email, 'admin', NOW(), NOW());

        RETURN QUERY SELECT
            target_user_id as user_id,
            user_email as email,
            'admin'::TEXT as role,
            TRUE as success,
            'User profile created with admin role' as message;
    END IF;

    RAISE NOTICE 'User % (ID: %) has been promoted to admin', user_email, target_user_id;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT
            target_user_id as user_id,
            user_email as email,
            NULL::TEXT as role,
            FALSE as success,
            'Error promoting user: ' || SQLERRM as message;
END;
$$;

CREATE OR REPLACE FUNCTION list_admin_users()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    role TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        up.id as user_id,
        up.email,
        up.role,
        up.created_at,
        up.updated_at
    FROM user_profiles up
    WHERE up.role = 'admin'
    ORDER BY up.created_at ASC;
$$;

CREATE OR REPLACE FUNCTION demote_admin(user_email TEXT)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    role TEXT,
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT au.id INTO target_user_id
    FROM auth.users au
    WHERE au.email = user_email
    LIMIT 1;

    IF target_user_id IS NULL THEN
        RETURN QUERY SELECT
            NULL::UUID as user_id,
            user_email as email,
            NULL::TEXT as role,
            FALSE as success,
            'User not found with email: ' || user_email as message;
        RETURN;
    END IF;

    UPDATE user_profiles
    SET role = 'user', updated_at = NOW()
    WHERE id = target_user_id;

    IF FOUND THEN
        RETURN QUERY SELECT
            target_user_id as user_id,
            user_email as email,
            'user'::TEXT as role,
            TRUE as success,
            'User role changed to regular user' as message;

        RAISE NOTICE 'User % (ID: %) has been demoted to regular user', user_email, target_user_id;
    ELSE
        RETURN QUERY SELECT
            target_user_id as user_id,
            user_email as email,
            NULL::TEXT as role,
            FALSE as success,
            'User profile not found or already a regular user' as message;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT
            target_user_id as user_id,
            user_email as email,
            NULL::TEXT as role,
            FALSE as success,
            'Error demoting user: ' || SQLERRM as message;
END;
$$;

CREATE OR REPLACE FUNCTION is_user_admin(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS(
        SELECT 1
        FROM user_profiles up
        JOIN auth.users au ON au.id = up.id
        WHERE au.email = user_email
        AND up.role = 'admin'
    );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION list_admin_users() TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_admin(TEXT) TO authenticated;

-- Restrict admin management functions to service role only
REVOKE EXECUTE ON FUNCTION make_user_admin(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION demote_admin(TEXT) FROM PUBLIC;

COMMENT ON FUNCTION make_user_admin(TEXT) IS 'Promotes a user to admin role by email. Only accessible to service role.';
COMMENT ON FUNCTION list_admin_users() IS 'Lists all users with admin role. Accessible to authenticated users.';
COMMENT ON FUNCTION demote_admin(TEXT) IS 'Demotes an admin user to regular user role. Only accessible to service role.';
COMMENT ON FUNCTION is_user_admin(TEXT) IS 'Checks if a user has admin role by email. Accessible to authenticated users.';


-- ============================================================================
-- SECTION 11: SAMPLE DATA (OPTIONAL)
-- ============================================================================
-- Uncomment below to seed sample case studies

-- INSERT INTO case_studies (
--     title, slug, client_name, client_industry, client_location,
--     challenge, solution, results, testimonial, testimonial_author,
--     metrics, tags, status, published_at
-- ) VALUES
-- (
--     'Local Cafe Doubles Online Orders Through Social Media Strategy',
--     'local-cafe-doubles-online-orders',
--     'Geelong Coffee Co.',
--     'Hospitality & Tourism',
--     'Geelong, VIC',
--     'Low online visibility and declining foot traffic during COVID lockdowns',
--     'Implemented comprehensive social media strategy with Instagram marketing, Google Ads, and website optimization',
--     'Doubled online orders within 3 months, increased Instagram followers by 300%, and improved Google ranking to position 3 for "coffee Geelong"',
--     'The team at Your Mate transformed our online presence. We went from struggling to stay afloat to having more orders than we can handle!',
--     'Sarah Mitchell, Owner',
--     '{"revenue_increase": "100%", "social_followers": "300%", "google_ranking": "Position 3"}',
--     ARRAY['social-media', 'google-ads', 'hospitality'],
--     'published',
--     CURRENT_TIMESTAMP - INTERVAL '30 days'
-- )
-- ON CONFLICT (slug) DO NOTHING;


-- ============================================================================
-- END OF CONSOLIDATED MIGRATIONS
-- ============================================================================
--
-- After running this file, execute these to verify:
--
-- 1. Check all tables exist:
--    SELECT table_name FROM information_schema.tables
--    WHERE table_schema = 'public' ORDER BY table_name;
--
-- 2. Check storage buckets:
--    SELECT id, name, public FROM storage.buckets;
--
-- 3. Verify user_profiles columns:
--    SELECT column_name, data_type FROM information_schema.columns
--    WHERE table_name = 'user_profiles';
--
-- 4. Create first admin user (after they sign up):
--    SELECT make_user_admin('matt@yourmateagency.com.au');
--
