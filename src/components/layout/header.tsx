'use client';

import { useState } from 'react';
import Link from 'next/link';
import { History, Heart, ShieldOff } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { LoginButton } from '@/components/auth/login-button';
import { UserMenu } from '@/components/auth/user-menu';
import { LoginPromptDialog } from '@/components/auth/login-prompt-dialog';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const { loading, isAnonymous } = useAuth();
  const [loginPrompt, setLoginPrompt] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  const handleProtectedNav = (e: React.MouseEvent, message: string) => {
    if (isAnonymous) {
      e.preventDefault();
      setLoginPrompt({ open: true, message });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <h1 className="text-xl font-bold text-primary">오늘의 픽</h1>
            </Link>
            <span className="text-sm text-muted-foreground">점심 뭐 먹지?</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation Links */}
            <Link href="/picks" onClick={(e) => handleProtectedNav(e, '히스토리를 보려면 로그인이 필요합니다')}>
              <Button variant="ghost" size="icon" title="히스토리">
                <History className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/favorites" onClick={(e) => handleProtectedNav(e, '즐겨찾기를 보려면 로그인이 필요합니다')}>
              <Button variant="ghost" size="icon" title="즐겨찾기">
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            <Link href="/settings/blacklist" onClick={(e) => handleProtectedNav(e, '차단 목록을 보려면 로그인이 필요합니다')}>
              <Button variant="ghost" size="icon" title="차단 목록">
                <ShieldOff className="h-5 w-5" />
              </Button>
            </Link>

            <ThemeToggle />

            {/* Auth */}
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
            ) : (
              isAnonymous ? <LoginButton /> : <UserMenu />
            )}
          </div>
        </div>
      </header>

      <LoginPromptDialog
        open={loginPrompt.open}
        onOpenChange={(open) => setLoginPrompt((prev) => ({ ...prev, open }))}
        message={loginPrompt.message}
      />
    </>
  );
}
