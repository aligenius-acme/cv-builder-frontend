import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  centered?: boolean;
}

const sizes = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function LoadingSpinner({
  size = 'md',
  text,
  className,
  centered = true,
}: LoadingSpinnerProps) {
  const content = (
    <>
      <Loader2 className={cn(sizes[size], 'animate-spin text-blue-600', className)} />
      {text && <p className="text-sm text-slate-500 mt-2">{text}</p>}
    </>
  );

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        {content}
      </div>
    );
  }

  return <>{content}</>;
}

// Inline variant for buttons
export function ButtonSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin', className)} />;
}

// Loading skeleton for card/list items
export function LoadingSkeleton({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-slate-200 dark:bg-zinc-700 rounded-lg" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-zinc-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
