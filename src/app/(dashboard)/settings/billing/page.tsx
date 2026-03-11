'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Crown, Zap, Check, ArrowLeft, Loader2, ExternalLink, CreditCard, Gift, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface BillingStatus {
  plan: string;
  remainingCredits: number;
  stripeCustomerId: string | null;
  hasSubscription: boolean;
  proSubscriptionEnabled: boolean;
  canClaimMonthlyCredits: boolean;
  nextRefillDate: string | null;
  monthlyCreditsAmount: number;
}

function formatRefillDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    if (success === 'true') {
      toast.success('Welcome to Pro! Your subscription is now active.');
      loadStatus();
    }
  }, [success]);

  const loadStatus = async () => {
    try {
      const res = await api.getBillingStatus();
      if (res.success) setStatus(res.data);
    } catch {
      toast.error('Failed to load billing status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setIsCheckingOut(true);
    try {
      const res = await api.createCheckoutSession();
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      toast.error('Failed to start checkout. Please try again.');
      setIsCheckingOut(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsOpeningPortal(true);
    try {
      const res = await api.createPortalSession();
      if (res.data?.url) window.location.href = res.data.url;
    } catch {
      toast.error('Failed to open billing portal. Please try again.');
      setIsOpeningPortal(false);
    }
  };

  const handleClaimCredits = async () => {
    setIsClaiming(true);
    try {
      const res = await api.claimMonthlyCredits();
      if (res.success && res.data) {
        toast.success(`${status?.monthlyCreditsAmount ?? 10} credits added to your account!`);
        setStatus((prev) => prev ? {
          ...prev,
          canClaimMonthlyCredits: false,
          remainingCredits: res.data!.remaining,
          nextRefillDate: res.data!.nextRefillDate,
        } : prev);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to claim credits. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const isPro = status?.plan === 'PRO';

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Settings
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Billing & Plan</h1>
            <p className="text-sm text-[var(--muted)]">Manage your subscription and credits</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Current Plan Card */}
            <Card variant="elevated">
              <CardContent className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPro ? 'bg-blue-600' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      {isPro ? (
                        <Crown className="h-6 w-6 text-white" />
                      ) : (
                        <Zap className="h-6 w-6 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-[var(--text)]">
                          {isPro ? 'Pro Plan' : 'Free Plan'}
                        </h2>
                        <Badge variant={isPro ? 'primary' : 'default'} size="sm">
                          {isPro ? 'Active' : 'Current'}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--muted)] mt-1">
                        {isPro
                          ? 'Unlimited AI features · Up to 200 AI calls/day'
                          : `${status?.remainingCredits ?? 0} AI credits remaining`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[var(--text)]">
                      {isPro ? '$12' : '$0'}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {isPro ? '/month' : 'forever'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action section */}
            {isPro ? (
              /* Pro: manage subscription */
              <Card variant="elevated">
                <CardContent className="py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-[var(--text)]">Manage Subscription</h3>
                      <p className="text-sm text-[var(--muted)]">
                        Update payment method, view invoices, or cancel your subscription
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleManageSubscription}
                      isLoading={isOpeningPortal}
                      rightIcon={<ExternalLink className="h-4 w-4" />}
                    >
                      Billing Portal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : status?.proSubscriptionEnabled ? (
              /* Free + Pro enabled: show upgrade CTA */
              <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="py-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-[var(--text)] text-lg mb-1">Upgrade to Pro</h3>
                      <p className="text-sm text-[var(--muted)] mb-3">
                        Get unlimited AI features for $12/month
                      </p>
                      <ul className="space-y-1">
                        {[
                          'Unlimited resume tailoring',
                          'Unlimited cover letters',
                          'All AI tools (interview prep, salary analysis, etc.)',
                          'Cancel anytime',
                        ].map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                            <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleUpgrade}
                      isLoading={isCheckingOut}
                      leftIcon={<CreditCard className="h-5 w-5" />}
                    >
                      Upgrade — $12/mo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Free + Pro disabled: show monthly credits claim */
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                <CardContent className="py-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Gift className="h-5 w-5 text-green-600" />
                        <h3 className="font-bold text-[var(--text)] text-lg">
                          Monthly Free Credits
                        </h3>
                      </div>
                      {status?.canClaimMonthlyCredits ? (
                        <p className="text-sm text-[var(--muted)]">
                          Your {status.monthlyCreditsAmount} monthly credits are ready to claim.
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                          <Calendar className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>
                            Already claimed.{' '}
                            {status?.nextRefillDate && (
                              <>Next refill on <span className="font-semibold text-[var(--text)]">{formatRefillDate(status.nextRefillDate)}</span></>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleClaimCredits}
                      isLoading={isClaiming}
                      disabled={!status?.canClaimMonthlyCredits}
                      leftIcon={isClaiming ? undefined : <Gift className="h-5 w-5" />}
                    >
                      {status?.canClaimMonthlyCredits ? 'Claim Credits' : 'Already Claimed'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pro features list — only shown when Pro is enabled and user is on free plan */}
            {!isPro && status?.proSubscriptionEnabled && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-base">Pro Plan Includes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      'Unlimited resume tailoring',
                      'Unlimited ATS analysis',
                      'Cover letter generation (unlimited)',
                      'Interview question generator',
                      'Salary analyzer & negotiation scripts',
                      'Skill gap analyzer',
                      'Job match scoring',
                      'Follow-up email generator',
                      'Networking message writer',
                      'Career performance scoring',
                      'Priority support',
                      'Cancel anytime',
                    ].map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
