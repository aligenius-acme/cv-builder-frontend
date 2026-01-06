import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  variant?: 'list' | 'grid' | 'compact';
  className?: string;
}

export default function SkeletonCard({ variant = 'list', className }: SkeletonCardProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('bg-white rounded-lg p-4 animate-pulse', className)}>
        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <Card variant="elevated" className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
          <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-slate-200 rounded w-2/3 mb-4" />
          <div className="flex gap-2 mt-4">
            <div className="h-6 bg-slate-200 rounded-full w-16" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default list variant
  return (
    <Card variant="elevated" className={className}>
      <CardContent className="py-6">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-slate-200 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded w-full" />
            <div className="h-3 bg-slate-200 rounded w-5/6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple skeleton elements for custom layouts
export function SkeletonLine({ width = 'full', height = 4 }: { width?: string; height?: number }) {
  const widthClass = width === 'full' ? 'w-full' : `w-${width}`;
  return <div className={cn(`h-${height} bg-slate-200 rounded animate-pulse`, widthClass)} />;
}

export function SkeletonCircle({ size = 12 }: { size?: number }) {
  return <div className={cn(`w-${size} h-${size} bg-slate-200 rounded-full animate-pulse`)} />;
}

export function SkeletonBox({ width = 14, height = 14, rounded = 'xl' }: { width?: number; height?: number; rounded?: string }) {
  return <div className={cn(`w-${width} h-${height} bg-slate-200 rounded-${rounded} animate-pulse`)} />;
}
