import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card variant="elevated">
      <CardContent className="py-16 text-center">
        <div className="w-20 h-20 bg-[var(--surface-raised)] rounded-xl flex items-center justify-center mx-auto mb-6 text-[var(--text-secondary)]">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-[var(--text)] mb-2">{title}</h3>
        <p className="text-[var(--text-secondary)] max-w-sm mx-auto">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  );
}
