import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ history: [], totalCount: 0, hasMore: false });
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '0', 10);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // Get total count
    const { count } = await supabase
      .from('picks_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Fetch paginated history
    const { data, error } = await supabase
      .from('picks_history')
      .select('*')
      .eq('user_id', user.id)
      .order('picked_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('picks-history fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      history: data || [],
      totalCount: count || 0,
      hasMore: (data || []).length === PAGE_SIZE,
    });
  } catch (err) {
    console.error('picks-history GET error:', err);
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

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    const { error } = await supabase
      .from('picks_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('picks-history delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('picks-history DELETE error:', err);
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
