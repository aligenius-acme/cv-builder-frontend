'use client';

import { Zap, BookOpen, Video, Briefcase, ExternalLink, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';

export default function OutOfCreditsPage() {
  const { user } = useAuthStore();

  const affiliateProducts = [
    {
      title: 'Resume Writing Masterclass',
      description: 'Learn to craft ATS-optimized resumes that get you interviews. Step-by-step video course with templates.',
      price: '$49',
      category: 'Course',
      icon: Video,
      link: '#', // Replace with actual affiliate link
      features: [
        '5+ hours of video content',
        '15 premium resume templates',
        'ATS optimization guide',
        'Cover letter templates'
      ]
    },
    {
      title: 'Interview Prep Bundle',
      description: 'Master technical and behavioral interviews with real questions from top companies.',
      price: '$79',
      category: 'Course',
      icon: BookOpen,
      link: '#', // Replace with actual affiliate link
      features: [
        '200+ interview questions',
        'Answer frameworks',
        'Mock interview videos',
        'Salary negotiation guide'
      ]
    },
    {
      title: 'Career Coaching Session',
      description: 'One-on-one career coaching with industry experts. Get personalized advice for your job search.',
      price: '$199',
      category: 'Service',
      icon: Briefcase,
      link: '#', // Replace with actual affiliate link
      features: [
        '1-hour video session',
        'Resume review',
        'LinkedIn optimization',
        'Job search strategy'
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
                (resume tailoring, cover letters, ATS analysis, etc.). These credits help us maintain
                the quality of our AI services while keeping the platform accessible to everyone.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
