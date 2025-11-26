-- Case Studies CMS Schema Migration
-- Created: 2025-11-18
-- Description: Creates tables and policies for case studies management system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE case_study_status AS ENUM ('draft', 'published', 'archived');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create user_profiles table for role management
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create index on role for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON user_profiles
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

-- Only service role can insert/delete profiles (handled by functions)
-- Regular users cannot directly insert/delete profiles

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create case_studies table
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

-- Create case_study_images table for additional image gallery
CREATE TABLE IF NOT EXISTS case_study_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_study_id UUID NOT NULL REFERENCES case_studies(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_case_studies_slug ON case_studies(slug);
CREATE INDEX IF NOT EXISTS idx_case_studies_status_published ON case_studies(status, published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_case_studies_tags ON case_studies USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_case_studies_author ON case_studies(author_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_industry ON case_studies(client_industry);
CREATE INDEX IF NOT EXISTS idx_case_studies_metrics ON case_studies USING GIN(metrics);
CREATE INDEX IF NOT EXISTS idx_case_study_images_case_study ON case_study_images(case_study_id, display_order);

-- Create triggers for updated_at
CREATE TRIGGER update_case_studies_updated_at
    BEFORE UPDATE ON case_studies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_study_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for case_studies table

-- Public can read published case studies
CREATE POLICY "Public can read published case studies" ON case_studies
    FOR SELECT
    USING (status = 'published');

-- Authenticated users can read all case studies (for admin dashboard)
CREATE POLICY "Authenticated users can read all case studies" ON case_studies
    FOR SELECT
    TO authenticated
    USING (true);

-- Authors can create new case studies
CREATE POLICY "Authors can create case studies" ON case_studies
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- Authors can update their own case studies or admins can update any
CREATE POLICY "Authors can update own case studies" ON case_studies
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Authors can delete their own case studies or admins can delete any
CREATE POLICY "Authors can delete own case studies" ON case_studies
    FOR DELETE
    TO authenticated
    USING (
        auth.uid() = author_id
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- RLS Policies for case_study_images table

-- Public can read images for published case studies
CREATE POLICY "Public can read images for published case studies" ON case_study_images
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM case_studies
            WHERE case_studies.id = case_study_images.case_study_id
            AND case_studies.status = 'published'
        )
    );

-- Authenticated users can read all images (for admin dashboard)
CREATE POLICY "Authenticated users can read all images" ON case_study_images
    FOR SELECT
    TO authenticated
    USING (true);

-- Authors can insert images for their own case studies
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
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            )
        )
    );

-- Authors can update images for their own case studies
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
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            )
        )
    );

-- Authors can delete images for their own case studies
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
                    SELECT 1 FROM auth.users
                    WHERE auth.users.id = auth.uid()
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            )
        )
    );

-- Create helpful views for common queries

-- Published case studies with image counts
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

-- Case studies by industry for filtering
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

-- Add helpful comments
COMMENT ON TABLE case_studies IS 'Main table storing case study content and metadata';
COMMENT ON TABLE case_study_images IS 'Additional images gallery for each case study';
COMMENT ON COLUMN case_studies.metrics IS 'JSON object storing key metrics like {"revenue_increase": "40%", "traffic_increase": "150%"}';
COMMENT ON COLUMN case_studies.tags IS 'Array of tags for categorization like ["social-media", "website-design"]';
COMMENT ON COLUMN case_studies.slug IS 'URL-friendly version of title for routing';
COMMENT ON COLUMN case_studies.featured_image_url IS 'Main hero image displayed in listings';

-- Insert sample data (optional - remove if not needed)
INSERT INTO case_studies (
    title,
    slug,
    client_name,
    client_industry,
    client_location,
    challenge,
    solution,
    results,
    testimonial,
    testimonial_author,
    metrics,
    tags,
    status,
    published_at
) VALUES
(
    'Local Cafe Doubles Online Orders Through Social Media Strategy',
    'local-cafe-doubles-online-orders',
    'Geelong Coffee Co.',
    'Hospitality & Tourism',
    'Geelong, VIC',
    'Low online visibility and declining foot traffic during COVID lockdowns',
    'Implemented comprehensive social media strategy with Instagram marketing, Google Ads, and website optimization',
    'Doubled online orders within 3 months, increased Instagram followers by 300%, and improved Google ranking to position 3 for "coffee Geelong"',
    'The team at Your Mate transformed our online presence. We went from struggling to stay afloat to having more orders than we can handle!',
    'Sarah Mitchell, Owner',
    '{"revenue_increase": "100%", "social_followers": "300%", "google_ranking": "Position 3"}',
    ARRAY['social-media', 'google-ads', 'hospitality'],
    'published',
    CURRENT_TIMESTAMP - INTERVAL '30 days'
),
(
    'Tradie Business Generates $50k in New Leads with Local SEO',
    'tradie-business-generates-50k-new-leads',
    'Ballarat Plumbing Solutions',
    'Trades & Services',
    'Ballarat, VIC',
    'Invisible online presence and relying entirely on word-of-mouth referrals',
    'Built new website, optimized for local SEO, set up Google My Business, and launched targeted Google Ads campaign',
    'Generated $50,000 in new leads within 6 months, ranking #1 for "plumber Ballarat", and booked solid for 3 months ahead',
    'We never thought we needed a website, but now we can''t imagine business without it. The phone hasn''t stopped ringing!',
    'Mike Thompson, Director',
    '{"new_leads_value": "$50,000", "google_ranking": "Position 1", "booking_pipeline": "3 months"}',
    ARRAY['local-seo', 'website-design', 'trades'],
    'published',
    CURRENT_TIMESTAMP - INTERVAL '15 days'
);