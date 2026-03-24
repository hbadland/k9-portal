# Battersea K9 — Client Portal

Owner-facing web portal. Built with Vite + React + Tailwind CSS. Data layer uses Supabase.

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the Supabase SQL editor to create all tables and RLS policies
3. Copy your project URL and anon key into `.env`:

```bash
cd portal
cp .env.example .env
# Edit .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

4. Install dependencies and start the dev server:

```bash
npm install
npm run dev   # runs on http://localhost:5174
```

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL (e.g. `https://abcdef.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

## Netlify deploy

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- The `netlify.toml` at the repo root of this directory handles both of the above and the SPA redirect rule.

### Environment variables on Netlify

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Site settings → Environment variables**.

## Project structure

```
portal/
  supabase/
    schema.sql            Full DB schema with RLS policies — run in Supabase SQL editor
  src/
    lib/supabase.js       Supabase client singleton
    components/
      Layout.jsx          Sidebar (desktop) + bottom nav (mobile) + header
      ProtectedRoute.jsx  Checks Supabase session; redirects to /login if none
    pages/
      LoginPage.jsx
      DashboardPage.jsx   Next booking, dogs grid, recent messages
      DogsPage.jsx
      DogDetailPage.jsx
      BookingsPage.jsx    Upcoming / Past split
      BookingDetailPage.jsx
      MessagesPage.jsx    Collapsible per-booking message threads
      AccountPage.jsx
```
