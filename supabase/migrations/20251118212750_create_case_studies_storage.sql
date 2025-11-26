-- Case Studies Storage Bucket Migration
-- Created: 2025-11-18
-- Description: Creates storage bucket and RLS policies for case study images

-- Create the case-studies storage bucket
-- This bucket will store before/after screenshots, featured images, and gallery images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-studies',
  'case-studies',
  true,                                                    -- Public bucket for easy image display
  10485760,                                               -- 10MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']  -- Allowed image formats
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS is already enabled on storage.objects by default in Supabase
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: PUBLIC READ ACCESS
-- Anyone can view/download images from the case-studies bucket
-- This allows public display of case study images on the website
CREATE POLICY "Public can view case study images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'case-studies');

-- RLS Policy 2: AUTHENTICATED UPLOAD
-- Only authenticated users (admins/authors) can upload new images
-- Enforces proper folder structure: case-studies/case-study-id/filename.ext
CREATE POLICY "Authenticated users can upload case study images" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'case-studies'
    AND auth.role() = 'authenticated'
    -- Optional: Enforce naming convention like /case-studies/{case_study_id}/{filename}
    -- AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  );

-- RLS Policy 3: AUTHENTICATED UPDATE
-- Authenticated users can update metadata of images they uploaded
-- Admins can update any image metadata
CREATE POLICY "Users can update their own case study images" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'case-studies'
    AND (
      auth.uid() = owner
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

-- RLS Policy 4: AUTHENTICATED DELETE
-- Users can delete images they uploaded
-- Admins can delete any image
-- This prevents unauthorized deletion of case study assets
CREATE POLICY "Users can delete their own case study images" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'case-studies'
    AND (
      auth.uid() = owner
      OR EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND auth.users.raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

-- Create a helper function to generate secure file URLs
-- This function can be used in application code to get proper image URLs
CREATE OR REPLACE FUNCTION get_case_study_image_url(
  file_path TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_url TEXT;
BEGIN
  -- Get the Supabase project URL (replace with your actual project URL)
  -- This should be set via environment variable in production
  base_url := 'https://wcawetkkyfhmvgfrfbpi.supabase.co/storage/v1/object/public/case-studies/';

  -- Return the complete public URL
  RETURN base_url || file_path;
END;
$$;

-- Create a helper function to organize file paths by case study
-- This ensures consistent file organization
CREATE OR REPLACE FUNCTION generate_case_study_file_path(
  case_study_id UUID,
  file_type TEXT,  -- 'before', 'after', 'featured', 'gallery'
  file_extension TEXT
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  timestamp_str TEXT;
BEGIN
  -- Generate timestamp for unique filenames
  timestamp_str := EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::TEXT;

  -- Return organized path structure
  RETURN case_study_id::TEXT || '/' || file_type || '_' || timestamp_str || '.' || file_extension;
END;
$$;

-- Add helpful comments for documentation
COMMENT ON FUNCTION get_case_study_image_url(TEXT) IS 'Generates public URL for case study images stored in Supabase storage';
COMMENT ON FUNCTION generate_case_study_file_path(UUID, TEXT, TEXT) IS 'Creates organized file paths for case study images with consistent naming convention';

-- Create a view for easy access to case study images with public URLs
-- This view joins case studies with their storage objects
CREATE OR REPLACE VIEW case_study_images_with_urls AS
SELECT
  cs.id as case_study_id,
  cs.title,
  cs.slug,
  cs.status,
  obj.id as object_id,
  obj.name as file_path,
  obj.metadata,
  obj.created_at as uploaded_at,
  get_case_study_image_url(obj.name) as public_url,
  -- Extract file type from path (before, after, featured, gallery)
  CASE
    WHEN obj.name ~ 'before_' THEN 'before'
    WHEN obj.name ~ 'after_' THEN 'after'
    WHEN obj.name ~ 'featured_' THEN 'featured'
    WHEN obj.name ~ 'gallery_' THEN 'gallery'
    ELSE 'other'
  END as image_type
FROM case_studies cs
JOIN storage.objects obj ON obj.bucket_id = 'case-studies'
  AND obj.name ~ ('^' || cs.id::TEXT || '/')
WHERE obj.bucket_id = 'case-studies'
ORDER BY cs.created_at DESC, obj.created_at DESC;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Security considerations and notes:
--
-- 1. FILE SIZE LIMIT: Set to 10MB to prevent abuse while allowing high-quality images
-- 2. MIME TYPE RESTRICTION: Only allow common web image formats
-- 3. PUBLIC BUCKET: Enables direct CDN access for fast image loading
-- 4. ORGANIZED STRUCTURE: Files are organized by case study ID for easy management
-- 5. ADMIN OVERRIDE: Admins can manage any files for content moderation
-- 6. OWNER VALIDATION: Users can only modify files they uploaded
-- 7. AUTHENTICATED UPLOADS: Prevents anonymous file uploads
-- 8. HELPER FUNCTIONS: Provide consistent file naming and URL generation
--
-- Additional security recommendations:
-- - Implement virus scanning for uploaded files
-- - Add image optimization/compression pipeline
-- - Consider adding watermarks for before/after images
-- - Monitor storage usage and implement cleanup for deleted case studies
-- - Use CDN caching for better performance
-- - Implement image moderation for inappropriate content

-- Example usage in application:
--
-- 1. Upload a file:
--    const filePath = generate_case_study_file_path(case_study_id, 'before', 'jpg')
--    supabase.storage.from('case-studies').upload(filePath, file)
--
-- 2. Get public URL:
--    const url = get_case_study_image_url(filePath)
--    OR use: supabase.storage.from('case-studies').getPublicUrl(filePath)
--
-- 3. Query images with URLs:
--    SELECT * FROM case_study_images_with_urls WHERE case_study_id = $1