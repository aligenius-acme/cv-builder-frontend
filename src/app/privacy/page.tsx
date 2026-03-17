import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — Job Tools',
  description: 'Privacy Policy for Job Tools. Learn exactly what data we collect, how we use it, and your rights.',
};

const EFFECTIVE_DATE = 'March 17, 2026';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
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
              Job Tools operates the website <a href="https://www.jobtools.io">www.jobtools.io</a> and
              provides AI-assisted career tools including resume building, ATS analysis, cover letter
              generation, interview preparation, and job search. This Privacy Policy explains what personal
              data we collect when you use the Service, how we use it, who we share it with, and what
              rights you have.
            </p>
            <p>
              For privacy enquiries, contact us at{' '}
              <a href="mailto:support@jobtools.io">support@jobtools.io</a>.
            </p>
          </Section>

          <Section title="2. Data We Collect">

            <p><strong>Account data</strong> — collected when you register:</p>
            <ul>
              <li>Email address (required)</li>
              <li>First name and last name (optional)</li>
              <li>Hashed password — we never store your password in plain text</li>
              <li>If you sign in via Google or GitHub OAuth, we receive only the name and email address
                that your provider shares with us; we do not receive your Google or GitHub password</li>
            </ul>

            <p><strong>Professional and resume data</strong> — created or uploaded by you:</p>
            <ul>
              <li>Resume files you upload (stored via Cloudinary)</li>
              <li>Resume content you enter or edit: work experience, education history, skills,
                certifications, projects, awards, volunteer work, contact details (phone, LinkedIn,
                GitHub, portfolio URLs)</li>
              <li>Cover letters you generate or write</li>
              <li>Job applications you record in the tracker (company name, role, status, notes)</li>
              <li>Job descriptions you paste in for ATS analysis or tailoring</li>
            </ul>

            <p><strong>Usage data</strong> — collected automatically:</p>
            <ul>
              <li>AI credits used per feature and per session</li>
              <li>Features accessed and frequency of use (anonymised for analytics)</li>
              <li>Server log data: IP address, browser type and version, operating system, referring
                URL, pages visited, and timestamps</li>
            </ul>

            <p><strong>Billing data</strong> — when you subscribe to Pro:</p>
            <ul>
              <li>Subscription plan and status</li>
              <li>Stripe Customer ID (a reference token, not your card details)</li>
              <li>We do not store your card number, expiry date, or CVV — these are handled entirely
                by Stripe</li>
            </ul>

          </Section>

          <Section title="3. How We Use Your Data">
            <table>
              <thead>
                <tr><th>Purpose</th><th>Data used</th><th>Legal basis</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>Create and manage your account</td>
                  <td>Email, name, hashed password</td>
                  <td>Contract (providing the Service)</td>
                </tr>
                <tr>
                  <td>Generate AI-assisted content</td>
                  <td>Resume content and job descriptions you submit</td>
                  <td>Contract</td>
                </tr>
                <tr>
                  <td>Store and retrieve your resumes and letters</td>
                  <td>All resume and cover letter data</td>
                  <td>Contract</td>
                </tr>
                <tr>
                  <td>Process payments and manage subscriptions</td>
                  <td>Email, Stripe Customer ID</td>
                  <td>Contract; legal obligation</td>
                </tr>
                <tr>
                  <td>Send transactional emails (verification, password reset, billing)</td>
                  <td>Email address, name</td>
                  <td>Contract; legal obligation</td>
                </tr>
                <tr>
                  <td>Analytics — understand feature usage and improve the Service</td>
                  <td>Anonymised usage data, page views</td>
                  <td>Legitimate interest</td>
                </tr>
                <tr>
                  <td>Error monitoring and debugging</td>
                  <td>Request metadata, error stack traces (no resume content)</td>
                  <td>Legitimate interest</td>
                </tr>
                <tr>
                  <td>Security, fraud prevention, and abuse detection</td>
                  <td>IP address, log data, account activity</td>
                  <td>Legitimate interest; legal obligation</td>
                </tr>
              </tbody>
            </table>
            <p>
              <strong>We do not sell your personal data.</strong> We do not use your resume content or
              personal data to train AI models. We do not send marketing emails unless you have explicitly
              opted in.
            </p>
          </Section>

          <Section title="4. Data Processors (Third Parties We Share Data With)">
            <p>
              We share data with the following service providers only to the extent necessary to operate
              the Service. Each is contractually bound to process data only on our instructions and to
              maintain appropriate technical and organisational security measures.
            </p>
            <table>
              <thead>
                <tr><th>Provider</th><th>Purpose</th><th>Data shared</th><th>Privacy policy</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>OpenAI (USA)</td>
                  <td>AI content generation</td>
                  <td>Resume text and job descriptions you submit for AI processing</td>
                  <td><a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">openai.com</a></td>
                </tr>
                <tr>
                  <td>Stripe (USA)</td>
                  <td>Payment processing</td>
                  <td>Email address, subscription details</td>
                  <td><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com</a></td>
                </tr>
                <tr>
                  <td>Cloudinary (USA)</td>
                  <td>Resume file storage</td>
                  <td>Resume files you upload</td>
                  <td><a href="https://cloudinary.com/privacy" target="_blank" rel="noopener noreferrer">cloudinary.com</a></td>
                </tr>
                <tr>
                  <td>SendGrid / Twilio (USA)</td>
                  <td>Transactional email delivery</td>
                  <td>Email address, email content (verification, password reset, billing)</td>
                  <td><a href="https://www.twilio.com/en-us/legal/privacy" target="_blank" rel="noopener noreferrer">twilio.com</a></td>
                </tr>
                <tr>
                  <td>Google Analytics (USA)</td>
                  <td>Usage analytics</td>
                  <td>Anonymised page-view and event data via browser cookies</td>
                  <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">google.com</a></td>
                </tr>
                <tr>
                  <td>Sentry (USA)</td>
                  <td>Error monitoring</td>
                  <td>Request metadata and error stack traces (no resume content)</td>
                  <td><a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer">sentry.io</a></td>
                </tr>
                <tr>
                  <td>Google OAuth (USA)</td>
                  <td>Social sign-in (optional)</td>
                  <td>Name and email from your Google account, only if you choose Google login</td>
                  <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">google.com</a></td>
                </tr>
                <tr>
                  <td>GitHub OAuth (USA)</td>
                  <td>Social sign-in (optional)</td>
                  <td>Name and email from your GitHub account, only if you choose GitHub login</td>
                  <td><a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer">github.com</a></td>
                </tr>
                <tr>
                  <td>Adzuna (UK/USA)</td>
                  <td>Job listing search</td>
                  <td>Search query keywords only (no personal identifiers)</td>
                  <td><a href="https://www.adzuna.com/privacy" target="_blank" rel="noopener noreferrer">adzuna.com</a></td>
                </tr>
                <tr>
                  <td>Neon / Koyeb / Upstash</td>
                  <td>Database, hosting, and caching infrastructure</td>
                  <td>All data stored in the Service, processed on our behalf under data processing agreements</td>
                  <td>Infrastructure providers</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="5. Data Retention">
            <ul>
              <li><strong>Active accounts:</strong> we retain your account data and resume content for as long as your account exists.</li>
              <li><strong>Deleted accounts:</strong> when you delete your account, your personal data and resume files are permanently deleted within 30 days. Anonymised usage data (e.g. aggregate feature counts) may be retained indefinitely.</li>
              <li><strong>Billing records:</strong> may be retained for up to 7 years to satisfy financial and tax regulations.</li>
              <li><strong>Server logs:</strong> retained for up to 90 days for security and debugging purposes.</li>
            </ul>
          </Section>

          <Section title="6. Cookies and Local Storage">
            <p>
              We use a small number of cookies and browser local storage items strictly for authentication
              and analytics. See our <Link href="/cookies">Cookie Policy</Link> for full details including
              specific names, purposes, and durations.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>
              Depending on where you are located, you may have some or all of the following rights
              regarding your personal data:
            </p>
            <ul>
              <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> update inaccurate or incomplete data — most account data can be updated directly in Settings.</li>
              <li><strong>Deletion:</strong> delete your account and all associated personal data via Settings → Account, or by emailing us.</li>
              <li><strong>Data portability:</strong> export your resume content in a standard format.</li>
              <li><strong>Objection:</strong> object to processing based on legitimate interest (e.g. analytics).</li>
              <li><strong>Restriction:</strong> request that we restrict processing of your data in certain circumstances.</li>
              <li><strong>Withdraw consent:</strong> where processing is based on your consent, you may withdraw it at any time without affecting the lawfulness of prior processing.</li>
            </ul>
            <p>
              To exercise any right, email <a href="mailto:support@jobtools.io">support@jobtools.io</a> with
              &ldquo;Privacy Request&rdquo; in the subject line. We will respond within 30 days. We will not
              discriminate against you for exercising any privacy right.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We protect your data using industry-standard measures:
            </p>
            <ul>
              <li>All data in transit is encrypted using TLS (HTTPS).</li>
              <li>Passwords are hashed using bcrypt with a cost factor of 12 — they are never stored in plain text.</li>
              <li>Authentication tokens are signed JWTs stored in browser local storage, not accessible to other websites.</li>
              <li>Access to production systems is restricted to authorised personnel only.</li>
              <li>We use Sentry for real-time error monitoring to detect and respond to issues promptly.</li>
            </ul>
            <p>
              No method of internet transmission is 100% secure. If you discover a security vulnerability,
              please report it responsibly to <a href="mailto:support@jobtools.io">support@jobtools.io</a>.
            </p>
          </Section>

          <Section title="9. Children's Privacy">
            <p>
              The Service is not directed to children under the age of 16. We do not knowingly collect
              personal data from anyone under 16. If you believe a child under 16 has provided us with
              personal data, please contact us and we will delete it promptly.
            </p>
          </Section>

          <Section title="10. International Data Transfers">
            <p>
              Job Tools uses service providers based in the United States (OpenAI, Stripe, Cloudinary,
              SendGrid, Google, GitHub, Sentry). By using the Service, you acknowledge that your data may
              be transferred to and processed in the United States and other countries whose data protection
              laws may differ from those in your country. Where required, we rely on appropriate safeguards
              such as Standard Contractual Clauses for such transfers.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We will notify you of material changes to this Privacy Policy by email to your registered
              address and/or by a notice within the Service at least 14 days before the changes take effect.
              The effective date at the top of this page reflects the date of the most recent revision.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              For any privacy question or to exercise your rights, email{' '}
              <a href="mailto:support@jobtools.io">support@jobtools.io</a> with &ldquo;Privacy Request&rdquo;
              in the subject line. We aim to respond within 30 days.
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
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)] [&_a]:text-blue-600 [&_a]:hover:underline [&_strong]:text-[var(--text)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_th]:text-left [&_th]:font-semibold [&_th]:text-[var(--text)] [&_th]:border-b [&_th]:border-[var(--border)] [&_th]:pb-2 [&_th]:pr-3 [&_td]:py-2 [&_td]:pr-3 [&_td]:border-b [&_td]:border-[var(--border)] [&_td]:align-top">
        {children}
      </div>
    </section>
  );
}
