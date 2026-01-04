'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ATSScoreCircle from './ATSScoreCircle';
import {
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Cpu,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target,
  Loader2,
} from 'lucide-react';
import { ATSAnalysis } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ATSSimulatorProps {
  resumeId: string;
  versionId: string;
  initialScore?: number;
  initialAnalysis?: ATSAnalysis;
}

export default function ATSSimulator({
  resumeId,
  versionId,
  initialScore,
  initialAnalysis,
}: ATSSimulatorProps) {
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(initialAnalysis || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showExtractedView, setShowExtractedView] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await api.simulateATS(resumeId, versionId);
      if (response.success && response.data) {
        setAnalysis(response.data);
        toast.success('ATS simulation complete');
      }
    } catch (error) {
      toast.error('Failed to run ATS simulation');
    } finally {
      setIsLoading(false);
    }
  };

  const getSectionScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-100';
    if (score >= 60) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getSectionScoreBar = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  if (!analysis) {
    return (
      <Card variant="elevated">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Cpu className="h-10 w-10 text-cyan-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">ATS Simulator</h3>
            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
              See exactly how ATS systems will read and score your resume. Identify formatting issues and risky elements.
            </p>
            <Button
              variant="gradient"
              size="lg"
              onClick={runSimulation}
              isLoading={isLoading}
              leftIcon={<Eye className="h-5 w-5" />}
            >
              Run ATS Simulation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Rescan Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-cyan-600" />
          ATS Simulation Results
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={runSimulation}
          isLoading={isLoading}
          leftIcon={<Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Rescan
        </Button>
      </div>

      {/* Overall Score & Keyword Match */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardContent className="py-6">
            <div className="flex items-center gap-6">
              <ATSScoreCircle score={analysis.score} size="lg" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Overall ATS Score</h3>
                <p className="text-sm text-slate-500">
                  {analysis.score >= 80
                    ? 'Excellent! Your resume should pass most ATS filters.'
                    : analysis.score >= 60
                    ? 'Good. Consider improvements for better ATS compatibility.'
                    : 'Needs work. Significant improvements recommended.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="py-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                <Target className="h-10 w-10 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Keyword Match</h3>
                <p className="text-3xl font-bold text-indigo-600">{analysis.keywordMatchPercentage}%</p>
                <p className="text-sm text-slate-500">
                  {analysis.matchedKeywords.length} of {analysis.matchedKeywords.length + analysis.missingKeywords.length} keywords matched
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Scores */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-400" />
            Section Scores
          </CardTitle>
          <CardDescription>How each section of your resume performs in ATS analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analysis.sectionScores).map(([section, score]) => (
              <div key={section} className="flex items-center gap-4">
                <div className="w-24 text-sm font-medium text-slate-700 capitalize">{section}</div>
                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getSectionScoreBar(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className={`w-12 text-right text-sm font-semibold ${getSectionScoreColor(score).split(' ')[0]}`}>
                  {score}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="h-5 w-5" />
              Matched Keywords ({analysis.matchedKeywords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.matchedKeywords.length > 0 ? (
                analysis.matchedKeywords.map((keyword, i) => (
                  <Badge key={i} variant="success" size="lg">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No keywords matched</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Missing Keywords ({analysis.missingKeywords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords.length > 0 ? (
                analysis.missingKeywords.map((keyword, i) => (
                  <Badge key={i} variant="error" size="lg">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-emerald-600 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  All important keywords found
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risky Elements & Formatting Issues */}
      {(analysis.riskyElements.length > 0 || analysis.formattingIssues.length > 0) && (
        <Card variant="elevated" className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Potential Issues
            </CardTitle>
            <CardDescription className="text-amber-700">
              These elements may cause problems with ATS parsing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.riskyElements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-amber-900 mb-2">Risky Elements</h4>
                  <ul className="space-y-2">
                    {analysis.riskyElements.map((element, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800 bg-amber-100 p-3 rounded-xl">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {element}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.formattingIssues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-amber-900 mb-2">Formatting Issues</h4>
                  <ul className="space-y-2">
                    {analysis.formattingIssues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800 bg-amber-100 p-3 rounded-xl">
                        <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="w-full flex items-center justify-between"
            >
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                Recommendations ({analysis.recommendations.length})
              </CardTitle>
              {showRecommendations ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>
          </CardHeader>
          {showRecommendations && (
            <CardContent>
              <ul className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-indigo-600">{i + 1}</span>
                    </div>
                    <p className="text-sm text-slate-700">{rec}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      {/* ATS Extracted View */}
      {analysis.atsExtractedView && (
        <Card variant="elevated">
          <CardHeader>
            <button
              onClick={() => setShowExtractedView(!showExtractedView)}
              className="w-full flex items-center justify-between"
            >
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-400" />
                  ATS Extracted View
                </CardTitle>
                <CardDescription>
                  This is what an ATS system sees when parsing your resume
                </CardDescription>
              </div>
              {showExtractedView ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>
          </CardHeader>
          {showExtractedView && (
            <CardContent>
              <div className="bg-slate-900 text-green-400 p-6 rounded-xl font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                {analysis.atsExtractedView}
              </div>
              <p className="mt-4 text-xs text-slate-500 text-center">
                This simulates how text-based ATS systems extract and read your resume content.
                Graphics, tables, and special formatting are typically lost.
              </p>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
