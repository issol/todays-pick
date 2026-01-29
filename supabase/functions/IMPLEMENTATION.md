# Edge Functions Implementation Summary

## Overview
Successfully implemented three Supabase Edge Functions in Deno TypeScript for the "오늘의 픽 (Today's Pick)" project.

## Files Created

### Shared Utilities (_shared/)
1. **cors.ts** - CORS headers configuration
2. **supabase-client.ts** - Supabase client initialization with service role
3. **types.ts** - TypeScript type definitions (Restaurant, PickResult, Naver API types)
4. **naver-api.ts** - Naver Search Local API wrapper with:
   - Restaurant search with location filtering
   - Coordinate conversion (katec → WGS84)
   - HTML tag stripping
   - Haversine distance calculation
   - Restaurant data parsing
5. **curation.ts** - Curation scoring algorithm and weighted random selection:
   - Rating score (0-40)
   - Review trust score (0-30)
   - Blog review bonus (0-20)
   - Freshness score (0-10)
   - Weighted random pick with alternatives

### Edge Functions
1. **search-restaurants/index.ts**
   - POST endpoint for restaurant search
   - Multi-category search with deduplication
   - Radius filtering (500m, 1000m, 2000m)
   - Curation score calculation
   - Results sorted by score

2. **pick-random/index.ts**
   - POST endpoint for weighted random selection
   - Searches restaurants using same logic as search-restaurants
   - Applies weighted random algorithm based on curation scores
   - Returns 1 picked + up to 3 alternatives
   - Optionally saves to picks_history table

3. **restaurant-detail/index.ts**
   - GET endpoint for detailed restaurant info
   - Currently returns placeholder (needs Naver Place API)
   - Includes cache headers (1 hour)

### Documentation
- **README.md** - Complete API documentation with examples
- **IMPLEMENTATION.md** - This file

## Technical Details

### Deno-Specific Features Used
- ✅ `Deno.serve()` for HTTP handlers
- ✅ `Deno.env.get()` for environment variables
- ✅ ESM imports from esm.sh (`@supabase/supabase-js@2`)
- ✅ Web standard APIs (fetch, Response, Request, URL, Headers)
- ✅ No Node.js-specific imports
- ✅ TypeScript with .ts extensions

### CORS Handling
All functions handle:
- OPTIONS preflight requests
- CORS headers in all responses

### Error Handling
- Input validation with meaningful error messages
- Try-catch blocks with proper error responses
- Graceful degradation (continues if one category search fails)
- Logging for debugging

### Algorithm Accuracy
The curation scoring algorithm exactly matches the PRD specification:
- Rating baseline at 3.5 stars
- Logarithmic scaling for review counts
- Freshness heuristic based on activity level
- Total score range: 0-100

### Category Mapping
Supports 8 categories with Korean search queries:
- korean (한식), chinese (중식), japanese (일식)
- western (양식), asian (아시안)
- cafe (카페), dessert (디저트), bar (술집)

## Environment Variables Required

```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NAVER_CLIENT_ID=xxx
NAVER_CLIENT_SECRET=xxx
```

## API Endpoints

### 1. Search Restaurants
```
POST /search-restaurants
Body: { lat, lng, radius, categories, excludeIds? }
Returns: { restaurants[], total, categories, radius, location }
```

### 2. Pick Random
```
POST /pick-random
Body: { lat, lng, radius, categories, excludeIds?, userId? }
Returns: { picked, alternatives[], timestamp }
```

### 3. Restaurant Detail
```
GET /restaurant-detail?id=12345
Returns: { id, name, category, ..., _note }
```

## Testing Recommendations

1. **Local Testing:**
   ```bash
   supabase functions serve search-restaurants --env-file .env.local
   ```

2. **Test Cases:**
   - Valid search with multiple categories
   - Invalid coordinates (should return 400)
   - Invalid radius (should return 400)
   - Empty categories (should return 400)
   - No restaurants found (should return 404 for pick-random)
   - CORS preflight (OPTIONS request)

3. **Integration Testing:**
   - Verify Naver API rate limits
   - Test with real coordinates in Seoul
   - Verify database insert for picks_history
   - Test weighted random distribution

## Known Limitations

1. **restaurant-detail function** returns placeholder data
   - Naver Place Detail API requires additional implementation
   - May need web scraping or undocumented API endpoints
   - Should implement with proper rate limiting

2. **Rating/Review Data** from Search API is limited
   - Search API returns basic info only
   - Real ratings require Place API enrichment
   - Currently using default values (0) for rating/reviews

3. **Distance Filtering** happens after API call
   - Naver API doesn't support radius parameter
   - Filtering is done client-side after fetching results
   - May return fewer results than expected

## Next Steps

1. Implement actual Naver Place Detail API integration
2. Add rate limiting and caching layer
3. Enrich search results with Place API data
4. Add comprehensive error logging
5. Implement retry logic for API failures
6. Add monitoring and analytics

## Deployment

Deploy all functions:
```bash
supabase functions deploy search-restaurants
supabase functions deploy pick-random
supabase functions deploy restaurant-detail
```

Set secrets:
```bash
supabase secrets set NAVER_CLIENT_ID=xxx
supabase secrets set NAVER_CLIENT_SECRET=xxx
```
