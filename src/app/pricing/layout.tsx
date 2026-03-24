import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — JobTools AI',
  description: 'Simple, transparent pricing for JobTools AI. Start free and upgrade when you need more AI-powered resume tailoring, cover letters, and job-search tools.',
  robots: { index: false, follow: false },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
