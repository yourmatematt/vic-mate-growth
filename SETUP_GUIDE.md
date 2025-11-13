# Setup Guide - Third-Party Services & API Keys

This document outlines all third-party services that need to be set up to make the interactive tools system fully functional.

---

## 📋 **CURRENT STATUS**

✅ **What's Built & Working:**
- All 3 interactive tools (Break-Even Calculator, Subject Line Scorer, Marketing Assessment)
- Tools hub landing page with search/filter
- Lead capture modals with conversion optimization
- Client dashboard with 6 pages
- Mock data for demonstrations
- Form validation with Zod schemas
- localStorage for temporary result storage

⚠️ **What Needs Backend Integration:**
- Email delivery for tool results
- Database storage for leads and results
- User authentication (already stubbed out)
- Analytics tracking
- Payment processing (for invoices)

---

## 🔧 **REQUIRED SERVICES**

### **1. Supabase (Backend Database & Auth)**

**Purpose:** Store leads, tool results, user accounts, and all data

**Setup Steps:**

1. **Create Supabase Account**
   - Go to [https://supabase.com](https://supabase.com)
   - Sign up for free account
   - Create new project: `vic-mate-growth`

2. **Get API Keys**
   - Navigate to Settings → API
   - Copy these values:
     - `Project URL` (e.g., `https://abc123.supabase.co`)
     - `anon public` key
     - `service_role` key (keep secret!)

3. **Create Database Tables**

```sql
-- Leads from tools
CREATE TABLE tool_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  business_name TEXT,
  tool_name TEXT NOT NULL,
  tool_data JSONB,
  results JSONB,
  source_page TEXT
);

-- Tool results (for logged-in users)
CREATE TABLE tool_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users,
  tool_name TEXT NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL
);

-- Website analysis requests (existing form)
CREATE TABLE website_analysis_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  location TEXT NOT NULL,
  industry TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  website_url TEXT,
  biggest_challenge TEXT NOT NULL,
  hear_about_us TEXT,
  source_page TEXT
);

-- Newsletter signups
CREATE TABLE newsletter_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  business_name TEXT,
  source TEXT
);

-- Enable Row Level Security
ALTER TABLE tool_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_analysis_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_signups ENABLE ROW LEVEL SECURITY;

-- Create policies (allow inserts from anyone, reads only for authenticated users)
CREATE POLICY "Anyone can insert leads" ON tool_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read own results" ON tool_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert results" ON tool_results FOR INSERT WITH CHECK (auth.uid() = user_id);
```

4. **Create Environment Variables File**

Create `.env.local` in project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Email Service (see next section)
VITE_RESEND_API_KEY=re_your-api-key-here

# Analytics (see section 3)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

5. **Install Supabase Client**

Already added to package.json, but if needed:
```bash
npm install @supabase/supabase-js
```

6. **Create Supabase Client File**

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

7. **Update Form Handlers**

Replace console.log statements in these files:
- `src/components/tools/LeadCaptureModal.tsx`
- `src/pages/tools/BreakEvenCalculator.tsx`
- `src/pages/tools/SubjectLineScorer.tsx`
- `src/pages/tools/MarketingAssessment.tsx`
- `src/components/WebsiteAnalysisCTA.tsx`

Example replacement:
```typescript
// OLD:
console.log('Tool result:', data);

// NEW:
import { supabase } from '@/lib/supabase';

const { error } = await supabase
  .from('tool_leads')
  .insert({
    email: emailData.email,
    first_name: emailData.firstName,
    business_name: emailData.businessName,
    tool_name: 'break-even-calculator',
    tool_data: inputs,
    results: calculatedResults,
    source_page: window.location.pathname,
  });

if (error) {
  console.error('Error saving lead:', error);
  throw error;
}
```

---

### **2. Resend (Email Delivery)**

**Purpose:** Send tool results, welcome emails, and notifications

**Setup Steps:**

1. **Create Resend Account**
   - Go to [https://resend.com](https://resend.com)
   - Sign up (free tier: 100 emails/day)
   - Verify your email

2. **Add Domain (Recommended)**
   - Go to Domains → Add Domain
   - Add your domain (e.g., `yourmate.agency`)
   - Add DNS records they provide:
     - SPF record
     - DKIM record
     - DMARC record (optional but recommended)
   - Wait for verification (can take up to 48 hours)
   - **OR** Use their default domain (`onboarding.resend.dev`) for testing

3. **Get API Key**
   - Go to API Keys → Create API Key
   - Name it: `vic-mate-growth-production`
   - Copy the key (starts with `re_`)
   - Add to `.env.local`: `VITE_RESEND_API_KEY=re_...`

4. **Create Email Templates**

Create `src/lib/emailTemplates.ts`:

```typescript
export const breakEvenResultsEmail = (data: {
  firstName: string;
  results: any;
  inputs: any;
}) => ({
  subject: `Your Break-Even Calculator Results - ${data.results.breakEvenCustomers} Customers Needed`,
  html: `
    <h1>Hi ${data.firstName},</h1>
    <p>Thanks for using our Break-Even Calculator! Here are your results:</p>

    <h2>Your Results</h2>
    <ul>
      <li><strong>Leads Needed:</strong> ${data.results.leadsNeeded}</li>
      <li><strong>Customers Needed:</strong> ${data.results.customersNeeded}</li>
      <li><strong>Total Profit:</strong> $${data.results.totalProfit.toLocaleString()}</li>
      <li><strong>Actual ROI:</strong> ${data.results.actualROI}%</li>
    </ul>

    <p><a href="https://yourmate.agency/tools/break-even-calculator">Run the calculator again</a></p>

    <h3>Ready to make these numbers a reality?</h3>
    <p><a href="https://yourmate.agency/about">Book a free strategy call</a> with our team.</p>

    <p>Cheers,<br>Your Mate Agency</p>
  `,
});

// Add more templates for other tools...
```

5. **Create Email Sending Function**

Create `src/lib/sendEmail.ts`:

```typescript
export async function sendEmail(to: string, template: { subject: string; html: string }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Your Mate Agency <hello@yourmate.agency>',
      to: [to],
      subject: template.subject,
      html: template.html,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send email');
  }

  return response.json();
}
```

6. **Update Form Handlers to Send Emails**

```typescript
// After saving to Supabase:
import { sendEmail } from '@/lib/sendEmail';
import { breakEvenResultsEmail } from '@/lib/emailTemplates';

await sendEmail(
  emailData.email,
  breakEvenResultsEmail({
    firstName: emailData.firstName || 'there',
    results,
    inputs: watchedValues,
  })
);
```

**Alternative: Supabase Edge Functions**

If you prefer serverless:
1. Create edge function: `supabase functions new send-email`
2. Deploy with Resend API key
3. Call from frontend instead of direct API calls

---

### **3. Google Analytics 4 (Analytics Tracking)**

**Purpose:** Track tool usage, conversions, and user behavior

**Setup Steps:**

1. **Create GA4 Property**
   - Go to [https://analytics.google.com](https://analytics.google.com)
   - Admin → Create Property
   - Name: `Vic Mate Growth`
   - Set timezone: `Australia/Melbourne`
   - Create Data Stream (Web)
   - Enter website URL

2. **Get Measurement ID**
   - Data Streams → Select your stream
   - Copy `Measurement ID` (format: `G-XXXXXXXXXX`)
   - Add to `.env.local`: `VITE_GA_MEASUREMENT_ID=G-...`

3. **Install GA4 Package**

```bash
npm install react-ga4
```

4. **Initialize GA4**

Create `src/lib/analytics.ts`:

```typescript
import ReactGA from 'react-ga4';

export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (measurementId) {
    ReactGA.initialize(measurementId);
  }
};

export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};
```

5. **Add to App.tsx**

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView } from '@/lib/analytics';

// Inside App component:
useEffect(() => {
  initGA();
}, []);

// Track page views
const location = useLocation();
useEffect(() => {
  trackPageView(location.pathname);
}, [location]);
```

6. **Track Tool Events**

In each tool, add tracking:

```typescript
import { trackEvent } from '@/lib/analytics';

// When tool starts
trackEvent('Tool', 'Start', 'Break-Even Calculator');

// When results shown
trackEvent('Tool', 'Complete', 'Break-Even Calculator');

// When email captured
trackEvent('Conversion', 'Email Capture', 'Break-Even Calculator');
```

7. **Create Custom Events in GA4**
   - Admin → Events → Create Event
   - Name: `tool_start`, `tool_complete`, `email_capture`
   - Mark as conversions

---

### **4. Facebook Pixel (Optional - For Retargeting)**

**Purpose:** Track visitors for retargeting ads

**Setup Steps:**

1. **Create Facebook Pixel**
   - Go to Facebook Events Manager
   - Create Pixel
   - Copy Pixel ID

2. **Add to `.env.local`**
```env
VITE_FACEBOOK_PIXEL_ID=123456789012345
```

3. **Install Package**
```bash
npm install react-facebook-pixel
```

4. **Initialize**
```typescript
import ReactPixel from 'react-facebook-pixel';

ReactPixel.init(import.meta.env.VITE_FACEBOOK_PIXEL_ID);
ReactPixel.pageView();
```

---

## 📊 **OPTIONAL SERVICES**

### **5. Stripe (Payment Processing)**

**When Needed:** When you want to accept payments through the dashboard

**Setup:**
1. Create Stripe account: [https://stripe.com](https://stripe.com)
2. Get API keys (test + production)
3. Add to environment variables
4. Use `@stripe/stripe-js` package

---

### **6. Google Maps API (For Location Features)**

**When Needed:** If you want to show maps on location pages

**Setup:**
1. Go to Google Cloud Console
2. Enable Maps JavaScript API
3. Create API key
4. Add to `.env.local`
5. Restrict key to your domain

---

### **7. Twilio (SMS Notifications)**

**When Needed:** If you want SMS alerts for new leads

**Setup:**
1. Create Twilio account
2. Get phone number
3. Get Account SID and Auth Token
4. Add to environment variables
5. Send SMS when high-value lead captured

---

## 🚀 **DEPLOYMENT CHECKLIST**

### **Before Deploying:**

- [ ] All environment variables added to hosting platform
- [ ] Supabase tables created and policies set
- [ ] DNS records added for email domain
- [ ] Google Analytics property created
- [ ] Test email sending in production
- [ ] Test form submissions save to database
- [ ] Test analytics tracking works
- [ ] SSL certificate configured (automatic with Vercel/Netlify)

### **Recommended Hosting:**

**Best Options:**
1. **Vercel** (Recommended)
   - Free tier
   - Automatic deployments from GitHub
   - Great DX
   - Built-in analytics

2. **Netlify**
   - Free tier
   - Similar to Vercel
   - Good form handling

3. **Cloudflare Pages**
   - Free tier
   - Fast global CDN
   - Good for static sites

### **Deployment Steps (Vercel):**

1. Push code to GitHub (already done ✅)
2. Go to [https://vercel.com](https://vercel.com)
3. Sign up with GitHub
4. Import repository: `yourmatematt/vic-mate-growth`
5. Configure:
   - Framework: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
6. Add environment variables (all `VITE_*` vars)
7. Deploy!
8. Add custom domain in settings

---

## 📝 **FILES TO UPDATE**

Once you have API keys, update these files:

### **Priority 1 (Core Functionality):**
1. Create `.env.local` with all keys
2. Create `src/lib/supabase.ts`
3. Create `src/lib/sendEmail.ts`
4. Create `src/lib/emailTemplates.ts`
5. Create `src/lib/analytics.ts`

### **Priority 2 (Replace TODO comments):**
6. `src/components/tools/LeadCaptureModal.tsx:89` - Add email sending
7. `src/pages/tools/BreakEvenCalculator.tsx:90` - Add Supabase insert
8. `src/pages/tools/SubjectLineScorer.tsx:128` - Add Supabase insert
9. `src/pages/tools/MarketingAssessment.tsx:205` - Add Supabase insert
10. `src/components/WebsiteAnalysisCTA.tsx:50` - Add Supabase insert

### **Priority 3 (Analytics):**
11. `src/App.tsx` - Add GA4 initialization
12. Each tool file - Add event tracking

---

## 💰 **COST BREAKDOWN**

**Total Monthly Cost: $0-$25 (for starter traffic)**

| Service | Free Tier | Paid Plans | Estimated Cost |
|---------|-----------|------------|----------------|
| **Supabase** | 500MB database, 2GB bandwidth, 50,000 monthly active users | $25/month Pro | **$0** (free tier sufficient) |
| **Resend** | 100 emails/day (3,000/month) | $20/month (50,000 emails) | **$0** (free tier sufficient initially) |
| **Google Analytics** | Unlimited | N/A | **$0** (always free) |
| **Vercel** | 100GB bandwidth, unlimited sites | $20/month Pro | **$0** (free tier sufficient) |
| **Facebook Pixel** | Free | N/A | **$0** (always free) |
| **TOTAL** | - | - | **$0/month** to start |

**When to Upgrade:**
- Supabase: When you exceed 500MB database or 2GB bandwidth
- Resend: When sending >100 emails/day (≈ 30+ leads/day)
- Vercel: When you need advanced features or >100GB bandwidth

---

## 🧪 **TESTING GUIDE**

### **1. Test Email Delivery (Development)**

```typescript
// Create test endpoint
// pages/api/test-email.ts
import { sendEmail } from '@/lib/sendEmail';

export async function testEmail() {
  await sendEmail('your-email@example.com', {
    subject: 'Test Email',
    html: '<h1>It works!</h1>',
  });
}
```

### **2. Test Database Connection**

```typescript
import { supabase } from '@/lib/supabase';

async function testDatabase() {
  const { data, error } = await supabase
    .from('tool_leads')
    .select('*')
    .limit(1);

  console.log('Database test:', data, error);
}
```

### **3. Test Analytics**

1. Open browser console
2. Run tool
3. Check Network tab for Google Analytics requests
4. Check GA4 Real-time reports

---

## 📚 **DOCUMENTATION LINKS**

- **Supabase Docs:** https://supabase.com/docs
- **Resend Docs:** https://resend.com/docs
- **GA4 Docs:** https://developers.google.com/analytics/devguides/collection/ga4
- **React Hook Form:** https://react-hook-form.com/
- **Zod Validation:** https://zod.dev/
- **Vercel Deployment:** https://vercel.com/docs

---

## ⚡ **QUICK START (5 Minutes)**

For the fastest setup to get tools working:

1. **Supabase (2 min):**
   - Sign up → Create project → Copy API keys
   - Add to `.env.local`

2. **Resend (2 min):**
   - Sign up → Create API key
   - Add to `.env.local`
   - Use default domain for now (set up custom domain later)

3. **Google Analytics (1 min):**
   - Create property → Copy measurement ID
   - Add to `.env.local`

4. **Deploy:**
   ```bash
   npm install
   npm run dev  # Test locally
   git push      # Auto-deploys to Vercel if connected
   ```

That's it! Tools will now:
- ✅ Save leads to database
- ✅ Send results via email
- ✅ Track usage in analytics

---

## 🆘 **TROUBLESHOOTING**

### **Emails not sending:**
- Check API key is correct in `.env.local`
- Verify domain is verified in Resend
- Check browser console for errors
- Test with Resend's test email feature

### **Database not saving:**
- Check Supabase URL and key
- Verify tables exist
- Check Row Level Security policies
- Look for errors in browser console

### **Analytics not tracking:**
- Check Measurement ID is correct
- Verify GA4 is initialized in App.tsx
- Check Network tab for gtag requests
- Wait 24-48 hours for data to appear

---

Need help? Check the TODO comments in the code—they mark exactly where integrations are needed!
