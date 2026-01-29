import { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/layout/mobile-container';
import { Header } from '@/components/layout/header';
import { BlacklistList } from '@/components/blacklist';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '차단 목록 - 오늘의 픽',
  description: '차단된 맛집 목록을 관리합니다',
};

export default function BlacklistPage() {
  return (
    <MobileContainer>
      <Header />
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-background sticky top-14 z-40">
          <div className="flex items-center gap-2 px-4 py-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">차단 목록</h1>
          </div>
        </div>

        <div className="flex-1">
          <BlacklistList />
        </div>
      </div>
    </MobileContainer>
  );
}
