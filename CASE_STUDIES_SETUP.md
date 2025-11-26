# Case Studies CMS Setup Guide

This guide will walk you through setting up the complete Case Studies Content Management System for Your Mate Agency.

## Prerequisites

Before you begin, ensure you have:

- [x] **Supabase project created** - Sign up at [supabase.com](https://supabase.com)
- [x] **Node.js 18+** installed
- [x] **pnpm** package manager installed (`npm install -g pnpm`)
- [x] **Supabase CLI** installed (optional but recommended) - [Installation guide](https://supabase.com/docs/guides/cli)
- [x] **Git** for version control
- [x] **Code editor** (VS Code recommended)

## Environment Setup

### 1. Configure Environment Variables

Copy the example environment file and configure it with your Supabase credentials:

```bash
cp src/.env.example .env.local
```

Edit `.env.local` and fill in the following required variables:

```bash
# Required: Get these from your Supabase project dashboard
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Application settings
NEXT_PUBLIC_APP_URL=http://localhost:5173
NODE_ENV=development

# Optional: Additional configuration
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
```

#### Where to find Supabase credentials:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **Project URL** → `SUPABASE_URL`
5. Copy the **anon/public key** → `SUPABASE_ANON_KEY`
6. Copy the **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Keep this secret!**

## Database Migration Steps

### Method 1: Using Supabase CLI (Recommended)

If you have Supabase CLI installed and linked to your project:

```bash
# Link to your Supabase project (one-time setup)
supabase link --project-ref your-project-id

# Run all migrations
supabase db push

# Verify migrations ran successfully
supabase db diff
```

### Method 2: Manual Migration (Alternative)

If you prefer to run migrations manually:

1. Open your [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Run each migration file in order:

   **Step 1:** `supabase/migrations/20251118211022_create_case_studies_schema.sql`
   - Creates `case_studies` and `case_study_images` tables
   - Sets up RLS policies for data security
   - Creates helper functions and triggers

   **Step 2:** `supabase/migrations/20251118212750_create_case_studies_storage.sql`
   - Creates `case-studies` storage bucket
   - Sets up file upload policies
   - Configures image storage permissions

   **Step 3:** `supabase/migrations/99999999999999_create_first_admin.sql`
   - Creates admin user promotion function
   - Sets up role management

### Verification

After running migrations, verify the setup:

```bash
node scripts/verify-setup.js
```

You should see output like:
```
✅ Environment variables configured
✅ Supabase connection successful
✅ case_studies table exists
✅ case_study_images table exists
✅ case-studies storage bucket exists
✅ RLS policies configured
🎉 Setup verification complete!
```

## Creating Your First Admin User

### Step 1: Sign Up Through the App

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:5173/signup`

3. Create your account with your admin email

### Step 2: Promote User to Admin

After signing up, promote your user to admin:

#### Option A: Using Supabase SQL Editor

1. Go to your Supabase Dashboard → **SQL Editor**
2. Run this query (replace with your email):
   ```sql
   SELECT make_user_admin('your-email@yourmateagency.com.au');
   ```

#### Option B: Direct Database Update

1. Go to **Database** → **Authentication** → **Users**
2. Find your user and copy the User UID
3. Go to **Table Editor** → **user_profiles** table
4. Find your user and update the `role` column to `admin`

### Step 3: Verify Admin Access

1. Sign out and sign back in
2. Navigate to `http://localhost:5173/admin`
3. You should see the admin dashboard

## Testing the Setup

Use this checklist to verify everything works:

### ✅ Authentication & Admin Access
- [ ] Can sign up at `/signup`
- [ ] Can sign in at `/login`
- [ ] Can access `/admin` with admin user
- [ ] Non-admin users get "Unauthorized" at `/admin`

### ✅ Case Study Management
- [ ] Can create new case study at `/admin/case-studies/new`
- [ ] Can edit existing case study
- [ ] Can delete case studies
- [ ] Can publish/unpublish case studies
- [ ] Can duplicate case studies
- [ ] Bulk operations work (select multiple → delete/publish)

### ✅ Image Upload System
- [ ] Can upload featured images
- [ ] Can upload before/after images
- [ ] Images appear in preview
- [ ] Can replace existing images
- [ ] Can delete images
- [ ] Image validation works (file type, size limits)

### ✅ Public Case Studies Page
- [ ] Published case studies appear at `/expertise`
- [ ] Draft case studies don't appear publicly
- [ ] Individual case study pages work (`/expertise/case-study-slug`)
- [ ] Before/after slider works
- [ ] Related case studies show up
- [ ] Filtering by industry/tags works
- [ ] "Load more" pagination works

### ✅ Data Persistence
- [ ] Changes save correctly to database
- [ ] Images persist after page reload
- [ ] Filters preserve state
- [ ] Admin lists update in real-time

## Troubleshooting

### Common Issues

#### 🚨 "RLS policies blocking access"
```
Error: new row violates row-level security policy
```
**Solution:**
1. Check you're signed in with correct user
2. Verify admin role is set correctly
3. Check RLS policies in Supabase Dashboard → Authentication → Policies

#### 🚨 "Storage bucket not found"
```
Error: The resource was not found
```
**Solution:**
1. Verify storage migration ran: Check Supabase Dashboard → Storage
2. Manually create bucket named `case-studies`
3. Set bucket to public in Storage settings

#### 🚨 "Images not uploading"
```
Error: Failed to upload image
```
**Solution:**
1. Check file size (max 10MB)
2. Verify file type (JPEG, PNG, WebP only)
3. Check storage policies allow uploads
4. Verify SUPABASE_ANON_KEY in environment

#### 🚨 "Admin role not working"
```
Access denied or unauthorized errors
```
**Solution:**
1. Verify user_profiles table exists
2. Check user has `role = 'admin'` in user_profiles
3. Clear browser cache and cookies
4. Sign out and sign back in

#### 🚨 "API endpoints not working"
```
404 errors on /api/case-studies
```
**Solution:**
1. Verify environment variables are loaded
2. Check Supabase connection
3. Ensure you're using the correct base URL
4. Check browser network tab for specific error details

### Environment Issues

#### Missing Environment Variables
If you see errors about missing environment variables:

1. Verify `.env.local` exists in project root
2. Check all required variables are set
3. Restart development server after changes
4. Use `process.env` in browser console to debug

#### Supabase Connection Issues
If Supabase connection fails:

1. Verify URL format: `https://your-project-id.supabase.co`
2. Check keys aren't wrapped in quotes
3. Ensure project isn't paused (free tier limitation)
4. Test connection in Supabase dashboard

### Getting Help

If you're still having issues:

1. **Check the verification script output:**
   ```bash
   node scripts/verify-setup.js
   ```

2. **Review Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Check for authentication and database errors

3. **Check browser console:**
   - Open browser developer tools
   - Look for JavaScript errors or failed API calls

4. **Database debugging:**
   - Use Supabase SQL Editor to run test queries
   - Verify data is being written correctly

## Next Steps

Once setup is complete:

1. **Seed sample data** (optional):
   ```bash
   tsx scripts/seed-case-studies.ts
   ```

2. **Customize branding:**
   - Update logo and colors in the admin interface
   - Modify the public case studies page styling

3. **Configure production:**
   - Set up production Supabase project
   - Configure production environment variables
   - Set up domain and SSL certificate

4. **Add team members:**
   - Create additional admin accounts
   - Set up role-based permissions if needed

## Production Deployment

When ready to deploy:

1. Create production Supabase project
2. Run migrations on production database
3. Update environment variables for production
4. Deploy to your hosting platform (Vercel, Netlify, etc.)
5. Test all functionality in production environment

---

**Need help?** Check the troubleshooting section above or review the project documentation.