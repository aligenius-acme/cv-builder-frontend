'use client';

import { useState, useEffect } from 'react';
import { Zap, BookOpen, Video, Briefcase, ExternalLink, ArrowLeft, Crown, Check, CreditCard } from 'lucide-react';
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

function providerIcon(provider: string) {
  switch (provider) {
    case 'Udemy': return Video;
    case 'LinkedIn Learning': return Briefcase;
    default: return BookOpen;
  }
}

export default function OutOfCreditsPage() {
  const { user } = useAuthStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [affiliates, setAffiliates] = useState<CreditsAffiliate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCreditsPageAffiliates()
      .then((res) => {
        if (res.success && res.data) {
          setAffiliates(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text)] mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-950/30 rounded-xl mb-4">
            <Zap className="h-8 w-8 text-amber-600 dark:text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-3">
            You've Used All Your AI Credits
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
            You've used all <span className="font-semibold">{user?.aiCredits || 5} AI credits</span> available with your account.
            Check out these recommended resources to continue boosting your job search!
          </p>
        </div>

        {/* Upgrade to Pro CTA */}
        <Card className="mb-10 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-[var(--text)]">Upgrade to Pro — $12/month</h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">
                  Get unlimited AI features and never worry about credits again.
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  {[
                    'Unlimited resume tailoring',
                    'Unlimited cover letters',
                    'Interview prep & salary tools',
                    'Cancel anytime',
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
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

        {/* Affiliate Products Grid — only shown when admin has enabled courses */}
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
                      {/* Icon & Provider */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--surface-raised)] px-2 py-1 rounded-full">
                          {affiliate.provider}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-semibold text-[var(--text)] mb-4">
                        {affiliate.title}
                      </h3>
                    </div>

                    {/* CTA */}
                    <div className="border-t border-[var(--border)] pt-4 mt-2">
                      <a
                        href={affiliate.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full"
                      >
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

        {/* Loading skeleton */}
        {isLoading && (
          <div className="mb-12">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-6" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
                    <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse" />
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)] mb-1">
                About AI Credits
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Every account gets {user?.aiCredits || 5} lifetime AI credits to try our AI-powered features
                (resume tailoring, cover letters, ATS analysis, etc.). Upgrade to Pro for unlimited access
                to all AI tools with no credit limits.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
