# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/67d1be06-9998-4c42-b1af-aa753f2795d2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/67d1be06-9998-4c42-b1af-aa753f2795d2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Case Studies CMS

This project includes a comprehensive Case Studies Content Management System built specifically for Your Mate Agency. The CMS allows for creating, managing, and displaying client case studies with rich content and image galleries.

### Features

- **Admin Dashboard**: Complete case study management interface at `/admin`
- **Public Case Studies**: Client-facing case studies display at `/expertise`
- **Image Management**: Multi-image upload with before/after comparisons
- **Rich Content**: Detailed challenge, solution, and results sections
- **Filtering & Search**: Advanced filtering by industry, project type, and tags
- **Role-based Access**: Admin authentication with Supabase Auth
- **Performance Optimized**: Infinite scroll pagination and optimized images

### Quick Setup

1. **Environment Configuration**: Copy and configure environment variables
   ```bash
   cp src/.env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

2. **Database Setup**: Run Supabase migrations to create tables and storage
   ```bash
   # Using Supabase CLI (recommended)
   supabase link --project-ref your-project-id
   supabase db push

   # Or manually run migrations in Supabase SQL Editor
   ```

3. **Verify Setup**: Run the verification script to check configuration
   ```bash
   node scripts/verify-setup.js
   ```

4. **Create Admin User**:
   - Sign up at `/signup` with your admin email
   - Promote to admin role in Supabase SQL Editor:
     ```sql
     SELECT make_user_admin('your-email@example.com');
     ```

5. **Optional - Seed Sample Data**: Add sample case studies for development
   ```bash
   tsx scripts/seed-case-studies.ts
   ```

### Tech Stack

**Backend & Database:**
- Supabase (PostgreSQL + Storage + Auth)
- Row Level Security (RLS) policies
- Real-time subscriptions

**Frontend:**
- React with TypeScript
- TanStack Query for data fetching
- React Hook Form with Zod validation
- Radix UI components with shadcn/ui

**Features:**
- Image upload with drag & drop
- Advanced filtering and search
- Infinite scroll pagination
- Before/After image sliders
- Auto-save functionality
- Bulk operations

### Directory Structure

```
src/
├── components/admin/         # Admin dashboard components
├── pages/                    # Page components (Expertise, CaseStudy, etc.)
├── hooks/                    # Custom React hooks for data fetching
├── services/                 # Supabase service layer
├── api/                      # API endpoints (public and admin)
├── lib/                      # Utilities and configuration
└── types/                    # TypeScript type definitions

supabase/
├── migrations/               # Database migration files
└── config.toml              # Supabase configuration

scripts/
├── verify-setup.js          # Setup verification script
└── seed-case-studies.ts     # Sample data seeding script
```

### Documentation

- **Setup Guide**: See `CASE_STUDIES_SETUP.md` for detailed setup instructions
- **Migration Guide**: See `supabase/migrations/README.md` for database migration steps
- **API Documentation**: API endpoints are documented in the respective files

For detailed setup instructions, troubleshooting, and configuration options, see the [Case Studies Setup Guide](CASE_STUDIES_SETUP.md).

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/67d1be06-9998-4c42-b1af-aa753f2795d2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
