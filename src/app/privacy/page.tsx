import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — Job Tools',
  description: 'Privacy Policy for Job Tools. Learn how we collect, use, and protect your data.',
};

const EFFECTIVE_DATE = 'March 17, 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">Job Tools</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/terms" className="text-[var(--text-secondary)] hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="/cookies" className="text-[var(--text-secondary)] hover:text-blue-600 transition-colors">Cookies</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-14">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose-legal">

          <Section title="1. Who We Are">
            <p>
              Job Tools (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) operates the website{' '}
              <a href="https://www.jobtools.io">www.jobtools.io</a>. This policy explains what personal data we
              collect, how we use it, and your rights regarding it.
            </p>
          </Section>

          <Section title="2. Data We Collect">
            <p><strong>Account data</strong></p>
            <ul>
              <li>Email address, first name, and last name when you register.</li>
              <li>If you sign in via Google or GitHub OAuth, we receive your public profile information (name and email) from that provider.</li>
              <li>Hashed password (we never store your password in plain text).</li>
            </ul>

            <p><strong>Professional / resume data</strong></p>
            <ul>
              <li>Resume files you upload or content you enter: work experience, education, skills, certifications, projects, contact details, and other career information.</li>
              <li>Cover letters and job application records you create.</li>
              <li>Job postings you save or track.</li>
            </ul>

            <p><strong>Usage data</strong></p>
            <ul>
              <li>AI credits used, features accessed, and timestamps of activity.</li>
              <li>Log data: IP address, browser type, pages visited, and referring URL, collected automatically.</li>
            </ul>

            <p><strong>Billing data</strong></p>
            <ul>
              <li>Subscription status and plan type.</li>
              <li>Payment is processed by Stripe. We do not store your card number or banking details.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul>
              <li><strong>Provide the Service</strong> — to create and manage your account, generate AI-powered resume and career content, and store your work.</li>
              <li><strong>Process payments</strong> — to manage your subscription via Stripe.</li>
              <li><strong>Send transactional emails</strong> — account verification, password resets, and subscription receipts via SendGrid.</li>
              <li><strong>Improve the Service</strong> — anonymised usage analytics help us understand which features work best.</li>
              <li><strong>Error monitoring</strong> — we use Sentry to detect and fix technical errors; error reports may contain request metadata but not resume content.</li>
              <li><strong>Security</strong> — to detect and prevent fraud, abuse, and unauthorised access.</li>
            </ul>
            <p>We do not sell your personal data to third parties. We do not use your resume content to train AI models.</p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>We share data with the following processors only to the extent necessary to operate the Service:</p>
            <table>
              <thead>
                <tr><th>Service</th><th>Purpose</th><th>Data shared</th></tr>
              </thead>
              <tbody>
                <tr><td>OpenAI</td><td>AI content generation</td><td>Resume text &amp; job description you submit</td></tr>
                <tr><td>Stripe</td><td>Payment processing</td><td>Email, subscription status</td></tr>
                <tr><td>Cloudinary</td><td>File storage</td><td>Resume files you upload</td></tr>
                <tr><td>SendGrid</td><td>Transactional email</td><td>Email address, email content</td></tr>
                <tr><td>Google Analytics</td><td>Usage analytics</td><td>Anonymised page-visit data</td></tr>
                <tr><td>Sentry</td><td>Error monitoring</td><td>Request metadata, error stack traces</td></tr>
                <tr><td>Google OAuth</td><td>Social login (optional)</td><td>Name &amp; email from your Google account</td></tr>
                <tr><td>GitHub OAuth</td><td>Social login (optional)</td><td>Name &amp; email from your GitHub account</td></tr>
                <tr><td>Adzuna</td><td>Job search results</td><td>Search query keywords only</td></tr>
              </tbody>
            </table>
            <p>All processors are contractually bound to process data only on our instructions and to maintain appropriate security measures.</p>
          </Section>

          <Section title="5. Data Retention">
            <ul>
              <li>Your account data and resume content are retained for as long as your account is active.</li>
              <li>When you delete your account, your personal data and resume files are permanently deleted within 30 days.</li>
              <li>Anonymised usage statistics and aggregated analytics may be retained indefinitely.</li>
              <li>Billing records may be retained for up to 7 years to comply with financial regulations.</li>
            </ul>
          </Section>

          <Section title="6. Cookies">
            <p>
              We use cookies and similar technologies for authentication and analytics. See our{' '}
              <Link href="/cookies">Cookie Policy</Link> for full details.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li><strong>Access</strong> — request a copy of the personal data we hold about you.</li>
              <li><strong>Correction</strong> — update inaccurate or incomplete data via your account Settings.</li>
              <li><strong>Deletion</strong> — delete your account and all associated data.</li>
              <li><strong>Portability</strong> — export your resume data in a standard format.</li>
              <li><strong>Objection</strong> — object to processing for analytics or marketing purposes.</li>
              <li><strong>Withdraw consent</strong> — where processing is based on consent, you may withdraw it at any time.</li>
            </ul>
            <p>
              To exercise any of these rights, email{' '}
              <a href="mailto:support@jobtools.io">support@jobtools.io</a>. We will respond within 30 days.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We protect your data using industry-standard measures including TLS encryption in transit, hashed
              passwords, and restricted access controls. No method of transmission over the internet is 100% secure;
              we cannot guarantee absolute security, but we take reasonable precautions to protect your information.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              The Service is not directed to children under 16. If we learn that we have collected personal data
              from a child under 16, we will delete it promptly.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by email
              or via an in-app notice. The &ldquo;Effective date&rdquo; at the top reflects the date of the latest revision.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              For privacy questions or to exercise your rights, contact us at{' '}
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
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)] [&_a]:text-blue-600 [&_a]:hover:underline [&_strong]:text-[var(--text)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_th]:text-left [&_th]:font-semibold [&_th]:text-[var(--text)] [&_th]:border-b [&_th]:border-[var(--border)] [&_th]:pb-2 [&_th]:pr-4 [&_td]:py-1.5 [&_td]:pr-4 [&_td]:border-b [&_td]:border-[var(--border)]">
        {children}
      </div>
    </section>
  );
}
