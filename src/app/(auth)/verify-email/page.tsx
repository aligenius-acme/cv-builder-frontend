'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await api.verifyEmail(token!);
      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
      } else {
        setStatus('error');
        setMessage(response.error || 'Failed to verify email');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Invalid or expired verification link');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verifying Email</h1>
            <p className="text-slate-500">Please wait while we verify your email address...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'no-token') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">No Verification Token</h1>
            <p className="text-slate-500 mb-6">
              No verification token found. Please click the link in your verification email or request a new one.
            </p>
            <Link href="/login">
              <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h1>
            <p className="text-slate-500 mb-6">{message}</p>
            <Link href="/resumes">
              <Button variant="primary" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Continue to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h1>
          <p className="text-slate-500 mb-6">{message}</p>
          <div className="space-y-3">
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Go to Login
              </Button>
            </Link>
            <p className="text-sm text-slate-400">
              Need a new verification link? Log in and request a new one from your settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8 text-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
