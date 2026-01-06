import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { iconGradients, GradientType } from './PageHeader';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  gradient?: GradientType;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  gradient = 'violet',
}: EmptyStateProps) {
  return (
    <Card variant="elevated">
      <CardContent className="py-16 text-center">
        <div
          className={`w-20 h-20 bg-gradient-to-br ${iconGradients[gradient]} rounded-3xl flex items-center justify-center mx-auto mb-6`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 max-w-sm mx-auto">{description}</p>
        {action && <div className="mt-6">{action}</div>}
      </CardContent>
    </Card>
  );
}
