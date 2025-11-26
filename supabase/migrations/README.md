# Database Migrations

This directory contains all database migrations for the Case Studies CMS system. Migrations must be run in the correct order to ensure proper schema setup and data integrity.

## Migration Files

### 📋 Migration Checklist

Run migrations in this exact order:

- [ ] **Step 1**: `20251118211022_create_case_studies_schema.sql`
  - ✅ Creates `case_studies` table with all required columns
  - ✅ Creates `case_study_images` table for image management
  - ✅ Creates `user_profiles` table for role management
  - ✅ Sets up Row Level Security (RLS) policies
  - ✅ Creates performance indexes
  - ✅ Adds helper functions and triggers

- [ ] **Step 2**: `20251118212750_create_case_studies_storage.sql`
  - ✅ Creates `case-studies` storage bucket
  - ✅ Configures public access for images
  - ✅ Sets up RLS policies for storage
  - ✅ Creates file upload/delete permissions
  - ✅ Configures CORS for file access

- [ ] **Step 3**: `99999999999999_create_first_admin.sql`
  - ✅ Creates `make_user_admin()` function
  - ✅ Creates `list_admin_users()` function
  - ✅ Creates `demote_admin()` function
  - ✅ Creates `is_user_admin()` function
  - ✅ Sets up proper permissions and security

## Running Migrations

### Method 1: Supabase CLI (Recommended)

```bash
# Link to your project (one-time setup)
supabase link --project-ref your-project-id

# Run all migrations
supabase db push

# Verify migrations
supabase db diff
```

### Method 2: Manual Execution

1. Open [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Copy and paste each migration file content
4. Execute in the order listed above

## Verification Steps

After running all migrations, verify the setup:

### 1. Check Tables Exist
```sql
-- Verify main tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('case_studies', 'case_study_images', 'user_profiles');
```

### 2. Check Storage Bucket
```sql
-- Verify storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'case-studies';
```

### 3. Check RLS Policies
```sql
-- Verify RLS policies are active
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE tablename IN ('case_studies', 'case_study_images', 'user_profiles');
```

### 4. Test Admin Functions
```sql
-- Test admin function exists (should return function definition)
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'make_user_admin';
```

### 5. Run Automated Verification
```bash
# Use the verification script
node scripts/verify-setup.js
```

## Schema Overview

### Core Tables

#### `case_studies`
- **Purpose**: Main case study data storage
- **Key Features**: Full-text search, JSONB metadata, status management
- **Relationships**: One-to-many with `case_study_images`

#### `case_study_images`
- **Purpose**: Stores image metadata and relationships
- **Key Features**: Image types (featured, before, after, gallery), file metadata
- **Storage**: Files stored in Supabase Storage bucket

#### `user_profiles`
- **Purpose**: User role and profile management
- **Key Features**: Role-based access control, admin promotion
- **Security**: Linked to Supabase Auth users

### Security Features

#### Row Level Security (RLS)
- **Public Read**: Published case studies visible to everyone
- **Authenticated Write**: Only authenticated users can create/edit
- **Admin Override**: Admin users have full access to all data

#### Storage Security
- **Public Images**: Case study images are publicly accessible
- **Upload Restrictions**: Only authenticated users can upload
- **File Validation**: Size and type restrictions enforced

## Migration Best Practices

### Before Running Migrations

1. **Backup Data**: Always backup production data
2. **Test Locally**: Run migrations on development environment first
3. **Review Changes**: Understand what each migration does
4. **Check Dependencies**: Ensure all required environment variables are set

### During Migration

1. **Run in Order**: Execute migrations in the specified sequence
2. **Monitor Progress**: Watch for errors or warnings
3. **Verify Each Step**: Check that each migration completes successfully
4. **Don't Skip Steps**: All migrations are required for proper functionality

### After Migration

1. **Verify Setup**: Use the verification script
2. **Test Functionality**: Manually test key features
3. **Create Admin User**: Set up first admin account
4. **Seed Data**: Optionally add sample data for testing

## Troubleshooting

### Common Issues

#### ❌ "relation already exists"
**Problem**: Migration already run or partial execution
**Solution**:
```sql
-- Check if table exists
SELECT * FROM information_schema.tables WHERE table_name = 'case_studies';
-- Drop and recreate if needed (development only)
DROP TABLE IF EXISTS case_studies CASCADE;
```

#### ❌ "permission denied for schema public"
**Problem**: Insufficient database permissions
**Solution**: Ensure you're using the service role key, not anon key

#### ❌ "storage bucket already exists"
**Problem**: Storage migration already run
**Solution**: Check bucket exists and skip bucket creation part

#### ❌ "function already exists"
**Problem**: Admin functions migration already run
**Solution**: Use `CREATE OR REPLACE FUNCTION` (already in migration)

### Rollback Procedures

#### To Rollback Schema Migration
```sql
-- WARNING: This will delete all case study data
DROP TABLE IF EXISTS case_study_images CASCADE;
DROP TABLE IF EXISTS case_studies CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS make_user_admin(TEXT);
DROP FUNCTION IF EXISTS list_admin_users();
DROP FUNCTION IF EXISTS demote_admin(TEXT);
DROP FUNCTION IF EXISTS is_user_admin(TEXT);
```

#### To Rollback Storage Migration
```sql
-- Delete storage bucket and all files
DELETE FROM storage.objects WHERE bucket_id = 'case-studies';
DELETE FROM storage.buckets WHERE name = 'case-studies';
```

## Migration Development

### Creating New Migrations

When adding new features, create migrations following this pattern:

1. **Filename**: `YYYYMMDDHHMMSS_descriptive_name.sql`
2. **Structure**:
   ```sql
   -- Migration: Add new feature
   -- Created: YYYY-MM-DD
   -- Description: What this migration does

   -- Add new tables/columns
   -- Update existing schema
   -- Create/modify indexes
   -- Update RLS policies
   -- Add comments for documentation
   ```

3. **Testing**: Always test migrations on development environment
4. **Documentation**: Update this README with new migration steps

### Schema Modifications

When modifying existing schema:

1. **Never drop columns in production** - Mark as deprecated instead
2. **Add new columns with defaults** - Avoid breaking existing data
3. **Update RLS policies** - Ensure security remains intact
4. **Update indexes** - Maintain query performance
5. **Update type definitions** - Keep TypeScript types in sync

## Support

If you encounter issues with migrations:

1. **Check Setup Guide**: See `CASE_STUDIES_SETUP.md` for troubleshooting
2. **Verify Environment**: Ensure all required environment variables are set
3. **Check Logs**: Review Supabase project logs for detailed errors
4. **Test Locally**: Use local Supabase development environment
5. **Backup First**: Always backup before attempting fixes

For development questions, check the project documentation or create an issue with:
- Migration file causing issues
- Complete error message
- Environment details (development/production)
- Steps taken before error occurred