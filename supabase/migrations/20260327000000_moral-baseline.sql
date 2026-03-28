-- Phase 7: Moral Profile Data Layer
-- Adds moral baseline columns to players table
-- Non-destructive: existing rows get NULL defaults
-- Run in Supabase SQL Editor before deploying Phase 7 code

ALTER TABLE players
  ADD COLUMN IF NOT EXISTS moral_values jsonb DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS moral_stances jsonb DEFAULT NULL;

-- Verify columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'players'
  AND column_name IN ('moral_values', 'moral_stances');
