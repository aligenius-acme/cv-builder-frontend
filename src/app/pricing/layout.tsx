import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — JobTools AI',
  description: 'Simple, transparent pricing for JobTools AI. Start free and upgrade when you need more AI-powered resume tailoring, cover letters, and job-search tools.',
  alternates: { canonical: 'https://jobtools.io/pricing' },
  openGraph: {
    title: 'Pricing — JobTools AI',
    description: 'Simple, transparent pricing. Start free and upgrade when you need more.',
    url: 'https://jobtools.io/pricing',
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
