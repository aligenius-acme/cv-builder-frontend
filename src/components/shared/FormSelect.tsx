import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, hint, options, placeholder, className, id, value, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const isPlaceholderSelected = value === '' || value === undefined;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[var(--text-secondary)]">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          value={value}
          className={cn(
            'w-full px-4 py-2.5 border border-[var(--border)] rounded-xl bg-[var(--surface)]',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
            error && 'border-red-300 focus:ring-red-500/20 focus:border-red-500',
            props.disabled && 'bg-[var(--surface-raised)] cursor-not-allowed',
            isPlaceholderSelected ? 'text-[var(--text-muted)]' : 'text-[var(--text)]',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled} className="text-[var(--text)] bg-[var(--surface)]">
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {hint && !error && <p className="text-sm text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

export default FormSelect;
