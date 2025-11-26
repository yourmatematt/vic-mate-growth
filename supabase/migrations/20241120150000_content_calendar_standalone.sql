-- Content Calendar System Migration (Standalone)
-- Created: 2024-11-20
-- Description: Creates content calendar tables independent of other systems

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for content calendar
DO $$ BEGIN
    CREATE TYPE content_platform AS ENUM ('facebook', 'instagram', 'linkedin', 'twitter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('starter', 'growth', 'pro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_profiles table if it doesn't exist (simplified version)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create content_calendar_posts table
CREATE TABLE IF NOT EXISTS content_calendar_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_tier subscription_tier NOT NULL,
    platform content_platform NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    status post_status NOT NULL DEFAULT 'draft',
    original_caption TEXT NOT NULL,
    current_caption TEXT NOT NULL,
    image_url TEXT,
    ai_generated BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create content_calendar_revisions table
CREATE TABLE IF NOT EXISTS content_calendar_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES content_calendar_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    caption TEXT NOT NULL,
    revision_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create content_calendar_comments table
CREATE TABLE IF NOT EXISTS content_calendar_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES content_calendar_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create content_calendar_images table
CREATE TABLE IF NOT EXISTS content_calendar_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES content_calendar_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_content_calendar_posts_user_id ON content_calendar_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_posts_scheduled_date ON content_calendar_posts(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_posts_status ON content_calendar_posts(status);
CREATE INDEX IF NOT EXISTS idx_content_calendar_posts_user_scheduled ON content_calendar_posts(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_content_calendar_posts_user_status ON content_calendar_posts(user_id, status);

CREATE INDEX IF NOT EXISTS idx_content_calendar_revisions_post_id ON content_calendar_revisions(post_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_revisions_user_id ON content_calendar_revisions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_comments_post_id ON content_calendar_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_comments_user_id ON content_calendar_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_images_post_id ON content_calendar_images(post_id);
CREATE INDEX IF NOT EXISTS idx_content_calendar_images_user_id ON content_calendar_images(user_id);

-- Create unique constraint for revision numbers per post
DO $$ BEGIN
    CREATE UNIQUE INDEX idx_content_calendar_revisions_post_revision
    ON content_calendar_revisions(post_id, revision_number);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- Add updated_at trigger for posts table
DROP TRIGGER IF EXISTS update_content_calendar_posts_updated_at ON content_calendar_posts;
CREATE TRIGGER update_content_calendar_posts_updated_at
    BEFORE UPDATE ON content_calendar_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE content_calendar_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar_images ENABLE ROW LEVEL SECURITY;

-- Enable RLS for user_profiles if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own posts" ON content_calendar_posts;
DROP POLICY IF EXISTS "Admins can manage all posts" ON content_calendar_posts;
DROP POLICY IF EXISTS "Users can manage revisions for their posts" ON content_calendar_revisions;
DROP POLICY IF EXISTS "Admins can manage all revisions" ON content_calendar_revisions;
DROP POLICY IF EXISTS "Users can manage comments on their posts" ON content_calendar_comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON content_calendar_comments;
DROP POLICY IF EXISTS "Users can manage images for their posts" ON content_calendar_images;
DROP POLICY IF EXISTS "Admins can manage all images" ON content_calendar_images;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

-- RLS Policies for content_calendar_posts
CREATE POLICY "Users can manage their own posts" ON content_calendar_posts
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts" ON content_calendar_posts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- RLS Policies for content_calendar_revisions
CREATE POLICY "Users can manage revisions for their posts" ON content_calendar_revisions
    FOR ALL
    TO authenticated
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM content_calendar_posts
            WHERE content_calendar_posts.id = post_id
            AND content_calendar_posts.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM content_calendar_posts
            WHERE content_calendar_posts.id = post_id
            AND content_calendar_posts.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all revisions" ON content_calendar_revisions
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- RLS Policies for content_calendar_comments
CREATE POLICY "Users can manage comments on their posts" ON content_calendar_comments
    FOR ALL
    TO authenticated
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM content_calendar_posts
            WHERE content_calendar_posts.id = post_id
            AND content_calendar_posts.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM content_calendar_posts
            WHERE content_calendar_posts.id = post_id
            AND content_calendar_posts.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all comments" ON content_calendar_comments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- RLS Policies for content_calendar_images
CREATE POLICY "Users can manage images for their posts" ON content_calendar_images
    FOR ALL
    TO authenticated
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM content_calendar_posts
            WHERE content_calendar_posts.id = post_id
            AND content_calendar_posts.user_id = auth.uid()
        )
    )
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM content_calendar_posts
            WHERE content_calendar_posts.id = post_id
            AND content_calendar_posts.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all images" ON content_calendar_images
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- User profiles policy
CREATE POLICY "Users can read own profile" ON user_profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Create storage bucket for content calendar images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'content-calendar-images',
    'content-calendar-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for content calendar images bucket
-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload images for own posts" ON storage.objects;
DROP POLICY IF EXISTS "Users can view content calendar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own content calendar images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own content calendar images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all content calendar images" ON storage.objects;

-- Users can upload images for their own posts
CREATE POLICY "Users can upload images for own posts" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'content-calendar-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can view images for their own posts and public images
CREATE POLICY "Users can view content calendar images" ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'content-calendar-images' AND
        (auth.uid()::text = (storage.foldername(name))[1] OR
         EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
         ))
    );

-- Users can update their own images
CREATE POLICY "Users can update own content calendar images" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'content-calendar-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'content-calendar-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own images
CREATE POLICY "Users can delete own content calendar images" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'content-calendar-images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Admins can manage all images in the bucket
CREATE POLICY "Admins can manage all content calendar images" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'content-calendar-images' AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    )
    WITH CHECK (
        bucket_id = 'content-calendar-images' AND
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role = 'admin'
        )
    );

-- Comments for documentation
COMMENT ON TABLE content_calendar_posts IS 'Stores scheduled social media posts with platform and subscription tier support';
COMMENT ON TABLE content_calendar_revisions IS 'Tracks all caption edits for audit trail and version control';
COMMENT ON TABLE content_calendar_comments IS 'Stores client feedback and comments on posts';
COMMENT ON TABLE content_calendar_images IS 'Manages custom uploaded images for posts via Supabase storage';