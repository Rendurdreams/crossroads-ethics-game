-- ============================================================
-- The Crossroads: Complete Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- 1. TABLES
-- ============================================================

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code text UNIQUE NOT NULL,
  status text DEFAULT 'lobby',
  current_round int DEFAULT 0,
  total_rounds int DEFAULT 4,
  world_state jsonb DEFAULT '{"trust":50,"courage":50,"solidarity":50,"awareness":50}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar text,
  framework_counts jsonb DEFAULT '{"consequentialism":0,"deontology":0,"care":0,"virtue":0}',
  choice_history jsonb DEFAULT '[]',
  dominant_framework text,
  conflicts jsonb DEFAULT '[]',
  joined_at timestamptz DEFAULT now()
);

CREATE TABLE choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  round_number int NOT NULL,
  scenario_id text NOT NULL,
  choice_index int NOT NULL,
  frameworks text[] NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(player_id, round_number)
);

CREATE TABLE reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  round_number int NOT NULL,
  text text NOT NULL,
  submitted_at timestamptz DEFAULT now()
);

-- 2. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;

-- Sessions: anyone can read, anyone can insert (host creates), anyone can update (host advances rounds)
CREATE POLICY "sessions_read" ON sessions FOR SELECT USING (true);
CREATE POLICY "sessions_insert" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "sessions_update" ON sessions FOR UPDATE USING (true);

-- Players: anyone can read (roster), anyone can insert (join), anyone can update (framework_counts at end)
CREATE POLICY "players_read" ON players FOR SELECT USING (true);
CREATE POLICY "players_insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_update" ON players FOR UPDATE USING (true);

-- Choices: anyone can read (host tallies), anyone can insert (player submits)
CREATE POLICY "choices_read" ON choices FOR SELECT USING (true);
CREATE POLICY "choices_insert" ON choices FOR INSERT WITH CHECK (true);

-- Reflections: anyone can read (host end view), anyone can insert (player submits)
CREATE POLICY "reflections_read" ON reflections FOR SELECT USING (true);
CREATE POLICY "reflections_insert" ON reflections FOR INSERT WITH CHECK (true);

-- 3. REAL-TIME REPLICATION
-- ============================================================
-- NOTE: After running this SQL, you MUST also enable real-time
-- replication in the Supabase Dashboard:
--   Database > Replication > Toggle ON for: sessions, players, choices
-- The reflections table does not need real-time replication.
--
-- Alternatively, these commands enable replication via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE choices;
