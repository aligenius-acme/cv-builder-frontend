'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ATSScoreCircle from '@/components/resume/ATSScoreCircle';
import DownloadModal from '@/components/resume/DownloadModal';
import ATSSimulator from '@/components/resume/ATSSimulator';
import ShareModal from '@/components/resume/ShareModal';
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  FileText,
  Briefcase,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Lightbulb,
  Target,
  Zap,
  Award,
  GraduationCap,
  User,
  Star,
  TrendingUp,
  ChevronRight,
  AlertOctagon,
  Info,
  Wand2,
  ArrowRightLeft,
  ListChecks,
  RefreshCw,
} from 'lucide-react';
import api from '@/lib/api';
import { ResumeVersion } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function VersionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;
  const versionId = params.versionId as string;

  const [version, setVersion] = useState<ResumeVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadVersion();
  }, [resumeId, versionId]);

  const loadVersion = async () => {
    try {
      const response = await api.getResumeVersion(resumeId, versionId);
      if (response.success && response.data) {
        setVersion(response.data);
      }
    } catch (error) {
      toast.error('Failed to load version');
      router.push(`/resumes/${resumeId}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <p className="text-slate-500">Loading version...</p>
        </div>
      </div>
    );
  }

  if (!version) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Download Modal */}
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          resumeId={resumeId}
          versionId={versionId}
          versionNumber={version.versionNumber}
          companyName={version.companyName}
        />

        {/* Share Modal */}
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          resumeId={resumeId}
          versionId={versionId}
          jobTitle={version.jobTitle}
          companyName={version.companyName}
        />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/resumes/${resumeId}`}>
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Resume
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {version.jobTitle} at {version.companyName}
              </h1>
              <p className="text-slate-500">
                Version {version.versionNumber} • Created {formatDate(version.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowShareModal(true)}
              leftIcon={<Share2 className="h-5 w-5" />}
            >
              Share
            </Button>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => setShowDownloadModal(true)}
              leftIcon={<Download className="h-5 w-5" />}
            >
              Download Resume
            </Button>
          </div>
        </div>

        {/* ATS Simulator */}
        <ATSSimulator
          resumeId={resumeId}
          versionId={versionId}
          initialScore={version.atsScore}
          initialAnalysis={version.atsDetails ? {
            score: version.atsScore,
            keywordMatchPercentage: version.atsDetails.keywordMatchPercentage || Math.round((version.matchedKeywords?.length || 0) / ((version.matchedKeywords?.length || 0) + (version.missingKeywords?.length || 1)) * 100),
            matchedKeywords: version.matchedKeywords || [],
            missingKeywords: version.missingKeywords || [],
            sectionScores: version.atsDetails.sectionScores || { summary: 75, experience: 80, skills: 70, education: 85, formatting: 90 },
            formattingIssues: version.atsDetails.formattingIssues || [],
            recommendations: version.atsDetails.recommendations || [],
            atsExtractedView: version.atsDetails.atsExtractedView || '',
            riskyElements: version.atsDetails.riskyElements || [],
          } : undefined}
        />

        {/* Changes Explanation */}
        {version.changesExplanation && (
          <div className="relative overflow-hidden rounded-2xl border border-purple-200/50 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/20 shadow-lg">
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-6">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
                  <Wand2 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    AI-Powered Changes
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                  </h3>
                  <p className="text-purple-200 text-sm mt-1">
                    Summary of how your resume was tailored for {version.companyName}
                  </p>
                </div>
              </div>
              {/* Quick indicators */}
              <div className="relative flex items-center gap-3 mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                  <RefreshCw className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white">Optimized</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                  <Target className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white">{version.jobTitle}</span>
                </div>
              </div>
            </div>

            {/* Changes content */}
            <div className="p-6">
              <div className="relative">
                {/* Decorative quote marks */}
                <div className="absolute -top-2 -left-2 text-purple-200 opacity-50">
                  <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                  </svg>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-6 border border-purple-200/50">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed pl-8">
                    {version.changesExplanation}
                  </p>
                </div>
              </div>

              {/* Info footer */}
              <div className="mt-4 flex items-center gap-3 p-4 bg-gradient-to-r from-slate-50 to-purple-50/50 rounded-xl border border-slate-200/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <ListChecks className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">What changed:</span> Your summary, skills, and experience descriptions were optimized to match the job requirements.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TruthGuard Warnings */}
        {version.truthGuardWarnings && version.truthGuardWarnings.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-amber-200/50 bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50/30 shadow-lg">
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 p-6">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMThjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
                  <ShieldAlert className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    TruthGuard Integrity Check
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      {version.truthGuardWarnings.length} {version.truthGuardWarnings.length === 1 ? 'Alert' : 'Alerts'}
                    </span>
                  </h3>
                  <p className="text-amber-100 text-sm mt-1">
                    Review these items to ensure accuracy and authenticity
                  </p>
                </div>
              </div>
              {/* Severity summary */}
              <div className="relative flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
                {(() => {
                  const high = version.truthGuardWarnings.filter(w => w.severity === 'high').length;
                  const medium = version.truthGuardWarnings.filter(w => w.severity === 'medium').length;
                  const low = version.truthGuardWarnings.filter(w => w.severity === 'low').length;
                  return (
                    <>
                      {high > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/30 rounded-lg backdrop-blur-sm">
                          <AlertOctagon className="h-4 w-4 text-white" />
                          <span className="text-sm font-medium text-white">{high} High</span>
                        </div>
                      )}
                      {medium > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/30 rounded-lg backdrop-blur-sm">
                          <AlertTriangle className="h-4 w-4 text-white" />
                          <span className="text-sm font-medium text-white">{medium} Medium</span>
                        </div>
                      )}
                      {low > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/30 rounded-lg backdrop-blur-sm">
                          <Info className="h-4 w-4 text-white" />
                          <span className="text-sm font-medium text-white">{low} Low</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Warnings list */}
            <div className="p-6 space-y-4">
              {version.truthGuardWarnings.map((warning, i) => {
                const getSeverityConfig = (severity: string) => {
                  switch (severity) {
                    case 'high':
                      return {
                        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
                        border: 'border-l-4 border-l-red-500 border border-red-200/50',
                        icon: AlertOctagon,
                        iconBg: 'bg-red-100',
                        iconColor: 'text-red-600',
                        badge: 'bg-red-100 text-red-700 ring-red-600/20',
                        label: 'High Priority',
                      };
                    case 'medium':
                      return {
                        bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
                        border: 'border-l-4 border-l-amber-500 border border-amber-200/50',
                        icon: AlertTriangle,
                        iconBg: 'bg-amber-100',
                        iconColor: 'text-amber-600',
                        badge: 'bg-amber-100 text-amber-700 ring-amber-600/20',
                        label: 'Medium Priority',
                      };
                    default:
                      return {
                        bg: 'bg-gradient-to-r from-blue-50 to-sky-50',
                        border: 'border-l-4 border-l-blue-500 border border-blue-200/50',
                        icon: Info,
                        iconBg: 'bg-blue-100',
                        iconColor: 'text-blue-600',
                        badge: 'bg-blue-100 text-blue-700 ring-blue-600/20',
                        label: 'Low Priority',
                      };
                  }
                };
                const config = getSeverityConfig(warning.severity);
                const Icon = config.icon;

                return (
                  <div
                    key={i}
                    className={`relative rounded-xl ${config.bg} ${config.border} p-5 shadow-sm hover:shadow-md transition-shadow`}
                  >
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 h-10 w-10 rounded-lg ${config.iconBg} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${config.badge}`}>
                            {config.label}
                          </span>
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            {warning.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                          {warning.concern}
                        </p>
                        {warning.original && (
                          <div className="mt-3 flex items-start gap-2 text-xs bg-white/60 rounded-lg p-3 border border-slate-200/50">
                            <Eye className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-medium text-slate-500">Original text:</span>
                              <p className="text-slate-600 italic mt-0.5">&quot;{warning.original}&quot;</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer tip */}
            <div className="px-6 pb-6">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border border-slate-200/50">
                <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-slate-600">
                  <span className="font-medium text-slate-700">Pro tip:</span> Review each warning and verify the information before using this resume. Accuracy builds trust with employers.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tailored Resume Content */}
        {version.tailoredData && (
          <div className="relative overflow-hidden rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 shadow-lg">
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 p-6">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-2 ring-white/30">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    Tailored Resume Content
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                  </h3>
                  <p className="text-indigo-200 text-sm mt-1">
                    Your resume optimized for {version.jobTitle} at {version.companyName}
                  </p>
                </div>
              </div>
              {/* Quick stats */}
              <div className="relative flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
                {version.tailoredData.skills && version.tailoredData.skills.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Zap className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm font-medium text-white">{version.tailoredData.skills.length} Skills</span>
                  </div>
                )}
                {version.tailoredData.experience && version.tailoredData.experience.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Briefcase className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm font-medium text-white">{version.tailoredData.experience.length} Positions</span>
                  </div>
                )}
                {version.tailoredData.summary && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
                    <User className="h-4 w-4 text-cyan-300" />
                    <span className="text-sm font-medium text-white">Custom Summary</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content sections */}
            <div className="p-6 space-y-8">
              {/* Summary */}
              {version.tailoredData.summary && (
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Professional Summary</h4>
                      <p className="text-xs text-slate-500">Your tailored elevator pitch</p>
                    </div>
                  </div>
                  <div className="relative bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-200/50">
                    <div className="absolute top-4 left-4 text-emerald-200">
                      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                      </svg>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed pl-8">
                      {version.tailoredData.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Skills */}
              {version.tailoredData.skills && version.tailoredData.skills.length > 0 && (
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/25">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Key Skills</h4>
                      <p className="text-xs text-slate-500">Highlighted competencies for this role</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-violet-50/50 to-purple-50/50 rounded-xl p-5 border border-violet-200/50">
                    <div className="flex flex-wrap gap-2">
                      {version.tailoredData.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-slate-700 border border-violet-200/50 shadow-sm hover:shadow-md hover:border-violet-300 transition-all cursor-default"
                        >
                          <Star className="h-3.5 w-3.5 text-violet-500" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Experience */}
              {version.tailoredData.experience && version.tailoredData.experience.length > 0 && (
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/25">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Professional Experience</h4>
                      <p className="text-xs text-slate-500">Tailored achievements and responsibilities</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {version.tailoredData.experience.map((exp, i) => (
                      <div
                        key={i}
                        className="relative bg-white rounded-xl p-5 border border-indigo-200/50 shadow-sm hover:shadow-md transition-shadow group"
                      >
                        {/* Position indicator */}
                        <div className="absolute -left-px top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-violet-500 rounded-l-full" />

                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <span className="text-lg font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                              {i + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-slate-900 text-lg">{exp.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-indigo-600 font-medium">{exp.company}</span>
                              {exp.dates && (
                                <>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-sm text-slate-500">{exp.dates}</span>
                                </>
                              )}
                            </div>
                            {exp.description && exp.description.length > 0 && (
                              <ul className="mt-4 space-y-2">
                                {exp.description.map((desc, j) => (
                                  <li key={j} className="flex items-start gap-3 text-sm text-slate-600">
                                    <ChevronRight className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{desc}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-100/50 to-purple-100/50 rounded-xl border border-indigo-200/50">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-indigo-600" />
                  <p className="text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Optimized for:</span> {version.jobTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-indigo-600 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  ATS Score: {version.atsScore}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
