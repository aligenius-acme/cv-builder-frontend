import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie Policy for JobTools AI. Learn exactly how and why we use cookies.',
  alternates: { canonical: 'https://jobtools.io/cookies' },
  openGraph: {
    title: 'Cookie Policy — JobTools AI',
    description: 'Learn exactly how and why we use cookies on JobTools AI.',
    url: 'https://jobtools.io/cookies',
  },
};

const EFFECTIVE_DATE = 'March 17, 2026';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <nav className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">Job Tools</Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/terms" className="text-[var(--text-secondary)] hover:text-blue-600 transition-colors">Terms</Link>
            <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-blue-600 transition-colors">Privacy</Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-14">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Cookie Policy</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose-legal">

          <Section title="1. What Are Cookies?">
            <p>
              Cookies are small text files placed on your device by a website. We also use browser{' '}
              <strong>local storage</strong> — a similar mechanism that stores data locally on your device but
              is not sent to our servers on every request. This policy covers both.
            </p>
          </Section>

          <Section title="2. Strictly Necessary — Cookies">
            <p>
              These are required for the Service to work correctly. You cannot opt out without losing core
              functionality such as staying signed in.
            </p>
            <table>
              <thead>
                <tr><th>Cookie name</th><th>Purpose</th><th>Duration</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>auth_present</code></td>
                  <td>
                    A lightweight flag (contains no personal data) that tells our server-side routing
                    whether you have an active session. The actual authentication token is stored only
                    in your browser&apos;s local storage, not in a cookie.
                  </td>
                  <td>7 days</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="3. Strictly Necessary — Local Storage">
            <p>
              The following items are stored in your browser&apos;s local storage. They never leave your device
              except as part of normal API requests to our servers.
            </p>
            <table>
              <thead>
                <tr><th>Key</th><th>Purpose</th><th>Duration</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>token</code></td>
                  <td>
                    Your JSON Web Token (JWT) authentication credential. Used to authorise API requests
                    without requiring you to log in on every page. The token expires after 7 days.
                  </td>
                  <td>7 days</td>
                </tr>
                <tr>
                  <td><code>theme</code></td>
                  <td>
                    Stores your light/dark mode preference so the correct theme loads instantly on your
                    next visit without a flash of the wrong colour scheme.
                  </td>
                  <td>Persistent (until cleared)</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="4. Analytics Cookies (Google Analytics)">
            <p>
              We use Google Analytics 4 to understand how visitors interact with the site — for example,
              which features are used most and where users encounter errors. The data is aggregated and
              does not identify you personally.
            </p>
            <table>
              <thead>
                <tr><th>Cookie name</th><th>Purpose</th><th>Duration</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>_ga</code></td>
                  <td>Registers a unique identifier used to generate statistical data on how you use the site.</td>
                  <td>2 years</td>
                </tr>
                <tr>
                  <td><code>_ga_*</code></td>
                  <td>Used by Google Analytics 4 to persist session state across page views.</td>
                  <td>2 years</td>
                </tr>
              </tbody>
            </table>
            <p>
              Google Analytics is operated by Google LLC and is subject to{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google&apos;s Privacy Policy
              </a>. You can opt out of Google Analytics tracking across all websites by installing the{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                Google Analytics Opt-out Browser Add-on
              </a>.
            </p>
          </Section>

          <Section title="5. Third-Party Authentication Cookies">
            <p>
              If you choose to sign in using Google or GitHub OAuth, those providers set their own cookies
              on their respective domains (<code>accounts.google.com</code>,{' '}
              <code>github.com</code>) as part of their authentication process. We have no control over
              these cookies. Please refer to{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google&apos;s Privacy Policy
              </a>{' '}
              and{' '}
              <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer">
                GitHub&apos;s Privacy Statement
              </a>{' '}
              for details.
            </p>
          </Section>

          <Section title="6. What We Do Not Use">
            <p>We do not use:</p>
            <ul>
              <li>Advertising or tracking cookies from ad networks.</li>
              <li>Cross-site tracking technologies.</li>
              <li>Cookies that share your data with data brokers.</li>
              <li>Fingerprinting or other persistent device identification techniques.</li>
            </ul>
          </Section>

          <Section title="7. Managing Cookies and Local Storage">
            <p>
              <strong>Cookies:</strong> You can view, block, or delete cookies through your browser settings.
              Note that blocking the <code>auth_present</code> cookie will not prevent you from using the
              Service (your session is maintained via local storage), but may affect server-side route
              protection behaviour.
            </p>
            <p>
              <strong>Local storage:</strong> You can clear local storage through your browser&apos;s developer
              tools (Application → Local Storage → jobtools.io → Clear). This will sign you out and reset
              your theme preference.
            </p>
            <p>Guidance for common browsers:</p>
            <ul>
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
                  Google Chrome — Cookies &amp; site data
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" target="_blank" rel="noopener noreferrer">
                  Mozilla Firefox — Clear cookies and site data
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
                  Apple Safari — Manage cookies
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">
                  Microsoft Edge — Delete and manage cookies
                </a>
              </li>
            </ul>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>
              We will update this policy if we add or remove cookies or local storage keys. The effective
              date at the top of this page reflects the date of the most recent revision.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions about this policy? Email{' '}
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
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)] [&_a]:text-blue-600 [&_a]:hover:underline [&_strong]:text-[var(--text)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_code]:font-mono [&_code]:text-xs [&_code]:bg-[var(--surface)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_th]:text-left [&_th]:font-semibold [&_th]:text-[var(--text)] [&_th]:border-b [&_th]:border-[var(--border)] [&_th]:pb-2 [&_th]:pr-4 [&_td]:py-2 [&_td]:pr-4 [&_td]:border-b [&_td]:border-[var(--border)] [&_td]:align-top">
        {children}
      </div>
    </section>
  );
}
