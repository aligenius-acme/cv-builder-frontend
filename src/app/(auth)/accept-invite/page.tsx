'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building, CheckCircle, XCircle, Loader2, LogIn } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');
  const [orgName, setOrgName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    // Wait for auth check
    setTimeout(() => {
      if (isAuthenticated) {
        setStatus('ready');
      } else {
        setStatus('loading');
      }
    }, 500);
  }, [token, isAuthenticated]);

  const handleAccept = async () => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const response = await api.acceptInvite(token);
      if (response.success) {
        setStatus('success');
        setOrgName(response.data?.organizationName || 'the organization');
        setMessage(response.message || 'You have joined the organization!');
        await fetchUser();
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to accept invitation');
    } finally {
      setIsSubmitting(false);
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading...</h1>
            <p className="text-slate-500">Please wait...</p>
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
              <Building className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Invitation</h1>
            <p className="text-slate-500 mb-6">
              No invitation token found. Please use the link from your invitation email.
            </p>
            <Link href="/resumes">
              <Button variant="primary" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <LogIn className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign In Required</h1>
            <p className="text-slate-500 mb-6">
              Please sign in or create an account to accept this invitation.
            </p>
            <div className="space-y-3">
              <Link href={`/login?redirect=/accept-invite?token=${token}`}>
                <Button variant="primary" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href={`/register?redirect=/accept-invite?token=${token}`}>
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
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
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome!</h1>
            <p className="text-slate-500 mb-6">
              You&apos;ve successfully joined <strong>{orgName}</strong>.
            </p>
            <Link href="/organization">
              <Button variant="primary" className="w-full">
                View Organization
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Invitation Failed</h1>
            <p className="text-slate-500 mb-6">{message}</p>
            <Link href="/resumes">
              <Button variant="primary" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Ready to accept
  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8 text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Building className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Organization Invitation</h1>
          <p className="text-slate-500 mb-6">
            You&apos;ve been invited to join an organization. Click below to accept.
          </p>
          <Button
            variant="primary"
            className="w-full"
            onClick={handleAccept}
            isLoading={isSubmitting}
          >
            Accept Invitation
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
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
      <AcceptInviteContent />
    </Suspense>
  );
}
