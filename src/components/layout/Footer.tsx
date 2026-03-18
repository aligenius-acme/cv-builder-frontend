'use client';

import Link from 'next/link';
import { useAppSettings } from '@/contexts/AppSettingsContext';
import { useAuthStore } from '@/store/auth';

export default function Footer() {
  const year = new Date().getFullYear();
  const { proSubscriptionEnabled } = useAppSettings();
  const { isAuthenticated } = useAuthStore();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className={`grid grid-cols-1 gap-8 mb-8 ${(!isAuthenticated || proSubscriptionEnabled) ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {/* Brand */}
          <div>
            <span className="text-lg font-bold text-blue-600">Job Tools</span>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              AI-powered tools to help you land your next job faster — resume tailoring, ATS analysis, cover letters, and more.
            </p>
          </div>

          {/* Product — only shown to guests, or to authenticated users when pricing is enabled */}
          {(!isAuthenticated || proSubscriptionEnabled) && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                {proSubscriptionEnabled && (
                  <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
                )}
                {!isAuthenticated && (
                  <>
                    <li><Link href="/register" className="hover:text-blue-600 transition-colors">Get started free</Link></li>
                    <li><Link href="/login" className="hover:text-blue-600 transition-colors">Sign in</Link></li>
                  </>
                )}
              </ul>
            </div>
          )}

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-blue-600 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-[var(--text-secondary)]">
          <span>&copy; {year} Job Tools. All rights reserved.</span>
          <span>Contact: <a href="mailto:support@jobtools.io" className="hover:text-blue-600 transition-colors">support@jobtools.io</a></span>
        </div>
      </div>
    </footer>
  );
}
