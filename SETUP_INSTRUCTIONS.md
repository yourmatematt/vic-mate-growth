# Development Setup Instructions

## Issue Resolution: Admin Authentication Infinite Loading

### Root Cause
The admin authentication is stuck in an infinite loading state because:
1. Missing Supabase environment variables
2. Database not properly set up with required tables
3. `getCurrentUser()` fails silently without proper Supabase connection

### Required Setup Steps

#### 1. Supabase Configuration
1. Create or use existing Supabase project
2. Get project URL and anon key from: `https://app.supabase.com/project/YOUR_PROJECT_ID/settings/api`
3. Copy `.env.example` to `.env.local`
4. Fill in your actual Supabase values:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

#### 2. Database Setup
Run these migrations in order via Supabase Dashboard SQL Editor:

1. **First**: Run `supabase/migrations/20241120150000_content_calendar_standalone.sql`
   - Creates `user_profiles` table with admin role support
   - Creates essential triggers and functions

2. **Second**: Run `deployment/CONSOLIDATED_MIGRATIONS.sql`
   - Creates all other tables and features
   - Sets up RLS policies for admin authentication

#### 3. Create Admin User
After database setup:
1. Sign up normally through the app
2. In Supabase Dashboard, run:
   ```sql
   SELECT make_user_admin('your-email@example.com');
   ```

### Test Authentication
1. Start dev server: `pnpm dev`
2. Navigate to `/admin`
3. Should show admin login form
4. After login, should access admin dashboard

### Debug Console Output
With proper setup, you should see in browser console:
```
auth-utils: Getting current user...
auth-utils: Supabase getUser result: {user: "your-email", error: null}
auth-utils: Fetching user profile for: user-uuid
auth-utils: User profile query result: {profile: {role: "admin"}, error: null}
AdminProtectedRoute: getCurrentUser result: {id: "...", email: "...", role: "admin", isAdmin: true}
```

### File Locations
- Environment template: `.env.example`
- Database migrations: `supabase/migrations/` and `deployment/`
- Auth utils: `src/lib/auth-utils.ts`
- Admin route: `src/components/admin/AdminProtectedRoute.tsx`