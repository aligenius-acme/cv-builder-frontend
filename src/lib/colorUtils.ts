/**
 * Color utility functions for score and status visualization
 */

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

export function getVerdictBg(verdict: string): string {
  if (verdict === 'excellent') return 'bg-green-100 text-green-700';
  if (verdict === 'good') return 'bg-blue-100 text-blue-700';
  if (verdict === 'fair') return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

export function getSeverityColor(severity: string): string {
  if (severity === 'critical') return 'error';
  if (severity === 'major') return 'warning';
  return 'info';
}

export function getHealthColor(health: string): string {
  if (health === 'excellent') return 'text-green-600';
  if (health === 'good') return 'text-blue-600';
  if (health === 'fair') return 'text-yellow-600';
  return 'text-red-600';
}
