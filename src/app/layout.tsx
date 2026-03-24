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
  metadataBase: new URL('https://jobtools.io'),
  title: {
    default: 'JobTools AI — AI-Powered Resume & Job Search Platform',
    template: '%s | JobTools AI',
  },
  description: 'AI-powered resume tailoring that helps you pass ATS filters, match job description keywords, and land more interviews. Generate cover letters, analyse skill gaps, and track applications — all in one place.',
  keywords: ['resume builder', 'AI resume', 'ATS resume', 'job search', 'cover letter generator', 'skill gap analysis', 'job tracker', 'interview prep', 'salary analyzer', 'CV builder'],
  authors: [{ name: 'JobTools AI', url: 'https://jobtools.io' }],
  creator: 'JobTools AI',
  publisher: 'JobTools AI',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jobtools.io',
    siteName: 'JobTools AI',
    title: 'JobTools AI — AI-Powered Resume & Job Search Platform',
    description: 'AI-powered resume tailoring that helps you pass ATS filters, match job description keywords, and land more interviews.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'JobTools AI — AI-Powered Resume & Job Search Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobTools AI — AI-Powered Resume & Job Search Platform',
    description: 'AI-powered resume tailoring that helps you pass ATS filters, match job description keywords, and land more interviews.',
    images: ['/opengraph-image'],
    creator: '@jobtoolsai',
  },
  alternates: {
    canonical: 'https://jobtools.io',
  },
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
