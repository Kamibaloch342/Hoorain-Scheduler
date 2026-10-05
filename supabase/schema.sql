-- =========================================================================
-- Hoorain-Scheduler: Supabase Database Schema & Row Level Security (RLS)
-- Supports 6 Platforms, 25+ Destinations, Recurring Rules, and Task Tracking
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Enums
DO $$ BEGIN
  CREATE TYPE platform_type AS ENUM (
    'facebook', 
    'whatsapp', 
    'x', 
    'linkedin', 
    'pinterest', 
    'meta_business_suite'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status_type AS ENUM (
    'scheduled', 
    'completed', 
    'missed', 
    'draft'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE destination_category_type AS ENUM (
    'page', 
    'group', 
    'profile', 
    'channel', 
    'broadcast',
    'board', 
    'suite_planner'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Destinations Table (Stores 25+ target destinations)
CREATE TABLE IF NOT EXISTS public.destinations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id platform_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  category destination_category_type NOT NULL DEFAULT 'page',
  target_url TEXT NOT NULL,
  handle_or_group VARCHAR(255),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  default_post_count_target INT DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Recurring Rules Table
CREATE TABLE IF NOT EXISTS public.recurring_rules (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE,
  frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
  days_of_week INT[] NOT NULL,
  time_slots TEXT[] NOT NULL,
  posts_per_slot INT DEFAULT 1,
  content_template TEXT,
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tasks Table (Core Scheduled Content)
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id TEXT REFERENCES public.destinations(id) ON DELETE CASCADE,
  platform_id platform_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  scheduled_at TIMESTAMPTZ NOT NULL,
  status task_status_type DEFAULT 'scheduled',
  completed_at TIMESTAMPTZ,
  recurring_rule_id TEXT REFERENCES public.recurring_rules(id) ON DELETE SET NULL,
  post_target INT DEFAULT 1,
  post_completed_count INT DEFAULT 0,
  tags TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_scheduled ON public.tasks(user_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_destination ON public.tasks(destination_id);
CREATE INDEX IF NOT EXISTS idx_tasks_platform ON public.tasks(platform_id);
CREATE INDEX IF NOT EXISTS idx_destinations_platform ON public.destinations(platform_id);
CREATE INDEX IF NOT EXISTS idx_destinations_user ON public.destinations(user_id);

-- 6. Updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_destinations_updated_at ON public.destinations;
CREATE TRIGGER set_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_recurring_rules_updated_at ON public.recurring_rules;
CREATE TRIGGER set_recurring_rules_updated_at
  BEFORE UPDATE ON public.recurring_rules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Row Level Security (RLS)
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their own records
CREATE POLICY "Users can manage own destinations"
  ON public.destinations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own recurring rules"
  ON public.recurring_rules FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow public read/write if using anon key in single-user offline-first sync mode (optional fallback)
CREATE POLICY "Anon sync fallback for destinations"
  ON public.destinations FOR ALL
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anon sync fallback for recurring rules"
  ON public.recurring_rules FOR ALL
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anon sync fallback for tasks"
  ON public.tasks FOR ALL
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);
