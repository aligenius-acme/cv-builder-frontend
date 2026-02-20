'use client';

import { cn } from '@/lib/utils';

interface ScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  thresholds?: 'default' | 'strict'; // default: 80/60/40, strict: 80/60
}

/**
 * Unified circular score visualization component
 * Replaces ATSScoreCircle and PerformanceScore.ScoreCircle
 */
export default function ScoreCircle({
  score,
  size = 'md',
  showLabel = false,
  label = 'Score',
  thresholds = 'default',
}: ScoreCircleProps) {
  // Size configurations
  const sizeConfig = {
    sm: { width: 80, stroke: 6, fontSize: 20 },
    md: { width: 100, stroke: 6, fontSize: 24 },
    lg: { width: 128, stroke: 8, fontSize: 32 },
  };

  const { width, stroke, fontSize } = sizeConfig[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Color thresholds
  const getColor = (score: number) => {
    if (thresholds === 'strict') {
      // 3-tier: green, amber, red
      if (score >= 80) return { text: 'text-green-600', stroke: '#22c55e' };
      if (score >= 60) return { text: 'text-amber-600', stroke: '#f59e0b' };
      return { text: 'text-red-600', stroke: '#ef4444' };
    } else {
      // 4-tier: green, yellow, orange, red
      if (score >= 80) return { text: 'text-green-600', stroke: '#22c55e' };
      if (score >= 60) return { text: 'text-yellow-600', stroke: '#eab308' };
      if (score >= 40) return { text: 'text-orange-600', stroke: '#f97316' };
      return { text: 'text-red-600', stroke: '#ef4444' };
    }
  };

  const colors = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        <svg className="transform -rotate-90 w-full h-full" width={width} height={width}>
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={stroke}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center font-bold',
            colors.text
          )}
          style={{ fontSize }}
        >
          {score}
        </div>
      </div>
      {showLabel && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
      )}
    </div>
  );
}
