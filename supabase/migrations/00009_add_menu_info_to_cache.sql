-- Add menu_info column to cached_restaurants for storing scraped menu/price data
ALTER TABLE cached_restaurants
  ADD COLUMN IF NOT EXISTS menu_info TEXT;
