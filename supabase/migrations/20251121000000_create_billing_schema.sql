-- Billing & Subscription Management Schema Migration
-- Created: 2025-11-21
-- Description: Creates tables for tracking plan changes, upgrade trials, and billing analytics

-- Create custom types for billing
CREATE TYPE plan_change_type AS ENUM ('upgrade', 'downgrade', 'trial_start', 'trial_convert', 'cancellation');

-- Add subscription_tier to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'subscription_tier') THEN
        ALTER TABLE user_profiles ADD COLUMN subscription_tier subscription_tier DEFAULT 'starter';
    END IF;
END $$;

-- Create plan_changes table
-- Tracks history of subscription changes
CREATE TABLE plan_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_tier subscription_tier,
    to_tier subscription_tier,
    change_type plan_change_type NOT NULL,
    effective_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create plan_change_views table
-- Analytics: Tracks when users view the plan change/upgrade page
CREATE TABLE plan_change_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    viewed_tier subscription_tier, -- Optional: if they clicked details for a specific tier
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create plan_change_attempts table
-- Analytics: Tracks when users click "Upgrade" but might not complete payment
CREATE TABLE plan_change_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_tier subscription_tier NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create upgrade_trials table
-- Manages the 3-month upgrade trial system
CREATE TABLE upgrade_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    original_tier subscription_tier NOT NULL,
    trial_tier subscription_tier NOT NULL,
    trial_start_date TIMESTAMPTZ NOT NULL,
    trial_end_date TIMESTAMPTZ NOT NULL,
    converted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_plan_changes_user_id ON plan_changes(user_id);
CREATE INDEX idx_plan_changes_created_at ON plan_changes(created_at);
CREATE INDEX idx_plan_change_views_user_id ON plan_change_views(user_id);
CREATE INDEX idx_plan_change_attempts_user_id ON plan_change_attempts(user_id);
CREATE INDEX idx_upgrade_trials_user_id ON upgrade_trials(user_id);
CREATE INDEX idx_upgrade_trials_end_date ON upgrade_trials(trial_end_date);

-- Enable Row Level Security
ALTER TABLE plan_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_change_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_change_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrade_trials ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- plan_changes: Users can view their own history, Admins view all
CREATE POLICY "Users can view own plan changes" ON plan_changes
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all plan changes" ON plan_changes
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- plan_change_views: Users insert their own, Admins view all
CREATE POLICY "Users can insert own plan views" ON plan_change_views
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all plan views" ON plan_change_views
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- plan_change_attempts: Users insert their own, Admins view all
CREATE POLICY "Users can insert own plan attempts" ON plan_change_attempts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all plan attempts" ON plan_change_attempts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- upgrade_trials: Users view own, Admins manage all
CREATE POLICY "Users can view own trials" ON upgrade_trials
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all trials" ON upgrade_trials
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Comments
COMMENT ON TABLE plan_changes IS 'Tracks history of subscription changes (upgrades, downgrades, cancellations)';
COMMENT ON TABLE plan_change_views IS 'Analytics: Tracks when users view the plan change/upgrade page';
COMMENT ON TABLE plan_change_attempts IS 'Analytics: Tracks when users click Upgrade but might not complete payment';
COMMENT ON TABLE upgrade_trials IS 'Manages the 3-month upgrade trial system';
