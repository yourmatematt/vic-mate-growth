# 🚀 VIC MATE GROWTH - DEVELOPER HANDOVER DOCUMENTATION

## 📋 PROJECT OVERVIEW

**Your Mate Agency - Client Portal & Business Management Platform**

This is a comprehensive Australian digital marketing agency platform designed specifically for regional small business owners (tradies, cafes, gyms, etc.) in Victoria, Australia. The platform features a client portal, content calendar management, booking system, and AI-powered tone learning for personalised content generation.

### 🎯 TARGET AUDIENCE
- **Primary**: Australian small business owners (tradies, hospitality, local services)
- **Communication Style**: "Mate-like", conversational, no corporate jargon
- **Geographic Focus**: Victoria, Australia (Melbourne timezone)
- **Technical Level**: Non-technical users who need simple, intuitive interfaces

---

## 🏗️ TECHNICAL ARCHITECTURE

### **Frontend Stack**
- **Framework**: React 18.3.1 with TypeScript 5.8.3
- **Build Tool**: Vite 5.4.19 (fast development and production builds)
- **Styling**: Tailwind CSS 3.4.17 with custom Australian design system
- **UI Components**: Radix UI + shadcn/ui (modern, accessible component library)
- **State Management**: TanStack React Query 5.83.0 for server state
- **Routing**: React Router DOM 6.30.1
- **Forms**: React Hook Form 7.61.1 + Zod 3.25.76 validation
- **Icons**: Lucide React (consistent icon system)

### **Backend & Database**
- **Backend**: Supabase (PostgreSQL + Authentication + Storage + Real-time)
- **Project ID**: `wcawetkkyfhmvgfrfbpi`
- **Region**: Sydney, Australia (for latency optimisation)
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **File Storage**: Supabase Storage for images and documents
- **Real-time**: WebSocket connections for live updates

### **Development Tools**
- **Package Manager**: npm (lockfile: package-lock.json)
- **Linting**: ESLint 9.32.0 with TypeScript rules
- **Code Formatting**: Built-in with Vite
- **Type Checking**: TypeScript strict mode enabled

---

## 🎨 DESIGN SYSTEM & BRAND IDENTITY

### **Australian Design Approach**
```css
/* Brand Colors - Australian Digital Marketing Theme */
--primary: 213 100% 40%;           /* Trustworthy Blue #0066CC */
--secondary: 140 100% 33%;         /* Growth Green #00A651 */
--accent: 27 96% 61%;             /* Energy Orange #FF8C00 */
```

### **Communication Style Guidelines**
- **Tone**: Conversational, mate-like, no corporate jargon
- **Language**: Australian English (colour, centre, realise)
- **Expressions**: "No worries", "Fair dinkum", "Give us a bell"
- **Error Messages**: Friendly and helpful ("Oops! Give it another go in a tick")
- **Success Messages**: Encouraging and positive

### **Mobile-First Design**
- All components designed for mobile-first experience
- Touch-friendly interactive elements (48px minimum)
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

---

## 📁 PROJECT STRUCTURE

```
vic-mate-growth/
├── 📁 src/
│   ├── 📁 components/           # React components organised by feature
│   │   ├── 📁 admin/           # Admin dashboard components
│   │   ├── 📁 client/          # Client portal components
│   │   ├── 📁 booking/         # Booking system components
│   │   ├── 📁 ui/              # shadcn/ui base components
│   │   └── 📁 about/           # Marketing site components
│   ├── 📁 pages/               # Route components
│   │   ├── 📁 admin/           # Admin dashboard pages
│   │   ├── 📁 dashboard/       # Client portal pages
│   │   ├── 📁 services/        # Service landing pages
│   │   └── 📁 tools/           # Marketing tools pages
│   ├── 📁 hooks/               # Custom React Query hooks
│   ├── 📁 services/            # API service layer (Supabase integration)
│   ├── 📁 types/               # TypeScript type definitions
│   ├── 📁 contexts/            # React Context providers
│   ├── 📁 lib/                 # Utility functions and configurations
│   └── 📁 api/                 # API endpoint abstractions
├── 📁 supabase/
│   ├── 📁 migrations/          # Database schema migrations
│   └── config.toml             # Supabase project configuration
├── 📁 scripts/                 # Setup and utility scripts
└── 📁 public/                  # Static assets
```

---

## 🗄️ DATABASE SCHEMA

### **Authentication & User Management**
```sql
-- Core user profiles with role-based access
user_profiles (
    id UUID PRIMARY KEY → auth.users(id),
    email TEXT NOT NULL,
    role TEXT CHECK(role IN ('user', 'admin')) DEFAULT 'user',
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
```

### **Content Calendar System** 🎯 **(NEW FEATURE)**
```sql
-- Main content posts with subscription tiers
content_calendar_posts (
    id UUID PRIMARY KEY,
    user_id UUID → auth.users(id),
    subscription_tier ENUM('starter', 'growth', 'pro'),
    platform ENUM('facebook', 'instagram', 'linkedin', 'twitter'),
    scheduled_date TIMESTAMPTZ,
    status ENUM('draft', 'scheduled', 'published', 'cancelled'),
    original_caption TEXT,    -- AI-generated
    current_caption TEXT,     -- User-edited
    image_url TEXT,
    ai_generated BOOLEAN DEFAULT true
)

-- Caption revision history for AI tone learning
content_calendar_revisions (
    id UUID PRIMARY KEY,
    post_id UUID → content_calendar_posts(id),
    user_id UUID → auth.users(id),
    caption TEXT,
    revision_number INTEGER,
    created_at TIMESTAMPTZ
)

-- Client feedback and comments
content_calendar_comments (
    id UUID PRIMARY KEY,
    post_id UUID → content_calendar_posts(id),
    user_id UUID → auth.users(id),
    comment TEXT,
    created_at TIMESTAMPTZ
)

-- Image management for posts
content_calendar_images (
    id UUID PRIMARY KEY,
    post_id UUID → content_calendar_posts(id),
    user_id UUID → auth.users(id),
    storage_path TEXT,        -- Supabase storage path
    file_name TEXT,
    file_size INTEGER,
    mime_type TEXT
)
```

### **Booking System**
```sql
-- Client booking management
bookings (
    id UUID PRIMARY KEY,
    user_email TEXT,
    user_name TEXT,
    business_name TEXT,
    phone TEXT,
    service_type TEXT,
    booking_date TIMESTAMPTZ,
    time_slot TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    notes TEXT
)

-- Recurring meeting management
recurring_meetings (
    id UUID PRIMARY KEY,
    user_id UUID → auth.users(id),
    title TEXT,
    frequency ENUM('weekly', 'monthly'),
    day_of_week INTEGER,
    time_slot TIME,
    duration INTEGER,       -- minutes
    is_active BOOLEAN,
    google_calendar_event_id TEXT
)
```

### **Case Studies CMS**
```sql
-- Client case studies and portfolio
case_studies (
    id UUID PRIMARY KEY,
    title TEXT,
    slug TEXT UNIQUE,
    client_name TEXT,
    client_industry TEXT,
    challenge TEXT,
    solution TEXT,
    results TEXT,
    testimonial TEXT,
    status ENUM('draft', 'published', 'archived'),
    featured_image_url TEXT,
    before_image_url TEXT,
    after_image_url TEXT
)
```

---

## 🔧 KEY FEATURES & COMPONENTS

### **1. Content Calendar System** 🎯 **(NEWLY IMPLEMENTED)**

**Location**: `/src/components/client/ContentCalendarGrid.tsx`

**Features**:
- Mobile-first calendar view (next 30 days)
- Platform-specific posts (Facebook, Instagram, LinkedIn, Twitter)
- Status management (Draft, Scheduled, Published, Cancelled)
- Australian timezone support (Australia/Melbourne)
- Subscription tier awareness (Starter, Growth, Pro)

**Key Components**:
```typescript
// Main calendar component
<ContentCalendarGrid
  userId={string}
  subscriptionTier={'starter' | 'growth' | 'pro'}
  onPostClick={(postId: string) => void}
/>

// Post editor modal
<PostEditorModal
  postId={string}
  isOpen={boolean}
  onClose={() => void}
/>
```

**Service Integration**:
```typescript
// React Query hooks for data management
useContentPosts(userId, filters?, sort?, pagination?)
useContentPost(postId)
useUpdateCaption()  // Auto-save after 2 seconds
useUploadImage()    // Drag & drop with progress
useAddComment()     // Optimistic UI updates
```

### **2. AI Tone Learning System** 🧠 **(NEWLY IMPLEMENTED)**

**Location**: `/src/services/toneLearningService.ts`

**Purpose**: Learn each user's unique brand voice to personalise AI content generation

**Key Functions**:
```typescript
// Generate comprehensive user tone profile
getUserToneProfile(userId: string): Promise<ToneProfile>

// Analyse text style and characteristics
calculateStyleMetrics(text: string): StyleMetrics

// Learn from user edits to improve AI
analyzeEditPatterns(original: string, edited: string): EditAnalysis[]
```

**Data Collected**:
- **Writing Style**: Formality level, enthusiasm, conversational score
- **Australian Language**: Slang usage, local references, spelling preferences
- **Edit Patterns**: What users consistently change from AI content
- **Platform Preferences**: How tone adapts per social platform
- **Vocabulary**: Preferred words, phrases, and expressions

**Claude AI Integration Ready**:
```typescript
// Generate training prompts for Claude API
getClaudeTrainingPrompt(userId): Promise<ClaudePrompt>
```

### **3. Booking Management System**

**Features**:
- Public booking form with time slot selection
- Admin dashboard for booking management
- Google Calendar integration
- Email notifications
- Recurring meeting scheduling

### **4. Case Studies CMS**

**Features**:
- Rich content editor for client success stories
- Before/after image comparisons
- Industry and service filtering
- Public portfolio display
- Admin content management

---

## 🎨 UI COMPONENT LIBRARY

### **Base Components** (`/src/components/ui/`)
All components built with Radix UI + Tailwind CSS:

```typescript
// Form components
<Button variant="default" | "outline" | "ghost" size="sm" | "md" | "lg" />
<Input placeholder="Enter text..." />
<Textarea rows={4} />
<Select onValueChange={handleChange} />
<Checkbox checked={isChecked} />

// Layout components
<Card><CardHeader><CardTitle /></CardHeader><CardContent /></Card>
<Dialog><DialogContent><DialogHeader /></DialogContent></Dialog>
<Sheet side="left" | "right" | "top" | "bottom" />

// Feedback components
<Alert variant="default" | "destructive" />
<Toast title="Success" description="Operation completed" />
<Badge variant="default" | "outline" | "secondary" />

// Navigation components
<Tabs defaultValue="tab1"><TabsList><TabsContent /></Tabs>
<Accordion type="single" collapsible />
```

### **Australian Design Patterns**
```typescript
// Friendly error messages
<Alert className="border-red-200 bg-red-50">
  <AlertCircle className="h-4 w-4 text-red-600" />
  <AlertDescription className="text-red-800">
    Oops! Having trouble loading your content. Give it another go in a tick.
  </AlertDescription>
</Alert>

// Mate-like empty states
<EmptyState
  title="G'day! Ready to get started?"
  description="Your content calendar is looking a bit empty. Let's create your first social media post to get things rolling!"
  action={<Button>Create Your First Post</Button>}
/>
```

---

## 🔌 API INTEGRATION & DATA FLOW

### **Service Layer Architecture**

**Location**: `/src/services/`

```typescript
// Content Calendar Service
contentCalendarService.ts:
  - getPosts(userId, filters) → PaginatedResponse<Post>
  - createPost(userId, data) → Post
  - updateCaption(postId, caption, userId) → {post, revision}
  - uploadImage(postId, file, userId) → Image

// Image Upload Service
imageUploadService.ts:
  - uploadToStorage(file, bucket, path) → {publicUrl, path}
  - validateImageFile(file) → ValidationResult
  - deleteFromStorage(bucket, path) → void

// Tone Learning Service (AI Integration Ready)
toneLearningService.ts:
  - getUserToneProfile(userId) → ToneProfile
  - analyzeEditPatterns(original, edited) → EditAnalysis[]
  - generateClaudePrompt(profile) → string
```

### **React Query Integration**

**Location**: `/src/hooks/`

```typescript
// Optimistic updates for better UX
const updateCaption = useUpdateCaption();
const addComment = useAddComment();
const uploadImage = useUploadImage();

// Automatic cache invalidation
queryClient.invalidateQueries(['content-calendar', 'posts']);
queryClient.setQueryData(['post', postId], optimisticData);
```

### **Supabase Integration**

```typescript
// Real-time subscriptions
const { data: posts } = useQuery({
  queryKey: ['posts', userId],
  queryFn: () => supabase
    .from('content_calendar_posts')
    .select('*')
    .eq('user_id', userId)
    .order('scheduled_date'),
});

// Row Level Security policies ensure data isolation
CREATE POLICY "Users can only see own posts" ON content_calendar_posts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);
```

---

## 🔒 AUTHENTICATION & SECURITY

### **Supabase Authentication**
- Email/password authentication
- Password reset functionality
- Role-based access control (user/admin)
- Protected routes with route guards

### **Row Level Security (RLS)**
All tables have RLS policies ensuring users can only access their own data:

```sql
-- Users can only manage their own content
CREATE POLICY "Users manage own posts" ON content_calendar_posts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all content
CREATE POLICY "Admins manage all posts" ON content_calendar_posts
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

### **File Storage Security**
```sql
-- Users can only upload to their own folders
CREATE POLICY "Users upload own files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'content-calendar-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## 🌏 AUSTRALIAN LOCALISATION

### **Timezone Handling**
```typescript
// All dates in Australia/Melbourne timezone
const australianTimezoneUtils = {
  toAustralianTime: (date: Date) => Date,
  formatAustralianTime: (date: Date, format?: string) => string,
  isBusinessHours: (date: Date) => boolean,  // 9 AM - 5 PM AEST/AEDT
  getNextBusinessDay: (date: Date) => Date,
};
```

### **Language & Communication**
```typescript
// Australian English spelling
const AUSTRALIAN_TERMS = [
  'colour', 'centre', 'realise', 'organise', 'favour',
  'mate', 'g\'day', 'no worries', 'fair dinkum', 'arvo'
];

// Mate-like UI copy
const messages = {
  loading: "Loading your content...",
  error: "Oops! Give it another go in a tick",
  success: "Sorted! Your post is scheduled",
  empty: "G'day! Ready to get started?"
};
```

### **Subscription Tiers for Australian Businesses**
```typescript
const SUBSCRIPTION_TIERS = {
  starter: {
    maxPosts: 30,        // Perfect for small tradies
    platforms: ['facebook', 'instagram'],
    priceAUD: '$99/month'
  },
  growth: {
    maxPosts: 100,       // Growing local businesses
    platforms: ['facebook', 'instagram', 'linkedin'],
    priceAUD: '$199/month'
  },
  pro: {
    maxPosts: 500,       // Established businesses
    platforms: ['facebook', 'instagram', 'linkedin', 'twitter'],
    priceAUD: '$399/month'
  }
};
```

---

## 🚀 DEVELOPMENT WORKFLOW

### **Setup Instructions**
```bash
# 1. Clone and install dependencies
git clone <repository>
cd vic-mate-growth
npm install

# 2. Environment setup
cp src/.env.example .env.local
# Configure Supabase credentials

# 3. Database setup (Supabase CLI required)
supabase link --project-ref wcawetkkyfhmvgfrfbpi
supabase db pull  # Pull current schema
supabase db push  # Push migrations

# 4. Start development server
npm run dev
```

### **Available Scripts**
```json
{
  "dev": "vite",                    // Development server
  "build": "vite build",            // Production build
  "build:dev": "vite build --mode development",
  "lint": "eslint .",               // Code linting
  "preview": "vite preview",        // Preview build
  "setup:calendar": "node ../scripts/setup-google-calendar.js",
  "test:booking": "npx tsx ../scripts/test-booking.ts"
}
```

### **Development Guidelines**

**Component Structure**:
```typescript
// Follow this pattern for all new components
interface ComponentProps {
  // Props interface with clear TypeScript types
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks at the top
  const { data, isLoading } = useQuery();

  // Event handlers
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies]);

  // Early returns for loading/error states
  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage />;

  // Main render
  return (
    <div className="mobile-first-responsive">
      {/* Component content */}
    </div>
  );
};

export default Component;
```

**Australian UI Copy Guidelines**:
```typescript
// ✅ Good - Mate-like and friendly
"G'day! Here's what's coming up"
"No worries, we'll sort that out for you"
"Give us a bell if you need help"

// ❌ Avoid - Corporate jargon
"Please contact our customer service department"
"Your request is being processed"
"Error: Invalid input parameters"
```

---

## 📋 FUTURE FEATURES PLANNED

Based on the product roadmap, here are upcoming features to implement:

### **1. Live Chat System - "Chat with Your Mate"** 🎯
**Concept**: Claude AI chat that learns user's tone and handles support tickets

**Technical Requirements**:
- Claude API integration with user tone profiles
- Slack/Telegram webhook integration for escalations
- Real-time chat interface with Supabase real-time
- Ticket management system
- AI response approval/training workflow

**Database Schema Needed**:
```sql
chat_conversations (
  id UUID PRIMARY KEY,
  user_id UUID → auth.users(id),
  status ENUM('active', 'resolved', 'escalated'),
  created_at TIMESTAMPTZ
)

chat_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID → chat_conversations(id),
  sender_type ENUM('user', 'ai', 'admin'),
  message TEXT,
  escalated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)
```

### **2. Blog Post Approval System**
**Features**:
- Admin-generated blog posts
- Client review and approval workflow
- Revision tracking and comments
- Publication scheduling

### **3. CTA System Integration**
**Features**:
- Smart CTAs based on user behaviour
- Upgrade prompts based on content performance
- Platform expansion recommendations
- Usage-based upselling

### **4. Billing System Redesign**
**Changes Required**:
- Remove invoices section from client portal
- Add billing section in settings
- Hide payment amounts (auto-pay focus)
- Plan change tracking and logging
- Upgrade trial system (3-month trigger)

**Database Schema Needed**:
```sql
subscription_changes (
  id UUID PRIMARY KEY,
  user_id UUID → auth.users(id),
  from_tier subscription_tier,
  to_tier subscription_tier,
  change_type ENUM('upgrade', 'downgrade', 'trial'),
  effective_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ
)

upgrade_trials (
  id UUID PRIMARY KEY,
  user_id UUID → auth.users(id),
  original_tier subscription_tier,
  trial_tier subscription_tier,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  converted BOOLEAN DEFAULT false
)
```

### **5. Smart Upgrade System**
**Logic**:
- After 3 months on a tier → offer free trial of next tier
- 1-month free trial (4 months total at same price)
- Track conversion rates and user engagement
- Automated email sequences with Australian messaging

---

## 🐛 KNOWN ISSUES & TECHNICAL DEBT

### **Current Issues**
1. **Supabase CLI Connection Timeouts**: Migration deployment via CLI has connection issues
   - **Workaround**: Use Supabase Dashboard SQL Editor for manual deployment
   - **Files affected**: All migration files in `/supabase/migrations/`

2. **Migration History Conflicts**: Some migrations have dependency issues
   - **Issue**: `user_profiles` table dependency in recurring meetings migration
   - **Solution**: Use the standalone migration file created

3. **TypeScript Build Errors**: Some component type conflicts
   - **Location**: `/src/components/admin/AdminLayout.tsx:304:10`
   - **Issue**: Mismatched HTML tags (div/header)

### **Performance Optimisations Needed**
1. **Image Optimisation**: Implement WebP conversion and lazy loading
2. **Code Splitting**: Add route-based code splitting for better load times
3. **Query Optimisation**: Review and optimise database queries for large datasets

### **Security Improvements**
1. **Rate Limiting**: Add rate limiting to API endpoints
2. **Input Sanitisation**: Enhance input validation for user-generated content
3. **Audit Logging**: Implement comprehensive audit trail for admin actions

---

## 📞 SUPPORT & DEPLOYMENT

### **Environment Variables Required**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://wcawetkkyfhmvgfrfbpi.supabase.co
VITE_SUPABASE_ANON_KEY=[your_anon_key]

# Optional: Google Calendar Integration
GOOGLE_CALENDAR_CLIENT_ID=[client_id]
GOOGLE_CALENDAR_CLIENT_SECRET=[client_secret]

# Optional: Email Service
SMTP_HOST=[smtp_server]
SMTP_USER=[smtp_username]
SMTP_PASS=[smtp_password]
```

### **Deployment Configuration**
- **Production**: Lovable.dev auto-deployment from main branch
- **Staging**: Manual deployment via `npm run build`
- **Database**: Supabase hosted PostgreSQL (Sydney region)
- **CDN**: Supabase Storage for file hosting

### **Monitoring & Analytics**
- **Error Tracking**: Console logging (upgrade to Sentry recommended)
- **Performance**: React DevTools and Lighthouse
- **User Analytics**: Not implemented (consider Plausible Analytics for privacy)

---

## 📖 DOCUMENTATION & RESOURCES

### **Existing Documentation**
- `README.md` - Basic project overview and setup
- `CASE_STUDIES_SETUP.md` - Case studies feature documentation
- `TOOLS_IMPLEMENTATION_PLAN.md` - Feature planning document
- `/supabase/migrations/README.md` - Database migration guide
- `/sample-tone-profile.json` - Example AI tone learning output

### **Code Documentation Standards**
- TypeScript interfaces with JSDoc comments
- Component props documented with examples
- Service functions with usage examples
- Database schemas with relationship explanations

### **External Dependencies Documentation**
- [Supabase Docs](https://supabase.com/docs) - Database and backend
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework

---

## 🎯 GETTING STARTED CHECKLIST

### **For New Developers**
- [ ] Clone repository and run `npm install`
- [ ] Configure environment variables (`.env.local`)
- [ ] Set up Supabase CLI and link project
- [ ] Review database schema in `/supabase/migrations/`
- [ ] Run `npm run dev` and explore the application
- [ ] Read through component library in `/src/components/ui/`
- [ ] Understand the Australian design patterns and copy guidelines
- [ ] Review the tone learning system and AI integration points
- [ ] Test content calendar functionality in client portal

### **First Tasks Recommendations**
1. **Fix Known Issues**: Start with AdminLayout.tsx HTML tag mismatch
2. **Complete Database Deployment**: Ensure all migrations are applied
3. **Test Content Calendar**: Verify all CRUD operations work correctly
4. **Review AI Integration**: Understand tone learning data flow
5. **Plan Live Chat Implementation**: Design architecture for Claude AI integration

---

**Project Contact**: Your Mate Agency Development Team
**Last Updated**: November 20, 2024
**Project Version**: v1.2.0 (Content Calendar Integration Complete)
**Next Major Feature**: Live Chat with Claude AI Integration