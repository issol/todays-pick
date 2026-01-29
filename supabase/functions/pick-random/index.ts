import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase-client.ts';
import { searchRestaurants } from '../_shared/naver-api.ts';
import { scoreRestaurants, weightedRandomPick } from '../_shared/curation.ts';
import type { PickResult } from '../_shared/types.ts';

interface PickRequestBody {
  lat: number;
  lng: number;
  radius: number;
  categories: string[];
  excludeIds?: string[];
  userId?: string;
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
    const body: PickRequestBody = await req.json();
    const { lat, lng, radius, categories, excludeIds = [], userId } = body;

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

    // Search for restaurants (same logic as search-restaurants)
    const allRestaurants = [];
    const seenIds = new Set<string>();

    for (const category of categories) {
      const query = categoryQueries[category];
      if (!query) continue;

      try {
        const results = await searchRestaurants(query, lat, lng, radius);

        for (const restaurant of results) {
          if (!seenIds.has(restaurant.id)) {
            seenIds.add(restaurant.id);
            allRestaurants.push(restaurant);
          }
        }
      } catch (error) {
        console.error(`Error searching category ${category}:`, error);
      }
    }

    // Filter out excluded IDs
    const filteredRestaurants = allRestaurants.filter(
      r => !excludeIds.includes(r.id)
    );

    if (filteredRestaurants.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'No restaurants found',
          message: 'Try expanding your search radius or selecting different categories',
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Calculate curation scores
    const scoredRestaurants = scoreRestaurants(filteredRestaurants);

    // Perform weighted random selection
    const pickResult = weightedRandomPick(scoredRestaurants, excludeIds);

    if (!pickResult) {
      return new Response(
        JSON.stringify({
          error: 'Could not pick a restaurant',
          message: 'All restaurants have been excluded',
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const timestamp = new Date().toISOString();
    const result: PickResult = {
      picked: pickResult.picked,
      alternatives: pickResult.alternatives,
      timestamp,
    };

    // Save to picks_history if userId provided
    if (userId) {
      try {
        const supabase = getSupabaseClient();

        await supabase
          .from('picks_history')
          .insert({
            user_id: userId,
            restaurant_id: pickResult.picked.id,
            restaurant_name: pickResult.picked.name,
            restaurant_data: pickResult.picked,
            location: `POINT(${lng} ${lat})`,
            search_radius: radius,
            categories: categories,
            curation_score: pickResult.picked.curationScore,
          });
      } catch (error) {
        // Log error but don't fail the request
        console.error('Error saving to picks_history:', error);
      }
    }

    // Return result
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in pick-random:', error);

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
