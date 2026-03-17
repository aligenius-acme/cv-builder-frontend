import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Cookie Policy — Job Tools',
  description: 'Cookie Policy for Job Tools. Learn how and why we use cookies.',
};

const EFFECTIVE_DATE = 'March 17, 2026';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Nav */}
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
              Cookies are small text files placed on your device by websites you visit. They are widely used to
              make websites work, to remember your preferences, and to provide analytics information to site owners.
              We also use similar technologies such as local storage for the same purposes.
            </p>
          </Section>

          <Section title="2. Cookies We Use">

            <p><strong>Strictly necessary</strong></p>
            <p>These cookies are required for the Service to function. You cannot opt out of them.</p>
            <table>
              <thead>
                <tr><th>Name / key</th><th>Purpose</th><th>Duration</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>auth_token</code></td>
                  <td>Stores your JWT authentication token to keep you signed in.</td>
                  <td>7 days</td>
                </tr>
                <tr>
                  <td><code>theme</code></td>
                  <td>Remembers your light/dark mode preference.</td>
                  <td>1 year</td>
                </tr>
              </tbody>
            </table>

            <p><strong>Analytics</strong></p>
            <p>
              We use Google Analytics to understand how visitors use the site. The data is anonymised and
              aggregated; it does not personally identify you.
            </p>
            <table>
              <thead>
                <tr><th>Name</th><th>Purpose</th><th>Duration</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>_ga</code></td>
                  <td>Distinguishes unique users for Google Analytics.</td>
                  <td>2 years</td>
                </tr>
                <tr>
                  <td><code>_ga_*</code></td>
                  <td>Maintains session state for Google Analytics 4.</td>
                  <td>2 years</td>
                </tr>
              </tbody>
            </table>
            <p>
              Google Analytics is operated by Google LLC. You can opt out globally at{' '}
              <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
                tools.google.com/dlpage/gaoptout
              </a>.
            </p>

            <p><strong>Third-party (functional)</strong></p>
            <p>
              When you choose to sign in via Google or GitHub OAuth, those providers may set their own cookies on
              their domains as part of their authentication flow. We do not control those cookies.
            </p>

          </Section>

          <Section title="3. Local Storage">
            <p>
              In addition to cookies, we store some data in your browser&apos;s local storage, including your
              authentication token and UI preferences. This data stays on your device and is not sent to any
              third party.
            </p>
          </Section>

          <Section title="4. Managing Cookies">
            <p>
              You can control and delete cookies through your browser settings. Deleting or blocking strictly
              necessary cookies will prevent you from signing in or using most features of the Service. For
              guidance on managing cookies in common browsers:
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>
          </Section>

          <Section title="5. Changes to This Policy">
            <p>
              We may update this Cookie Policy to reflect changes in the cookies we use or for legal reasons. The
              &ldquo;Effective date&rdquo; at the top shows when the policy was last revised. We encourage you to
              review this page periodically.
            </p>
          </Section>

          <Section title="6. Contact">
            <p>
              Questions about cookies? Email us at{' '}
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
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)] [&_a]:text-blue-600 [&_a]:hover:underline [&_strong]:text-[var(--text)] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_code]:font-mono [&_code]:text-xs [&_code]:bg-[var(--surface)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_th]:text-left [&_th]:font-semibold [&_th]:text-[var(--text)] [&_th]:border-b [&_th]:border-[var(--border)] [&_th]:pb-2 [&_th]:pr-4 [&_td]:py-1.5 [&_td]:pr-4 [&_td]:border-b [&_td]:border-[var(--border)]">
        {children}
      </div>
    </section>
  );
}
