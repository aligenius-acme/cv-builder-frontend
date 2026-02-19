import { ReactNode } from 'react';

interface PageHeaderProps {
  icon: ReactNode;
  label: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

export default function PageHeader({
  icon,
  label,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div
      className="rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow-xs)] pl-6 pr-6 py-5"
      style={{ borderLeftWidth: '4px', borderLeftColor: '#2563eb' }}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 mt-0.5">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">{label}</p>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text)] leading-tight">{title}</h1>
            <p className="text-[var(--text-secondary)] mt-1 max-w-2xl">{description}</p>
          </div>
        </div>
        {actions && <div className="hidden md:flex items-center flex-shrink-0 pt-1">{actions}</div>}
      </div>
    </div>
  );
}
