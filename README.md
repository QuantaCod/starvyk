# DataViz Platform

A production-ready data visualization web app built with **React + Vite**, **Supabase** (PostgreSQL + Auth), and deployed on **Vercel**.

---

## Table of Contents

1. [What You Get](#what-you-get)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Step 1 — Clone & Install](#step-1--clone--install)
5. [Step 2 — Create Supabase Project](#step-2--create-supabase-project)
6. [Step 3 — Run the Database Schema](#step-3--run-the-database-schema)
7. [Step 4 — Enable Realtime](#step-4--enable-realtime)
8. [Step 5 — Set Up Admin Auth](#step-5--set-up-admin-auth)
9. [Step 6 — Configure Environment Variables](#step-6--configure-environment-variables)
10. [Step 7 — Run Locally](#step-7--run-locally)
11. [Step 8 — Deploy to Vercel](#step-8--deploy-to-vercel)
12. [Step 9 — Post-Deployment Checklist](#step-9--post-deployment-checklist)
13. [Admin Panel Guide](#admin-panel-guide)
14. [Chart Data Format](#chart-data-format)
15. [Troubleshooting](#troubleshooting)

---

## What You Get

| Feature | Details |
|---|---|
| Public homepage | Two sections — 4 featured datasets + 4 featured articles |
| Datasets page | `/datasets` — full listing, search, tag filter, pagination |
| Articles page | `/articles` — full listing, search, tag filter, pagination |
| Dataset detail | `/dataset/:slug` — interactive chart with Bar/Line/Pie/Table switcher |
| Article detail | `/article/:slug` — markdown rendered, read time, tags |
| Like system | Anonymous likes with fingerprint deduplication, real-time count updates |
| Admin panel | `/admin` — full Supabase email+password auth, create/edit/delete datasets & articles |
| SEO | Dynamic meta titles, descriptions, Open Graph tags per page |
| Responsive | Mobile + desktop, dark theme throughout |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + Vite |
| Routing | React Router v6 |
| Charts | Chart.js + react-chartjs-2 |
| Markdown | react-markdown |
| Database | Supabase PostgreSQL |
| Auth | Supabase Authentication (email + password) |
| Realtime | Supabase Realtime WebSocket |
| Styling | CSS Modules |
| SEO | react-helmet-async |
| CSV parsing | PapaParse |
| Notifications | react-hot-toast |
| Deployment | Vercel |

---

## Project Structure

```
dataviz-app/
├── index.html
├── vite.config.js
├── vercel.json              ← SPA routing config for Vercel
├── package.json
├── .env.example             ← Copy this to .env and fill in values
├── supabase-schema.sql      ← Run this in Supabase SQL Editor
└── src/
    ├── App.jsx              ← All routes defined here
    ├── main.jsx             ← React root entry
    ├── styles/
    │   └── globals.css      ← Design system (CSS variables, animations)
    ├── lib/
    │   ├── supabase.js      ← Supabase client
    │   ├── api.js           ← All database operations
    │   └── fingerprint.js   ← Anonymous like deduplication logic
    ├── hooks/
    │   ├── useAdminAuth.js  ← Supabase Auth session management
    │   └── useLike.js       ← Like state + realtime subscription
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx   ← Public nav (no admin link)
    │   │   ├── Footer.jsx   ← Centered footer, always at bottom
    │   │   └── Layout.jsx   ← Shell with Navbar + Footer
    │   ├── ui/
    │   │   ├── DatasetCard.jsx
    │   │   ├── ArticleCard.jsx
    │   │   ├── LikeButton.jsx
    │   │   ├── TagBadge.jsx
    │   │   ├── SEO.jsx      ← Helmet meta tags
    │   │   └── Skeleton.jsx ← Loading skeletons
    │   ├── charts/
    │   │   ├── ChartRenderer.jsx     ← Bar, Line, Pie, Table
    │   │   └── ChartTypeSwitcher.jsx ← Toggle between chart types
    │   └── admin/
    │       ├── AdminLogin.jsx        ← Email + password + forgot password
    │       ├── AdminDashboard.jsx    ← Stats overview
    │       ├── AdminDatasetForm.jsx  ← Create/edit datasets (CSV import)
    │       ├── AdminArticleForm.jsx  ← Create/edit articles (Markdown)
    │       ├── AdminDatasetList.jsx  ← Manage all datasets
    │       └── AdminArticleList.jsx  ← Manage all articles
    └── pages/
        ├── HomePage.jsx     ← 4 datasets + 4 articles, hero, search
        ├── DatasetsPage.jsx ← /datasets — full listing
        ├── ArticlesPage.jsx ← /articles — full listing
        ├── DatasetPage.jsx  ← /dataset/:slug
        ├── ArticlePage.jsx  ← /article/:slug
        ├── AdminPage.jsx    ← /admin — auth shell + sidebar
        └── NotFoundPage.jsx
```

---

## Step 1 — Clone & Install

```bash
# Clone or unzip the project
cd dataviz-app

# Install all dependencies
npm install
```

> Requires Node.js 18 or higher. Check with `node -v`.

---

## Step 2 — Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account)
2. Click **New Project**
3. Fill in:
   - **Project name**: anything you like (e.g. `dataviz-platform`)
   - **Database password**: choose a strong password and save it somewhere
   - **Region**: pick the one closest to your users
4. Click **Create new project**
5. Wait 1–2 minutes for the project to provision

---

## Step 3 — Run the Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase-schema.sql` from this project
4. Copy the entire contents and paste it into the SQL Editor
5. Click **Run** (or press Ctrl+Enter / Cmd+Enter)
6. You should see: `Success. No rows returned`

This creates:
- `datasets` table — stores chart data, tags, slug, like count
- `articles` table — stores markdown content, tags, slug, like count
- `likes` table — tracks anonymous likes with unique constraint
- `increment_likes` and `decrement_likes` RPC functions
- Row Level Security (RLS) policies
- Sample seed data (1 dataset + 1 article to get you started)

---

## Step 4 — Enable Realtime

Realtime allows like counts to update live across all open browser tabs.

1. In Supabase dashboard, go to **Database** in the left sidebar
2. Click **Replication**
3. Under **Supabase Realtime**, find the `public` schema
4. Toggle ON for:
   - `datasets`
   - `articles`
5. Click **Save**

---

## Step 5 — Set Up Admin Auth

The admin panel at `/admin` uses Supabase's built-in email + password authentication.

### 5a. Create your admin user

1. In Supabase dashboard, go to **Authentication** in the left sidebar
2. Click **Users**
3. Click **Add user** → **Create new user**
4. Enter:
   - **Email**: your admin email (e.g. `admin@yoursite.com`)
   - **Password**: a strong password (at least 8 characters)
5. Click **Create user**

### 5b. Disable public signups (important for security)

1. Go to **Authentication** → **Settings**
2. Under **User Signups**, toggle **OFF**: `Enable email confirmations` is optional, but toggle **OFF** the `Allow new users to sign up` option
3. This prevents anyone else from registering an account on your project

### 5c. Set the Site URL (required for password reset emails)

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel app URL:
   - During local dev: `http://localhost:5173`
   - After deploying: `https://your-app-name.vercel.app`
3. Click **Save**

---

## Step 6 — Configure Environment Variables

### Get your Supabase keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** — looks like `https://abcdefghijkl.supabase.co`
   - **anon public** key — a long JWT string (safe to expose in frontend)

### Create your local .env file

```bash
cp .env.example .env
```

Open `.env` and fill in all values:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here

# Admin — only this email can log in to /admin
VITE_ADMIN_EMAIL=admin@yoursite.com

# SEO — your public site URL
VITE_SITE_URL=https://your-app-name.vercel.app
```

> **Important:** All Vite env variables MUST start with `VITE_` to be accessible in the browser.

> **Do not** use your Supabase **service_role** key here — use the **anon** key only.

---

## Step 7 — Run Locally

```bash
npm run dev
```

Open your browser at:
- **Public site**: [http://localhost:5173](http://localhost:5173)
- **Admin panel**: [http://localhost:5173/admin](http://localhost:5173/admin)

Log in to the admin panel using the email and password you created in Step 5a.

To build and preview the production bundle locally:

```bash
npm run build
npm run preview
```

---

## Step 8 — Deploy to Vercel

### Option A — Vercel CLI (fastest, ~2 minutes)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Log in to Vercel
vercel login

# Deploy from the project root
vercel
```

When prompted:
- **Set up and deploy**: Yes
- **Which scope**: select your account
- **Link to existing project**: No
- **Project name**: dataviz-platform (or anything)
- **Directory**: `./` (current directory)
- **Override settings**: No

After first deploy, Vercel gives you a URL like `https://dataviz-platform-xxx.vercel.app`.

**Add environment variables** via CLI:

```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_ADMIN_EMAIL
vercel env add VITE_SITE_URL
```

Then redeploy to apply them:

```bash
vercel --prod
```

---

### Option B — GitHub + Vercel Dashboard (recommended for ongoing projects)

**Step 1 — Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/dataviz-platform.git
git push -u origin main
```

**Step 2 — Import to Vercel**

1. Go to [https://vercel.com](https://vercel.com) and log in
2. Click **Add New** → **Project**
3. Click **Import Git Repository**
4. Select your `dataviz-platform` repository
5. Vercel auto-detects Vite — no build config changes needed
6. Before clicking Deploy, click **Environment Variables** and add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://your-project-id.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `your-anon-key` |
| `VITE_ADMIN_EMAIL` | `admin@yoursite.com` |
| `VITE_SITE_URL` | `https://your-app-name.vercel.app` |

7. Click **Deploy**
8. Wait ~60 seconds — your site is live!

**Future deployments:** Every `git push` to `main` auto-deploys to Vercel.

---

## Step 9 — Post-Deployment Checklist

After your site is live, run through this checklist:

- [ ] Visit your Vercel URL — homepage loads with hero section
- [ ] `/datasets` and `/articles` pages load correctly
- [ ] Click a dataset — chart renders
- [ ] Click a Like button — count updates without page refresh
- [ ] Open the same page in two tabs — like count syncs in real-time
- [ ] Go to `/admin` — login form appears (NOT visible in navbar)
- [ ] Log in with your admin email + password
- [ ] Create a test dataset (use the sample JSON provided in the form)
- [ ] Create a test article (markdown editor with preview)
- [ ] Verify new content appears on the homepage
- [ ] Update Supabase Auth → URL Configuration → Site URL to your live Vercel URL
- [ ] Test "Forgot password" — you should receive a reset email

---

## Admin Panel Guide

The admin panel lives at `/admin`. It is **not linked** anywhere on the public site.

### Logging In

1. Go to `https://your-site.vercel.app/admin`
2. Enter your admin email and password
3. Click **Sign In**

### Forgot Password

1. Click **Forgot password?** on the login page
2. Enter your admin email
3. Click **Send Reset Link**
4. Check your inbox and click the link to set a new password

### Creating a Dataset

1. In the admin sidebar, click **Datasets** → **New Dataset**
2. Fill in:
   - **Title** — displayed as the dataset name
   - **Description** — short summary shown in cards
   - **Slug** — auto-generated from title (used in URL: `/dataset/your-slug`)
   - **Default Chart Type** — Bar, Line, Pie, or Table
   - **Tags** — type a tag and press Enter to add
   - **CSV Upload** (optional) — upload a CSV file to auto-convert to chart data
   - **Chart Data JSON** — must follow Chart.js format (see below)
3. Click **Create Dataset**

### Creating an Article

1. In the admin sidebar, click **Articles** → **New Article**
2. Fill in:
   - **Title**, **Description**, **Slug**, **Tags**
   - **Read Time** — auto-estimated from word count
   - **Content** — write in Markdown
3. Click **Preview** to see rendered output before publishing
4. Click **Publish Article**

### Editing or Deleting

- Click **Edit** (pencil icon) next to any item in the list
- Click **Delete** (trash icon) — you'll be asked to confirm before deletion

---

## Chart Data Format

All chart data must follow the Chart.js format:

```json
{
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "datasets": [
    {
      "label": "Revenue ($)",
      "data": [4200, 3800, 5100, 4700, 6200, 5800]
    },
    {
      "label": "Expenses ($)",
      "data": [2100, 2300, 2800, 2500, 3100, 2900]
    }
  ]
}
```

### CSV Auto-Import

Instead of writing JSON manually, upload a CSV file in the dataset form:

```csv
Month,Revenue,Expenses
Jan,4200,2100
Feb,3800,2300
Mar,5100,2800
```

The first column becomes the labels. All other columns become datasets. The converter runs automatically in the browser.

---

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure your `.env` file exists (copy from `.env.example`)
- All variable names must start with `VITE_`
- Restart the dev server after editing `.env`

### Admin login says "Invalid login credentials"
- Double-check the email and password in Supabase → Authentication → Users
- Make sure you created the user in Step 5a
- Try resetting your password via the "Forgot password?" link

### Admin login says "You do not have admin access"
- Your `VITE_ADMIN_EMAIL` in `.env` doesn't match the email you logged in with
- Either update `VITE_ADMIN_EMAIL` to match, or log in with the matching email

### Charts not rendering
- Check that `chart_data` is valid JSON — paste it into [jsonlint.com](https://jsonlint.com) to verify
- Make sure it follows the `{ labels, datasets }` format shown above
- Use the **Table** view fallback to verify data is present

### Like counts not updating in real-time
- Confirm Realtime is enabled in Supabase → Database → Replication for `datasets` and `articles`
- Check browser console for WebSocket connection errors
- Realtime requires the anon key to have correct RLS policies (already set by the schema)

### Vercel deployment shows blank page
- Check Vercel build logs for errors
- Confirm all `VITE_` environment variables are set in Vercel dashboard
- Make sure `vercel.json` is present in the project root (it handles SPA routing)

### Vercel deployment: "Cannot GET /dataset/my-slug"
- This means `vercel.json` is missing or not being picked up
- Verify `vercel.json` is in the project root with the rewrite rule:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```

### Password reset emails not arriving
- Go to Supabase → Authentication → URL Configuration
- Make sure **Site URL** is set to your Vercel deployment URL
- Check your spam folder
- Supabase free tier has a limit of 3 auth emails per hour on the free plan

### Supabase connection errors in production
- Verify the `VITE_SUPABASE_URL` does not have a trailing slash
- Confirm you are using the **anon** key, not the **service_role** key
- Check Supabase project is not paused (free tier pauses after 1 week of inactivity)

---

## Security Notes

| Concern | Solution |
|---|---|
| Admin login | Full Supabase Auth — email + password, JWT sessions |
| Admin restriction | `VITE_ADMIN_EMAIL` limits access to one specific email |
| Public signups | Disabled in Supabase Auth Settings |
| Anonymous likes | Unique DB index on `(target_type, target_id, fingerprint)` |
| Like spam | 5-minute cooldown per item stored in localStorage |
| Supabase key | Only the safe `anon` key is exposed — service role key never used in frontend |
| RLS | Row Level Security enabled on all tables |

---

## Reactivating a Paused Supabase Project

Supabase free tier projects pause after approximately 1 week of inactivity.

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Find your project — it will show a "Paused" badge
3. Click **Restore project**
4. Wait 1–2 minutes for it to wake up
5. Your site will work normally again

To avoid pausing, upgrade to Supabase Pro ($25/month) or make at least one database request per week.
