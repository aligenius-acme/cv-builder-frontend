'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  BarChart3,
  FileText,
  Type,
  Search,
  TrendingUp,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lightbulb,
  Star,
} from 'lucide-react';
import api, { ResumePerformanceScore } from '@/lib/api';
import toast from 'react-hot-toast';
import ScoreCircle from '@/components/ui/ScoreCircle';

interface PerformanceScoreProps {
  resumeId: string;
  versionId?: string;
  compact?: boolean;
}

const categoryConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  content: {
    icon: <FileText className="h-4 w-4" />,
    label: 'Content Quality',
    color: 'from-blue-500 to-blue-600',
  },
  formatting: {
    icon: <Type className="h-4 w-4" />,
    label: 'Formatting',
    color: 'bg-purple-600',
  },
  keywords: {
    icon: <Search className="h-4 w-4" />,
    label: 'Keywords',
    color: 'from-amber-500 to-amber-600',
  },
  impact: {
    icon: <TrendingUp className="h-4 w-4" />,
    label: 'Impact',
    color: 'from-green-500 to-green-600',
  },
  completeness: {
    icon: <CheckCircle className="h-4 w-4" />,
    label: 'Completeness',
    color: 'from-pink-500 to-pink-600',
  },
};

// ScoreCircle now imported from @/components/ui/ScoreCircle

function CategoryScore({
  category,
  score,
  feedback,
  expanded,
  onToggle,
}: {
  category: string;
  score: number;
  feedback: string[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const config = categoryConfig[category];
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700';
    if (score >= 60) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center text-white`}>
            {config.icon}
          </div>
          <span className="font-medium text-slate-900">{config.label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
            {score}/100
          </span>
          {expanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
        </div>
      </button>
      {expanded && feedback.length > 0 && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3">
          <ul className="space-y-2">
            {feedback.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PerformanceScore({ resumeId, versionId, compact = false }: PerformanceScoreProps) {
  const [score, setScore] = useState<ResumePerformanceScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadScore = async () => {
    try {
      setIsLoading(true);
      const response = await api.getResumePerformanceScore(resumeId, versionId);
      if (response.success && response.data) {
        setScore(response.data);
        setHasLoaded(true);
      }
    } catch (error) {
      toast.error('Failed to load performance score');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasLoaded && !isLoading) {
    return (
      <Card variant="elevated" className={compact ? '' : 'max-w-md'}>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Resume Performance Score</h3>
          <p className="text-sm text-slate-500 mb-4">
            Get a detailed analysis of your resume&apos;s effectiveness
          </p>
          <Button variant="primary" onClick={loadScore} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card variant="elevated" className={compact ? '' : 'max-w-md'}>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Analyzing your resume...</p>
        </CardContent>
      </Card>
    );
  }

  if (!score) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
        <ScoreCircle score={score.overall} size="sm" thresholds="strict" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-slate-900">Performance Score</span>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide' : 'Details'}
            </Button>
          </div>
          <p className="text-sm text-slate-500">
            {score.overall >= 80 ? 'Excellent' : score.overall >= 60 ? 'Good' : 'Needs improvement'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Card variant="elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Resume Performance Score
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center gap-6">
          <ScoreCircle score={score.overall} size="lg" thresholds="strict" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-1">
              {score.overall >= 80 ? 'Excellent Resume!' : score.overall >= 60 ? 'Good Resume' : 'Needs Improvement'}
            </h3>
            <p className="text-slate-500 text-sm">
              Your resume scores {score.overall}/100 based on content, formatting, keywords, impact, and completeness.
            </p>
          </div>
        </div>

        {/* Category Scores */}
        <div className="space-y-3">
          {Object.entries(score.categories).map(([key, value]) => (
            <CategoryScore
              key={key}
              category={key}
              score={value.score}
              feedback={value.feedback}
              expanded={expandedCategory === key}
              onToggle={() => setExpandedCategory(expandedCategory === key ? null : key)}
            />
          ))}
        </div>

        {/* Strengths */}
        {score.strengths.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-green-700 mb-2">
              <Star className="h-4 w-4" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {score.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {score.improvements.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-700 mb-2">
              <Lightbulb className="h-4 w-4" />
              Suggested Improvements
            </h4>
            <ul className="space-y-2">
              {score.improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Refresh Button */}
        <Button variant="ghost" className="w-full" onClick={loadScore}>
          <Loader2 className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Analysis
        </Button>
      </CardContent>
    </Card>
  );
}
