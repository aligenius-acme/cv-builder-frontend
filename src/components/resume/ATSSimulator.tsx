'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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
  ChevronRight,
  BarChart3,
  Target,
  Zap,
  TrendingUp,
  Shield,
  Award,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Rocket,
  Star,
  CheckCheck,
  Terminal,
  Code,
  Monitor,
  ScanLine,
  AlertOctagon,
  Briefcase,
  GraduationCap,
  LayoutDashboard,
  Info,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { ATSAnalysis, SectionAnalysis, SkillsAnalysis, SectionImprovement, BulletImprovement, ParsedResumeData } from '@/types';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface CourseRecommendation {
  title: string;
  url: string;
  provider: string;
}

interface ATSSimulatorProps {
  resumeId: string;
  versionId: string;
  initialScore?: number;
  initialAnalysis?: ATSAnalysis;
  initialCourseRecommendations?: CourseRecommendation[];
  initialSkills?: string[];
  onVersionUpdated?: () => void;
}

function isSkillsAnalysis(data: SectionAnalysis | SkillsAnalysis): data is SkillsAnalysis {
  return 'matched' in data;
}

function isBulletImprovement(imp: SectionImprovement | BulletImprovement): imp is BulletImprovement {
  return 'bulletPoint' in imp;
}

export default function ATSSimulator({
  resumeId,
  versionId,
  initialScore,
  initialAnalysis,
  initialCourseRecommendations,
  initialSkills,
  onVersionUpdated,
}: ATSSimulatorProps) {
  const [analysis, setAnalysis] = useState<ATSAnalysis | null>(initialAnalysis || null);
  const [courseRecommendations, setCourseRecommendations] = useState<CourseRecommendation[]>(
    initialCourseRecommendations || []
  );
  const [currentSkills, setCurrentSkills] = useState<string[]>(initialSkills || []);
  const [addedKeywords, setAddedKeywords] = useState<Set<string>>(new Set());
  const [savingKeyword, setSavingKeyword] = useState<string | null>(null);
  const [isSavingAllKeywords, setIsSavingAllKeywords] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showSkillsAddedInfo, setShowSkillsAddedInfo] = useState(false);

  useEffect(() => {
    if (initialCourseRecommendations && initialCourseRecommendations.length > 0) {
      setCourseRecommendations(initialCourseRecommendations);
    }
  }, [initialCourseRecommendations]);
  const [isLoading, setIsLoading] = useState(false);
  const [showExtractedView, setShowExtractedView] = useState(false);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const response = await api.simulateATS(resumeId, versionId);
      if (response.success && response.data) {
        const data = response.data as ATSAnalysis & { courseRecommendations?: CourseRecommendation[] };
        setAnalysis(data);
        if (data.courseRecommendations) {
          setCourseRecommendations(data.courseRecommendations);
        }
        toast.success('ATS simulation complete');
      }
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } }; message?: string };
      const msg = axiosErr?.response?.data?.error || axiosErr?.message || 'Failed to run ATS simulation';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const moveKeywordsToMatched = (keywords: string[]) => {
    setAnalysis(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        missingKeywords: prev.missingKeywords.filter(k => !keywords.includes(k)),
        matchedKeywords: [...prev.matchedKeywords, ...keywords],
      };
    });
  };

  const addKeywordToSkills = async (keyword: string) => {
    if (addedKeywords.has(keyword) || savingKeyword) return;
    setSavingKeyword(keyword);
    try {
      const updatedSkills = [...currentSkills, keyword];
      const response = await api.updateVersionContent(resumeId, versionId, { skills: updatedSkills });
      if (response.success) {
        setCurrentSkills(updatedSkills);
        setAddedKeywords(prev => new Set(prev).add(keyword));
        moveKeywordsToMatched([keyword]);
        toast.success(`"${keyword}" added to skills`);
      }
    } catch {
      toast.error('Failed to add keyword');
    } finally {
      setSavingKeyword(null);
    }
  };

  const addAllKeywords = async () => {
    if (!analysis || isSavingAllKeywords) return;
    const toAdd = analysis.missingKeywords.filter(k => !addedKeywords.has(k));
    if (toAdd.length === 0) return;
    setIsSavingAllKeywords(true);
    try {
      const updatedSkills = [...currentSkills, ...toAdd];
      const response = await api.updateVersionContent(resumeId, versionId, { skills: updatedSkills });
      if (response.success) {
        setCurrentSkills(updatedSkills);
        setAddedKeywords(prev => {
          const next = new Set(prev);
          toAdd.forEach(k => next.add(k));
          return next;
        });
        moveKeywordsToMatched(toAdd);
        setShowSkillsAddedInfo(true);
        toast.success(`${toAdd.length} keyword${toAdd.length !== 1 ? 's' : ''} added to skills`);
      }
    } catch {
      toast.error('Failed to add keywords');
    } finally {
      setIsSavingAllKeywords(false);
    }
  };

  const optimizeAll = async () => {
    if (isOptimizing) return;
    setIsOptimizing(true);
    try {
      const response = await api.optimizeVersion(resumeId, versionId);
      if (response.success && analysis) {
        const allMissing = [...analysis.missingKeywords];
        setCurrentSkills(prev => [...prev, ...allMissing]);
        setAddedKeywords(prev => {
          const next = new Set(prev);
          allMissing.forEach(k => next.add(k));
          return next;
        });
        moveKeywordsToMatched(allMissing);
        setShowSkillsAddedInfo(true);
        onVersionUpdated?.();
        toast.success(`${allMissing.length} keyword${allMissing.length !== 1 ? 's' : ''} added to your skills section`);
      }
    } catch (error: unknown) {
      const axiosErr = error as { response?: { data?: { error?: string } }; message?: string };
      toast.error(axiosErr?.response?.data?.error || 'Failed to add keywords');
    } finally {
      setIsOptimizing(false);
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
    if (score >= 75) return { status: 'LIKELY TO PASS', icon: Shield, color: 'emerald', bg: 'bg-emerald-600' };
    if (score >= 60) return { status: 'BORDERLINE', icon: AlertCircle, color: 'amber', bg: 'bg-amber-600' };
    return { status: 'AT RISK', icon: XCircle, color: 'red', bg: 'bg-red-600' };
  };

  const getSectionConfig = (section: string) => {
    switch (section) {
      case 'summary': return { icon: FileText, label: 'Summary' };
      case 'experience': return { icon: Briefcase, label: 'Experience' };
      case 'skills': return { icon: Zap, label: 'Skills' };
      case 'education': return { icon: GraduationCap, label: 'Education' };
      case 'formatting': return { icon: LayoutDashboard, label: 'Formatting' };
      default: return { icon: FileText, label: section.charAt(0).toUpperCase() + section.slice(1) };
    }
  };

  const getSectionStatus = (score: number) => {
    if (score >= 80) return { label: 'Strong', color: 'text-emerald-600', barColor: 'bg-emerald-500', trackColor: 'bg-emerald-100', badgeBg: 'bg-emerald-100 text-emerald-700' };
    if (score >= 60) return { label: 'Needs Polish', color: 'text-amber-600', barColor: 'bg-amber-500', trackColor: 'bg-amber-100', badgeBg: 'bg-amber-100 text-amber-700' };
    if (score >= 40) return { label: 'Needs Work', color: 'text-orange-600', barColor: 'bg-orange-500', trackColor: 'bg-orange-100', badgeBg: 'bg-orange-100 text-orange-700' };
    return { label: 'Critical Gap', color: 'text-red-600', barColor: 'bg-red-500', trackColor: 'bg-red-100', badgeBg: 'bg-red-100 text-red-700' };
  };

  if (!analysis) {
    return (
      <Card variant="elevated" className="overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-50/20" />
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <CardContent className="relative py-16">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-24 h-24 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Cpu className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">ATS Compatibility Scanner</h3>
              <p className="text-slate-500 mb-8 text-lg">
                Discover how Applicant Tracking Systems will read, parse, and score your resume. Get actionable insights to improve your chances.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Target className="h-4 w-4 text-blue-500" />
                  Keyword Analysis
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  Section Scoring
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  <Eye className="h-4 w-4 text-blue-500" />
                  ATS Preview
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                onClick={() => runSimulation()}
                isLoading={isLoading}
                leftIcon={<Zap className="h-5 w-5" />}
                className="px-8 py-4 text-lg shadow-xl"
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
          "relative p-8",
          analysis.score >= 75 ? "bg-emerald-600" :
          analysis.score >= 60 ? "bg-amber-600" :
          "bg-red-600"
        )}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
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
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center min-w-[120px]">
                <Target className="h-6 w-6 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{analysis.keywordMatchPercentage}%</div>
                <div className="text-xs text-white/70 mt-1">Keyword Match</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center min-w-[120px]">
                <CheckCircle className="h-6 w-6 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{analysis.matchedKeywords.length}</div>
                <div className="text-xs text-white/70 mt-1">Keywords Found</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 text-center min-w-[120px]">
                <AlertTriangle className="h-6 w-6 text-white mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{analysis.missingKeywords.length}</div>
                <div className="text-xs text-white/70 mt-1">Keywords Missing</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Missing Keywords Banner */}
      {analysis.missingKeywords.length > 0 && analysis.score < 85 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Add Missing Keywords to Skills
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Adds {analysis.missingKeywords.length} keyword{analysis.missingKeywords.length !== 1 ? 's' : ''} to your skills section. For a higher score, also weave them into your experience bullets.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={optimizeAll}
            isLoading={isOptimizing}
            leftIcon={<Zap className="h-4 w-4" />}
            className="flex-shrink-0 whitespace-nowrap"
          >
            {isOptimizing ? 'Adding…' : 'Add to Skills'}
          </Button>
        </div>
      )}

      {/* Skills Added Info */}
      {showSkillsAddedInfo && (
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Keywords saved to your skills section</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Real ATS systems (Workday, Greenhouse, Taleo) will now match these keywords. Our AI simulator also scores <span className="font-medium">contextual usage</span> — to push your score higher, work these keywords into your experience bullet points and summary too.
            </p>
          </div>
          <button
            onClick={() => setShowSkillsAddedInfo(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0 mt-0.5"
            aria-label="Dismiss"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <AlertCircle className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <span className="font-semibold text-slate-600 dark:text-slate-300">AI-estimated scores — </span>
          this analysis simulates ATS behaviour based on keyword matching and resume structure. Actual ATS results vary by system (Workday, Greenhouse, Taleo, etc.). Use this as directional guidance, not a guarantee.
        </p>
      </div>

      {/* Apply Verdict */}
      {analysis.applyVerdict && (() => {
        const verdict = analysis.applyVerdict;
        const isApplyNow = verdict.startsWith('Apply Now');
        const isDontApply = verdict.startsWith("Don't Apply");
        const bgColor = isApplyNow ? 'bg-emerald-900' : isDontApply ? 'bg-red-900' : 'bg-amber-900';
        const borderColor = isApplyNow ? 'border-emerald-700' : isDontApply ? 'border-red-700' : 'border-amber-700';
        const iconColor = isApplyNow ? 'text-emerald-300' : isDontApply ? 'text-red-300' : 'text-amber-300';
        const textColor = isApplyNow ? 'text-emerald-200' : isDontApply ? 'text-red-200' : 'text-amber-200';
        return (
          <div className={`flex items-start gap-4 p-5 ${bgColor} rounded-xl border ${borderColor} shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 bg-white/10`}>
              <CheckCircle className={`h-5 w-5 ${iconColor}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1.5">Apply Verdict</p>
              <p className={`${textColor} leading-relaxed text-sm font-medium`}>{verdict}</p>
            </div>
          </div>
        );
      })()}

      {/* Honest Assessment */}
      {analysis.honestAssessment && (
        <div className="flex items-start gap-4 p-5 bg-slate-900 rounded-xl border border-slate-700 shadow-sm">
          <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Info className="h-5 w-5 text-slate-300" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">AI Honest Assessment</p>
            <p className="text-slate-200 leading-relaxed text-sm">{analysis.honestAssessment}</p>
          </div>
        </div>
      )}

      {/* Potential Score Banner */}
      {potentialScore !== null && scoreGain !== null && scoreGain > 0 && (
        <div className="relative rounded-xl bg-slate-900 p-5 shadow-sm overflow-hidden">
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
                <div className={cn("text-xl font-bold", scoreGain >= 25 ? "text-amber-300" : "text-emerald-300")}>{scoreGain} pts</div>
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

      {/* Resume Intelligence Report — replaces Section Performance */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Resume Intelligence Report
              </CardTitle>
              <CardDescription>Click any section to see exactly what&apos;s holding it back and get AI-suggested fixes</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0 pt-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> 80+ Strong</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> 60–79 Polish</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> &lt;60 Fix now</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(analysis.sectionScores).map(([section, score]) => {
            const { icon: SectionIcon, label } = getSectionConfig(section);
            const status = getSectionStatus(score);
            const isExpanded = expandedSection === section;

            // Get per-section detailed data
            const sbsData = analysis.detailedRecommendations?.sectionBySection;
            const sectionData = (section !== 'formatting' && sbsData)
              ? sbsData[section as keyof typeof sbsData] as SectionAnalysis | SkillsAnalysis | undefined
              : undefined;

            // Count actionable issues
            const issueCount = (() => {
              if (section === 'formatting') return analysis.formattingIssues.length + analysis.riskyElements.length;
              if (!sectionData) return 0;
              if (isSkillsAnalysis(sectionData)) return sectionData.missing.length;
              return sectionData.issues.length;
            })();

            return (
              <div
                key={section}
                className={cn(
                  "rounded-xl border-2 overflow-hidden transition-all duration-200",
                  isExpanded
                    ? score >= 80 ? "border-emerald-300 shadow-sm" : score >= 60 ? "border-amber-300 shadow-sm" : "border-red-300 shadow-sm"
                    : "border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600"
                )}
              >
                {/* Section row — always visible */}
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    score >= 80 ? "bg-emerald-100" : score >= 60 ? "bg-amber-100" : "bg-red-100"
                  )}>
                    <SectionIcon className={cn(
                      "h-[18px] w-[18px]",
                      score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-600"
                    )} />
                  </div>

                  {/* Section label */}
                  <span className="font-semibold text-slate-800 dark:text-zinc-100 w-24 flex-shrink-0 text-sm">{label}</span>

                  {/* Progress bar */}
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <div className={cn("h-2.5 rounded-full flex-1 overflow-hidden", status.trackColor)}>
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", status.barColor)}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  {/* Score + status + issue count + arrow */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="flex items-baseline gap-0.5">
                      <span className={cn("text-xl font-black", status.color)}>{score}</span>
                      <span className="text-slate-400 dark:text-zinc-500 text-sm">/100</span>
                    </div>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full hidden sm:inline", status.badgeBg)}>
                      {status.label}
                    </span>
                    {issueCount > 0 && !isExpanded && (
                      <span className="text-xs bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-full hidden md:inline">
                        {issueCount} issue{issueCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <div className={cn(
                      "w-7 h-7 rounded-lg bg-slate-100 dark:bg-zinc-700 flex items-center justify-center transition-transform duration-200",
                      isExpanded && "rotate-90 !bg-blue-100 dark:!bg-blue-900/40"
                    )}>
                      <ChevronRight className={cn("h-4 w-4", isExpanded ? "text-blue-600" : "text-slate-400 dark:text-zinc-400")} />
                    </div>
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 p-5 space-y-5">

                    {/* FORMATTING section */}
                    {section === 'formatting' && (
                      <>
                        {analysis.formattingIssues.length === 0 && analysis.riskyElements.length === 0 ? (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">No formatting issues detected. ATS can read your resume cleanly.</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Issues to fix:</p>
                            {analysis.formattingIssues.map((issue, i) => (
                              <div key={`fi-${i}`} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-200 shadow-sm">
                                <XCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-700">{issue}</p>
                              </div>
                            ))}
                            {analysis.riskyElements.map((el, i) => (
                              <div key={`re-${i}`} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200 shadow-sm">
                                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-700">{el}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* SKILLS section */}
                    {section === 'skills' && sectionData && isSkillsAnalysis(sectionData) && (
                      <div className="space-y-4">
                        {sectionData.missing.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2">
                              Missing critical skills — click to add:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {sectionData.missing.map((s, i) => {
                                const isAdded = addedKeywords.has(s);
                                const isLoading = savingKeyword === s;
                                return isAdded ? (
                                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                                    <CheckCircle className="h-3 w-3" />{s}
                                  </span>
                                ) : (
                                  <button
                                    key={i}
                                    onClick={() => addKeywordToSkills(s)}
                                    disabled={!!savingKeyword || isSavingAllKeywords}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 group"
                                  >
                                    {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3 group-hover:hidden" />}
                                    {!isLoading && <CheckCircle className="h-3 w-3 hidden group-hover:inline text-emerald-600" />}
                                    {s}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {sectionData.matched.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">
                              Skills matching this job&apos;s requirements:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {sectionData.matched.map((s, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                                  <CheckCircle className="h-3 w-3" />{s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {sectionData.irrelevant.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                              De-emphasize these (not relevant to this role):
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {sectionData.irrelevant.map((s, i) => (
                                <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-sm line-through">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {sectionData.reorder && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs font-bold text-blue-700 uppercase mb-1">Reorder suggestion:</p>
                            <p className="text-sm text-slate-700">{sectionData.reorder}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STANDARD sections: summary, experience, education */}
                    {section !== 'formatting' && section !== 'skills' && sectionData && !isSkillsAnalysis(sectionData) && (
                      <div className="space-y-4">
                        {/* Issues */}
                        {sectionData.issues.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                              What&apos;s holding this section back:
                            </p>
                            <div className="space-y-2">
                              {sectionData.issues.map((issue, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100 shadow-sm">
                                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-sm text-slate-700">{issue}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Improvements */}
                        {sectionData.improvements.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-2">
                              AI-suggested improvements:
                            </p>
                            <div className="space-y-3">
                              {sectionData.improvements.slice(0, 3).map((imp, i) => {
                                if (isBulletImprovement(imp)) {
                                  return (
                                    <div key={i} className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                                      <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 uppercase">Bullet Enhancement</span>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{imp.impact}</span>
                                      </div>
                                      <div className="grid grid-cols-2 divide-x divide-slate-200">
                                        <div className="p-4">
                                          <p className="text-xs font-bold text-red-500 uppercase mb-1.5">Current</p>
                                          <p className="text-sm text-slate-600 italic leading-relaxed">&quot;{imp.bulletPoint}&quot;</p>
                                          {imp.weaknesses.length > 0 && (
                                            <div className="mt-2 space-y-0.5">
                                              {imp.weaknesses.map((w, wi) => (
                                                <p key={wi} className="text-xs text-red-500">• {w}</p>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                        <div className="p-4 bg-emerald-50">
                                          <p className="text-xs font-bold text-emerald-600 uppercase mb-1.5">Improved</p>
                                          <p className="text-sm text-slate-700 font-medium leading-relaxed">&quot;{imp.enhanced}&quot;</p>
                                          {imp.keywordsAdded.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                              {imp.keywordsAdded.map((kw, ki) => (
                                                <span key={ki} className="px-1.5 py-0.5 bg-emerald-200 text-emerald-700 rounded text-xs font-medium">+{kw}</span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div key={i} className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
                                      <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                                        <span className="text-xs text-slate-600">{imp.change}</span>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{imp.impact}</span>
                                      </div>
                                      <div className="grid grid-cols-2 divide-x divide-slate-200">
                                        <div className="p-4">
                                          <p className="text-xs font-bold text-red-500 uppercase mb-1.5">Current</p>
                                          <p className="text-sm text-slate-600 italic leading-relaxed">&quot;{imp.before}&quot;</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50">
                                          <p className="text-xs font-bold text-emerald-600 uppercase mb-1.5">Improved</p>
                                          <p className="text-sm text-slate-700 font-medium leading-relaxed">&quot;{imp.after}&quot;</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              })}
                            </div>
                          </div>
                        )}

                        {/* All good */}
                        {sectionData.issues.length === 0 && sectionData.improvements.length === 0 && (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">This section is well-optimized. No critical issues found.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* No detailed data yet */}
                    {section !== 'formatting' && !sectionData && (
                      <div className={cn("text-sm flex items-center gap-2", score >= 80 ? "text-emerald-600" : "text-slate-500")}>
                        {score >= 80 ? (
                          <><CheckCircle className="h-4 w-4" /> This section looks strong for ATS.</>
                        ) : (
                          <><Info className="h-4 w-4" /> Run a rescan to get detailed analysis with specific improvements for this section.</>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Keywords Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated" className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
                Keywords Found
              </span>
              <span className="text-sm font-bold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">{analysis.matchedKeywords.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.matchedKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analysis.matchedKeywords.map((keyword, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium">
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

        <Card variant="elevated" className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                Keywords Missing
              </span>
              <span className="text-sm font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">{analysis.missingKeywords.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.missingKeywords.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-slate-600">
                    Click a keyword to add it directly to your skills:
                  </p>
                  {analysis.missingKeywords.some(k => !addedKeywords.has(k)) && (
                    <button
                      onClick={addAllKeywords}
                      disabled={isSavingAllKeywords}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isSavingAllKeywords ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCheck className="h-3 w-3" />
                      )}
                      Add All
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingKeywords.map((keyword, i) => {
                    const isAdded = addedKeywords.has(keyword);
                    const isLoading = savingKeyword === keyword;
                    return isAdded ? (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {keyword}
                      </span>
                    ) : (
                      <button
                        key={i}
                        onClick={() => addKeywordToSkills(keyword)}
                        disabled={!!savingKeyword || isSavingAllKeywords}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 group"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 group-hover:hidden" />
                        )}
                        {!isLoading && <CheckCircle className="h-3.5 w-3.5 hidden group-hover:inline text-emerald-600" />}
                        {keyword}
                      </button>
                    );
                  })}
                </div>
                {/* Affiliate course recommendations */}
                {courseRecommendations.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-slate-700">Level Up These Skills</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {courseRecommendations.slice(0, 4).map((course, i) => (
                        <a
                          key={i}
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                        >
                          <div>
                            <p className="text-xs font-medium text-blue-700 mb-0.5">{course.provider}</p>
                            <p className="text-sm text-slate-700 line-clamp-1">{course.title}</p>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 text-blue-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
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
        <Card variant="elevated" className="border-amber-300 bg-amber-50">
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
                <div key={`risk-${i}`} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-amber-200 shadow-sm">
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
                <div key={`format-${i}`} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-orange-200 shadow-sm">
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

      {/* Quick Wins */}
      {analysis.quickWins && analysis.quickWins.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 shadow-sm overflow-hidden">
          <div className="bg-amber-600 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30 animate-pulse">
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
          <div className="p-6 space-y-3">
            {analysis.quickWins.map((win, i) => (
              <div key={i} className="relative group bg-white rounded-xl p-5 border-2 border-yellow-200 hover:border-yellow-400 shadow-md hover:shadow-xl transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-lg">
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
        <div className="rounded-xl border border-blue-200 bg-blue-50 shadow-sm overflow-hidden">
          <div className="bg-blue-600 p-6">
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
            <div className="mt-6 p-5 bg-emerald-100 rounded-xl border border-emerald-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-medium">Expected Result:</span>
                <span className="text-2xl font-black text-emerald-600">
                  {analysis.actionPlan.estimatedScoreAfterFixes}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Issues — Before/After Examples */}
      {analysis.detailedRecommendations?.criticalIssues && analysis.detailedRecommendations.criticalIssues.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-[var(--surface)] shadow-sm overflow-hidden">
          <div className="bg-red-700 p-6">
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
                <div className="bg-red-100 px-5 py-3 border-b border-red-200">
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
        <div className="rounded-xl border border-purple-200 bg-[var(--surface)] shadow-sm overflow-hidden">
          <div className="bg-purple-700 p-6">
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
                      <p className="text-xs font-bold text-blue-600 uppercase mb-1">Also include:</p>
                      <div className="flex flex-wrap gap-1">
                        {kw.relatedKeywords.map((rk, rki) => (
                          <span key={rki} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
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
        <div className="rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">📊 Competitor Comparison</h4>
                <p className="text-xs text-slate-500">How you stack up against top candidates</p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border border-amber-200">
              {Array.isArray(analysis.competitorComparison) ? (
                <ul className="space-y-2">
                  {(analysis.competitorComparison as string[]).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                      <span className="text-amber-500 font-bold mt-0.5 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-700 leading-relaxed">{analysis.competitorComparison as string}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-[var(--surface)] shadow-sm overflow-hidden">
          <div className="bg-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
                  <Rocket className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    All Recommendations
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                  </h3>
                  <p className="text-blue-200 text-sm mt-1">
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

          <div className="p-6 space-y-4">
            {(showAllRecommendations ? analysis.recommendations : analysis.recommendations.slice(0, 3)).map((rec, i) => {
              const priorityConfig = [
                { bg: 'bg-blue-600', ring: 'ring-blue-500/20', border: 'border-blue-200', icon: Star, label: 'High Impact' },
                { bg: 'bg-purple-600', ring: 'ring-purple-500/20', border: 'border-purple-200', icon: Zap, label: 'Quick Win' },
                { bg: 'bg-pink-600', ring: 'ring-pink-500/20', border: 'border-pink-200', icon: Target, label: 'Recommended' },
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
                  <div className={cn("absolute left-0 top-0 bottom-0 w-1", config.bg)} />
                  <div className="flex items-start gap-4 p-5 pl-6">
                    <div className={cn(
                      "relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ring-4",
                      config.bg,
                      config.ring
                    )}>
                      <span className="text-xl font-bold text-white">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          i === 0 ? "bg-blue-100 text-blue-700" :
                          i === 1 ? "bg-purple-100 text-purple-700" :
                          "bg-pink-100 text-pink-700"
                        )}>
                          <PriorityIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{rec}</p>
                    </div>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {analysis.recommendations.length > 3 && (
            <div className="px-6 pb-6">
              <button
                onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-600 font-medium text-sm transition-colors border border-blue-200"
              >
                {showAllRecommendations ? (
                  <><ChevronUp className="h-4 w-4" /> Show fewer recommendations</>
                ) : (
                  <><ChevronDown className="h-4 w-4" /> View {analysis.recommendations.length - 3} more recommendations</>
                )}
              </button>
            </div>
          )}

          <div className="px-6 pb-6">
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
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
        <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
          <button
            onClick={() => setShowExtractedView(!showExtractedView)}
            className="w-full relative bg-slate-800 p-6 hover:bg-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
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

          {showExtractedView && (
            <div className="p-6 pt-0">
              <div className="relative mt-6 rounded-xl overflow-hidden border border-slate-600/50 shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-700 border-b border-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-lg" />
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-lg" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg" />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/50 rounded-md">
                    <Code className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs text-slate-400 font-mono">ats_parser_output.txt</span>
                  </div>
                  <div className="w-16" />
                </div>
                <div className="relative bg-slate-900">
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
              <div className="mt-4 flex items-center gap-3 p-4 bg-blue-950/50 rounded-xl border border-blue-900/50">
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
