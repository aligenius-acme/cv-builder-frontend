'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default:  'bg-[var(--surface-raised)] text-[var(--text-secondary)] border-[var(--border)]',
      primary:  'bg-[var(--accent-subtle)] text-[var(--accent-text)] border-[var(--accent-border)]',
      success:  'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-border)]',
      warning:  'bg-[var(--warning-bg)] text-[var(--warning-text)] border-[var(--warning-border)]',
      error:    'bg-[var(--error-bg)] text-[var(--error-text)] border-[var(--error-border)]',
      info:     'bg-[var(--info-bg)] text-[var(--info-text)] border-[var(--info-border)]',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs',
      lg: 'px-3 py-1.5 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-full border transition-colors',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
