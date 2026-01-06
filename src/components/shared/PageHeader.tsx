import { ReactNode } from 'react';

const gradients = {
  violet: 'from-violet-600 via-purple-600 to-fuchsia-500',
  purple: 'from-purple-600 via-pink-600 to-rose-500',
  emerald: 'from-emerald-600 via-teal-600 to-cyan-500',
  cyan: 'from-cyan-600 via-blue-600 to-indigo-500',
  amber: 'from-amber-500 via-orange-500 to-red-500',
  slate: 'from-slate-700 via-slate-600 to-slate-500',
  teal: 'from-teal-500 via-emerald-500 to-green-500',
  indigo: 'from-indigo-600 via-purple-600 to-pink-500',
  blue: 'from-blue-600 via-indigo-600 to-violet-500',
};

const iconGradients = {
  violet: 'from-violet-100 to-fuchsia-100',
  purple: 'from-purple-100 to-pink-100',
  emerald: 'from-emerald-100 to-teal-100',
  cyan: 'from-cyan-100 to-blue-100',
  amber: 'from-amber-100 to-orange-100',
  slate: 'from-slate-100 to-gray-100',
  teal: 'from-teal-100 to-emerald-100',
  indigo: 'from-indigo-100 to-purple-100',
  blue: 'from-blue-100 to-indigo-100',
};

export type GradientType = keyof typeof gradients;

interface PageHeaderProps {
  icon: ReactNode;
  label: string;
  title: string;
  description: string;
  gradient?: GradientType;
  actions?: ReactNode;
}

const patternSvg = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export default function PageHeader({
  icon,
  label,
  title,
  description,
  gradient = 'violet',
  actions,
}: PageHeaderProps) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${gradients[gradient]} p-8 text-white`}>
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: patternSvg }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {icon}
              <span className="text-white/80 text-sm font-medium">{label}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">{title}</h1>
            <p className="text-white/80 text-lg max-w-2xl">{description}</p>
          </div>
          {actions && <div className="hidden md:block">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

// Export gradient mappings for use in other components
export { gradients, iconGradients };
