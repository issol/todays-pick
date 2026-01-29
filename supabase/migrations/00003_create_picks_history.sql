-- Pick history table
CREATE TABLE picks_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id VARCHAR(50) NOT NULL,
  restaurant_name VARCHAR(200) NOT NULL,
  restaurant_data JSONB,
  picked_at TIMESTAMPTZ DEFAULT NOW(),
  was_accepted BOOLEAN DEFAULT false,
  retry_count INT DEFAULT 0
);

-- Index for user's pick history ordered by date
CREATE INDEX idx_picks_history_user ON picks_history(user_id, picked_at DESC);

-- Enable RLS
ALTER TABLE picks_history ENABLE ROW LEVEL SECURITY;

-- Users can access their own picks
CREATE POLICY "Users can access own picks" ON picks_history
  FOR ALL USING (auth.uid() = user_id);
