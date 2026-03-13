'use client';

import { useState, useEffect } from 'react';
import { Zap, BookOpen, Video, Briefcase, ExternalLink, ArrowLeft, Crown, Check, CreditCard, Gift, Calendar } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CreditsAffiliate {
  skill: string;
  title: string;
  url: string;
  provider: string;
}

interface BillingStatus {
  plan: string;
  remainingCredits: number;
  proSubscriptionEnabled: boolean;
  canClaimMonthlyCredits: boolean;
  nextRefillDate: string | null;
  monthlyCreditsAmount: number;
}

function providerIcon(provider: string) {
  switch (provider) {
    case 'Udemy': return Video;
    case 'LinkedIn Learning': return Briefcase;
    default: return BookOpen;
  }
}

function formatRefillDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

function daysUntil(isoDate: string): number {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function OutOfCreditsPage() {
  const { user } = useAuthStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [affiliates, setAffiliates] = useState<CreditsAffiliate[]>([]);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getBillingStatus(),
      api.getCreditsPageAffiliates(),
    ]).then(([billingRes, affiliatesRes]) => {
      if (billingRes.success && billingRes.data) setBilling(billingRes.data);
      if (affiliatesRes.success && affiliatesRes.data) setAffiliates(affiliatesRes.data);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    try {
      const res = await api.createCheckoutSession();
      const url = res.data?.url;
      if (url) {
        try {
          const { hostname } = new URL(url);
          if (hostname === 'checkout.stripe.com' || hostname === 'billing.stripe.com') {
            window.location.href = url;
          }
        } catch { /* invalid url */ }
      }
    } catch {
      toast.error('Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleClaimCredits = async () => {
    setIsClaiming(true);
    try {
      const res = await api.claimMonthlyCredits();
      if (res.success && res.data) {
        toast.success(`${billing?.monthlyCreditsAmount ?? 10} credits added to your account!`);
        setBilling((prev) => prev ? {
          ...prev,
          canClaimMonthlyCredits: false,
          nextRefillDate: res.data!.nextRefillDate,
          remainingCredits: res.data!.remaining,
        } : prev);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to claim credits. Please try again.';
      toast.error(msg);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center text-sm text-[var(--muted)] hover:text-[var(--text)] mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-950/30 rounded-xl mb-4">
            <Zap className="h-8 w-8 text-amber-600 dark:text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-3">
            You've Used All Your AI Credits
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
            You've used all your AI credits for this period.
          </p>
        </div>

        {/* Main CTA — mutually exclusive based on proSubscriptionEnabled */}
        {!isLoading && billing && (
          <>
            {billing.proSubscriptionEnabled ? (
              /* ── Pro subscription enabled: show upgrade CTA only ── */
              <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-[var(--text)]">Upgrade to Pro — $12/month</h2>
                      </div>
                      <p className="text-sm text-[var(--muted)] mb-3">
                        Get unlimited AI features and never worry about credits again.
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                        {[
                          'Unlimited resume tailoring',
                          'Unlimited cover letters',
                          'Interview prep & salary tools',
                          'Cancel anytime',
                        ].map((f) => (
                          <div key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                            <Check className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleUpgrade}
                        isLoading={isCheckingOut}
                        leftIcon={isCheckingOut ? undefined : <CreditCard className="h-5 w-5" />}
                        className="w-full sm:w-auto"
                      >
                        Upgrade to Pro
                      </Button>
                      <Link href="/pricing" className="text-xs text-center text-blue-600 hover:underline">
                        Compare plans →
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              /* ── Pro disabled: show monthly free credits CTA only ── */
              <Card className="mb-8 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="h-5 w-5 text-green-600" />
                        <h2 className="text-lg font-bold text-[var(--text)]">
                          Get {billing.monthlyCreditsAmount} Free Credits — Resets Monthly
                        </h2>
                      </div>
                      {billing.canClaimMonthlyCredits ? (
                        <p className="text-sm text-[var(--muted)]">
                          Your monthly credit refill is ready. Claim {billing.monthlyCreditsAmount} credits to continue using AI features.
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                          <Calendar className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>
                            Already claimed this month.{' '}
                            {billing.nextRefillDate && (
                              <>
                                Next refill on <span className="font-semibold text-[var(--text)]">{formatRefillDate(billing.nextRefillDate)}</span>
                                {' '}({daysUntil(billing.nextRefillDate)} days)
                              </>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleClaimCredits}
                        isLoading={isClaiming}
                        disabled={!billing.canClaimMonthlyCredits}
                        leftIcon={isClaiming ? undefined : <Gift className="h-5 w-5" />}
                        className="w-full sm:w-auto"
                      >
                        {billing.canClaimMonthlyCredits ? 'Claim Free Credits' : 'Already Claimed'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Loading skeleton for CTA */}
        {isLoading && (
          <div className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-5 h-5 bg-[var(--border)] rounded animate-pulse" />
              <div className="h-5 w-48 bg-[var(--border)] rounded animate-pulse" />
            </div>
            <div className="h-4 w-64 bg-[var(--border)] rounded animate-pulse mb-4" />
            <div className="h-10 w-40 bg-[var(--border)] rounded-lg animate-pulse" />
          </div>
        )}

        {/* Recommended Courses */}
        {!isLoading && affiliates.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-[var(--text)] mb-6">
              Recommended for You
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {affiliates.map((affiliate) => {
                const Icon = providerIcon(affiliate.provider);
                return (
                  <Card key={affiliate.skill} className="flex flex-col h-full">
                    <div className="flex-1 p-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-[var(--muted)] bg-[var(--surface-raised)] px-2 py-1 rounded-full">
                          {affiliate.provider}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-[var(--text)] mb-4">
                        {affiliate.title}
                      </h3>
                    </div>
                    <div className="border-t border-[var(--border)] pt-4 mt-2">
                      <a href={affiliate.url} target="_blank" rel="noopener noreferrer" className="inline-flex w-full">
                        <Button variant="primary" size="sm" className="w-full justify-center">
                          Learn More
                          <ExternalLink className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Info box */}
        <Card className="bg-[var(--surface)] border-[var(--border)]">
          <div className="flex items-start gap-3 p-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex-shrink-0">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)] mb-1">About AI Credits</h3>
              <p className="text-sm text-[var(--muted)]">
                Every account starts with free AI credits to try resume tailoring, cover letters, ATS analysis, and more.
                {billing && !billing.proSubscriptionEnabled
                  ? ` Claim ${billing.monthlyCreditsAmount} free credits each month to keep going.`
                  : ' Upgrade to Pro for unlimited access with no credit limits.'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
