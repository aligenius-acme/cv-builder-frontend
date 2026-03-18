import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeScript } from '@/lib/theme';
import Providers from '@/components/Providers';
import CookieBanner from '@/components/CookieBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'JobTools AI - AI-Powered Job Search Platform',
  description: 'AI-powered resume tailoring platform that helps job seekers pass ATS filters, match job description keywords, and land more interviews. Generate cover letters, analyse skill gaps, and track job applications — all in one place.',
  keywords: ['job search', 'resume', 'cv', 'ats', 'interview prep', 'ai', 'career tools', 'job application', 'job tracker', 'salary analyzer'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="impact-site-verification" content="b87ad12d-b12f-4e19-9746-c0d9026edced" />
        <ThemeScript />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <CookieBanner />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--surface-overlay)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
