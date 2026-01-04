'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
        bg-indigo-600 text-white
        hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25
        focus-visible:ring-indigo-500
      `,
      secondary: `
        bg-slate-100 text-slate-900
        hover:bg-slate-200 hover:shadow-md
        focus-visible:ring-slate-500
      `,
      outline: `
        border-2 border-slate-200 text-slate-700 bg-white
        hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50
        focus-visible:ring-indigo-500
      `,
      ghost: `
        text-slate-600
        hover:bg-slate-100 hover:text-slate-900
        focus-visible:ring-slate-500
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/25
        focus-visible:ring-red-500
      `,
      gradient: `
        bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white
        hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]
        focus-visible:ring-purple-500
        relative overflow-hidden
        before:absolute before:inset-0
        before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
        before:translate-x-[-200%] hover:before:translate-x-[200%]
        before:transition-transform before:duration-700
      `,
    };

    const sizes = {
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
