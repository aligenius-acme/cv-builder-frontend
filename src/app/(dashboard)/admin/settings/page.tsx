'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ArrowLeft, Settings, Zap, Gift, Save, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AppSettings {
  proSubscriptionEnabled: string;
  freeMonthlyCredits: string;
}

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [settings, setSettings] = useState<AppSettings>({
    proSubscriptionEnabled: 'false',
    freeMonthlyCredits: '10',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [creditsInput, setCreditsInput] = useState('10');

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      const res = await api.getAdminSettings();
      if (res.success && res.data) {
        setSettings(res.data.settings as unknown as AppSettings);
        setCreditsInput(res.data.settings.freeMonthlyCredits ?? '10');
      }
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePro = async () => {
    const newValue = settings.proSubscriptionEnabled === 'true' ? 'false' : 'true';
    setSavingKey('proSubscriptionEnabled');
    try {
      await api.updateAdminSetting('proSubscriptionEnabled', newValue);
      setSettings((prev) => ({ ...prev, proSubscriptionEnabled: newValue }));
      toast.success(
        newValue === 'true'
          ? 'Pro subscription enabled — users can now upgrade'
          : 'Pro subscription disabled — monthly free credits active'
      );
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setSavingKey(null);
    }
  };

  const handleSaveCredits = async () => {
    const n = parseInt(creditsInput, 10);
    if (isNaN(n) || n < 1 || n > 100) {
      toast.error('Credits must be between 1 and 100');
      return;
    }
    setSavingKey('freeMonthlyCredits');
    try {
      await api.updateAdminSetting('freeMonthlyCredits', String(n));
      setSettings((prev) => ({ ...prev, freeMonthlyCredits: String(n) }));
      toast.success('Monthly credits amount updated');
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setSavingKey(null);
    }
  };

  const proEnabled = settings.proSubscriptionEnabled === 'true';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/admin"
          className="inline-flex items-center text-sm text-[var(--muted)] hover:text-[var(--text)] mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Admin Dashboard
        </Link>

        {/* Page header — matches affiliates page pattern */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 flex-shrink-0">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">App Settings</h1>
            <p className="text-sm text-[var(--muted)]">Configure monetization and credit behaviour</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Pro Subscription Toggle */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4 text-blue-600" />
                Pro Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <p className="text-sm text-[var(--muted)] mb-2">
                    When <span className="font-semibold text-[var(--text)]">enabled</span>: Stripe checkout is active,
                    Pro upgrade CTAs appear throughout the app, and monthly free credit claims are blocked.
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    When <span className="font-semibold text-[var(--text)]">disabled</span>: Stripe checkout is blocked,
                    all upgrade CTAs are hidden, and free users can claim {settings.freeMonthlyCredits} credits per month.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={handleTogglePro}
                    disabled={savingKey === 'proSubscriptionEnabled'}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      proEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
                    } disabled:opacity-50`}
                    role="switch"
                    aria-checked={proEnabled}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                        proEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-semibold ${proEnabled ? 'text-blue-600' : 'text-[var(--muted)]'}`}>
                    {savingKey === 'proSubscriptionEnabled' ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : proEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {/* Status pill */}
              <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                proEnabled
                  ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                  : 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
              }`}>
                {proEnabled
                  ? 'Pro subscription is live. Users can upgrade via Stripe checkout.'
                  : 'Free launch mode. Users get monthly free credits instead of a paid plan.'}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Free Credits */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Gift className="h-4 w-4 text-green-600" />
                Monthly Free Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[var(--muted)] mb-4">
                Number of credits awarded to free users when they claim their monthly refill.
                Only applies when Pro subscription is <span className="font-semibold">disabled</span>.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={creditsInput}
                  onChange={(e) => setCreditsInput(e.target.value)}
                  className="w-24 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-sm text-[var(--muted)]">credits per month</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveCredits}
                  isLoading={savingKey === 'freeMonthlyCredits'}
                  leftIcon={<Save className="h-3.5 w-3.5" />}
                  disabled={creditsInput === settings.freeMonthlyCredits}
                >
                  Save
                </Button>
              </div>
              <p className="text-xs text-[var(--muted)] mt-2">Must be between 1 and 100.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
