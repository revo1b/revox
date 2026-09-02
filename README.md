# Revox — Business Operating System

A premium, personal business operating system: CRM + AI Brain + Email + Tasks +
Calendar + Insights — built with **Next.js 15 (App Router) + TypeScript +
Tailwind CSS + Supabase (PostgreSQL + Auth + Storage)**, ready to deploy on
**Vercel** straight from **GitHub**.

This is the native-stack rebuild of the original PHP/MySQL version, chosen
specifically because it's the true fit for GitHub + Vercel + Supabase hosting.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **Supabase**: PostgreSQL database, Auth (email/password), Storage (knowledge-base file uploads)
- **Tailwind CSS** — the same natural/premium design system as the original spec
- **TypeScript** throughout, strict mode

---

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**. Pick a name, region, and database password (save it).
2. Once it's provisioned, open **SQL Editor** and run, in order:
   1. `supabase/schema.sql` — creates all tables + Row Level Security policies
   2. `supabase/seed.sql` — optional sample data so the app isn't empty on first run
   3. `supabase/storage.sql` — creates the `knowledge` storage bucket for file uploads (or create it manually via **Storage → New bucket**, name it `knowledge`, private)
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never exposed to the browser)
4. Create your login user: **Authentication → Users → Add user** (email + password). Revox is a personal/single-tenant tool (per the original spec — no multi-tenancy), so every authenticated user on this Supabase project has full access to the data, by design. Invite teammates the same way if needed.

## 2. Run it locally

```bash
npm install
cp .env.example .env.local   
npm run dev
```

Visit `http://localhost:3000` — you'll be redirected to `/login`. Sign in with the user you created in Supabase.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Revox — initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/revox.git
git push -u origin main
```

## 4. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import your GitHub repo.
2. Vercel auto-detects Next.js — no build configuration needed.
3. Add environment variables (**Settings → Environment Variables**), same as your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY` (optional — see below)
   - `APP_CURRENCY` (optional, defaults to `TSh`)
4. Deploy. Every push to `main` redeploys automatically.

That's it — GitHub for source control, Vercel for hosting, Supabase for the database, auth, and file storage.

---

## Enabling the live AI Brain (optional)

The AI Brain works fully out of the box using a built-in local
business-intelligence engine (`src/lib/ai/localEngine.ts`) that answers
questions like "What needs my attention today?" or "Who am I waiting for?"
directly from your CRM data — no external API key required, and it never
invents information it doesn't have.

To upgrade to live, natural-language AI responses powered by Claude, add an
`ANTHROPIC_API_KEY` environment variable (both locally in `.env.local` and in
Vercel's project settings). When present, `src/app/api/ai/chat/route.ts`
automatically calls the Anthropic API with your live business data as
grounded context, and falls back to the local engine if the call fails for
any reason — so the AI Brain is never down.

---

## Project structure

```
revox-next/
  supabase/
    schema.sql          Database schema + Row Level Security
    seed.sql             Sample data (safe to skip)
    storage.sql           Knowledge-base storage bucket + policies

  src/
    middleware.ts          Route protection — redirects unauthenticated users to /login
    app/
      layout.tsx            Root HTML layout
      globals.css             Design system (Tailwind + custom component classes)
      login/page.tsx           Login page
      (app)/                  Authenticated route group (wrapped in AppShell)
        layout.tsx               Fetches current user, renders sidebar/topbar
        page.tsx                  Command Center (dashboard) — route "/"
        contacts/ , companies/ , leads/ , opportunities/ , customers/
        email/                    inbox, [id] thread view, waiting, compose
        ai/                        AI Brain chat page
        tasks/ , calendar/ , insights/ , settings/ , notifications/ , search/
      api/ai/chat/route.ts       AI Brain backend (local engine or live Claude API)

    components/               Sidebar, Topbar, AppShell, modals, forms, chat UI
    lib/
      supabase/                Browser client, server client, middleware helper
      actions/                  Server Actions — all CRUD (contacts, companies,
                                 opportunities, tasks, notes, events, email, settings, auth)
      ai/localEngine.ts          Grounded, no-API-key-required business intelligence engine
      types.ts / utils.ts        Shared types and formatting helpers
```

## Design notes

- **Color palette:** warm neutral background, white surfaces, deep charcoal
  text, a navy/teal brand pair, and muted green/amber/red status colors —
  no bright colors, heavy shadows, or glassmorphism.
- **Mobile:** the sidebar collapses behind a hamburger menu with an overlay,
  and a bottom tab bar (Home, Pipeline, Email, AI Brain, Tasks) appears on
  small screens.
- **Safety:** Revox never sends an email automatically — every send goes
  through an explicit "Review & Send" step (`src/lib/actions/email.ts`), and
  actions are recorded to `audit_logs`.
- **Security:** Every table has Row Level Security enabled — only
  authenticated Supabase users can read or write data. Route middleware
  additionally protects every page and API route server-side.

## What's intentionally out of scope for this build

Per the original product brief, this deliberately does **not** include
multi-tenancy, billing, a public API, WhatsApp/SMS/voice, or workflow
automation. Two things worth knowing before relying on this in production:

- **Email is a CRM-linked inbox, not a live mail sync.** Sending/receiving
  through a real mail provider (an API like Postmark, SendGrid, or Resend)
  isn't wired up — `src/lib/actions/email.ts` writes to the database so the
  UI and CRM linkage work end-to-end, but plugging in a real provider is a
  natural next step.
- **The AI Brain's local engine is intentionally rule-based**, not a
  general-purpose LLM, so it runs with zero configuration. Add your
  Anthropic API key any time for open-ended, natural-language answers.

## Testing performed

- `npx tsc --noEmit` passes with zero TypeScript errors across the entire codebase.
- `npm run build` (production build) compiles and generates all 23 routes successfully.
- The schema and seed SQL were validated against a live PostgreSQL instance
  (all tables, foreign keys, and sample data load without error).
- The production server was booted and verified end-to-end: the login page
  renders, unauthenticated requests to every protected page and to the AI
  chat API correctly redirect or return a 401 as appropriate, matching the
  intended auth behavior.
