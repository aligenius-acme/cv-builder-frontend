import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const securityHeaders = [
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      isDev
        ? "img-src 'self' data: blob: http://localhost:3001 https://res.cloudinary.com https://www.google-analytics.com https://*.koyeb.app"
        : "img-src 'self' data: blob: https://res.cloudinary.com https://www.google-analytics.com https://*.koyeb.app",
      "font-src 'self' data:",
      isDev
        ? "connect-src 'self' http://localhost:3001 ws://localhost:3001 https://www.google-analytics.com https://www.googletagmanager.com"
        : "connect-src 'self' https://*.koyeb.app https://www.google-analytics.com https://www.googletagmanager.com",
      isDev ? "frame-src blob: http://localhost:3001" : "frame-src blob:",
      "object-src 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.koyeb.app',
        pathname: '/**',
      },
    ],
  },

  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Security headers on all routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
