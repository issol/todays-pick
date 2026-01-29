'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginButton() {
  const { signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error('로그인에 실패했습니다.');
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleLogin} className="gap-2">
      <LogIn className="h-4 w-4" />
      <span className="hidden sm:inline">로그인</span>
    </Button>
  );
}
