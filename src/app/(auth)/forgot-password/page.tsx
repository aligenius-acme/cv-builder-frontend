'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.forgotPassword(email);
      if (response.success) {
        setIsSubmitted(true);
      }
    } catch (error: any) {
      // Don't reveal if email exists or not for security
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2.5 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              JobTools AI
            </span>
          </Link>
        </div>

        <Card variant="elevated">
          {isSubmitted ? (
            <CardContent className="py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Check Your Email</h2>
                <p className="text-slate-500 mb-6">
                  If an account exists with <span className="font-medium text-slate-700">{email}</span>,
                  you will receive a password reset link shortly.
                </p>
                <p className="text-sm text-slate-400 mb-6">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                  >
                    Try Another Email
                  </Button>
                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                <CardDescription>
                  Enter your email and we'll send you a reset link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    isLoading={isLoading}
                  >
                    Send Reset Link
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
