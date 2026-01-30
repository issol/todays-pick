import { corsHeaders } from '../_shared/cors.ts';
import { searchWithCache } from '../_shared/search-logic.ts';
import { scoreRestaurants } from '../_shared/curation.ts';

interface SearchRequestBody {
  lat: number;
  lng: number;
  radius: number;
  categories: string[];
  excludeIds?: string[];
  areaName?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: SearchRequestBody = await req.json();
    const { lat, lng, radius, categories, excludeIds = [], areaName } = body;

    // Validate input
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Invalid coordinates: lat and lng must be numbers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (![500, 1000, 2000].includes(radius)) {
      return new Response(
        JSON.stringify({ error: 'Invalid radius: must be 500, 1000, or 2000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid categories: must be non-empty array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search with cache layer (pagination + DB caching)
    const allRestaurants = await searchWithCache({
      lat,
      lng,
      radius,
      categories,
      excludeIds,
      areaName,
    });

    // Calculate curation scores
    const scoredRestaurants = scoreRestaurants(allRestaurants);

    // Sort by curation score (highest first)
    scoredRestaurants.sort((a, b) => b.curationScore - a.curationScore);

    // Return results
    return new Response(
      JSON.stringify({
        restaurants: scoredRestaurants,
        total: scoredRestaurants.length,
        categories: categories,
        radius,
        location: { lat, lng },
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in search-restaurants:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
