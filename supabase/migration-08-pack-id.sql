-- Phase 8: Multi-Pack System
-- Adds pack_id column to sessions table
-- Non-destructive: existing rows get NULL (getPackById fallback handles this)
-- Run in Supabase SQL Editor before deploying Phase 8 code

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS pack_id text DEFAULT 'kingdom-arc';

-- Verify column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'sessions'
  AND column_name = 'pack_id';
