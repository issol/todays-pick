# Supabase Edge Functions

This directory contains Deno-based Edge Functions for the "오늘의 픽 (Today's Pick)" project.

## Functions

### 1. search-restaurants
Search for restaurants based on location, radius, and categories.

**Endpoint:** `POST /search-restaurants`

**Request Body:**
```json
{
  "lat": 37.5665,
  "lng": 126.9780,
  "radius": 1000,
  "categories": ["korean", "japanese", "chinese"],
  "excludeIds": ["12345", "67890"]
}
```

**Response:**
```json
{
  "restaurants": [
    {
      "id": "12345",
      "name": "Restaurant Name",
      "category": "한식",
      "address": "서울특별시...",
      "roadAddress": "서울특별시...",
      "phone": "02-1234-5678",
      "latitude": 37.5665,
      "longitude": 126.9780,
      "distance": 523.45,
      "rating": 4.5,
      "reviewCount": 120,
      "blogReviewCount": 45,
      "naverPlaceUrl": "https://...",
      "curationScore": 78
    }
  ],
  "total": 25,
  "categories": ["korean", "japanese", "chinese"],
  "radius": 1000,
  "location": { "lat": 37.5665, "lng": 126.9780 }
}
```

### 2. pick-random
Pick a random restaurant using weighted selection based on curation scores.

**Endpoint:** `POST /pick-random`

**Request Body:**
```json
{
  "lat": 37.5665,
  "lng": 126.9780,
  "radius": 1000,
  "categories": ["korean", "japanese"],
  "excludeIds": ["12345"],
  "userId": "user-uuid"
}
```

**Response:**
```json
{
  "picked": {
    "id": "67890",
    "name": "Picked Restaurant",
    "curationScore": 85,
    ...
  },
  "alternatives": [
    { "id": "11111", "name": "Alternative 1", ... },
    { "id": "22222", "name": "Alternative 2", ... },
    { "id": "33333", "name": "Alternative 3", ... }
  ],
  "timestamp": "2024-01-29T12:00:00.000Z"
}
```

### 3. restaurant-detail
Get detailed information about a specific restaurant.

**Endpoint:** `GET /restaurant-detail?id=12345`

**Response:**
```json
{
  "id": "12345",
  "name": "Restaurant Name",
  "category": "한식",
  "phone": "02-1234-5678",
  "address": "서울특별시...",
  "roadAddress": "서울특별시...",
  "latitude": 37.5665,
  "longitude": 126.9780,
  "imageUrl": "https://...",
  "rating": 4.5,
  "reviewCount": 120,
  "blogReviewCount": 45,
  "menuInfo": "...",
  "businessHours": "...",
  "naverPlaceUrl": "https://..."
}
```

## Shared Utilities

### _shared/cors.ts
CORS headers configuration.

### _shared/supabase-client.ts
Supabase client initialization using service role key.

### _shared/naver-api.ts
Naver Search Local API wrapper with:
- `searchRestaurants()` - Search for restaurants
- `convertNaverCoords()` - Convert katec to WGS84
- `stripHtmlTags()` - Clean HTML from results
- `calculateDistance()` - Haversine distance calculation
- `parseNaverSearchItem()` - Parse API response to Restaurant type

### _shared/curation.ts
Curation scoring and weighted random selection:
- `calculateCurationScore()` - Score restaurants (0-100)
- `scoreRestaurants()` - Apply scores to array
- `weightedRandomPick()` - Weighted random selection

### _shared/types.ts
TypeScript type definitions for all functions.

## Environment Variables

Required environment variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for server-side operations
- `NAVER_CLIENT_ID` - Naver API client ID
- `NAVER_CLIENT_SECRET` - Naver API client secret

## Development

### Local Testing
```bash
supabase functions serve search-restaurants --env-file .env.local
supabase functions serve pick-random --env-file .env.local
supabase functions serve restaurant-detail --env-file .env.local
```

### Deploy
```bash
supabase functions deploy search-restaurants
supabase functions deploy pick-random
supabase functions deploy restaurant-detail
```

## Category Mapping

| Category Key | Korean Query |
|--------------|--------------|
| korean       | 한식         |
| chinese      | 중식         |
| japanese     | 일식         |
| western      | 양식         |
| asian        | 아시안       |
| cafe         | 카페         |
| dessert      | 디저트       |
| bar          | 술집         |

## Curation Score Algorithm

Score ranges 0-100, composed of:
- **Rating score (0-40)**: `Math.min((rating - 3.5) * 20, 40)`
- **Review trust score (0-30)**: `Math.min(Math.log10(reviewCount + 1) * 10, 30)`
- **Blog review bonus (0-20)**: `Math.min(Math.log10(blogReviewCount + 1) * 8, 20)`
- **Freshness score (0-10)**: Based on total review activity

## Notes

- All functions handle CORS preflight (OPTIONS) requests
- Coordinates are in WGS84 format (latitude, longitude)
- Distances are calculated using Haversine formula in meters
- Radius options: 500m, 1000m, 2000m
- Search results are automatically deduplicated by restaurant ID
- `pick-random` saves to `picks_history` table when `userId` is provided
- `restaurant-detail` currently returns placeholder data (needs Naver Place API implementation)
