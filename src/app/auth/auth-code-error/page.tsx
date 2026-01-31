import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/layout/mobile-container';

export const metadata: Metadata = {
  title: '로그인 오류',
  description: '인증 과정에서 문제가 발생했습니다',
};

export default function AuthCodeErrorPage() {
  return (
    <MobileContainer>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground">
            로그인에 실패했습니다
          </h1>

          {/* Description */}
          <p className="text-base text-muted-foreground max-w-sm">
            인증 과정에서 문제가 발생했습니다. 다시 시도해주세요.
          </p>

          {/* Button */}
          <div className="pt-4">
            <Link href="/">
              <Button className="w-full max-w-xs">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
