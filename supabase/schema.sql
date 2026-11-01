-- =============================================================================
-- DIGITAL DARK SPOT - SUPABASE DATABASE INITIALIZATION SCHEMA
-- =============================================================================
-- Run this script in the Supabase SQL Editor:
-- 1. Go to your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New query", paste this file's contents, and click "Run"
-- =============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. USERS TABLE
-- Stores local credentials, Google Identity profiles, and user roles
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT,
  avatar TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  auth_provider TEXT NOT NULL DEFAULT 'local',
  google_id TEXT UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users (google_id);

-- =============================================================================
-- 2. RESEARCH SESSIONS TABLE
-- Stores research questions, objectives, extracted sources, AI analysis,
-- and verification checklists with full JSONB support
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.research_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  objective TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  analysis JSONB,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  analyzed_at TIMESTAMPTZ
);

-- Indexes for research sessions
CREATE INDEX IF NOT EXISTS idx_research_sessions_created_at ON public.research_sessions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_research_sessions_user_id ON public.research_sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_research_sessions_status ON public.research_sessions (status);

-- =============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sessions ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (used by Digital Dark Spot API backend with SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY)
DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
CREATE POLICY "Service role full access on users"
  ON public.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on research_sessions" ON public.research_sessions;
CREATE POLICY "Service role full access on research_sessions"
  ON public.research_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow public read/write access if connecting with anon key
DROP POLICY IF EXISTS "Anon access on research_sessions" ON public.research_sessions;
CREATE POLICY "Anon access on research_sessions"
  ON public.research_sessions
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anon access on users" ON public.users;
CREATE POLICY "Anon access on users"
  ON public.users
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- 4. SEED DEMO RESEARCHER (Optional test user)
-- =============================================================================
INSERT INTO public.users (
  id,
  email,
  name,
  role,
  auth_provider,
  email_verified,
  created_at,
  updated_at,
  last_login_at
) VALUES (
  'usr_demo_researcher_001',
  'researcher@veriscope.internal',
  'VeriScope Lead Researcher',
  'user',
  'local',
  true,
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

