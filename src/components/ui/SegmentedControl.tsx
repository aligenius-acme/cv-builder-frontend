'use client';

import { ReactNode } from 'react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
  count?: number;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div className={`flex items-center gap-2 p-1 bg-slate-200 rounded-xl w-fit ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => !option.disabled && onChange(option.value)}
          disabled={option.disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            value === option.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {option.icon}
          {option.label}
          {option.count !== undefined && option.count > 0 && (
            <span className={`${value === option.value ? 'text-blue-500' : 'text-slate-400'}`}>
              ({option.count})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
