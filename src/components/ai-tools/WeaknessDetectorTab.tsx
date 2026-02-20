'use client';

import { useState } from 'react';
import { useModal } from '@/hooks/useModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Link from 'next/link';
import {
  Shield,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Zap,
  Heart,
  Edit3,
  ChevronDown,
  MapPin,
  DollarSign,
  Upload,
  Search,
  FileText,
  Briefcase,
  Building,
} from 'lucide-react';
import api, {
  JobApplication,
  WeaknessDetectorResult,
} from '@/lib/api';
import toast from 'react-hot-toast';


interface WeaknessDetectorTabProps {
  resumes: any[];
  savedJobs: JobApplication[];
  isLoadingResumes: boolean;
  isLoadingSavedJobs: boolean;
}

export default function WeaknessDetectorTab({ resumes, savedJobs, isLoadingResumes, isLoadingSavedJobs }: WeaknessDetectorTabProps) {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WeaknessDetectorResult | null>(null);
  const [expandedWeakness, setExpandedWeakness] = useState<number | null>(null);
  const [showQuickFixes, setShowQuickFixes] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Input mode and dropdowns
  const [roleInputMode, setRoleInputMode] = useState<'saved' | 'manual'>('saved');
  const [selectedJobId, setSelectedJobId] = useState('');
  const resumeDropdown = useModal();
  const jobDropdown = useModal();

  const handleSelectSavedJob = (jobId: string) => {
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJobId(jobId);
      setTargetRole(job.jobTitle);
      jobDropdown.close();
    }
  };

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    resumeDropdown.close();
  };

  const handleDetect = async () => {
    if (!selectedResumeId) {
      toast.error('Please select a resume');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.detectWeaknesses({
        resumeId: selectedResumeId,
        targetRole: targetRole || undefined,
      });
      if (response.success && response.data) {
        setResult(response.data);
        toast.success('Analysis complete!');
      }
    } catch (error) {
      toast.error('Failed to analyze resume');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'Critical') return 'bg-red-100 text-red-700 border-red-200';
    if (severity === 'Major') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getHealthColor = (health: string) => {
    if (health === 'Excellent') return 'text-green-600 bg-green-100';
    if (health === 'Good') return 'text-blue-600 bg-blue-100';
    if (health === 'Needs Work') return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);
  const selectedJob = savedJobs.find((j) => j.id === selectedJobId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-600" />
            Analyze Resume
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resume Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Resume</label>
            {isLoadingResumes ? (
              <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl">
                <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
                <span className="text-slate-500">Loading resumes...</span>
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
                <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium text-sm">No resumes yet</p>
                <Link href="/resumes">
                  <Button variant="primary" size="sm" className="mt-3" leftIcon={<Upload className="h-4 w-4" />}>
                    Upload Resume
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => resumeDropdown.toggle()}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                >
                  {selectedResume ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-amber-600" />
                      </div>
                      <span className="font-medium truncate">{selectedResume.title || selectedResume.fileName}</span>
                    </div>
                  ) : (
                    <span className="text-slate-500">Choose a resume...</span>
                  )}
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${resumeDropdown.isOpen ? 'rotate-180' : ''}`} />
                </button>

                {resumeDropdown.isOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {resumes.map((resume) => (
                      <button
                        key={resume.id}
                        type="button"
                        onClick={() => handleSelectResume(resume.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-amber-50 transition-colors text-left border-b border-slate-100 last:border-0 ${
                          selectedResumeId === resume.id ? 'bg-amber-50' : ''
                        }`}
                      >
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{resume.title || resume.fileName}</p>
                          <p className="text-xs text-slate-500 truncate">{resume.fileName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Target Role - with saved jobs option */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Role (Optional)</label>
            <SegmentedControl
              options={[
                { value: 'saved' as const, label: 'From Jobs', icon: <Heart className="h-4 w-4" />, count: savedJobs.length },
                { value: 'manual' as const, label: 'Manual', icon: <Edit3 className="h-4 w-4" /> },
              ]}
              value={roleInputMode}
              onChange={(mode) => {
                setRoleInputMode(mode);
                if (mode === 'manual') {
                  setSelectedJobId('');
                  setTargetRole('');
                }
              }}
              className="mb-3"
            />

            {roleInputMode === 'saved' ? (
              isLoadingSavedJobs ? (
                <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl">
                  <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
                  <span className="text-slate-500 text-sm">Loading...</span>
                </div>
              ) : savedJobs.length === 0 ? (
                <div className="p-3 border border-dashed border-slate-300 rounded-xl text-center">
                  <p className="text-slate-500 text-sm">No saved jobs</p>
                  <button
                    type="button"
                    onClick={() => setRoleInputMode('manual')}
                    className="text-amber-600 text-sm font-medium mt-1"
                  >
                    Enter manually
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => jobDropdown.toggle()}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                  >
                    {selectedJob ? (
                      <span className="truncate">{selectedJob.jobTitle}</span>
                    ) : (
                      <span className="text-slate-500">Select a job...</span>
                    )}
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ${jobDropdown.isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {jobDropdown.isOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {savedJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => handleSelectSavedJob(job.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-50 transition-colors text-left border-b border-slate-100 last:border-0 ${
                            selectedJobId === job.id ? 'bg-amber-50' : ''
                          }`}
                        >
                          <Building className="h-4 w-4 text-amber-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{job.jobTitle}</p>
                            <p className="text-xs text-slate-500 truncate">{job.companyName}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Data Scientist"
                  className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm placeholder:text-slate-400"
                />
              </div>
            )}
          </div>

          <Button
            variant="primary"
            className="w-full"
            onClick={handleDetect}
            disabled={isLoading || !selectedResumeId}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Detect Weaknesses
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="lg:col-span-2 space-y-4">
        {!result ? (
          <Card variant="elevated">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Find Hidden Red Flags</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Get honest, actionable feedback on your resume weaknesses before
                recruiters see them.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Health Score */}
            <Card variant="elevated">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(result.overallHealth)}`}>
                      {result.overallHealth}
                    </span>
                    <p className="text-slate-500 mt-2 text-sm">
                      {result.weaknesses.length} issue{result.weaknesses.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${
                      result.healthScore >= 80 ? 'text-green-600' :
                      result.healthScore >= 60 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {result.healthScore}
                    </div>
                    <p className="text-sm text-slate-500">Health Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Fixes Section - NEW */}
            {result.quickFixes && result.quickFixes.length > 0 && (
              <Card variant="elevated" className="border-emerald-200">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-emerald-800 flex items-center gap-2 text-base">
                      <Zap className="h-5 w-5" />
                      Quick Fixes - Copy & Paste
                      <Badge className="bg-emerald-200 text-emerald-800 ml-2">
                        {result.quickFixes.length} fixes
                      </Badge>
                    </CardTitle>
                    <button
                      onClick={() => setShowQuickFixes(!showQuickFixes)}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      {showQuickFixes ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </CardHeader>
                {showQuickFixes && (
                  <CardContent className="space-y-4">
                    {result.quickFixes.map((fix: any, idx: number) => (
                      <div key={idx} className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={`${
                            fix.changeType === 'rewrite' ? 'bg-purple-100 text-purple-700' :
                            fix.changeType === 'add' ? 'bg-blue-100 text-blue-700' :
                            fix.changeType === 'remove' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {fix.changeType.charAt(0).toUpperCase() + fix.changeType.slice(1)}
                          </Badge>
                          <span className="text-sm font-medium text-slate-700">{fix.section}</span>
                        </div>

                        {/* Before */}
                        <div className="mb-3">
                          <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Before</span>
                          <p className="text-sm text-slate-500 bg-slate-50 p-2 rounded-lg mt-1 line-through">
                            {fix.original}
                          </p>
                        </div>

                        {/* After */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-emerald-600 uppercase tracking-wide font-medium">After (Improved)</span>
                            <button
                              onClick={() => copyToClipboard(fix.improved, idx)}
                              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  Copy
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-sm text-slate-900 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                            {fix.improved}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Positives */}
            {result.positives.length > 0 && (
              <Card variant="elevated" className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-700 flex items-center gap-2 text-base">
                    <CheckCircle className="h-5 w-5" />
                    What's Working Well
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.positives.map((positive, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                        <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                        {positive}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Weaknesses with Rewritten Versions */}
            <div className="space-y-3">
              {result.weaknesses.map((weakness: any, idx: number) => (
                <Card key={idx} variant="elevated" className={`border-l-4 ${
                  weakness.severity === 'Critical' ? 'border-l-red-500' :
                  weakness.severity === 'Major' ? 'border-l-amber-500' : 'border-l-blue-500'
                }`}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{weakness.issue}</h4>
                      <Badge className={getSeverityColor(weakness.severity)}>
                        {weakness.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">
                      <span className="font-medium">Location:</span> {weakness.location}
                    </p>
                    <p className="text-sm text-slate-600 mb-2">
                      <span className="font-medium">Impact:</span> {weakness.impact}
                    </p>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-sm text-slate-700">
                        <span className="font-medium text-green-600">Fix:</span> {weakness.fix}
                      </p>
                      {weakness.example && (
                        <p className="text-sm text-slate-600 mt-2 italic">
                          Example: {weakness.example}
                        </p>
                      )}
                    </div>

                    {/* NEW: Rewritten Version Section */}
                    {weakness.rewrittenVersion && (
                      <div className="mt-4 border-t pt-4">
                        <button
                          onClick={() => setExpandedWeakness(expandedWeakness === idx ? null : idx)}
                          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <RefreshCw className="h-4 w-4" />
                          {expandedWeakness === idx ? 'Hide' : 'Show'} Rewritten Version
                        </button>

                        {expandedWeakness === idx && (
                          <div className="mt-3 space-y-3">
                            {/* Original Text */}
                            {weakness.originalText && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-xs font-medium text-red-700 uppercase">Original (Problematic)</span>
                                </div>
                                <p className="text-sm text-red-800 line-through">{weakness.originalText}</p>
                              </div>
                            )}

                            {/* Rewritten Version */}
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                                  <span className="text-xs font-medium text-emerald-700 uppercase">Improved Version</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(weakness.rewrittenVersion, idx + 1000)}
                                  className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700"
                                >
                                  {copiedIndex === idx + 1000 ? (
                                    <>
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3.5 w-3.5" />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-sm text-emerald-900">{weakness.rewrittenVersion}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Industry Insights - NEW */}
            {result.industryInsights && (
              <Card variant="elevated" className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center gap-2 text-base">
                    <Briefcase className="h-5 w-5" />
                    Industry Insights
                    {targetRole && <Badge className="bg-indigo-200 text-blue-800 ml-2">{targetRole}</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Common Mistakes */}
                  {result.industryInsights.commonMistakes && result.industryInsights.commonMistakes.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Common Mistakes to Avoid
                      </h5>
                      <ul className="space-y-1">
                        {result.industryInsights.commonMistakes.map((mistake: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                            <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                            {mistake}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Industry Keywords */}
                  {result.industryInsights.industryKeywords && result.industryInsights.industryKeywords.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Keywords to Include
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {result.industryInsights.industryKeywords.map((keyword: string, idx: number) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200" onClick={() => copyToClipboard(keyword, idx + 2000)}>
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Competitor Advantages */}
                  {result.industryInsights.competitorAdvantages && result.industryInsights.competitorAdvantages.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        What Top Candidates Do Differently
                      </h5>
                      <ul className="space-y-1">
                        {result.industryInsights.competitorAdvantages.map((advantage: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Priority Actions */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-base">Priority Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {result.prioritizedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-slate-700">{action}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}