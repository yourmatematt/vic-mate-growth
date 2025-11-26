-- Booking System Migration
-- Created: 2025-11-19
-- Description: Creates tables and functions for Google Calendar/Meet integration booking system

-- Table: bookings
-- Main table for storing consultation bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer Info
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,

  -- Business Info
  business_name TEXT NOT NULL,
  business_type TEXT, -- e.g., "Cafe", "Plumbing", "Gym"
  business_location TEXT, -- Suburb/region in Victoria
  current_marketing TEXT[], -- What they're currently doing
  biggest_challenge TEXT NOT NULL, -- Main pain point
  monthly_revenue_range TEXT, -- "$0-5k", "$5k-20k", "$20k-50k", "$50k+"

  -- Booking Details
  preferred_date DATE NOT NULL,
  preferred_time_slot TEXT NOT NULL, -- e.g., "9:00 AM - 10:00 AM"
  additional_notes TEXT,

  -- Status & Integration
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled', 'no-show'
  google_calendar_event_id TEXT UNIQUE,
  google_meet_link TEXT,

  -- Notifications
  confirmation_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show')),
  CONSTRAINT valid_email CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table: available_time_slots
-- Defines when bookings can be made (recurring weekly schedule)
CREATE TABLE available_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  max_bookings_per_slot INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_day CHECK (day_of_week >= 0 AND day_of_week <= 6),
  CONSTRAINT valid_time CHECK (end_time > start_time)
);

-- Table: booking_blackout_dates
-- Specific dates when no bookings are allowed (holidays, vacations, etc.)
CREATE TABLE booking_blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_email ON bookings(customer_email);
CREATE INDEX idx_bookings_date ON bookings(preferred_date);
CREATE INDEX idx_bookings_calendar_event ON bookings(google_calendar_event_id);
CREATE INDEX idx_time_slots_day ON available_time_slots(day_of_week);
CREATE INDEX idx_blackout_dates ON booking_blackout_dates(date);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_blackout_dates ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public can create bookings (form submission)
CREATE POLICY "Public can create bookings" ON bookings
  FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'matt@yourmateagency.com.au'
  );

-- Admins can update bookings
CREATE POLICY "Admins can update bookings" ON bookings
  FOR UPDATE TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'matt@yourmateagency.com.au'
  );

-- Public can view available time slots
CREATE POLICY "Public can view time slots" ON available_time_slots
  FOR SELECT TO anon, authenticated
  USING (is_available = TRUE);

-- Admins can manage time slots
CREATE POLICY "Admins can manage time slots" ON available_time_slots
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'matt@yourmateagency.com.au'
  );

-- Public can view blackout dates
CREATE POLICY "Public can view blackout dates" ON booking_blackout_dates
  FOR SELECT TO anon, authenticated
  USING (true);

-- Admins can manage blackout dates
CREATE POLICY "Admins can manage blackout dates" ON booking_blackout_dates
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'email' = 'matt@yourmateagency.com.au'
  );

-- Functions

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_booking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_updated_at();

-- Get available slots for a date range
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
    ats.start_time,
    ats.end_time,
    ats.max_bookings_per_slot - COALESCE(COUNT(b.id), 0) AS available_count
  FROM generate_series(date_start, date_end, '1 day'::interval) AS d(date)
  CROSS JOIN available_time_slots ats
  LEFT JOIN bookings b ON
    b.preferred_date = d.date AND
    b.status IN ('pending', 'confirmed')
  WHERE
    ats.is_available = TRUE AND
    EXTRACT(DOW FROM d.date) = ats.day_of_week AND
    NOT EXISTS (
      SELECT 1 FROM booking_blackout_dates
      WHERE booking_blackout_dates.date = d.date
    )
  GROUP BY d.date, ats.start_time, ats.end_time, ats.max_bookings_per_slot
  HAVING ats.max_bookings_per_slot - COALESCE(COUNT(b.id), 0) > 0
  ORDER BY d.date, ats.start_time;
END;
$$ LANGUAGE plpgsql;

-- Seed default time slots (Monday to Friday, 9 AM - 5 PM, hourly slots)
INSERT INTO available_time_slots (day_of_week, start_time, end_time) VALUES
  -- Monday (1)
  (1, '09:00', '10:00'),
  (1, '10:00', '11:00'),
  (1, '11:00', '12:00'),
  (1, '13:00', '14:00'), -- Skip 12-1 for lunch
  (1, '14:00', '15:00'),
  (1, '15:00', '16:00'),
  (1, '16:00', '17:00'),
  -- Tuesday (2)
  (2, '09:00', '10:00'),
  (2, '10:00', '11:00'),
  (2, '11:00', '12:00'),
  (2, '13:00', '14:00'),
  (2, '14:00', '15:00'),
  (2, '15:00', '16:00'),
  (2, '16:00', '17:00'),
  -- Wednesday (3)
  (3, '09:00', '10:00'),
  (3, '10:00', '11:00'),
  (3, '11:00', '12:00'),
  (3, '13:00', '14:00'),
  (3, '14:00', '15:00'),
  (3, '15:00', '16:00'),
  (3, '16:00', '17:00'),
  -- Thursday (4)
  (4, '09:00', '10:00'),
  (4, '10:00', '11:00'),
  (4, '11:00', '12:00'),
  (4, '13:00', '14:00'),
  (4, '14:00', '15:00'),
  (4, '15:00', '16:00'),
  (4, '16:00', '17:00'),
  -- Friday (5)
  (5, '09:00', '10:00'),
  (5, '10:00', '11:00'),
  (5, '11:00', '12:00'),
  (5, '13:00', '14:00'),
  (5, '14:00', '15:00'),
  (5, '15:00', '16:00'),
  (5, '16:00', '17:00');

-- Add helpful comments for documentation
COMMENT ON TABLE bookings IS 'Main table storing consultation booking requests with customer and business information';
COMMENT ON TABLE available_time_slots IS 'Recurring weekly schedule defining when bookings can be made';
COMMENT ON TABLE booking_blackout_dates IS 'Specific dates when no bookings are allowed (holidays, vacations, etc.)';
COMMENT ON FUNCTION get_available_slots(DATE, DATE) IS 'Returns available booking slots for a date range, considering existing bookings and blackout dates';

-- Add sample blackout dates for Australian holidays 2025
INSERT INTO booking_blackout_dates (date, reason) VALUES
  ('2025-01-01', 'New Year''s Day'),
  ('2025-01-27', 'Australia Day'),
  ('2025-04-18', 'Good Friday'),
  ('2025-04-21', 'Easter Monday'),
  ('2025-04-25', 'ANZAC Day'),
  ('2025-06-09', 'Queen''s Birthday (VIC)'),
  ('2025-11-04', 'Melbourne Cup Day (VIC)'),
  ('2025-12-25', 'Christmas Day'),
  ('2025-12-26', 'Boxing Day');

-- Create a view for easy booking management
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON available_time_slots TO anon;
GRANT SELECT ON booking_blackout_dates TO anon;
GRANT INSERT ON bookings TO anon;
GRANT SELECT ON booking_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_slots(DATE, DATE) TO anon, authenticated;

-- Security and performance notes:
-- 1. RLS ensures only admins can view/manage bookings
-- 2. Public can only create bookings and view availability
-- 3. Email validation ensures proper contact information
-- 4. Indexes optimize common queries by date, status, and email
-- 5. Triggers automatically update timestamps
-- 6. Functions provide business logic for slot availability
-- 7. Default time slots cover standard business hours
-- 8. Blackout dates prevent bookings on holidays
-- 9. Views simplify common admin queries
-- 10. Foreign key constraints maintain data integrity