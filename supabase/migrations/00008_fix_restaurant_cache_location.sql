-- Fix: auto-compute location from lat/lng via trigger
-- PostgREST can't directly insert WKT strings into GEOGRAPHY columns

-- Make location nullable (will be auto-filled by trigger)
ALTER TABLE cached_restaurants ALTER COLUMN location DROP NOT NULL;

-- Trigger to auto-set location from lat/lng on INSERT or UPDATE
CREATE OR REPLACE FUNCTION set_cached_restaurant_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cached_restaurants_set_location
  BEFORE INSERT OR UPDATE ON cached_restaurants
  FOR EACH ROW
  EXECUTE FUNCTION set_cached_restaurant_location();

-- Same fix for search_cache
ALTER TABLE search_cache ALTER COLUMN location DROP NOT NULL;

CREATE OR REPLACE FUNCTION set_search_cache_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_search_cache_set_location
  BEFORE INSERT OR UPDATE ON search_cache
  FOR EACH ROW
  EXECUTE FUNCTION set_search_cache_location();

-- Backfill any existing rows that have null location
UPDATE cached_restaurants
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE location IS NULL;

UPDATE search_cache
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE location IS NULL;
