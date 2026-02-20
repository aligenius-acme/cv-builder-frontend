'use client';

import { useState } from 'react';
import { useModal } from '@/hooks/useModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Link from 'next/link';
import {
  Target,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Zap,
  BarChart3,
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
  JobMatchResult,
} from '@/lib/api';
import toast from 'react-hot-toast';

interface JobMatchTabProps {
  resumes: any[];
  savedJobs: JobApplication[];
  isLoadingResumes: boolean;
  isLoadingSavedJobs: boolean;
}

export default function JobMatchTab({ resumes, savedJobs, isLoadingResumes, isLoadingSavedJobs }: JobMatchTabProps) {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);

  // Input mode and dropdowns
  const [jobInputMode, setJobInputMode] = useState<'saved' | 'manual'>('saved');
  const [selectedJobId, setSelectedJobId] = useState('');
  const resumeDropdown = useModal();
  const jobDropdown = useModal();

  const handleSelectSavedJob = (jobId: string) => {
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJobId(jobId);
      setJobTitle(job.jobTitle);
      setJobDescription(job.jobDescription || '');
      jobDropdown.close();
    }
  };

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    resumeDropdown.close();
  };

  const handleAnalyze = async () => {
    if (!selectedResumeId || !jobTitle || !jobDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.calculateJobMatch({
        resumeId: selectedResumeId,
        jobTitle,
        jobDescription,
      });
      if (response.success && response.data) {
        setResult(response.data);
        toast.success('Analysis complete!');
      }
    } catch (error) {
      toast.error('Failed to analyze job match');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getVerdictBg = (verdict: string) => {
    if (verdict === 'Strong Match') return 'bg-green-100 text-green-700';
    if (verdict === 'Good Match') return 'bg-blue-100 text-blue-700';
    if (verdict === 'Moderate Match') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);
  const selectedJob = savedJobs.find((j) => j.id === selectedJobId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Check Job Match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resume Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Resume</label>
            {isLoadingResumes ? (
              <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <span className="text-slate-500">Loading resumes...</span>
              </div>
            ) : resumes.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
                <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium text-sm">No resumes yet</p>
                <p className="text-xs text-slate-500 mt-1">Upload a resume to get started</p>
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
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  {selectedResume ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{selectedResume.title || selectedResume.fileName}</span>
                    </div>
                  ) : (
                    <span className="text-slate-500">Choose a resume...</span>
                  )}
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${resumeDropdown.isOpen ? 'rotate-180' : ''}`} />
                </button>

                {resumeDropdown.isOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {resumes.map((resume) => (
                      <button
                        key={resume.id}
                        type="button"
                        onClick={() => handleSelectResume(resume.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-100 last:border-0 ${
                          selectedResumeId === resume.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{resume.title || resume.fileName}</p>
                          <p className="text-xs text-slate-500">{resume.fileName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Job Source Toggle */}
          <SegmentedControl
            options={[
              { value: 'saved' as const, label: 'From Saved Jobs', icon: <Heart className="h-4 w-4" />, count: savedJobs.length },
              { value: 'manual' as const, label: 'Enter Manually', icon: <Edit3 className="h-4 w-4" /> },
            ]}
            value={jobInputMode}
            onChange={(mode) => {
              setJobInputMode(mode);
              if (mode === 'manual') {
                setSelectedJobId('');
              }
            }}
          />

          {/* Saved Jobs Dropdown */}
          {jobInputMode === 'saved' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Select a Saved Job</label>
              {isLoadingSavedJobs ? (
                <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl">
                  <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  <span className="text-slate-500">Loading saved jobs...</span>
                </div>
              ) : savedJobs.length === 0 ? (
                <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
                  <Heart className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 font-medium text-sm">No saved jobs with descriptions</p>
                  <p className="text-xs text-slate-500 mt-1">Save jobs from the Job Tracker to use here</p>
                  <div className="flex justify-center gap-2 mt-3">
                    <Link href="/job-tracker">
                      <Button variant="primary" size="sm" leftIcon={<Search className="h-4 w-4" />}>
                        Job Tracker
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => setJobInputMode('manual')}>
                      Enter Manually
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => jobDropdown.toggle()}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    {selectedJob ? (
                      <span className="text-slate-900">{selectedJob.jobTitle} at {selectedJob.companyName}</span>
                    ) : (
                      <span className="text-slate-500">Select a job to analyze...</span>
                    )}
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${jobDropdown.isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {jobDropdown.isOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {savedJobs.map((job) => (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => handleSelectSavedJob(job.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-100 last:border-0 ${
                            selectedJobId === job.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">{job.jobTitle}</p>
                            <p className="text-sm text-slate-500 truncate">{job.companyName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {job.location && (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                              )}
                              {job.salary && (
                                <span className="text-xs text-emerald-600 flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {job.salary}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {savedJobs.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''} with descriptions •{' '}
                  <Link href="/job-tracker" className="text-blue-600 hover:text-blue-700">Manage jobs</Link>
                </p>
              )}
            </div>
          )}

          {/* Form fields - shown when manual mode or when a saved job is selected */}
          {(jobInputMode === 'manual' || (jobInputMode === 'saved' && selectedJobId)) && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                    readOnly={jobInputMode === 'saved' && !!selectedJobId}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={8}
                  className={`w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none ${
                    jobInputMode === 'saved' && selectedJobId ? 'bg-slate-50' : ''
                  }`}
                  readOnly={jobInputMode === 'saved' && !!selectedJobId}
                />
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleAnalyze}
                disabled={isLoading || !selectedResumeId}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Analyzing Match...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Calculate Match Score
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {!result ? (
          <Card variant="elevated">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Know Before You Apply</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                See how well your resume matches a job before spending time applying.
                Get instant feedback on strengths and gaps.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Score Card */}
            <Card variant="elevated">
              <CardContent className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getVerdictBg(result.verdict)}`}>
                      {result.verdict}
                    </span>
                    <p className="text-slate-500 mt-2 text-sm">{result.timeToApply}</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}%
                    </div>
                    <p className="text-sm text-slate-500">Match Score</p>
                  </div>
                </div>
                <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${result.overallScore}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Breakdown */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(result.breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <div className="w-28 text-sm text-slate-600 capitalize">
                        {key.replace('Match', '')}
                      </div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5">
                        <div
                          className={`h-full rounded-full ${value >= 70 ? 'bg-green-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium text-right">{value}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card variant="elevated" className="bg-green-50 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-700 flex items-center gap-2 text-base">
                    <CheckCircle className="h-5 w-5" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                        <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card variant="elevated" className="bg-amber-50 border-amber-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-amber-700 flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5" />
                    Gaps to Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.gaps.map((gap, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-amber-700">
                        <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Recommendation */}
            <Card variant="elevated">
              <CardContent className="py-4">
                <p className="text-slate-700">{result.recommendation}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}