import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service — Job Tools',
  description: 'Terms of Service for Job Tools. Read our terms before using the platform.',
};

const EFFECTIVE_DATE = 'March 17, 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">Job Tools</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-blue-600 transition-colors">Privacy</Link>
            <Link href="/cookies" className="text-[var(--text-secondary)] hover:text-blue-600 transition-colors">Cookies</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-14">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose-legal">

          <Section title="1. Acceptance of Terms">
            <p>
              By creating an account or using Job Tools (&ldquo;the Service&rdquo;) at{' '}
              <a href="https://www.jobtools.io">www.jobtools.io</a>, you agree to be bound by these Terms of Service.
              If you do not agree, do not use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              Job Tools is an AI-powered career platform that provides resume building, resume tailoring and ATS
              analysis, cover letter generation, interview preparation, job application tracking, salary analysis,
              skill gap analysis, and related job-search tools.
            </p>
            <p>
              Some features consume AI credits. Free accounts receive a starter credit allowance. Pro subscribers
              receive unlimited credits on a monthly subscription basis.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <ul>
              <li>You must provide accurate and complete registration information.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must be at least 16 years old to use the Service.</li>
              <li>One person may not maintain more than one free account.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service to generate content that is false, misleading, defamatory, or fraudulent.</li>
              <li>Attempt to reverse-engineer, scrape, or extract data from the Service in bulk.</li>
              <li>Use automated scripts or bots to interact with the Service without prior written consent.</li>
              <li>Attempt to gain unauthorized access to any part of the Service or its infrastructure.</li>
              <li>Resell or sublicense access to the Service without our written permission.</li>
              <li>Upload content that infringes third-party intellectual property rights.</li>
            </ul>
          </Section>

          <Section title="5. AI-Generated Content">
            <p>
              Features powered by artificial intelligence (including resume tailoring, cover letter writing,
              interview Q&amp;A, and salary analysis) produce suggestions based on the data you provide and
              publicly available models. You acknowledge that:
            </p>
            <ul>
              <li>AI-generated content is a starting point and may require review and editing.</li>
              <li>Job Tools does not guarantee that AI output is accurate, complete, or appropriate for your
                specific situation.</li>
              <li>You are solely responsible for the final content you submit to employers.</li>
              <li>AI credits are consumed when these features are used and are non-refundable once consumed.</li>
            </ul>
          </Section>

          <Section title="6. Subscription & Billing">
            <ul>
              <li>Pro subscriptions are billed monthly via Stripe. Pricing is shown on the{' '}
                <Link href="/pricing">pricing page</Link>.</li>
              <li>Subscriptions renew automatically each month unless cancelled.</li>
              <li>You may cancel at any time; your Pro access remains active until the end of the billing period.</li>
              <li>We do not offer prorated refunds for unused subscription time, except where required by law.</li>
              <li>We reserve the right to change pricing with 30 days&apos; notice to your registered email address.</li>
            </ul>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              <strong>Your content:</strong> You retain full ownership of the resumes, cover letters, and other
              content you create or upload. You grant Job Tools a limited, non-exclusive license to process that
              content solely to provide the Service to you.
            </p>
            <p>
              <strong>Our content:</strong> The Job Tools platform, including its code, design, and branding, is
              owned by Job Tools and protected by copyright law. You may not copy or redistribute it.
            </p>
          </Section>

          <Section title="8. Privacy">
            <p>
              Your use of the Service is also governed by our{' '}
              <Link href="/privacy">Privacy Policy</Link>, which is incorporated into these Terms by reference.
            </p>
          </Section>

          <Section title="9. Disclaimers">
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind. Job Tools does not
              guarantee that use of the platform will result in employment or any specific career outcome. Job
              search results, salary data, and interview guidance are informational only and not professional
              career advice.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Job Tools shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use of the Service. Our total liability
              for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="11. Termination">
            <p>
              You may delete your account at any time via Settings. We may suspend or terminate your account if
              you violate these Terms. Upon termination, your data will be deleted in accordance with our{' '}
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>
              We may update these Terms from time to time. We will notify you by email or in-app notice at least
              14 days before material changes take effect. Continued use after that date constitutes acceptance.
            </p>
          </Section>

          <Section title="13. Governing Law">
            <p>
              These Terms are governed by the laws of the jurisdiction in which Job Tools operates. Any disputes
              shall be resolved through binding arbitration or in the courts of that jurisdiction.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              Questions about these Terms? Email us at{' '}
              <a href="mailto:support@jobtools.io">support@jobtools.io</a>.
            </p>
          </Section>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-[var(--text)] mb-3 pb-1 border-b border-[var(--border)]">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)] [&_a]:text-blue-600 [&_a]:hover:underline [&_strong]:text-[var(--text)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
