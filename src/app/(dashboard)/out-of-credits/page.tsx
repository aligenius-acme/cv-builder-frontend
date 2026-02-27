'use client';

import { useState } from 'react';
import { Zap, BookOpen, Video, Briefcase, ExternalLink, ArrowLeft, Crown, Check, CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function OutOfCreditsPage() {
  const { user } = useAuthStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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

  const affiliateProducts = [
    {
      title: 'Resume Writing Masterclass',
      description: 'Learn to craft ATS-optimized resumes that get you interviews. Step-by-step video course with templates.',
      price: 'From $15',
      category: 'Udemy',
      icon: Video,
      link: 'https://www.udemy.com/course/writing-a-killer-resume/',
      features: [
        'ATS-optimized resume templates',
        'Keyword strategy guide',
        'Cover letter writing',
        'LinkedIn profile tips'
      ]
    },
    {
      title: 'Interview Prep & Career Skills',
      description: 'Master behavioral and technical interviews with proven frameworks used by top candidates.',
      price: 'From $15',
      category: 'Udemy',
      icon: BookOpen,
      link: 'https://www.udemy.com/course/master-the-tech-interview/',
      features: [
        'STAR method mastery',
        'Common interview questions',
        'Salary negotiation tactics',
        'Technical interview prep'
      ]
    },
    {
      title: 'Google Project Management Certificate',
      description: 'Earn a professional certificate from Google and become job-ready in project management.',
      price: 'From $49/mo',
      category: 'Coursera',
      icon: Briefcase,
      link: 'https://www.coursera.org/professional-certificates/google-project-management',
      features: [
        'Google-issued certificate',
        'No experience required',
        'Self-paced learning',
        'Job placement support'
      ]
    }
  ];

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

        {/* Affiliate Products Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--text)] mb-6">
            Recommended for You
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {affiliateProducts.map((product, index) => (
              <Card key={index} className="flex flex-col h-full">
                <div className="flex-1">
                  {/* Icon & Category */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <product.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-muted)] bg-[var(--surface-raised)] px-2 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    {product.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-4">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-[var(--text-secondary)]">
                        <span className="text-blue-600 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price & CTA */}
                <div className="border-t border-[var(--border)] pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[var(--text)]">
                      {product.price}
                    </span>
                    <a
                      href={product.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button variant="primary" size="sm">
                        Learn More
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

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
