-- Restaurant cache tables for reducing Naver API calls
-- Caches search results with PostGIS spatial indexing

-- Table: cached restaurants with enrichment data
CREATE TABLE IF NOT EXISTS cached_restaurants (
  id TEXT PRIMARY KEY,                    -- Naver place ID
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  road_address TEXT,
  phone TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  rating DOUBLE PRECISION DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  blog_review_count INTEGER DEFAULT 0,
  image_url TEXT,
  naver_place_url TEXT,
  is_enriched BOOLEAN DEFAULT FALSE,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for proximity searches
CREATE INDEX IF NOT EXISTS idx_cached_restaurants_location
  ON cached_restaurants USING GIST (location);

-- Index for cache freshness queries
CREATE INDEX IF NOT EXISTS idx_cached_restaurants_cached_at
  ON cached_restaurants (cached_at);

-- Table: tracks which area+category searches have been performed
CREATE TABLE IF NOT EXISTS search_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL,
  area_name TEXT,
  result_ids TEXT[] NOT NULL DEFAULT '{}',  -- Array of cached_restaurant IDs
  total_results INTEGER DEFAULT 0,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for finding nearby searches
CREATE INDEX IF NOT EXISTS idx_search_cache_location
  ON search_cache USING GIST (location);

-- Index for category + freshness lookups
CREATE INDEX IF NOT EXISTS idx_search_cache_category_time
  ON search_cache (category, searched_at DESC);

-- Auto-update updated_at on cached_restaurants
CREATE OR REPLACE FUNCTION update_cached_restaurant_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cached_restaurants_updated_at
  BEFORE UPDATE ON cached_restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_cached_restaurant_timestamp();

-- RPC function: find nearby search cache entries
CREATE OR REPLACE FUNCTION find_nearby_search_cache(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_category TEXT,
  p_radius_meters DOUBLE PRECISION,
  p_min_searched_at TIMESTAMPTZ
)
RETURNS TABLE (
  id UUID,
  result_ids TEXT[],
  total_results INTEGER,
  searched_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.result_ids,
    sc.total_results,
    sc.searched_at
  FROM search_cache sc
  WHERE sc.category = p_category
    AND sc.searched_at >= p_min_searched_at
    AND ST_DWithin(
      sc.location,
      ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
      p_radius_meters
    )
  ORDER BY sc.searched_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;
