import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { restaurant, retryCount } = body;

    if (!restaurant?.id || !restaurant?.name) {
      return NextResponse.json({ error: 'Invalid restaurant data' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('picks_history')
      .insert({
        user_id: user.id,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        restaurant_data: restaurant,
        retry_count: retryCount ?? 0,
        was_accepted: false,
      } as never);

    if (insertError) {
      console.error('picks-history insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('picks-history API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
