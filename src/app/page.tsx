'use client';

import { Header, Footer, MobileContainer } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LocationBar } from '@/components/location';
import { CategoryGrid, QualityFilter, PriceFilter } from '@/components/category';
import { PickSection } from '@/components/pick';
import { usePickStore } from '@/stores/pick-store';

export default function Home() {
  const { currentPick, isSearching, isPicking, hasSearched } = usePickStore();
  const hasResult = currentPick !== null;
  const showPickFlow = hasResult || isSearching || isPicking || hasSearched;

  return (
    <MobileContainer>
      <Header />

      <main className="flex-1 p-4 space-y-6">
        {!showPickFlow && (
          <>
            {/* Welcome Section */}
            <section className="text-center py-8">
              <h2 className="text-3xl font-bold text-primary mb-2">
                내 주변 맛집을 골라드립니다!
              </h2>
              <p className="text-muted-foreground">
                위치와 카테고리를 선택하면 랜덤으로 추천해드려요
              </p>
            </section>

            <Separator />

            {/* Location Section */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>위치 설정</CardTitle>
                  <CardDescription>
                    현재 위치를 기준으로 주변 맛집을 찾아드립니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LocationBar />
                </CardContent>
              </Card>
            </section>

            {/* Category Filter Section */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>카테고리 선택</CardTitle>
                  <CardDescription>
                    원하는 음식 종류를 선택해주세요 (최소 1개 이상)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CategoryGrid />
                  <Separator />
                  <QualityFilter />
                  <Separator />
                  <PriceFilter />
                </CardContent>
              </Card>
            </section>
          </>
        )}

        {/* Pick Section */}
        <section>
          <PickSection />
        </section>
      </main>

      <Footer />
    </MobileContainer>
  );
}
