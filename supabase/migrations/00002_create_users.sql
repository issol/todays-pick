-- Users table (anonymous sessions via Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_location GEOGRAPHY(POINT, 4326),
  preferences JSONB DEFAULT '{
    "radius": 500,
    "quality_filter": true,
    "categories": []
  }'::jsonb
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own data
CREATE POLICY "Users can access own data" ON users
  FOR ALL USING (auth.uid() = id);
