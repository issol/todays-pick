import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ blacklist: [] });
    }

    const { data, error } = await supabase
      .from('blacklist')
      .select('id, restaurant_id, restaurant_name, reason, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('blacklist fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const blacklist = (data || []).map((item: Record<string, unknown>) => ({
      id: item.id,
      restaurantId: item.restaurant_id,
      restaurantName: item.restaurant_name,
      reason: item.reason,
      createdAt: item.created_at,
    }));

    return NextResponse.json({ blacklist });
  } catch (err) {
    console.error('blacklist GET error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { restaurant, reason } = body;

    if (!restaurant?.id || !restaurant?.name) {
      return NextResponse.json({ error: 'Invalid restaurant data' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blacklist')
      .insert({
        user_id: user.id,
        restaurant_id: restaurant.id,
        restaurant_name: restaurant.name,
        reason: reason || null,
      } as never);

    if (error) {
      console.error('blacklist insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('blacklist POST error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const restaurantId = request.nextUrl.searchParams.get('restaurantId');
    if (!restaurantId) {
      return NextResponse.json({ error: 'Missing restaurantId' }, { status: 400 });
    }

    const { error } = await supabase
      .from('blacklist')
      .delete()
      .eq('user_id', user.id)
      .eq('restaurant_id', restaurantId);

    if (error) {
      console.error('blacklist delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('blacklist DELETE error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
