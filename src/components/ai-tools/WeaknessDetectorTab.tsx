'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { SavedJobsDropdown } from '@/components/ui/SavedJobsDropdown';
import { ResumeSelector } from '@/components/ui/ResumeSelector';
import {
  Shield,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Zap,
  Heart,
  Edit3,
  Briefcase,
  CheckCircle,
  Copy,
  XCircle,
  Target,
  TrendingUp,
  RefreshCw,
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Input mode and dropdowns
  const [roleInputMode, setRoleInputMode] = useState<'saved' | 'manual'>('saved');
  const [selectedJobId, setSelectedJobId] = useState('');

  const handleSelectSavedJob = (jobId: string) => {
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJobId(jobId);
      setTargetRole(job.jobTitle);
    }
  };

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
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
          <ResumeSelector
            resumes={resumes}
            selectedResumeId={selectedResumeId}
            onSelect={handleSelectResume}
            isLoading={isLoadingResumes}
            colorTheme="amber"
          />

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
              <SavedJobsDropdown
                jobs={savedJobs}
                selectedJobId={selectedJobId}
                onSelect={handleSelectSavedJob}
                isLoading={isLoadingSavedJobs}
                label=""
                placeholder="Select a job..."
                colorTheme="amber"
                onSwitchToManual={() => setRoleInputMode('manual')}
                showFooter={false}
                requireDescription={false}
              />
            ) : (
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Data Scientist"
                  className="w-full pl-11 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm placeholder:text-slate-400"
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

            {/* Blunt Assessment */}
            {(result as any).bluntAssessment && (
              <Card variant="elevated" className="bg-slate-900 border-slate-800">
                <CardContent className="py-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Honest Assessment</p>
                  <p className="text-slate-100 text-sm">{(result as any).bluntAssessment}</p>
                </CardContent>
              </Card>
            )}

            {/* Industry Insights */}
            {(result as any).industryInsights && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Industry Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(result as any).industryInsights.missingKeywords?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Missing Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {(result as any).industryInsights.missingKeywords.map((kw: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(result as any).industryInsights.competitorAdvantages?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">What Top Candidates Have</p>
                      <ul className="space-y-1">
                        {(result as any).industryInsights.competitorAdvantages.map((adv: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                            {adv}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}