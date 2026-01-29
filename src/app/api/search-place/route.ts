import { NextRequest, NextResponse } from 'next/server';

const NAVER_SEARCH_API_URL = 'https://openapi.naver.com/v1/search/local.json';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ items: [] });
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Missing Naver API credentials' },
      { status: 500 }
    );
  }

  try {
    const params = new URLSearchParams({
      query: query.trim(),
      display: '5',
      sort: 'comment',
    });

    const response = await fetch(`${NAVER_SEARCH_API_URL}?${params}`, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Naver API error', items: [] },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Convert mapx/mapy to lat/lng and return simplified results
    const items = (data.items || []).map(
      (item: { title: string; roadAddress: string; address: string; mapx: string; mapy: string; category: string }) => ({
        name: item.title.replace(/<[^>]*>/g, ''),
        roadAddress: item.roadAddress,
        jibunAddress: item.address,
        lat: parseInt(item.mapy, 10) / 10000000,
        lng: parseInt(item.mapx, 10) / 10000000,
        category: item.category,
      })
    );

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Search failed', items: [] }, { status: 500 });
  }
}
