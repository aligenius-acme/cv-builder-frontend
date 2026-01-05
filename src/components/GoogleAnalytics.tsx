'use client';

import Script from 'next/script';

// Google Analytics 4 Component
// FREE - Unlimited usage

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Track custom events
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== 'undefined' && (window as any).gtag && GA_MEASUREMENT_ID) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Track page views (for SPA navigation)
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag && GA_MEASUREMENT_ID) {
    (window as any).gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

// Predefined events for the app
export const analytics = {
  // Auth events
  signUp: (method: string) => trackEvent('sign_up', 'auth', method),
  login: (method: string) => trackEvent('login', 'auth', method),
  logout: () => trackEvent('logout', 'auth'),

  // Resume events
  resumeUpload: () => trackEvent('upload', 'resume'),
  resumeCustomize: (jobTitle?: string) => trackEvent('customize', 'resume', jobTitle),
  resumeDownload: (format: string) => trackEvent('download', 'resume', format),
  resumeShare: () => trackEvent('share', 'resume'),

  // Cover letter events
  coverLetterGenerate: () => trackEvent('generate', 'cover_letter'),
  coverLetterDownload: (format: string) => trackEvent('download', 'cover_letter', format),

  // Job events
  jobSearch: (keywords?: string) => trackEvent('search', 'jobs', keywords),
  jobSave: () => trackEvent('save', 'jobs'),
  jobApply: () => trackEvent('apply', 'jobs'),
  jobTrack: (status: string) => trackEvent('track', 'jobs', status),

  // Feature usage
  atsScore: () => trackEvent('use', 'feature', 'ats_score'),
  grammarCheck: () => trackEvent('use', 'feature', 'grammar_check'),
  interviewPrep: () => trackEvent('use', 'feature', 'interview_prep'),
  skillGap: () => trackEvent('use', 'feature', 'skill_gap'),
  abTest: () => trackEvent('use', 'feature', 'ab_test'),

  // Subscription events
  viewPricing: () => trackEvent('view', 'pricing'),
  startCheckout: (plan: string) => trackEvent('begin_checkout', 'subscription', plan),
  completePurchase: (plan: string, value: number) => trackEvent('purchase', 'subscription', plan, value),
};
