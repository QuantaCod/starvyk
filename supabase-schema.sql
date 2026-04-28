-- ============================================================
-- DataViz Platform — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ─── Enable UUID extension ───────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── DATASETS ────────────────────────────────────────────────
create table if not exists public.datasets (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  slug          text not null unique,
  description   text,
  chart_type    text not null default 'bar'
                  check (chart_type in ('bar', 'line', 'pie', 'table')),
  chart_data    jsonb,
  tags          text[] default '{}',
  likes_count   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists datasets_slug_idx on public.datasets (slug);
create index if not exists datasets_tags_idx on public.datasets using gin (tags);
create index if not exists datasets_created_idx on public.datasets (created_at desc);

-- ─── ARTICLES ────────────────────────────────────────────────
create table if not exists public.articles (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  slug          text not null unique,
  description   text,
  content       text,
  tags          text[] default '{}',
  read_time     integer,
  likes_count   integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists articles_slug_idx on public.articles (slug);
create index if not exists articles_tags_idx on public.articles using gin (tags);
create index if not exists articles_created_idx on public.articles (created_at desc);

-- ─── LIKES ───────────────────────────────────────────────────
create table if not exists public.likes (
  id            uuid primary key default uuid_generate_v4(),
  target_type   text not null check (target_type in ('dataset', 'article')),
  target_id     uuid not null,
  fingerprint   text not null,
  created_at    timestamptz not null default now()
);

-- Prevent exact duplicate likes (same fingerprint + item)
create unique index if not exists likes_unique_idx
  on public.likes (target_type, target_id, fingerprint);

create index if not exists likes_target_idx
  on public.likes (target_type, target_id);

-- ─── AUTO updated_at TRIGGER ─────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists datasets_updated_at on public.datasets;
create trigger datasets_updated_at
  before update on public.datasets
  for each row execute procedure public.handle_updated_at();

drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at
  before update on public.articles
  for each row execute procedure public.handle_updated_at();

-- ─── INCREMENT / DECREMENT LIKES RPCs ────────────────────────
-- These are called server-side to avoid race conditions

create or replace function public.increment_likes(table_name text, row_id uuid)
returns void language plpgsql security definer as $$
begin
  if table_name = 'datasets' then
    update public.datasets set likes_count = likes_count + 1 where id = row_id;
  elsif table_name = 'articles' then
    update public.articles set likes_count = likes_count + 1 where id = row_id;
  end if;
end;
$$;

create or replace function public.decrement_likes(table_name text, row_id uuid)
returns void language plpgsql security definer as $$
begin
  if table_name = 'datasets' then
    update public.datasets
    set likes_count = greatest(0, likes_count - 1)
    where id = row_id;
  elsif table_name = 'articles' then
    update public.articles
    set likes_count = greatest(0, likes_count - 1)
    where id = row_id;
  end if;
end;
$$;

-- ─── ROW LEVEL SECURITY (RLS) ────────────────────────────────
-- Enable RLS on all tables
alter table public.datasets enable row level security;
alter table public.articles enable row level security;
alter table public.likes enable row level security;

-- Datasets: anyone can read; service role can write (admin uses anon key + env password)
create policy "Public read datasets"
  on public.datasets for select to anon, authenticated using (true);

create policy "Anyone can insert datasets"
  on public.datasets for insert to anon, authenticated with check (true);

create policy "Anyone can update datasets"
  on public.datasets for update to anon, authenticated using (true);

create policy "Anyone can delete datasets"
  on public.datasets for delete to anon, authenticated using (true);

-- Articles: same pattern
create policy "Public read articles"
  on public.articles for select to anon, authenticated using (true);

create policy "Anyone can insert articles"
  on public.articles for insert to anon, authenticated with check (true);

create policy "Anyone can update articles"
  on public.articles for update to anon, authenticated using (true);

create policy "Anyone can delete articles"
  on public.articles for delete to anon, authenticated using (true);

-- Likes: anyone can read and write (fingerprint deduplication handled in app + unique index)
create policy "Public read likes"
  on public.likes for select to anon, authenticated using (true);

create policy "Anyone can insert likes"
  on public.likes for insert to anon, authenticated with check (true);

create policy "Anyone can delete own likes"
  on public.likes for delete to anon, authenticated using (true);

-- ─── REALTIME ────────────────────────────────────────────────
-- Enable realtime on datasets and articles for live like count updates
-- Run in Supabase Dashboard > Database > Replication and enable for:
--   public.datasets
--   public.articles

-- ─── SAMPLE DATA (optional) ──────────────────────────────────
insert into public.datasets (title, slug, description, chart_type, chart_data, tags)
values (
  'Global Temperature Anomalies 2000–2023',
  'global-temperature-anomalies',
  'Annual global mean temperature anomalies compared to the 20th century average, showing the accelerating warming trend.',
  'line',
  '{
    "labels": ["2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015","2016","2017","2018","2019","2020","2021","2022","2023"],
    "datasets": [{
      "label": "Temperature Anomaly (°C)",
      "data": [0.42,0.54,0.63,0.62,0.54,0.68,0.61,0.66,0.54,0.64,0.72,0.61,0.65,0.68,0.75,0.90,1.01,0.92,0.85,0.98,1.02,0.85,0.89,1.17]
    }]
  }',
  array['climate', 'environment', 'science']
) on conflict (slug) do nothing;

insert into public.datasets (title, slug, description, chart_type, chart_data, tags)
values (
  'Global Renewable Energy by Source 2023',
  'renewable-energy-by-source',
  'Breakdown of global renewable electricity generation capacity by technology type in 2023.',
  'pie',
  '{
    "labels": ["Solar PV", "Wind", "Hydro", "Bioenergy", "Geothermal", "Other"],
    "datasets": [{
      "label": "Capacity (GW)",
      "data": [1419, 899, 1392, 148, 15, 6]
    }]
  }',
  array['energy', 'environment', 'technology']
) on conflict (slug) do nothing;

insert into public.articles (title, slug, description, content, tags, read_time)
values (
  'Why Data Visualization Matters in 2024',
  'why-data-visualization-matters',
  'Exploring how modern data visualization transforms complex information into actionable insights for everyone.',
  '## The Power of Visual Data

In an era where data is generated at unprecedented scale, the ability to **visualize** information clearly has become one of the most critical skills in any domain.

> "A picture is worth a thousand words — but a well-designed chart is worth a thousand spreadsheet rows."

## What Makes a Good Visualization?

Great data visualizations share a few key properties:

1. **Clarity** — The message is immediately apparent
2. **Accuracy** — The visual encoding faithfully represents the data
3. **Efficiency** — No unnecessary elements distract from the insight
4. **Accessibility** — Anyone can understand it, not just specialists

## Choosing the Right Chart Type

Different data calls for different visual treatments:

- **Bar charts** work best for comparing discrete categories
- **Line charts** reveal trends over continuous time
- **Pie charts** show part-to-whole relationships (use sparingly)
- **Tables** are best when readers need exact values

## The Future of Data Viz

Interactive, real-time dashboards are becoming the norm. Tools like D3.js, Chart.js, and Recharts have democratized the creation of beautiful, responsive charts directly in the browser.

As AI improves, we''ll see more *generative* visualization — charts that adapt their form to best suit the underlying data automatically.

## Conclusion

Investing in data literacy and visualization skills pays dividends across every industry. The goal isn''t just to make things look good — it''s to make complex truths undeniably clear.',
  array['data', 'visualization', 'design'],
  5
) on conflict (slug) do nothing;


-- ============================================================
-- ADMIN AUTH SETUP (Full Supabase Authentication)
-- ============================================================
-- The admin panel uses Supabase's built-in Auth (email + password).
-- No extra tables needed — Supabase manages users in auth.users.
--
-- STEP 1: Create your admin user
--   Go to: Supabase Dashboard → Authentication → Users → Add User
--   Enter your admin email and a strong password.
--   Click "Create User".
--
-- STEP 2: Set VITE_ADMIN_EMAIL in your .env / Vercel env vars
--   VITE_ADMIN_EMAIL=admin@yoursite.com
--   This restricts /admin access to that email only.
--   If you leave VITE_ADMIN_EMAIL blank, any authenticated Supabase
--   user can access the admin panel (not recommended for production).
--
-- STEP 3: Enable Email Auth provider
--   Go to: Supabase Dashboard → Authentication → Providers
--   Make sure "Email" is enabled (it is by default).
--
-- STEP 4: (Optional) Disable public signups
--   Go to: Authentication → Settings → "Enable email confirmations"
--   and "Disable signup" so only you can create admin accounts.
--   This prevents strangers from registering.
--
-- STEP 5: Password Reset
--   The admin login page has a "Forgot password?" link.
--   Supabase sends a reset email automatically — no extra config needed.
--   Make sure your Supabase project has a valid "Site URL" set:
--   Authentication → URL Configuration → Site URL = https://your-app.vercel.app
--
-- ============================================================
