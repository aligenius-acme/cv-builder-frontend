import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'JobTools AI — AI-Powered Resume & Job Search Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo / brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width={56} height={56} viewBox="0 0 120 120">
            <defs>
              <linearGradient id="jt-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <linearGradient id="jt-arrow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#93c5fd" />
              </linearGradient>
            </defs>
            <rect width="120" height="120" rx="24" fill="url(#jt-bg)" />
            <rect x="22" y="52" width="76" height="52" rx="7" fill="none" stroke="white" strokeWidth="6" strokeLinejoin="round" />
            <path d="M42 52 L42 42 Q42 33 52 33 L68 33 Q78 33 78 42 L78 52" fill="none" stroke="white" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
            <line x1="22" y1="75" x2="98" y2="75" stroke="white" strokeWidth="4" opacity="0.35" />
            <line x1="60" y1="86" x2="60" y2="63" stroke="url(#jt-arrow)" strokeWidth="5" strokeLinecap="round" />
            <polyline points="51,72 60,61 69,72" fill="none" stroke="url(#jt-arrow)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
            <g transform="translate(91,28)" opacity="0.9">
              <line x1="0" y1="-7" x2="0" y2="7" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="-7" y1="0" x2="7" y2="0" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            <circle cx="29" cy="28" r="4" fill="#60a5fa" opacity="0.7" />
          </svg>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#f8fafc' }}>JobTools AI</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '60px',
            fontWeight: 800,
            color: '#f8fafc',
            lineHeight: 1.1,
            marginBottom: '24px',
            maxWidth: '900px',
          }}
        >
          Land More Interviews with{' '}
          <span style={{ color: '#3b82f6' }}>AI-Powered</span> Resumes
        </div>

        {/* Sub-text */}
        <div style={{ fontSize: '26px', color: '#94a3b8', maxWidth: '820px', lineHeight: 1.4 }}>
          Tailor your CV, beat ATS filters, generate cover letters &amp; track every application — all in one place.
        </div>

        {/* Bottom domain */}
        <div style={{ position: 'absolute', bottom: '60px', right: '80px', fontSize: '22px', color: '#475569' }}>
          jobtools.io
        </div>
      </div>
    ),
    { ...size }
  );
}
