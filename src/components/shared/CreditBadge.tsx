'use client';

import { Zap } from 'lucide-react';
import Link from 'next/link';

interface CreditBadgeProps {
  total: number;
  used: number;
  className?: string;
  showLabel?: boolean;
}

export default function CreditBadge({
  total,
  used,
  className = '',
  showLabel = true
}: CreditBadgeProps) {
  const remaining = total - used;
  const percentage = (remaining / total) * 100;

  // Determine color based on remaining credits
  const getColorClasses = () => {
    if (percentage > 60) {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
    } else if (percentage > 20) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800';
    } else {
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
    }
  };

  const content = (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getColorClasses()} ${className}`}>
      <Zap className="w-4 h-4" />
      <span className="text-sm font-medium">
        {showLabel && 'AI Credits: '}
        <span className="font-semibold">{remaining}/{total}</span>
      </span>
    </div>
  );

  // If no credits remaining, make it clickable to the out-of-credits page
  if (remaining === 0) {
    return (
      <Link href="/out-of-credits" className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
