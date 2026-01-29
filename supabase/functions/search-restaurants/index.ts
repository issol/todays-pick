import { corsHeaders } from '../_shared/cors.ts';
import { searchRestaurants } from '../_shared/naver-api.ts';
import { scoreRestaurants } from '../_shared/curation.ts';
import type { Restaurant } from '../_shared/types.ts';

interface SearchRequestBody {
  lat: number;
  lng: number;
  radius: number;
  categories: string[];
  excludeIds?: string[];
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
    const { lat, lng, radius, categories, excludeIds = [] } = body;

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

    // Map of category labels to search queries
    const categoryQueries: Record<string, string> = {
      korean: '한식',
      chinese: '중식',
      japanese: '일식',
      western: '양식',
      snacks: '분식',
      cafe: '카페 디저트',
      fastfood: '패스트푸드',
      latenight: '야식',
    };

    // Search for each category and merge results
    const allRestaurants: Omit<Restaurant, 'curationScore'>[] = [];
    const seenIds = new Set<string>();

    for (const category of categories) {
      const query = categoryQueries[category];
      if (!query) {
        console.warn(`Unknown category: ${category}`);
        continue;
      }

      try {
        const results = await searchRestaurants(query, lat, lng, radius);

        // Deduplicate by ID
        for (const restaurant of results) {
          if (!seenIds.has(restaurant.id)) {
            seenIds.add(restaurant.id);
            allRestaurants.push(restaurant);
          }
        }
      } catch (error) {
        console.error(`Error searching category ${category}:`, error);
        // Continue with other categories even if one fails
      }
    }

    // Filter out excluded IDs
    const filteredRestaurants = allRestaurants.filter(
      r => !excludeIds.includes(r.id)
    );

    // Calculate curation scores
    const scoredRestaurants = scoreRestaurants(filteredRestaurants);

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
