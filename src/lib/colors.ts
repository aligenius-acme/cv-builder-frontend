// Centralized color utilities for consistent styling across the app

// Score-based colors (0-100 scale)
export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-600';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-100';
  if (score >= 60) return 'bg-blue-100';
  if (score >= 40) return 'bg-amber-100';
  return 'bg-red-100';
}

export function getScoreGradient(score: number): string {
  if (score >= 80) return 'from-emerald-500 to-green-500';
  if (score >= 60) return 'from-blue-500 to-indigo-500';
  if (score >= 40) return 'from-amber-500 to-orange-500';
  return 'from-red-500 to-rose-500';
}

// Severity/Priority colors
export type Severity = 'high' | 'medium' | 'low';

export function getSeverityColor(severity: Severity | string): string {
  switch (severity.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'text-red-600';
    case 'medium':
    case 'moderate':
      return 'text-amber-600';
    case 'low':
    case 'minor':
      return 'text-green-600';
    default:
      return 'text-slate-600';
  }
}

export function getSeverityBgColor(severity: Severity | string): string {
  switch (severity.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'bg-red-100';
    case 'medium':
    case 'moderate':
      return 'bg-amber-100';
    case 'low':
    case 'minor':
      return 'bg-green-100';
    default:
      return 'bg-slate-100';
  }
}

// Health status colors
export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export function getHealthColor(health: HealthStatus | string): string {
  switch (health.toLowerCase()) {
    case 'excellent':
      return 'text-emerald-600';
    case 'good':
      return 'text-blue-600';
    case 'fair':
      return 'text-amber-600';
    case 'poor':
      return 'text-orange-600';
    case 'critical':
      return 'text-red-600';
    default:
      return 'text-slate-600';
  }
}

export function getHealthBgColor(health: HealthStatus | string): string {
  switch (health.toLowerCase()) {
    case 'excellent':
      return 'bg-emerald-100';
    case 'good':
      return 'bg-blue-100';
    case 'fair':
      return 'bg-amber-100';
    case 'poor':
      return 'bg-orange-100';
    case 'critical':
      return 'bg-red-100';
    default:
      return 'bg-slate-100';
  }
}

// Difficulty level colors
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export function getDifficultyColor(difficulty: DifficultyLevel | string): string {
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'bg-green-100 text-green-700';
    case 'medium':
      return 'bg-amber-100 text-amber-700';
    case 'hard':
      return 'bg-red-100 text-red-700';
    case 'expert':
      return 'bg-purple-100 text-purple-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

// Experience level colors
export type ExperienceLevel = 'Entry Level' | 'Mid Level' | 'Senior Level' | 'Executive';

export const experienceLevelColors: Record<string, string> = {
  'Entry Level': 'bg-green-100 text-green-700',
  'Mid Level': 'bg-blue-100 text-blue-700',
  'Senior Level': 'bg-purple-100 text-purple-700',
  Executive: 'bg-amber-100 text-amber-700',
};

export function getExperienceLevelColor(level: string): string {
  return experienceLevelColors[level] || 'bg-slate-100 text-slate-600';
}

// Category colors for interview prep, skills, etc.
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    technical: 'bg-blue-100 text-blue-700',
    behavioral: 'bg-purple-100 text-purple-700',
    situational: 'bg-amber-100 text-amber-700',
    'case study': 'bg-emerald-100 text-emerald-700',
    'role-specific': 'bg-pink-100 text-pink-700',
  };
  return colors[category.toLowerCase()] || 'bg-slate-100 text-slate-700';
}

// Job application status config
export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'SCREENING'
  | 'INTERVIEWING'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
}

export const JOB_STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  WISHLIST: { label: 'Wishlist', color: 'text-slate-600', bgColor: 'bg-slate-100' },
  APPLIED: { label: 'Applied', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  SCREENING: { label: 'Screening', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  INTERVIEWING: { label: 'Interviewing', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  OFFER: { label: 'Offer', color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  REJECTED: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
  WITHDRAWN: { label: 'Withdrawn', color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

// A/B Test status config
export type ABTestStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';

export const AB_TEST_STATUS_CONFIG: Record<ABTestStatus, { color: string; label: string }> = {
  DRAFT: { color: 'bg-slate-100 text-slate-700', label: 'Draft' },
  RUNNING: { color: 'bg-green-100 text-green-700', label: 'Running' },
  PAUSED: { color: 'bg-amber-100 text-amber-700', label: 'Paused' },
  COMPLETED: { color: 'bg-blue-100 text-blue-700', label: 'Completed' },
};

// Match verdict colors
export type MatchVerdict = 'Strong Match' | 'Good Match' | 'Moderate Match' | 'Weak Match';

export function getVerdictColor(verdict: MatchVerdict | string): string {
  switch (verdict) {
    case 'Strong Match':
      return 'text-emerald-600';
    case 'Good Match':
      return 'text-blue-600';
    case 'Moderate Match':
      return 'text-amber-600';
    case 'Weak Match':
      return 'text-red-600';
    default:
      return 'text-slate-600';
  }
}

export function getVerdictBgColor(verdict: MatchVerdict | string): string {
  switch (verdict) {
    case 'Strong Match':
      return 'bg-emerald-100';
    case 'Good Match':
      return 'bg-blue-100';
    case 'Moderate Match':
      return 'bg-amber-100';
    case 'Weak Match':
      return 'bg-red-100';
    default:
      return 'bg-slate-100';
  }
}
