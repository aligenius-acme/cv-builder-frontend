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
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  FileText,
  Briefcase,
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
          <Button
            variant="gradient"
            size="lg"
            onClick={() => setShowDownloadModal(true)}
            leftIcon={<Download className="h-5 w-5" />}
          >
            Download Resume
          </Button>
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
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Changes Made
              </CardTitle>
              <CardDescription>
                Summary of how your resume was tailored for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">
                {version.changesExplanation}
              </p>
            </CardContent>
          </Card>
        )}

        {/* TruthGuard Warnings */}
        {version.truthGuardWarnings && version.truthGuardWarnings.length > 0 && (
          <Card variant="elevated" className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                TruthGuard Warnings
              </CardTitle>
              <CardDescription className="text-amber-700">
                Review these items to ensure accuracy in your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {version.truthGuardWarnings.map((warning, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border ${
                      warning.severity === 'high'
                        ? 'bg-red-50 border-red-200'
                        : warning.severity === 'medium'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge
                          variant={
                            warning.severity === 'high'
                              ? 'error'
                              : warning.severity === 'medium'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {warning.type.replace('_', ' ')}
                        </Badge>
                        <p className="mt-2 text-sm text-slate-700">{warning.concern}</p>
                        {warning.original && (
                          <p className="mt-1 text-xs text-slate-500 italic">
                            Original: &quot;{warning.original}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tailored Resume Content */}
        {version.tailoredData && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Tailored Resume Content
              </CardTitle>
              <CardDescription>
                The tailored version of your resume for this job
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Summary */}
                {version.tailoredData.summary && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Summary</h4>
                    <p className="text-sm text-slate-700 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                      {version.tailoredData.summary}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {version.tailoredData.skills && version.tailoredData.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {version.tailoredData.skills.map((skill, i) => (
                        <Badge key={i} variant="info" size="lg">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {version.tailoredData.experience && version.tailoredData.experience.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      Experience
                    </h4>
                    <div className="space-y-4">
                      {version.tailoredData.experience.map((exp, i) => (
                        <div key={i} className="border-l-2 border-indigo-200 pl-4">
                          <h5 className="font-medium text-slate-900">{exp.title}</h5>
                          <p className="text-sm text-indigo-600 font-medium">{exp.company}</p>
                          {exp.description && exp.description.length > 0 && (
                            <ul className="mt-2 text-sm text-slate-600 space-y-1">
                              {exp.description.map((desc, j) => (
                                <li key={j} className="flex items-start gap-2">
                                  <span className="text-indigo-400 mt-1.5">•</span>
                                  {desc}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
