'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { Check, Zap, Crown, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const FREE_FEATURES = [
  'AI credits included to start',
  'Resume tailoring (uses credits)',
  'Cover letter generation (uses credits)',
  'ATS analysis (uses credits)',
  'Job application tracker',
  'Resume templates',
  'Resume builder',
];

const PRO_FEATURES = [
  'Unlimited AI credits',
  'Unlimited resume tailoring',
  'Unlimited ATS analysis',
  'Unlimited cover letter generation',
  'Interview question generator',
  'Salary analyzer & offer comparison',
  'Negotiation script generator',
  'Skill gap analyzer',
  'Job match scoring',
  'Follow-up email generator',
  'Networking message writer',
  'Career performance scoring',
  'Everything in Free',
  'Cancel anytime',
];

export default function PricingPage() {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();
  const { proSubscriptionEnabled, isLoaded } = useAppSettings();

  // Redirect away if pro is disabled — this page serves no purpose without it
  if (isLoaded && !proSubscriptionEnabled) {
    router.replace('/dashboard');
    return null;
  }

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    try {
      const res = await api.createCheckoutSession();
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        // Not logged in — redirect to register
        window.location.href = '/register?redirect=/pricing';
      } else {
        toast.error('Failed to start checkout. Please try again.');
      }
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Job Tools
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Get started free</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
            Start free and upgrade when you need unlimited AI-powered job search tools.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <Card variant="elevated" className="flex flex-col">
            <CardContent className="py-8 flex-1 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                    <Zap className="h-5 w-5 text-slate-500" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--text)]">Free</h2>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--text)]">$0</span>
                  <span className="text-[var(--text-secondary)]">forever</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Try AI features with free credits included
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <Check className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Get started free
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card variant="elevated" className="flex flex-col border-blue-300 dark:border-blue-700 ring-2 ring-blue-600">
            <CardContent className="py-8 flex-1 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text)]">Pro</h2>
                  </div>
                  <Badge variant="primary" size="sm">Most popular</Badge>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[var(--text)]">$12</span>
                  <span className="text-[var(--text-secondary)]">/month</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  Unlimited AI features, cancel anytime
                </p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <Check className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleUpgrade}
                isLoading={isCheckingOut}
                leftIcon={isCheckingOut ? undefined : <CreditCard className="h-4 w-4" />}
              >
                {isCheckingOut ? 'Redirecting to checkout...' : 'Upgrade to Pro'}
              </Button>
              <p className="text-xs text-center text-[var(--text-secondary)] mt-3">
                Secure checkout via Stripe · Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[var(--text)] text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'What counts as an AI credit?',
                a: 'Each time you use an AI feature (resume tailoring, cover letter, ATS analysis, etc.), one credit is used. Free users start with credits included and can claim more each month.',
              },
              {
                q: 'Can I cancel my Pro subscription?',
                a: 'Yes, anytime. You\'ll retain Pro access until the end of your billing period, then automatically downgrade to Free.',
              },
              {
                q: 'Is my payment info secure?',
                a: 'Yes. We use Stripe for payment processing — your card details never touch our servers.',
              },
              {
                q: 'Do unused credits roll over?',
                a: 'Yes — unused free credits never expire and carry over month to month. Pro users have unlimited credits with no limits.',
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-[var(--border)] pb-6">
                <h3 className="font-semibold text-[var(--text)] mb-2">{q}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
