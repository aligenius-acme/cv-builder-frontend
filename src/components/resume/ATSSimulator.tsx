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
  Zap,
  TrendingUp,
  Shield,
  Award,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Rocket,
  Star,
  CheckCheck,
  Terminal,
  Code,
  Monitor,
  ScanLine,
  AlertOctagon,
} from 'lucide-react';
import { ATSAnalysis } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

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
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

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

  const getScoreGrade = (score: number) => {
    if (score >= 90) return { grade: 'A+', label: 'Excellent', color: 'emerald' };
    if (score >= 80) return { grade: 'A', label: 'Great', color: 'emerald' };
    if (score >= 70) return { grade: 'B', label: 'Good', color: 'blue' };
    if (score >= 60) return { grade: 'C', label: 'Fair', color: 'amber' };
    if (score >= 50) return { grade: 'D', label: 'Needs Work', color: 'orange' };
    return { grade: 'F', label: 'Poor', color: 'red' };
  };

  const getPassStatus = (score: number) => {
    if (score >= 75) return { status: 'LIKELY TO PASS', icon: Shield, color: 'emerald', bg: 'from-emerald-500 to-green-600' };
    if (score >= 60) return { status: 'BORDERLINE', icon: AlertCircle, color: 'amber', bg: 'from-amber-500 to-orange-500' };
    return { status: 'AT RISK', icon: XCircle, color: 'red', bg: 'from-red-500 to-rose-600' };
  };

  if (!analysis) {
    return (
      <Card variant="elevated" className="overflow-hidden">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-indigo-500/5" />
          <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />

          <CardContent className="relative py-16">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-cyan-500/30 animate-pulse">
                <Cpu className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">ATS Compatibility Scanner</h3>
              <p className="text-slate-500 mb-8 text-lg">
                Discover how Applicant Tracking Systems will read, parse, and score your resume. Get actionable insights to improve your chances.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Target className="h-4 w-4 text-indigo-500" />
                  Keyword Analysis
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  <BarChart3 className="h-4 w-4 text-indigo-500" />
                  Section Scoring
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Eye className="h-4 w-4 text-indigo-500" />
                  ATS Preview
                </div>
              </div>

              <Button
                variant="gradient"
                size="lg"
                onClick={runSimulation}
                isLoading={isLoading}
                leftIcon={<Zap className="h-5 w-5" />}
                className="px-8 py-4 text-lg shadow-xl shadow-indigo-500/30"
              >
                {isLoading ? 'Scanning...' : 'Run ATS Scan'}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  const scoreGrade = getScoreGrade(analysis.score);
  const passStatus = getPassStatus(analysis.score);
  const PassIcon = passStatus.icon;

  // Parse potential score from actionPlan (e.g. "42/100 → 75/100" or "42 → 75")
  const potentialScore = (() => {
    const raw = analysis.actionPlan?.estimatedScoreAfterFixes || '';
    const match = raw.match(/→\s*(\d+)/);
    return match ? parseInt(match[1]) : null;
  })();
  const scoreGain = potentialScore !== null ? potentialScore - analysis.score : null;

  return (
    <div className="space-y-6">
      {/* Hero Score Section */}
      <Card variant="elevated" className="overflow-hidden">
        <div className={cn(
          "relative bg-gradient-to-br p-8",
          analysis.score >= 75 ? "from-emerald-600 via-teal-600 to-cyan-600" :
          analysis.score >= 60 ? "from-amber-500 via-orange-500 to-yellow-500" :
          "from-red-500 via-rose-500 to-pink-500"
        )}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Score Display */}
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full bg-white flex items-center justify-center shadow-2xl">
                    <div className="text-center">
                      <span className={cn(
                        "text-5xl font-black",
                        analysis.score >= 75 ? "text-emerald-600" :
                        analysis.score >= 60 ? "text-amber-600" :
                        "text-red-600"
                      )}>
                        {analysis.score}
                      </span>
                      <span className="text-slate-400 text-lg">/100</span>
                    </div>
                  </div>
                </div>
                {/* Grade Badge */}
                <div className={cn(
                  "absolute -bottom-2 -right-2 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg",
                  analysis.score >= 75 ? "bg-emerald-500 text-white" :
                  analysis.score >= 60 ? "bg-amber-500 text-white" :
                  "bg-red-500 text-white"
                )}>
                  {scoreGrade.grade}
                </div>
              </div>

              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <PassIcon className="h-5 w-5" />
                  <span className="text-sm font-semibold tracking-wider opacity-90">{passStatus.status}</span>
                </div>
                <h2 className="text-3xl font-bold mb-1">ATS Score: {scoreGrade.label}</h2>
                <p className="text-white/80 max-w-md">
                  {analysis.score >= 80
                    ? 'Your resume is well-optimized for ATS systems. Great job!'
                    : analysis.score >= 60
                    ? 'Your resume may pass some ATS filters but needs improvement.'
                    : 'Your resume needs significant improvements to pass ATS filters.'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 text-center min-w-[120px]">
                <Target className="h-6 w-6 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{analysis.keywordMatchPercentage}%</div>
                <div className="text-xs text-white/70 mt-1">Keyword Match</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 text-center min-w-[120px]">
                <CheckCircle className="h-6 w-6 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{analysis.matchedKeywords.length}</div>
                <div className="text-xs text-white/70 mt-1">Keywords Found</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 text-center min-w-[120px]">
                <AlertTriangle className="h-6 w-6 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{analysis.missingKeywords.length}</div>
                <div className="text-xs text-white/70 mt-1">Keywords Missing</div>
              </div>
            </div>
          </div>

          {/* Rescan Button */}
          <button
            onClick={runSimulation}
            disabled={isLoading}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Rescan
          </button>
        </div>
      </Card>

      {/* Potential Score Banner */}
      {potentialScore !== null && scoreGain !== null && scoreGain > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-5 shadow-lg">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3C/g%3E%3C/svg%3E\")"}} />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">Your potential score if you apply the fixes below</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-white/70 text-xl font-bold">{analysis.score}</span>
                  <ArrowRight className="h-5 w-5 text-white/60" />
                  <span className="text-white text-2xl font-black">{potentialScore}</span>
                  <span className="bg-white/20 text-white text-sm font-bold px-2 py-0.5 rounded-full">
                    +{scoreGain} pts
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-center bg-white/10 rounded-xl px-5 py-3">
                <div className="text-white/70 text-xs mb-1">Quick wins available</div>
                <div className="text-white text-xl font-bold">{analysis.quickWins?.length ?? 0}</div>
              </div>
              <div className="text-center bg-white/10 rounded-xl px-5 py-3">
                <div className="text-white/70 text-xs mb-1">Gap to close</div>
                <div className={cn(
                  "text-xl font-bold",
                  scoreGain >= 25 ? "text-amber-300" : "text-emerald-300"
                )}>{scoreGain} pts</div>
              </div>
            </div>
          </div>
          <div className="relative mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Lightbulb className="h-4 w-4 text-yellow-300 flex-shrink-0" />
              <span>{analysis.actionPlan?.step1 || 'Follow the action plan below to improve your score step by step.'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Section Scores - Visual Gauges */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                Section Performance
              </CardTitle>
              <CardDescription>How each section of your resume scores</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500" /> 80+</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500" /> 60-79</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> &lt;60</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analysis.sectionScores).map(([section, score]) => (
              <div
                key={section}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all hover:shadow-md",
                  score >= 80 ? "border-emerald-200 bg-emerald-50/50" :
                  score >= 60 ? "border-amber-200 bg-amber-50/50" :
                  "border-red-200 bg-red-50/50"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-700 capitalize">{section}</span>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg",
                    score >= 80 ? "bg-emerald-500 text-white" :
                    score >= 60 ? "bg-amber-500 text-white" :
                    "bg-red-500 text-white"
                  )}>
                    {score}
                  </div>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      score >= 80 ? "bg-gradient-to-r from-emerald-400 to-emerald-600" :
                      score >= 60 ? "bg-gradient-to-r from-amber-400 to-amber-600" :
                      "bg-gradient-to-r from-red-400 to-red-600"
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs">
                  {score >= 80 ? (
                    <><ThumbsUp className="h-3 w-3 text-emerald-600" /><span className="text-emerald-600">Excellent</span></>
                  ) : score >= 60 ? (
                    <><TrendingUp className="h-3 w-3 text-amber-600" /><span className="text-amber-600">Room to improve</span></>
                  ) : (
                    <><ThumbsDown className="h-3 w-3 text-red-600" /><span className="text-red-600">Needs attention</span></>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keywords Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        <Card variant="elevated" className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
                Keywords Found
              </span>
              <Badge variant="success" size="lg">{analysis.matchedKeywords.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.matchedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.matchedKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">No keywords matched - this needs attention!</p>
            )}
          </CardContent>
        </Card>

        {/* Missing Keywords */}
        <Card variant="elevated" className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                Keywords Missing
              </span>
              <Badge variant="error" size="lg">{analysis.missingKeywords.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.missingKeywords.length > 0 ? (
              <>
                <p className="text-sm text-slate-600 mb-3">
                  Consider adding these keywords to improve your match rate:
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((keyword, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm font-medium"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {keyword}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-emerald-600">
                <Award className="h-5 w-5" />
                <span className="font-medium">Perfect! All important keywords found</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Issues & Warnings */}
      {(analysis.riskyElements.length > 0 || analysis.formattingIssues.length > 0) && (
        <Card variant="elevated" className="border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              Issues Detected ({analysis.riskyElements.length + analysis.formattingIssues.length})
            </CardTitle>
            <CardDescription className="text-amber-700">
              These issues may cause problems with ATS parsing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.riskyElements.map((element, i) => (
                <div
                  key={`risk-${i}`}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-amber-200 shadow-sm"
                >
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">Risky Element</span>
                    <p className="text-sm text-slate-700 mt-1">{element}</p>
                  </div>
                </div>
              ))}
              {analysis.formattingIssues.map((issue, i) => (
                <div
                  key={`format-${i}`}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-orange-200 shadow-sm"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">Formatting Issue</span>
                    <p className="text-sm text-slate-700 mt-1">{issue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Wins - Most Important Section */}
      {analysis.quickWins && analysis.quickWins.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 shadow-xl">
          <div className="absolute top-0 right-0 -mt-4 -mr-4">
            <div className="w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl" />
          </div>
          <div className="relative bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30 animate-pulse">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-white">⚡ QUICK WINS</h3>
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-bounce">
                      START HERE
                    </span>
                  </div>
                  <p className="text-yellow-100 text-sm mt-1 font-medium">
                    Make these changes NOW for instant score boost!
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {analysis.quickWins.map((win, i) => (
              <div
                key={i}
                className="relative group bg-white rounded-xl p-5 border-2 border-yellow-200 hover:border-yellow-400 shadow-md hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 font-medium leading-relaxed">{win}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                      &lt;5 min
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Plan */}
      {analysis.actionPlan && (
        <div className="relative overflow-hidden rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
                <Target className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">📋 Your Action Plan</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Follow these steps to maximize your ATS score
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="bg-white rounded-xl p-5 border-l-4 border-l-red-500 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">STEP 1</span>
                <span className="text-xs text-slate-500">⏱️ 5 minutes</span>
              </div>
              <p className="text-slate-700 font-medium">{analysis.actionPlan.step1}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border-l-4 border-l-orange-500 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-bold rounded">STEP 2</span>
                <span className="text-xs text-slate-500">⏱️ 15 minutes</span>
              </div>
              <p className="text-slate-700 font-medium">{analysis.actionPlan.step2}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border-l-4 border-l-yellow-500 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">STEP 3</span>
                <span className="text-xs text-slate-500">⏱️ 30 minutes</span>
              </div>
              <p className="text-slate-700 font-medium">{analysis.actionPlan.step3}</p>
            </div>
            <div className="mt-6 p-5 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border border-emerald-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Expected Result:</span>
                <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {analysis.actionPlan.estimatedScoreAfterFixes}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Issues - Before/After Examples */}
      {analysis.detailedRecommendations?.criticalIssues && analysis.detailedRecommendations.criticalIssues.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-red-200/50 bg-gradient-to-br from-white via-red-50/30 to-rose-50/20 shadow-lg">
          <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
                <AlertOctagon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">🚨 Critical Issues</h3>
                <p className="text-red-100 text-sm mt-1">
                  These are blocking your resume from passing ATS
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {analysis.detailedRecommendations.criticalIssues.map((issue, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden border-2 border-red-200 shadow-md">
                <div className="bg-gradient-to-r from-red-100 to-rose-100 px-5 py-3 border-b border-red-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-1 rounded-md text-xs font-bold",
                        issue.priority === 'CRITICAL' ? "bg-red-500 text-white" :
                        issue.priority === 'HIGH' ? "bg-orange-500 text-white" :
                        "bg-yellow-500 text-white"
                      )}>
                        {issue.priority}
                      </span>
                      <span className="text-sm font-medium text-slate-600">{issue.location}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">{issue.estimatedScoreImpact}</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-2">❌ PROBLEM:</p>
                    <p className="text-slate-700">{issue.issue}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Current (Bad):</p>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-slate-600 italic">&quot;{issue.currentText}&quot;</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-600 uppercase mb-2">✅ Improved:</p>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="text-sm text-slate-700 font-medium">&quot;{issue.suggestedText}&quot;</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs font-bold text-blue-700 uppercase mb-2">💡 WHY THIS MATTERS:</p>
                    <p className="text-sm text-slate-700">{issue.reasoning}</p>
                  </div>
                  {issue.keywords.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-purple-600 uppercase mb-2">🔑 Keywords Added:</p>
                      <div className="flex flex-wrap gap-2">
                        {issue.keywords.map((kw, ki) => (
                          <span key={ki} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-600 uppercase mb-1">Step-by-step:</p>
                    <p className="text-sm text-slate-600">{issue.implementation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Keywords with Examples */}
      {analysis.detailedRecommendations?.missingKeywordDetails && analysis.detailedRecommendations.missingKeywordDetails.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-purple-200/50 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 shadow-lg">
          <div className="relative bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
                <XCircle className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">🔍 Missing Critical Keywords</h3>
                <p className="text-purple-100 text-sm mt-1">
                  Add these to dramatically improve your match rate
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {analysis.detailedRecommendations.missingKeywordDetails.map((kw, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-purple-500 text-white rounded-lg font-bold text-lg">
                      {kw.keyword}
                    </span>
                    <span className="text-sm text-slate-500">{kw.importance}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-bold text-slate-600 uppercase mb-1">📍 Where to add:</p>
                    <p className="text-sm text-slate-700">{kw.suggestedLocation}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <p className="text-xs font-bold text-emerald-700 uppercase mb-1">✅ Example usage:</p>
                    <p className="text-sm text-slate-700 font-medium italic">&quot;{kw.exampleUsage}&quot;</p>
                  </div>
                  {kw.relatedKeywords.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Also include:</p>
                      <div className="flex flex-wrap gap-1">
                        {kw.relatedKeywords.map((rk, rki) => (
                          <span key={rki} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                            {rk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-red-600 font-medium">⚠️ {kw.currentGap}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Comparison */}
      {analysis.competitorComparison && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">📊 Competitor Comparison</h4>
                <p className="text-xs text-slate-500">How you stack up against top candidates</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-amber-200">
              <p className="text-slate-700 leading-relaxed">{analysis.competitorComparison}</p>
            </div>
          </div>
        </div>
      )}

      {/* Original Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 shadow-lg">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
                  <Rocket className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    All Recommendations
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                  </h3>
                  <p className="text-indigo-200 text-sm mt-1">
                    {analysis.recommendations.length} total improvements identified
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-5 w-5 text-emerald-300" />
                <span className="text-white font-medium">+{Math.min(20, analysis.recommendations.length * 3)}% potential</span>
              </div>
            </div>
          </div>

          {/* Recommendations list */}
          <div className="p-6 space-y-4">
            {(showAllRecommendations ? analysis.recommendations : analysis.recommendations.slice(0, 3)).map((rec, i) => {
              const priorityConfig = [
                { bg: 'from-indigo-500 to-purple-600', ring: 'ring-indigo-500/20', border: 'border-indigo-200', icon: Star, label: 'High Impact' },
                { bg: 'from-purple-500 to-pink-600', ring: 'ring-purple-500/20', border: 'border-purple-200', icon: Zap, label: 'Quick Win' },
                { bg: 'from-pink-500 to-rose-500', ring: 'ring-pink-500/20', border: 'border-pink-200', icon: Target, label: 'Recommended' },
              ];
              const config = priorityConfig[i % 3];
              const PriorityIcon = config.icon;

              return (
                <div
                  key={i}
                  className={cn(
                    "relative group bg-white rounded-xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden",
                    config.border
                  )}
                >
                  {/* Left gradient accent */}
                  <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", config.bg)} />

                  <div className="flex items-start gap-4 p-5 pl-6">
                    {/* Number badge */}
                    <div className={cn(
                      "relative flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg ring-4",
                      config.bg,
                      config.ring
                    )}>
                      <span className="text-xl font-bold text-white">{i + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          i === 0 ? "bg-indigo-100 text-indigo-700" :
                          i === 1 ? "bg-purple-100 text-purple-700" :
                          "bg-pink-100 text-pink-700"
                        )}>
                          <PriorityIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{rec}</p>
                    </div>

                    {/* Action arrow */}
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show more button */}
          {analysis.recommendations.length > 3 && (
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 rounded-xl text-indigo-600 font-medium text-sm transition-colors border border-indigo-200/50"
              >
                {showAllRecommendations ? (
                  <><ChevronUp className="h-4 w-4" /> Show fewer recommendations</>
                ) : (
                  <><ChevronDown className="h-4 w-4" /> View {analysis.recommendations.length - 3} more recommendations</>
                )}
              </button>
            </div>
          )}

          {/* Footer tip */}
          <div className="px-6 pb-6">
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/50">
              <CheckCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-slate-600">
                <span className="font-medium text-emerald-700">Tip:</span> Focus on high-impact recommendations first for the biggest score improvements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ATS Extracted View */}
      {analysis.atsExtractedView && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
          {/* Header */}
          <button
            onClick={() => setShowExtractedView(!showExtractedView)}
            className="w-full relative bg-gradient-to-r from-slate-800 to-slate-700 p-6 hover:from-slate-700 hover:to-slate-600 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/20">
                  <Terminal className="h-7 w-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    ATS Eye View
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30">
                      <ScanLine className="h-3 w-3 mr-1" />
                      Parser Output
                    </span>
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">
                    See exactly what ATS systems extract from your resume
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-600/50 rounded-lg">
                  <Monitor className="h-4 w-4 text-slate-300" />
                  <span className="text-sm text-slate-300">Technical View</span>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-xl bg-slate-600/50 flex items-center justify-center transition-transform",
                  showExtractedView && "rotate-180"
                )}>
                  <ChevronDown className="h-5 w-5 text-slate-300" />
                </div>
              </div>
            </div>
          </button>

          {/* Expandable content */}
          {showExtractedView && (
            <div className="p-6 pt-0">
              {/* Terminal window */}
              <div className="relative mt-6 rounded-xl overflow-hidden border border-slate-600/50 shadow-2xl">
                {/* macOS-style title bar */}
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-slate-700 to-slate-800 border-b border-slate-600/50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-md">
                    <Code className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-400 font-mono">ats_parser_output.txt</span>
                  </div>
                  <div className="w-16" /> {/* Spacer for balance */}
                </div>

                {/* Terminal content */}
                <div className="relative bg-gradient-to-b from-slate-900 to-black">
                  {/* Scan line effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-5">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
                    }} />
                  </div>

                  <div className="p-6 font-mono text-sm whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto text-emerald-400 leading-relaxed relative z-10">
                    <span className="text-cyan-400">$ </span>
                    <span className="text-slate-400">ats_parser --extract resume.pdf</span>
                    <br />
                    <span className="text-slate-500">--- BEGIN EXTRACTED CONTENT ---</span>
                    <br /><br />
                    {analysis.atsExtractedView}
                    <br /><br />
                    <span className="text-slate-500">--- END EXTRACTED CONTENT ---</span>
                    <br />
                    <span className="text-emerald-500">✓ Parsing complete</span>
                  </div>
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Formatting Lost</p>
                    <p className="text-xs text-slate-400 mt-0.5">Tables, columns, and graphics are stripped</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Eye className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Plain Text Only</p>
                    <p className="text-xs text-slate-400 mt-0.5">This is exactly what recruiters search</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">Verify Keywords</p>
                    <p className="text-xs text-slate-400 mt-0.5">Ensure important terms appear here</p>
                  </div>
                </div>
              </div>

              {/* Pro tip */}
              <div className="mt-4 flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                <Lightbulb className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-cyan-300">Pro tip:</span> If your key qualifications don&apos;t appear clearly in this view, consider simplifying your resume&apos;s formatting.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
