'use client';

import { cn } from '@/lib/utils';

interface ATSScoreCircleProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function ATSScoreCircle({ score, size = 'md', showLabel = true }: ATSScoreCircleProps) {
  const sizes = {
    sm: { width: 60, stroke: 4, fontSize: 14 },
    md: { width: 100, stroke: 6, fontSize: 24 },
    lg: { width: 140, stroke: 8, fontSize: 32 },
  };

  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return { text: 'text-green-600', stroke: '#22c55e' };
    if (score >= 60) return { text: 'text-yellow-600', stroke: '#eab308' };
    if (score >= 40) return { text: 'text-orange-600', stroke: '#f97316' };
    return { text: 'text-red-600', stroke: '#ef4444' };
  };

  const colors = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height: width }}>
        <svg className="transform -rotate-90" width={width} height={width}>
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
            className="transition-all duration-500 ease-out"
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
        <p className="mt-2 text-sm text-gray-600 font-medium">ATS Score</p>
      )}
    </div>
  );
}
