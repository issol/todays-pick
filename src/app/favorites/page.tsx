import { Metadata } from 'next';
import { MobileContainer, Header } from '@/components/layout';
import { FavoritesList } from '@/components/favorites';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '즐겨찾기 - 오늘의 픽',
  description: '내가 좋아하는 맛집 목록',
};

export default function FavoritesPage() {
  return (
    <MobileContainer>
      <Header />

      <main className="flex-1 p-4 space-y-4">
        {/* Page Header */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">즐겨찾기</h1>
        </div>

        {/* Favorites List */}
        <FavoritesList />
      </main>
    </MobileContainer>
  );
}
