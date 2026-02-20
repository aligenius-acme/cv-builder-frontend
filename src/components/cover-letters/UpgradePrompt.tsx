'use client';

import { Crown } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function UpgradePrompt() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cover Letters</h1>
          <p className="text-slate-500 mt-1">
            Generate AI-powered cover letters tailored to your job applications
          </p>
        </div>

        <Card variant="elevated">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Crown className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Pro Feature</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                Cover letter generation is available on Pro and Business plans. Upgrade to unlock AI-powered cover letters.
              </p>
              <Link href="/subscription">
                <Button variant="primary" size="lg" leftIcon={<Crown className="h-5 w-5" />}>
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
