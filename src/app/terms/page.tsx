import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Terms of Service — Job Tools',
  description: 'Terms of Service for Job Tools. Please read before using the platform.',
};

const EFFECTIVE_DATE = 'March 17, 2026';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
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
              By creating an account or using Job Tools (&ldquo;the Service&rdquo;) available at{' '}
              <a href="https://www.jobtools.io">www.jobtools.io</a>, you confirm that you have read,
              understood, and agree to be bound by these Terms of Service and our{' '}
              <Link href="/privacy">Privacy Policy</Link>. If you do not agree, please do not use the
              Service.
            </p>
          </Section>

          <Section title="2. What Job Tools Provides">
            <p>
              Job Tools is an AI-assisted career platform. The Service currently includes:
            </p>
            <ul>
              <li><strong>Resume builder &amp; tailoring</strong> — create, edit, and customise resumes using AI suggestions and professional templates.</li>
              <li><strong>ATS analysis</strong> — score and optimise your resume against a specific job description.</li>
              <li><strong>Cover letter generation</strong> — produce tailored cover letters from your resume and a job description.</li>
              <li><strong>Interview preparation</strong> — practise likely interview questions and generate model answers.</li>
              <li><strong>Job application tracker</strong> — record and monitor the status of your job applications.</li>
              <li><strong>Salary analysis</strong> — compare compensation data and generate negotiation scripts.</li>
              <li><strong>Skill gap analysis</strong> — identify skills missing from your profile relative to a target role.</li>
              <li><strong>Job search</strong> — browse live job listings sourced from third-party job boards.</li>
            </ul>
            <p>
              Features that involve AI generation consume <strong>AI credits</strong>. Free accounts receive
              a starter credit allowance. Pro subscribers receive a monthly credit allocation that resets each
              billing period. Current credit limits are shown on the pricing page when available.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <ul>
              <li>You must be at least <strong>16 years old</strong> to create an account.</li>
              <li>You must provide accurate, current, and complete registration information.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You must notify us immediately at <a href="mailto:support@jobtools.io">support@jobtools.io</a> if you suspect unauthorised access to your account.</li>
              <li>Each person may maintain only one free account. Creating multiple free accounts to circumvent credit limits is prohibited.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service to create false, misleading, or fraudulent job application materials intended to misrepresent your qualifications to employers.</li>
              <li>Upload or submit content that infringes the intellectual property rights of any third party.</li>
              <li>Attempt to gain unauthorised access to the Service, its servers, databases, or any connected system.</li>
              <li>Use automated scripts, bots, or scrapers to access or extract data from the Service without prior written consent.</li>
              <li>Resell, sublicense, or commercially exploit access to the Service without our written permission.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Use the Service in any way that violates applicable local, national, or international law.</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these rules without prior notice.
            </p>
          </Section>

          <Section title="5. AI-Generated Content">
            <p>
              The Service uses large language models (currently OpenAI) to generate resume suggestions,
              cover letters, interview answers, and related content. You acknowledge that:
            </p>
            <ul>
              <li>AI-generated content is produced algorithmically and may contain errors, inaccuracies, or content that is not appropriate for your specific situation.</li>
              <li>You are responsible for reviewing, editing, and taking ownership of any AI-generated content before using it in job applications or professional communications.</li>
              <li>Job Tools does not guarantee that AI-generated content will improve your chances of employment or produce any specific outcome.</li>
              <li>AI credits are consumed when generation features are used. Consumed credits are non-refundable.</li>
              <li>We do not use your resume content or personal data to train AI models.</li>
            </ul>
          </Section>

          <Section title="6. Subscriptions and Billing">
            <ul>
              <li>Pro subscriptions are billed monthly in advance. Current pricing is displayed within the application.</li>
              <li>Payment is processed securely by Stripe. We do not store your card details.</li>
              <li>Subscriptions renew automatically each month unless you cancel.</li>
              <li>You may cancel at any time via Settings → Billing. Your Pro access and credits continue until the end of the current billing period.</li>
              <li>We do not offer prorated refunds for the unused portion of a billing period, except where required by applicable consumer protection law.</li>
              <li>We reserve the right to change subscription pricing. We will give at least 30 days&apos; notice by email before any price increase takes effect. Continued use after that date constitutes acceptance of the new price.</li>
            </ul>
          </Section>

          <Section title="7. Your Content and Intellectual Property">
            <p>
              <strong>Your content:</strong> You retain full ownership of the resumes, cover letters, job
              records, and other content you create or upload (&ldquo;Your Content&rdquo;). By using the
              Service, you grant Job Tools a limited, non-exclusive, royalty-free licence to store, process,
              and transmit Your Content solely as necessary to provide the Service to you. We do not claim
              ownership of Your Content and do not use it for any other purpose.
            </p>
            <p>
              <strong>Our content:</strong> The Job Tools platform — including its code, design, templates,
              and branding — is owned by Job Tools and protected by copyright and other intellectual property
              laws. You may not copy, reproduce, or redistribute it without written permission.
            </p>
          </Section>

          <Section title="8. Third-Party Services and Links">
            <p>
              The Service integrates with third-party services including OpenAI (AI generation), Stripe
              (payments), Cloudinary (file storage), Google and GitHub (OAuth login), and Adzuna (job
              listings). Your use of these services is subject to their respective terms and privacy policies.
              Job Tools is not responsible for the content, accuracy, or practices of third-party services.
            </p>
            <p>
              Job listings displayed in the Service are sourced from third-party job boards. Job Tools does
              not verify the accuracy, legitimacy, or availability of individual listings and is not
              responsible for the content of external job postings.
            </p>
          </Section>

          <Section title="9. Disclaimers">
            <p>
              The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
              To the fullest extent permitted by law, Job Tools makes no warranties, express or implied,
              regarding:
            </p>
            <ul>
              <li>The accuracy, completeness, or fitness for purpose of any content generated by the Service.</li>
              <li>Uninterrupted, error-free, or secure access to the Service.</li>
              <li>Any employment outcome, interview result, or career benefit arising from use of the Service.</li>
            </ul>
            <p>
              Nothing in these Terms excludes liability for death or personal injury caused by negligence,
              fraud, or any other liability that cannot be excluded by law.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the fullest extent permitted by applicable law, Job Tools shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages — including loss of data,
              loss of profits, or loss of business opportunity — arising from your use of or inability to
              use the Service.
            </p>
            <p>
              Our total aggregate liability to you for any claim arising from your use of the Service shall
              not exceed the total amount you paid to Job Tools in the 12 months preceding the event giving
              rise to the claim, or €100 (whichever is greater).
            </p>
          </Section>

          <Section title="11. Account Deletion and Data">
            <p>
              You may delete your account at any time via Settings → Account. Upon deletion, your personal
              data and resume files will be permanently removed within 30 days in accordance with our{' '}
              <Link href="/privacy">Privacy Policy</Link>. Billing records may be retained for up to 7 years
              to comply with financial regulations.
            </p>
          </Section>

          <Section title="12. Changes to These Terms">
            <p>
              We may update these Terms from time to time. We will notify you of material changes by email
              to your registered address and/or by a prominent notice within the Service, at least 14 days
              before the changes take effect. If you do not agree with the updated Terms, you should stop
              using the Service and delete your account before the effective date.
            </p>
          </Section>

          <Section title="13. Governing Law and Disputes">
            <p>
              These Terms are governed by and construed in accordance with applicable law. In the event of
              a dispute, we encourage you to contact us first at{' '}
              <a href="mailto:support@jobtools.io">support@jobtools.io</a> so we can try to resolve the
              matter informally. Nothing in these Terms limits your rights as a consumer under applicable
              mandatory consumer protection laws in your country of residence.
            </p>
          </Section>

          <Section title="14. Contact">
            <p>
              For questions about these Terms, email us at{' '}
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
