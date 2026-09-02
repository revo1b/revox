-- ============================================================
-- REVOX — Business Operating System
-- Supabase / PostgreSQL schema
-- Run this in the Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- BUSINESS PROFILE ----------
create table business_profile (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  industry text,
  description text,
  services text,
  currency text default 'TSh',
  updated_at timestamptz default now()
);

-- ---------- COMPANIES ----------
create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  industry text,
  website text,
  phone text,
  address text,
  relationship_health text default 'neutral' check (relationship_health in ('healthy','neutral','at_risk')),
  ai_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- CONTACTS ----------
create table contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete set null,
  name text not null,
  position text,
  email text,
  phone text,
  status text default 'lead' check (status in ('lead','prospect','customer','inactive')),
  ai_score int default 50,
  tags text,
  ai_summary text,
  last_activity_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- OPPORTUNITIES ----------
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  value numeric(14,2) default 0,
  stage text default 'new' check (stage in ('new','contacted','qualified','proposal','negotiation','won','lost')),
  probability int default 20,
  expected_close date,
  next_best_action text,
  next_best_action_reason text,
  ai_summary text,
  last_activity_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- EMAIL THREADS / EMAILS ----------
create table email_threads (
  id uuid primary key default gen_random_uuid(),
  subject text,
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  folder text default 'inbox' check (folder in ('inbox','sent','archive','waiting')),
  is_unread boolean default true,
  is_important boolean default false,
  ai_intent text,
  ai_priority text default 'medium' check (ai_priority in ('low','medium','high')),
  ai_sentiment text,
  ai_recommended_action text,
  waiting_since timestamptz,
  last_message_at timestamptz default now(),
  created_at timestamptz default now()
);

create table emails (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references email_threads(id) on delete cascade,
  direction text default 'inbound' check (direction in ('inbound','outbound')),
  sender_name text,
  sender_email text,
  body text,
  is_draft boolean default false,
  sent_at timestamptz default now()
);

-- ---------- ACTIVITIES (unified timeline) ----------
create table activities (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  type text not null,
  description text not null,
  occurred_at timestamptz default now()
);

-- ---------- TASKS ----------
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  due_date date,
  priority text default 'medium' check (priority in ('low','medium','high')),
  status text default 'open' check (status in ('open','completed')),
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  created_at timestamptz default now()
);

-- ---------- CALENDAR ----------
create table appointments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  ai_preparation text,
  created_at timestamptz default now()
);

-- ---------- NOTES ----------
create table notes (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  company_id uuid references companies(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  body text not null,
  created_at timestamptz default now()
);

-- ---------- AI ----------
create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  title text default 'New conversation',
  created_at timestamptz default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz default now()
);

-- ---------- KNOWLEDGE BASE ----------
create table knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text default 'document' check (type in ('profile','product','pricing','sales','policy','document')),
  file_path text,
  content text,
  created_at timestamptz default now()
);

-- ---------- NOTIFICATIONS ----------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  message text not null,
  link text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ---------- AUDIT LOG ----------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  details text,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- Revox is a single-tenant "personal" business OS (see product spec
-- section 2 — no multi-tenancy). Every table is readable/writable by
-- any authenticated Supabase user on this project. If you invite
-- teammates later via Supabase Auth, they'll share full access, which
-- matches "my business, not a SaaS" from the original spec.
-- ============================================================

do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'business_profile','companies','contacts','opportunities',
      'email_threads','emails','activities','tasks','appointments',
      'notes','ai_conversations','ai_messages','knowledge_sources',
      'notifications','audit_logs'
    ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy "Authenticated full access" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');',
      t
    );
  end loop;
end $$;

-- Helpful indexes
create index on contacts (company_id);
create index on contacts (status);
create index on opportunities (company_id);
create index on opportunities (contact_id);
create index on opportunities (stage);
create index on email_threads (contact_id);
create index on email_threads (company_id);
create index on email_threads (folder);
create index on emails (thread_id);
create index on activities (contact_id);
create index on activities (company_id);
create index on tasks (status);
create index on tasks (due_date);
