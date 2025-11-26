-- Content Calendar System Schema Migration
-- Created: 2024-11-20
-- Description: Creates tables and policies for content calendar management system
-- Supports scheduled posts, revisions, comments, and images across multiple platforms

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for content calendar
CREATE TYPE content_platform AS ENUM ('facebook', 'instagram', 'linkedin', 'twitter');
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'published', 'cancelled');
CREATE TYPE subscription_tier AS ENUM ('starter', 'growth', 'pro');

-- Create content_calendar_posts table
-- Stores scheduled social media posts with subscription tier support
CREATE TABLE content_calendar_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_tier subscription_tier NOT NULL,
    platform content_platform NOT NULL,
    scheduled_date TIMESTAMPTZ NOT NULL,
    status post_status NOT NULL DEFAULT 'draft',
    original_caption TEXT NOT NULL, -- AI-generated caption
    current_caption TEXT NOT NULL,  -- Latest edited version
    image_url TEXT,                 -- Optional image URL
    ai_generated BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create content_calendar_revisions table
-- Tracks all caption edits for audit trail and version control
CREATE TABLE content_calendar_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES content_calendar_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    caption TEXT NOT NULL,
    revision_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create content_calendar_comments table
-- Stores client feedback and comments on posts
CREATE TABLE content_calendar_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES content_calendar_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create content_calendar_images table
-- Manages custom uploaded images for posts
CREATE TABLE content_calendar_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES content_calendar_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,     -- Supabase storage path
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for optimal performance
-- Primary lookup patterns: user posts, scheduled dates, status filtering
CREATE INDEX idx_content_calendar_posts_user_id ON content_calendar_posts(user_id);
CREATE INDEX idx_content_calendar_posts_scheduled_date ON content_calendar_posts(scheduled_date);
CREATE INDEX idx_content_calendar_posts_status ON content_calendar_posts(status);
CREATE INDEX idx_content_calendar_posts_user_scheduled ON content_calendar_posts(user_id, scheduled_date);
CREATE INDEX idx_content_calendar_posts_user_status ON content_calendar_posts(user_id, status);

-- Indexes for related tables
CREATE INDEX idx_content_calendar_revisions_post_id ON content_calendar_revisions(post_id);
CREATE INDEX idx_content_calendar_revisions_user_id ON content_calendar_revisions(user_id);
CREATE INDEX idx_content_calendar_comments_post_id ON content_calendar_comments(post_id);
CREATE INDEX idx_content_calendar_comments_user_id ON content_calendar_comments(user_id);
CREATE INDEX idx_content_calendar_images_post_id ON content_calendar_images(post_id);
CREATE INDEX idx_content_calendar_images_user_id ON content_calendar_images(user_id);

-- Create unique constraint for revision numbers per post
CREATE UNIQUE INDEX idx_content_calendar_revisions_post_revision
ON content_calendar_revisions(post_id, revision_number);

-- Add updated_at trigger for posts table
-- Reuse existing trigger function from case studies migration
CREATE TRIGGER update_content_calendar_posts_updated_at
    BEFORE UPDATE ON content_calendar_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE content_calendar_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_calendar_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_calendar_posts
-- Users can manage their own posts
CREATE POLICY "Users can manage their own posts" ON content_calendar_posts
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Admins can manage all posts
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
-- Users can manage revisions for their own posts
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

-- Admins can manage all revisions
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
-- Users can manage comments on their own posts
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

-- Admins can manage all comments
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
-- Users can manage images for their own posts
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

-- Admins can manage all images
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

-- Create storage bucket for content calendar images
-- This will be handled by the storage setup in the next migration section
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-calendar-images', 'content-calendar-images', true);

-- Create storage policies for content calendar images bucket
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

-- Add helpful comments for future reference
COMMENT ON TABLE content_calendar_posts IS 'Stores scheduled social media posts with platform and subscription tier support';
COMMENT ON TABLE content_calendar_revisions IS 'Tracks all caption edits for audit trail and version control';
COMMENT ON TABLE content_calendar_comments IS 'Stores client feedback and comments on posts';
COMMENT ON TABLE content_calendar_images IS 'Manages custom uploaded images for posts via Supabase storage';

COMMENT ON COLUMN content_calendar_posts.subscription_tier IS 'User subscription level determining feature access limits';
COMMENT ON COLUMN content_calendar_posts.original_caption IS 'AI-generated caption stored for reference';
COMMENT ON COLUMN content_calendar_posts.current_caption IS 'Latest edited version of the caption';
COMMENT ON COLUMN content_calendar_posts.scheduled_date IS 'Target publication date/time in Australia/Melbourne timezone';
COMMENT ON COLUMN content_calendar_images.storage_path IS 'Full path in Supabase storage bucket';