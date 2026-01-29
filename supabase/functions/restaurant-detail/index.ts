import { corsHeaders } from '../_shared/cors.ts';

interface NaverPlaceDetail {
  id: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  blogReviewCount?: number;
  menuInfo?: string;
  businessHours?: string;
  naverPlaceUrl: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow GET
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Note: Naver Place API requires scraping or undocumented endpoints
    // For now, return a placeholder response indicating enrichment is needed
    // In production, this would call the actual Naver Place Detail API
    // or use web scraping with proper rate limiting

    // Placeholder response
    const placeholderDetail: NaverPlaceDetail = {
      id,
      name: 'Restaurant Details',
      category: 'Unknown',
      phone: '',
      address: '',
      roadAddress: '',
      latitude: 0,
      longitude: 0,
      imageUrl: undefined,
      rating: undefined,
      reviewCount: undefined,
      blogReviewCount: undefined,
      menuInfo: undefined,
      businessHours: undefined,
      naverPlaceUrl: `https://pcmap.place.naver.com/restaurant/${id}/home`,
    };

    return new Response(
      JSON.stringify({
        ...placeholderDetail,
        _note: 'This is a placeholder. Implement Naver Place Detail API or web scraping to get actual data.',
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=3600', // Cache for 1 hour
        },
      }
    );

  } catch (error) {
    console.error('Error in restaurant-detail:', error);

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
