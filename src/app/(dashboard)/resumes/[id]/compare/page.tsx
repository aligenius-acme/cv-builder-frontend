'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ATSScoreCircle from '@/components/resume/ATSScoreCircle';
import {
  ArrowLeft,
  GitCompare,
  ArrowRight,
  CheckCircle,
  XCircle,
  Minus,
  Plus,
  Loader2,
  FileText,
  Briefcase,
  Building,
} from 'lucide-react';
import api from '@/lib/api';
import { ResumeVersion, Resume } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CompareVersionsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = params.id as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [version1, setVersion1] = useState<ResumeVersion | null>(null);
  const [version2, setVersion2] = useState<ResumeVersion | null>(null);
  const [selectedV1, setSelectedV1] = useState<string>(searchParams.get('v1') || '');
  const [selectedV2, setSelectedV2] = useState<string>(searchParams.get('v2') || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    loadResume();
  }, [resumeId]);

  useEffect(() => {
    if (selectedV1 && selectedV2 && selectedV1 !== selectedV2) {
      loadComparison();
    }
  }, [selectedV1, selectedV2]);

  const loadResume = async () => {
    try {
      const response = await api.getResume(resumeId);
      if (response.success && response.data) {
        setResume(response.data);
        // Auto-select latest two versions if available
        if (response.data.versions && response.data.versions.length >= 2) {
          if (!selectedV1) setSelectedV1(response.data.versions[0].id);
          if (!selectedV2) setSelectedV2(response.data.versions[1].id);
        }
      }
    } catch (error) {
      toast.error('Failed to load resume');
      router.push('/resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadComparison = async () => {
    setIsComparing(true);
    try {
      const response = await api.compareVersions(resumeId, selectedV1, selectedV2);
      if (response.success && response.data) {
        setVersion1(response.data.version1);
        setVersion2(response.data.version2);
      }
    } catch (error) {
      toast.error('Failed to compare versions');
    } finally {
      setIsComparing(false);
    }
  };

  const getDiff = (text1: string | undefined, text2: string | undefined): 'same' | 'different' | 'added' | 'removed' => {
    if (!text1 && !text2) return 'same';
    if (!text1 && text2) return 'added';
    if (text1 && !text2) return 'removed';
    return text1 === text2 ? 'same' : 'different';
  };

  const getSkillsDiff = (skills1: string[] = [], skills2: string[] = []) => {
    const added = skills2.filter(s => !skills1.includes(s));
    const removed = skills1.filter(s => !skills2.includes(s));
    const same = skills1.filter(s => skills2.includes(s));
    return { added, removed, same };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-500">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return null;
  }

  const versions = resume.versions || [];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={`/resumes/${resumeId}`}>
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Resume
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <GitCompare className="h-6 w-6 text-blue-600" />
                Compare Versions
              </h1>
              <p className="text-slate-500">{resume.title}</p>
            </div>
          </div>
        </div>

        {/* Version Selectors */}
        <Card variant="elevated">
          <CardContent className="py-5">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-700 mb-2">Version A</label>
                <select
                  value={selectedV1}
                  onChange={(e) => setSelectedV1(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Select version...</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.id === selectedV2}>
                      v{v.versionNumber} - {v.jobTitle} at {v.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                <ArrowRight className="h-5 w-5 text-blue-600" />
              </div>

              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-slate-700 mb-2">Version B</label>
                <select
                  value={selectedV2}
                  onChange={(e) => setSelectedV2(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">Select version...</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id} disabled={v.id === selectedV1}>
                      v{v.versionNumber} - {v.jobTitle} at {v.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Content */}
        {isComparing ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-slate-500">Comparing versions...</p>
            </div>
          </div>
        ) : version1 && version2 ? (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="elevated" className="border-blue-200">
                <CardHeader>
                  <Badge variant="info" size="sm" className="w-fit mb-2">Version A</Badge>
                  <CardTitle className="text-lg">
                    v{version1.versionNumber} - {version1.jobTitle}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {version1.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <ATSScoreCircle score={version1.atsScore} size="sm" />
                    <div>
                      <p className="text-sm text-slate-500">ATS Score</p>
                      <p className="text-2xl font-bold text-slate-900">{version1.atsScore}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">{formatDate(version1.createdAt)}</p>
                </CardContent>
              </Card>

              <Card variant="elevated" className="border-purple-200">
                <CardHeader>
                  <Badge variant="primary" size="sm" className="w-fit mb-2">Version B</Badge>
                  <CardTitle className="text-lg">
                    v{version2.versionNumber} - {version2.jobTitle}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {version2.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <ATSScoreCircle score={version2.atsScore} size="sm" />
                    <div>
                      <p className="text-sm text-slate-500">ATS Score</p>
                      <p className="text-2xl font-bold text-slate-900">{version2.atsScore}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">{formatDate(version2.createdAt)}</p>
                </CardContent>
              </Card>
            </div>

            {/* Score Comparison */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Score Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">{version1.atsScore}%</p>
                    <p className="text-sm text-slate-500">Version A</p>
                  </div>
                  <div className="flex flex-col items-center">
                    {version2.atsScore > version1.atsScore ? (
                      <>
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Plus className="h-6 w-6 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-emerald-600 mt-1">
                          +{version2.atsScore - version1.atsScore}%
                        </p>
                      </>
                    ) : version2.atsScore < version1.atsScore ? (
                      <>
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <Minus className="h-6 w-6 text-red-600" />
                        </div>
                        <p className="text-sm font-medium text-red-600 mt-1">
                          {version2.atsScore - version1.atsScore}%
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          <span className="text-slate-600">=</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Same</p>
                      </>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-purple-600">{version2.atsScore}%</p>
                    <p className="text-sm text-slate-500">Version B</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Comparison */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Summary Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Badge variant="info" size="sm" className="mb-3">Version A</Badge>
                    <p className="text-sm text-slate-700">
                      {version1.tailoredData?.summary || 'No summary'}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <Badge variant="primary" size="sm" className="mb-3">Version B</Badge>
                    <p className="text-sm text-slate-700">
                      {version2.tailoredData?.summary || 'No summary'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills Diff */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Skills Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const diff = getSkillsDiff(
                    version1.tailoredData?.skills || [],
                    version2.tailoredData?.skills || []
                  );
                  return (
                    <div className="space-y-4">
                      {diff.added.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Added in Version B ({diff.added.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {diff.added.map((skill, i) => (
                              <Badge key={i} variant="success" size="lg">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {diff.removed.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-2">
                            <Minus className="h-4 w-4" />
                            Removed from Version A ({diff.removed.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {diff.removed.map((skill, i) => (
                              <Badge key={i} variant="error" size="lg">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {diff.same.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Unchanged ({diff.same.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {diff.same.map((skill, i) => (
                              <Badge key={i} variant="default" size="lg">{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {diff.added.length === 0 && diff.removed.length === 0 && diff.same.length === 0 && (
                        <p className="text-slate-500 text-center py-4">No skills to compare</p>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Keywords Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle className="h-5 w-5" />
                    Matched Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Version A</p>
                      <div className="flex flex-wrap gap-1">
                        {(version1.matchedKeywords || []).slice(0, 10).map((kw, i) => (
                          <Badge key={i} variant="success" size="sm">{kw}</Badge>
                        ))}
                        {(version1.matchedKeywords || []).length > 10 && (
                          <Badge variant="default" size="sm">+{(version1.matchedKeywords || []).length - 10}</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Version B</p>
                      <div className="flex flex-wrap gap-1">
                        {(version2.matchedKeywords || []).slice(0, 10).map((kw, i) => (
                          <Badge key={i} variant="success" size="sm">{kw}</Badge>
                        ))}
                        {(version2.matchedKeywords || []).length > 10 && (
                          <Badge variant="default" size="sm">+{(version2.matchedKeywords || []).length - 10}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                    <XCircle className="h-5 w-5" />
                    Missing Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Version A</p>
                      <div className="flex flex-wrap gap-1">
                        {(version1.missingKeywords || []).slice(0, 10).map((kw, i) => (
                          <Badge key={i} variant="error" size="sm">{kw}</Badge>
                        ))}
                        {(version1.missingKeywords || []).length > 10 && (
                          <Badge variant="default" size="sm">+{(version1.missingKeywords || []).length - 10}</Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Version B</p>
                      <div className="flex flex-wrap gap-1">
                        {(version2.missingKeywords || []).slice(0, 10).map((kw, i) => (
                          <Badge key={i} variant="error" size="sm">{kw}</Badge>
                        ))}
                        {(version2.missingKeywords || []).length > 10 && (
                          <Badge variant="default" size="sm">+{(version2.missingKeywords || []).length - 10}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : versions.length < 2 ? (
          <Card variant="elevated">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <GitCompare className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Not Enough Versions</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  You need at least 2 versions to compare. Customize your resume for different jobs to create more versions.
                </p>
                <Link href={`/resumes/${resumeId}`}>
                  <Button variant="primary">
                    Customize Resume
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card variant="elevated">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <GitCompare className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Select Versions to Compare</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  Choose two different versions above to see a detailed comparison of changes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
