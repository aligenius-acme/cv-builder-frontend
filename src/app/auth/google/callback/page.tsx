'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage('Google authentication was cancelled or denied.');
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received from Google.');
        return;
      }

      try {
        const response = await api.googleOAuthCallback(code);

        if (response.success && response.data) {
          setStatus('success');
          setUser(response.data.user);

          if (response.data.isNewUser) {
            toast.success('Welcome to JobTools AI! Your account has been created.');
          } else {
            toast.success('Welcome back!');
          }

          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.response?.data?.error || 'Failed to authenticate with Google. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Signing you in with Google...
              </h2>
              <p className="text-slate-500">
                Please wait while we verify your account.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Successfully signed in!
              </h2>
              <p className="text-slate-500">
                Redirecting you to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Authentication Failed
              </h2>
              <p className="text-slate-500 mb-6">
                {errorMessage}
              </p>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
