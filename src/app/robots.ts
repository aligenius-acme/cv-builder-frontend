import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/privacy', '/terms', '/cookies'],
        disallow: [
          '/dashboard/',
          '/resumes/',
          '/cover-letters/',
          '/jobs/',
          '/job-tracker/',
          '/interview-prep/',
          '/skill-gap/',
          '/salary-analyzer/',
          '/resume-builder/',
          '/resume-examples/',
          '/ai-tools/',
          '/settings/',
          '/out-of-credits',
          '/admin/',
          '/api/',
          '/auth/',
          '/shared/',
        ],
      },
    ],
    sitemap: 'https://jobtools.io/sitemap.xml',
  };
}
