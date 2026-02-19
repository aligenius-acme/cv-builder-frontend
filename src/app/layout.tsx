import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { ThemeProvider, ThemeScript } from '@/lib/theme';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'JobTools AI - AI-Powered Job Search Platform',
  description: 'Complete toolkit for your job search. AI-powered resume customization, ATS optimization, interview prep, job tracking, salary analysis, and more.',
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
        <ThemeScript />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <GoogleAnalytics />
          {children}
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
        </ThemeProvider>
      </body>
    </html>
  );
}
