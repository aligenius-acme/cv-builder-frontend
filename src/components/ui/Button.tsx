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
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-blue-600 text-white shadow-sm
        hover:bg-blue-700 hover:shadow-md
        focus-visible:ring-blue-500
      `,
      secondary: `
        bg-slate-100 text-slate-900
        hover:bg-slate-200
        focus-visible:ring-slate-500
        dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700
      `,
      outline: `
        border border-slate-200 text-slate-700 bg-white
        hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50
        focus-visible:ring-blue-500
        dark:border-zinc-700 dark:text-zinc-300 dark:bg-transparent dark:hover:border-blue-500 dark:hover:text-blue-400 dark:hover:bg-blue-950/30
      `,
      ghost: `
        text-slate-600
        hover:bg-slate-100 hover:text-slate-900
        focus-visible:ring-slate-500
        dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
      `,
      danger: `
        bg-red-600 text-white shadow-sm
        hover:bg-red-700 hover:shadow-md
        focus-visible:ring-red-500
      `,
      dark: `
        bg-slate-900 text-white shadow-sm
        hover:bg-slate-800 hover:shadow-md
        focus-visible:ring-slate-700
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
