-- Add AI debrief context columns for future LLM integration
ALTER TABLE players ADD COLUMN IF NOT EXISTS debrief_context jsonb DEFAULT NULL;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS group_debrief_context jsonb DEFAULT NULL;
