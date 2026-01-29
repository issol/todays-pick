-- Blacklist table
CREATE TABLE blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id VARCHAR(50) NOT NULL,
  restaurant_name VARCHAR(200) NOT NULL,
  reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- Index for user's blacklist
CREATE INDEX idx_blacklist_user ON blacklist(user_id);

-- Enable RLS
ALTER TABLE blacklist ENABLE ROW LEVEL SECURITY;

-- Users can access their own blacklist
CREATE POLICY "Users can access own blacklist" ON blacklist
  FOR ALL USING (auth.uid() = user_id);
