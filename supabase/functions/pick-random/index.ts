import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase-client.ts';
import { searchWithCache } from '../_shared/search-logic.ts';
import { scoreRestaurants, weightedRandomPick } from '../_shared/curation.ts';
import type { PickResult } from '../_shared/types.ts';

interface PickRequestBody {
  lat: number;
  lng: number;
  radius: number;
  categories: string[];
  excludeIds?: string[];
  userId?: string;
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
    const body: PickRequestBody = await req.json();
    const { lat, lng, radius, categories, excludeIds = [], userId, areaName } = body;

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

    // Search with cache layer (no duplicate logic)
    const allRestaurants = await searchWithCache({
      lat,
      lng,
      radius,
      categories,
      excludeIds,
      areaName,
    });

    if (allRestaurants.length === 0) {
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
    const scoredRestaurants = scoreRestaurants(allRestaurants);

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
