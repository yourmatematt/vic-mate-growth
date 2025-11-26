# Vercel Deployment Guide

## Overview

This guide walks you through deploying the Your Mate Agency website to Vercel with custom domain setup.

**Project:** vic-mate-growth
**Domain:** yourmateagency.com.au
**Repository:** GitHub repo (your-mate-agency-master)

---

## Prerequisites

- [ ] GitHub repository is pushed and up-to-date
- [ ] Vercel account created (vercel.com)
- [ ] Domain registrar access for yourmateagency.com.au
- [ ] Supabase project running with migrations deployed
- [ ] Google Cloud Console access (if using Calendar integration)

---

## Step 1: Connect GitHub Repository

### 1.1 Link Repository to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Select **"Import Git Repository"**
4. Find your GitHub repository: `your-mate-agency-master`
5. Click **"Import"**

### 1.2 Configure Project Settings

1. **Project Name:** `vic-mate-growth`
2. **Framework Preset:** Detected as "Vite" ✅
3. **Root Directory:** `vic-mate-growth` (subfolder)
4. **Build and Output Settings:**
   - Build Command: `pnpm build` ✅ (auto-detected)
   - Output Directory: `dist` ✅ (auto-detected)
   - Install Command: `pnpm install` ✅ (auto-detected)
5. Click **"Deploy"**

**Note:** The first deployment may fail due to missing environment variables - this is expected.

---

## Step 2: Configure Environment Variables

### 2.1 Access Environment Variables

1. In your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**

### 2.2 Add Required Variables

Copy these from your Supabase dashboard:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://wcawetkkyfhmvgfrfbpi.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | `eyJ[...]` (your anon key) | Production, Preview |

### 2.3 Add Optional Variables (if using features)

#### Google Calendar Integration

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_GOOGLE_CLIENT_ID` | `[client-id].apps.googleusercontent.com` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-[secret]` | Server-side only |
| `GOOGLE_REDIRECT_URI` | `https://yourmateagency.com.au/admin/google-calendar-auth` | OAuth callback |
| `GOOGLE_CALENDAR_ID` | `matt@yourmateagency.com.au` | Target calendar |

#### Email Service (choose one)

**SendGrid:**
| Variable | Value |
|----------|-------|
| `SENDGRID_API_KEY` | `SG.[key]` |

**Resend:**
| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | `re_[key]` |

#### Site Configuration

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SITE_URL` | `https://yourmateagency.com.au` | Production |
| `VITE_SITE_URL` | `https://preview-branch.vercel.app` | Preview |

#### Analytics (optional)

| Variable | Value |
|----------|-------|
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` |
| `VITE_SENTRY_DSN` | `https://[dsn].sentry.io/[project]` |

### 2.4 Environment Variable Best Practices

1. **For Production:** Set environment to "Production"
2. **For Previews:** Set environment to "Preview" (useful for testing)
3. **Sensitive Data:** Use Vercel's encrypted storage (automatic)
4. **Never commit:** Environment variables are never stored in git

---

## Step 3: Build Configuration Verification

### 3.1 Verify vercel.json

The project includes `vercel.json` with these settings:

```json
{
  "framework": "vite",
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "regions": ["syd1"],
  "rewrites": [{"source": "/(.*)", "destination": "/index.html"}],
  "headers": [/* Security headers */]
}
```

### 3.2 Build Settings in Dashboard

Verify these match in **Settings** → **Build & Development Settings**:

- **Framework Preset:** Vite
- **Build Command:** `pnpm build`
- **Output Directory:** `dist`
- **Install Command:** `pnpm install`
- **Node.js Version:** 18.x (recommended)

---

## Step 4: Deploy and Test

### 4.1 Trigger Deployment

1. Go to **Deployments** tab
2. Click **"Redeploy"** to trigger new build with environment variables
3. Monitor build logs for any errors

### 4.2 Test Deployment

Once deployed to the `.vercel.app` URL, test:

- [ ] Homepage loads correctly
- [ ] Navigation works (SPA routing)
- [ ] Booking form submits successfully
- [ ] Admin login works (`/admin`)
- [ ] Case studies display (`/expertise`)
- [ ] All images load properly

### 4.3 Check Build Logs

If build fails, check logs for:
- Missing environment variables
- TypeScript errors
- Asset optimization issues

---

## Step 5: Custom Domain Setup

### 5.1 Add Domain in Vercel

1. In project dashboard, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `yourmateagency.com.au`
4. Enter: `www.yourmateagency.com.au`

### 5.2 Configure DNS Records

Vercel will provide DNS configuration. Add these records in your domain registrar:

**For yourmateagency.com.au:**
- Type: `A`
- Name: `@`
- Value: `76.76.19.61` (Vercel IP)

**For www.yourmateagency.com.au:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

**Alternative (if A record not supported):**
- Type: `CNAME`
- Name: `@`
- Value: `[your-project].vercel.app`

### 5.3 SSL Certificate

Vercel automatically provisions SSL certificates. This process takes 5-10 minutes after DNS propagation.

### 5.4 Verify Domain

1. Wait for DNS propagation (up to 48 hours, usually 5-10 minutes)
2. Check that `https://yourmateagency.com.au` loads your site
3. Verify SSL certificate is active (lock icon in browser)
4. Test redirect from `www` to non-www (or vice versa)

---

## Step 6: Production Checklist

### 6.1 Performance & SEO

- [ ] Lighthouse score > 90 for all metrics
- [ ] Meta tags present on all pages
- [ ] Sitemap.xml generated and accessible
- [ ] robots.txt configured
- [ ] Favicon and app icons present

### 6.2 Analytics & Monitoring

- [ ] Google Analytics configured (if using)
- [ ] Sentry error tracking active (if using)
- [ ] Uptime monitoring setup
- [ ] Core Web Vitals monitoring

### 6.3 Security

- [ ] Security headers active (from vercel.json)
- [ ] CSP policies configured
- [ ] All API endpoints use HTTPS
- [ ] No sensitive data in client-side code

### 6.4 Functionality

- [ ] Contact forms send emails
- [ ] Booking system creates calendar events
- [ ] Admin authentication works
- [ ] Case studies CRUD functional
- [ ] File uploads work correctly

### 6.5 Content

- [ ] All placeholder content replaced
- [ ] Real client testimonials added
- [ ] Professional photos uploaded
- [ ] Legal pages complete (Terms, Privacy)

---

## Step 7: Ongoing Maintenance

### 7.1 Automatic Deployments

Vercel automatically deploys when you push to main branch:
- **Production:** Pushes to `main` → deploys to yourmateagency.com.au
- **Preview:** Pushes to other branches → deploys to preview URLs

### 7.2 Monitoring

Monitor these in Vercel dashboard:
- **Analytics:** Page views, performance metrics
- **Functions:** Serverless function performance
- **Edge Network:** CDN performance worldwide

### 7.3 Updates

To update the site:
1. Make changes locally
2. Test thoroughly
3. Push to GitHub
4. Vercel automatically deploys
5. Test production deployment

---

## Troubleshooting

### Common Build Errors

**"Missing environment variable"**
- Add the variable in Vercel dashboard
- Redeploy after adding variables

**"TypeScript errors"**
- Fix TypeScript issues locally first
- Run `pnpm build` locally to test

**"Module not found"**
- Ensure all dependencies are in package.json
- Check import paths are correct

### Domain Issues

**"Domain not accessible"**
- Check DNS propagation with tools like dns-checker.org
- Verify DNS records match Vercel's requirements
- Wait 24-48 hours for full propagation

**"SSL certificate error"**
- SSL generation can take up to 24 hours
- Check that domain is properly verified in Vercel
- Contact Vercel support if persists

### Performance Issues

**Slow loading times**
- Enable Vercel Analytics for insights
- Optimize images and bundle sizes
- Check Edge Network distribution

---

## Support Resources

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Community Forum:** [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **Status Page:** [vercel-status.com](https://vercel-status.com)

---

**Estimated Setup Time:** 30-45 minutes (plus DNS propagation)
**Last Updated:** November 26, 2025