'use client';

import { useTheme } from '@/hooks/use-theme';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const icons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const Icon = icons[theme];

  return (
    <button
      onClick={cycleTheme}
      className="relative flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-all hover:bg-accent hover:text-accent-foreground"
      aria-label="테마 변경"
      title={`현재: ${theme === 'light' ? '라이트' : theme === 'dark' ? '다크' : '시스템'}`}
    >
      <Icon className="h-4 w-4 transition-transform duration-200 hover:scale-110" />
    </button>
  );
}
