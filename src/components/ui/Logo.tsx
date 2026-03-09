'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'full';
  className?: string;
}

const sizes = {
  sm: { icon: 32, fontSize: 18, tagSize: 10 },
  md: { icon: 40, fontSize: 22, tagSize: 11 },
  lg: { icon: 56, fontSize: 30, tagSize: 13 },
};

export default function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const s = sizes[size];

  const icon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s.icon}
      height={s.icon}
      viewBox="0 0 120 120"
      aria-hidden="true"
      className="flex-shrink-0"
    >
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
      {/* Briefcase body */}
      <rect x="22" y="52" width="76" height="52" rx="7" fill="none" stroke="white" strokeWidth="6" strokeLinejoin="round" />
      {/* Briefcase handle */}
      <path d="M42 52 L42 42 Q42 33 52 33 L68 33 Q78 33 78 42 L78 52" fill="none" stroke="white" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
      {/* Clasp line */}
      <line x1="22" y1="75" x2="98" y2="75" stroke="white" strokeWidth="4" opacity="0.35" />
      {/* Upward arrow */}
      <line x1="60" y1="86" x2="60" y2="63" stroke="url(#jt-arrow)" strokeWidth="5" strokeLinecap="round" />
      <polyline points="51,72 60,61 69,72" fill="none" stroke="url(#jt-arrow)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Sparkle */}
      <g transform="translate(91,28)" opacity="0.9">
        <line x1="0" y1="-7" x2="0" y2="7" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="-7" y1="0" x2="7" y2="0" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="-5" y1="-5" x2="5" y2="5" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="5" y1="-5" x2="-5" y2="5" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" />
      </g>
      {/* Dot accent */}
      <circle cx="29" cy="28" r="4" fill="#60a5fa" opacity="0.7" />
    </svg>
  );

  if (variant === 'icon') return <span className={className}>{icon}</span>;

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {icon}
      <span style={{ fontSize: s.fontSize, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>
        <span className="text-[var(--text)]">Job</span>
        <span className="text-blue-600">Tools</span>
      </span>
    </span>
  );
}
