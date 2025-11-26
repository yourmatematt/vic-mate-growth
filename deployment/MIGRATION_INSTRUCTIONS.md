# Database Migration Instructions

## Overview

This guide walks you through deploying all pending migrations to Supabase using the Dashboard SQL Editor.

**Project:** Your Mate Agency - vic-mate-growth
**Supabase Project URL:** https://wcawetkkyfhmvgfrfbpi.supabase.co

## Pre-Deployment Checklist

- [ ] Access to Supabase Dashboard with admin privileges
- [ ] Backup any existing data (if production)
- [ ] Review `CONSOLIDATED_MIGRATIONS.sql` for any project-specific changes
- [ ] Ensure you have at least 30 minutes for the deployment

---

## Already Deployed (DO NOT RE-RUN)

These migrations are already in production:

| Migration | Tables Created |
|-----------|----------------|
| `20241120140000_create_content_calendar_schema.sql` | content_calendar_posts, revisions, comments, images |
| `20241120150000_content_calendar_standalone.sql` | user_profiles (base), storage bucket |

---

## What Gets Deployed

| Section | Tables/Features |
|---------|-----------------|
| Extensions | uuid-ossp, pgcrypto |
| Custom Types | case_study_status, plan_change_type |
| user_profiles Updates | full_name, subscription_tier columns |
| Case Studies | case_studies, case_study_images |
| Case Studies Storage | case-studies bucket + policies |
| Booking System | bookings, booking_time_slots, booking_blackout_dates |
| Google Calendar | google_auth_tokens, google_calendar_webhooks, calendar_sync_logs |
| Recurring Meetings | recurring_meetings, generated_meeting_instances |
| Billing | plan_changes, plan_change_views, plan_change_attempts, upgrade_trials |
| Admin Functions | make_user_admin, demote_admin, list_admin_users, is_user_admin |

---

## Step-by-Step Deployment

### Step 1: Access SQL Editor

1. Go to https://supabase.com/dashboard/project/wcawetkkyfhmvgfrfbpi
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Pre-flight Check

Run this query first to see current database state:

```sql
-- Check existing tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check existing storage buckets
SELECT id, name, public FROM storage.buckets;

-- Check user_profiles columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_profiles';
```

**Expected:** You should see:
- `user_profiles`, `content_calendar_posts`, `content_calendar_revisions`, `content_calendar_comments`, `content_calendar_images`
- Storage bucket: `content-calendar-images`

### Step 3: Run the Consolidated Migration

1. Open `deployment/CONSOLIDATED_MIGRATIONS.sql` in a text editor
2. Copy the entire file contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Ctrl/Cmd + Enter)

**Expected:** The query should complete without errors. You may see some NOTICE messages - these are informational.

### Step 4: Verify Each Section

Run these verification queries:

#### 4a. Check All Tables Created

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables (alphabetical):**
- booking_blackout_dates
- booking_time_slots
- bookings
- calendar_sync_logs
- case_studies
- case_study_images
- content_calendar_comments
- content_calendar_images
- content_calendar_posts
- content_calendar_revisions
- generated_meeting_instances
- google_auth_tokens
- google_calendar_webhooks
- plan_change_attempts
- plan_change_views
- plan_changes
- recurring_meetings
- upgrade_trials
- user_profiles

#### 4b. Check Storage Buckets

```sql
SELECT id, name, public, file_size_limit
FROM storage.buckets;
```

**Expected buckets:**
- `content-calendar-images` (public, 5MB limit)
- `case-studies` (public, 10MB limit)

#### 4c. Check user_profiles Has All Columns

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

**Expected columns:**
- id (uuid)
- email (text)
- role (text)
- created_at (timestamp with time zone)
- updated_at (timestamp with time zone)
- full_name (text)
- subscription_tier (user-defined - subscription_tier enum)

#### 4d. Check Custom Types

```sql
SELECT typname, typtype
FROM pg_type
WHERE typname IN ('case_study_status', 'plan_change_type', 'subscription_tier', 'content_platform', 'post_status');
```

**Expected:** 5 rows, all with typtype = 'e' (enum)

#### 4e. Check Functions Exist

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
AND routine_schema = 'public'
ORDER BY routine_name;
```

**Expected functions include:**
- demote_admin
- generate_all_meeting_instances
- generate_meeting_instances
- get_allowed_frequencies
- get_available_slots
- get_case_study_image_url
- get_google_auth_token
- is_user_admin
- list_admin_users
- log_calendar_sync_operation
- make_user_admin
- store_google_auth_token
- update_booking_calendar_sync
- update_booking_updated_at
- update_recurring_meeting_updated_at
- update_updated_at_column
- user_can_access_recurring_meetings

#### 4f. Check Views Exist

```sql
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public';
```

**Expected views:**
- booking_calendar_sync_status
- booking_summary
- case_studies_by_industry
- published_case_studies
- upcoming_meetings_view

#### 4g. Check Default Time Slots Seeded

```sql
SELECT day_of_week, start_time, end_time, is_available
FROM booking_time_slots
ORDER BY day_of_week, start_time;
```

**Expected:** 35 rows (Monday-Friday, 7 slots each day, skipping 12-1pm lunch)

#### 4h. Check Blackout Dates Seeded

```sql
SELECT start_date, reason
FROM booking_blackout_dates
ORDER BY start_date;
```

**Expected:** 9 Victorian public holidays for 2025

### Step 5: Create Admin User

After Matt signs up with `matt@yourmateagency.com.au`, run:

```sql
SELECT * FROM make_user_admin('matt@yourmateagency.com.au');
```

To verify:
```sql
SELECT * FROM list_admin_users();
```

---

## Troubleshooting

### Error: "type already exists"

This is safe to ignore - the migration uses `CREATE TYPE IF NOT EXISTS` equivalent (DO blocks with exception handling).

### Error: "relation already exists"

This is safe to ignore - all CREATE TABLE statements use `IF NOT EXISTS`.

### Error: "policy already exists"

Run the individual DROP POLICY statement first, then re-run the CREATE POLICY.

### Error: "function already exists"

This is safe - all functions use `CREATE OR REPLACE`.

### Error: "permission denied for table"

Ensure you're logged in as the project owner or have appropriate permissions. The SQL Editor uses the `postgres` role by default which has full access.

### Error: "duplicate key value violates unique constraint" on seed data

The seed data (time slots, blackout dates) already exists. Safe to ignore.

---

## Rollback Instructions

If you need to undo specific sections, run these in reverse order:

### Rollback Billing Tables
```sql
DROP TABLE IF EXISTS upgrade_trials CASCADE;
DROP TABLE IF EXISTS plan_change_attempts CASCADE;
DROP TABLE IF EXISTS plan_change_views CASCADE;
DROP TABLE IF EXISTS plan_changes CASCADE;
DROP TYPE IF EXISTS plan_change_type CASCADE;
```

### Rollback Recurring Meetings
```sql
DROP VIEW IF EXISTS upcoming_meetings_view CASCADE;
DROP TABLE IF EXISTS generated_meeting_instances CASCADE;
DROP TABLE IF EXISTS recurring_meetings CASCADE;
```

### Rollback Google Calendar
```sql
DROP VIEW IF EXISTS booking_calendar_sync_status CASCADE;
DROP TABLE IF EXISTS calendar_sync_logs CASCADE;
DROP TABLE IF EXISTS google_calendar_webhooks CASCADE;
DROP TABLE IF EXISTS google_auth_tokens CASCADE;
-- Note: Booking columns cannot be easily dropped without data loss
```

### Rollback Booking System
```sql
DROP VIEW IF EXISTS booking_summary CASCADE;
DROP FUNCTION IF EXISTS get_available_slots(DATE, DATE) CASCADE;
DROP TABLE IF EXISTS booking_blackout_dates CASCADE;
DROP TABLE IF EXISTS booking_time_slots CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
```

### Rollback Case Studies
```sql
DROP VIEW IF EXISTS case_studies_by_industry CASCADE;
DROP VIEW IF EXISTS published_case_studies CASCADE;
DROP TABLE IF EXISTS case_study_images CASCADE;
DROP TABLE IF EXISTS case_studies CASCADE;
DROP TYPE IF EXISTS case_study_status CASCADE;

-- Remove storage bucket
DELETE FROM storage.buckets WHERE id = 'case-studies';
```

### Full Rollback (DANGER - destroys all data)
```sql
-- DO NOT RUN THIS UNLESS YOU WANT TO START FRESH
-- This will delete ALL tables including content_calendar

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

---

## Post-Deployment Tasks

1. **Test the booking form** at `/book-strategy-call`
2. **Test case study CRUD** at `/admin/case-studies`
3. **Verify time slot management** at `/admin/time-slots`
4. **Upload Matt's photos** to the About page
5. **Configure Google Calendar** (see `docs/GOOGLE_CALENDAR_SETUP.md`)
6. **Set up email notifications** (SendGrid/Resend)

---

## Support

If issues persist:
1. Check Supabase Dashboard Logs (Settings > Database > Logs)
2. Review the specific section in `CONSOLIDATED_MIGRATIONS.sql`
3. Contact the development team

---

Last Updated: November 26, 2025
