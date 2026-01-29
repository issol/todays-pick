import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MobileContainer } from '@/components/layout/mobile-container';
import { Header } from '@/components/layout/header';
import { HistoryList } from '@/components/history';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: '픽 기록 - 오늘의 픽',
  description: '내가 뽑았던 맛집 기록을 확인하세요',
};

export default function PicksPage() {
  return (
    <MobileContainer>
      <Header />

      <div className="flex-1 flex flex-col">
        {/* Page header */}
        <div className="sticky top-14 z-40 bg-background border-b">
          <div className="container flex items-center gap-2 h-14">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">픽 기록</h1>
          </div>
        </div>

        {/* History list */}
        <div className="flex-1 mt-4">
          <HistoryList />
        </div>
      </div>
    </MobileContainer>
  );
}
