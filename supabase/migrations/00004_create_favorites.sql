-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id VARCHAR(50) NOT NULL,
  restaurant_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

-- Index for user's favorites
CREATE INDEX idx_favorites_user ON favorites(user_id);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can access their own favorites
CREATE POLICY "Users can access own favorites" ON favorites
  FOR ALL USING (auth.uid() = user_id);
