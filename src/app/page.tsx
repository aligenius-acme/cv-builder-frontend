'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Target, Zap, Shield, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Logo from '@/components/ui/Logo';
import { useAuthStore } from '@/store/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show nothing while checking auth or if authenticated (will redirect)
  if (isLoading || isAuthenticated) {
    return null;
  }
  const features = [
    {
      icon: Target,
      title: 'ATS-Optimized',
      description: 'Get higher ATS scores with AI-powered keyword optimization and formatting.',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      icon: Zap,
      title: 'Instant Customization',
      description: 'Tailor your resume for any job in seconds, not hours.',
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      icon: Shield,
      title: 'Truth Guard',
      description: 'AI ensures factual accuracy - no fake skills or exaggerated claims.',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      icon: FileText,
      title: 'Version Control',
      description: 'Keep unlimited versions for different jobs. Compare and track changes.',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
    },
  ];

  const benefits = [
    'AI-powered resume tailoring for each job',
    'ATS compatibility scoring and simulator',
    'Cover letter generation',
    'Multiple professional templates',
    'PDF and DOCX downloads',
    'Version history and comparison',
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[var(--bg)]">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-white/90 text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Resume Builder
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-white">
              Land More Interviews with AI-Powered Resume Customization
            </h1>
            <p className="mt-6 text-xl text-slate-400">
              Tailor your resume for every job application in seconds. Get higher ATS scores,
              match more keywords, and stand out to recruiters.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Start Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 dark:bg-[var(--surface-raised)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Our AI understands what recruiters and ATS systems look for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white dark:bg-[var(--surface)] p-8 rounded-xl border border-slate-200 dark:border-[var(--border)] shadow-sm hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-5`}>
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white dark:bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">How It Works</h2>
            <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">Three simple steps to your tailored resume</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: 'Upload Your Resume',
                description: 'Upload your existing resume in PDF or DOCX format. Our AI will parse and understand your experience.',
              },
              {
                step: 2,
                title: 'Paste Job Description',
                description: 'Copy and paste the job description you want to apply for. Our AI extracts key requirements and keywords.',
              },
              {
                step: 3,
                title: 'Get Tailored Resume',
                description: 'Receive an ATS-optimized resume tailored specifically for that job, ready to download and submit.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-slate-50 dark:bg-[var(--surface-raised)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-8">
                Built for Job Seekers Who Want Results
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-lg text-slate-700 dark:text-slate-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 lg:mt-0">
              <div className="bg-slate-100 dark:bg-[var(--surface)] rounded-xl p-8 border border-slate-200 dark:border-[var(--border)]">
                <div className="bg-white dark:bg-[var(--surface-raised)] rounded-xl shadow-sm border border-slate-200 dark:border-[var(--border)] p-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-semibold text-slate-900 dark:text-white">ATS Score</span>
                    <span className="text-4xl font-bold text-emerald-600">92%</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Example output</p>
                  <div className="h-2 bg-slate-100 dark:bg-[var(--border)] rounded-full overflow-hidden mb-6">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }} />
                  </div>
                  <div className="space-y-3">
                    {[
                      '12/15 keywords matched',
                      'ATS-safe formatting',
                      'No truth guard warnings',
                    ].map((item) => (
                      <div key={item} className="flex items-center text-sm">
                        <CheckCircle className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Land More Interviews?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Tailor your resume to every job in seconds — AI-powered ATS optimisation,
            cover letters, interview prep, and salary analysis in one place.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <Logo size="sm" />
            </div>
            <div className="text-sm text-center md:text-right max-w-md">
              <p className="mb-2">
                This platform does not fabricate experience or guarantee hiring outcomes.
              </p>
              <p>AI-generated content is based solely on user-provided information.</p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Job Tools. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
