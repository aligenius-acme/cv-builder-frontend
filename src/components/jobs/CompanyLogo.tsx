'use client';

import { useState } from 'react';

interface CompanyLogoProps {
  company: string;
  size?: number;
}

export default function CompanyLogo({ company, size = 48 }: CompanyLogoProps) {
  const [imgError, setImgError] = useState(false);
  const initials = company.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  // Common company domain mappings
  const domains: Record<string, string> = {
    'google': 'google.com', 'microsoft': 'microsoft.com', 'apple': 'apple.com',
    'amazon': 'amazon.com', 'meta': 'meta.com', 'netflix': 'netflix.com',
    'salesforce': 'salesforce.com', 'oracle': 'oracle.com', 'ibm': 'ibm.com',
    'adobe': 'adobe.com', 'spotify': 'spotify.com', 'uber': 'uber.com',
    'stripe': 'stripe.com', 'shopify': 'shopify.com', 'slack': 'slack.com',
    'github': 'github.com', 'atlassian': 'atlassian.com', 'figma': 'figma.com',
    'boeing': 'boeing.com', 'intel': 'intel.com', 'nvidia': 'nvidia.com',
  };

  const normalized = company.toLowerCase().trim();
  let domain = domains[normalized];
  if (!domain) {
    for (const [key, val] of Object.entries(domains)) {
      if (normalized.includes(key)) { domain = val; break; }
    }
  }
  if (!domain) {
    const cleaned = normalized.replace(/\s+(inc\.?|llc\.?|ltd\.?|corp\.?)$/i, '').replace(/[^a-z0-9]/g, '');
    if (cleaned.length > 2) domain = `${cleaned}.com`;
  }

  if (imgError || !domain) {
    return (
      <div
        className="rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm"
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}?size=${size * 2}`}
      alt={company}
      className="rounded-xl object-contain flex-shrink-0 bg-white border border-slate-100 shadow-sm"
      style={{ width: size, height: size }}
      onError={() => setImgError(true)}
    />
  );
}
