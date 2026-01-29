import { cn } from '@/lib/utils';

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileContainer({ children, className }: MobileContainerProps) {
  return (
    <div className={cn('mx-auto max-w-md min-h-screen flex flex-col', className)}>
      {children}
    </div>
  );
}
