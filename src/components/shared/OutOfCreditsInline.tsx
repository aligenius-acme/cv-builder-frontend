import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function OutOfCreditsInline() {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3">
      <Zap className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0" />
      <p className="text-sm text-amber-800 dark:text-amber-300 flex-1">
        You're out of AI credits.
      </p>
      <Link
        href="/out-of-credits"
        className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 whitespace-nowrap underline-offset-2 hover:underline"
      >
        View options →
      </Link>
    </div>
  );
}
