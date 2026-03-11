'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark';
  size?: 'icon' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, leftIcon, rightIcon, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-semibold rounded-xl
      transition-all duration-200 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-blue-600 text-white shadow-sm
        hover:bg-blue-700 hover:shadow-md
      `,
      secondary: `
        bg-[var(--surface-raised)] text-[var(--text)] border border-[var(--border)]
        hover:bg-[var(--border)] hover:border-[var(--text-muted)]
      `,
      outline: `
        border border-[var(--border)] text-[var(--text-secondary)] bg-[var(--surface)]
        hover:border-blue-500 hover:text-blue-600 hover:bg-[var(--accent-subtle)]
      `,
      ghost: `
        text-[var(--text-secondary)] bg-transparent
        hover:bg-[var(--surface-raised)] hover:text-[var(--text)]
      `,
      danger: `
        bg-red-600 text-white shadow-sm
        hover:bg-red-700 hover:shadow-md
        focus-visible:ring-red-500
      `,
      dark: `
        bg-slate-900 text-white shadow-sm
        hover:bg-slate-800 hover:shadow-md
        dark:bg-[var(--surface-overlay)] dark:text-[var(--text)] dark:hover:bg-[var(--border)]
      `,
    };

    const sizes = {
      icon: 'p-2',
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
      xl: 'px-8 py-4 text-lg gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {rightIcon && !isLoading && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
