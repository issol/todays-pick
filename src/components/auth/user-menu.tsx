'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

export function UserMenu() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setOpen(false);
    const { error } = await signOut();
    if (error) {
      toast.error('로그아웃에 실패했습니다.');
    } else {
      toast.success('로그아웃 되었습니다.');
    }
  };

  const displayName = profile?.display_name || profile?.email || '사용자';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full border bg-muted pl-1 pr-3 py-1 hover:bg-accent/50 transition-colors"
        title={displayName}
      >
        <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-background">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="text-xs font-medium">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span className="text-sm font-medium truncate max-w-[80px]">
          {profile?.display_name || profile?.email?.split('@')[0] || '사용자'}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md">
          <div className="px-3 py-2 text-sm">
            <p className="font-medium truncate">{displayName}</p>
            {profile?.email && (
              <p className="text-xs text-muted-foreground truncate">
                {profile.email}
              </p>
            )}
          </div>
          <div className="h-px bg-border my-1" />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            로그아웃
          </Button>
        </div>
      )}
    </div>
  );
}
