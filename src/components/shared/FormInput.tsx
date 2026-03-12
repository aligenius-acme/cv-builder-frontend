import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-secondary)]">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--surface)] text-[var(--text)]',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
            'placeholder:text-[var(--text-muted)]',
            error && 'border-red-300 focus:ring-red-500/20 focus:border-red-500',
            props.disabled && 'bg-[var(--surface-raised)] text-[var(--text-muted)] cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {hint && !error && <p className="text-sm text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
