-- Signal Lost v2.0 schema additions
-- Adds break_flags tracking to sessions and senator profile assignment to players

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS break_flags jsonb DEFAULT '{}';
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS mode text DEFAULT 'standard';
ALTER TABLE players ADD COLUMN IF NOT EXISTS senator_profile_id text;
