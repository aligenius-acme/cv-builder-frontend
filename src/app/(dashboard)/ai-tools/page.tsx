'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Link from 'next/link';
import {
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
  Mail,
  MessageCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  RefreshCw,
  ChevronRight,
  ArrowRight,
  Zap,
  BarChart3,
  Shield,
  Send,
  Users,
  FileText,
  Briefcase,
  Building,
  Heart,
  Edit3,
  ChevronDown,
  MapPin,
  DollarSign,
  Upload,
  Search,
} from 'lucide-react';
import api, {
  JobApplication,
  JobMatchResult,
  AchievementQuantifierResult,
  WeaknessDetectorResult,
  FollowUpEmailResult,
  NetworkingMessageResult,
  FollowUpType,
  NetworkingPlatform,
  NetworkingPurpose,
} from '@/lib/api';
import toast from 'react-hot-toast';

type TabType = 'job-match' | 'quantifier' | 'weakness' | 'follow-up' | 'networking';

const tabs = [
  { id: 'job-match' as TabType, label: 'Job Match', icon: Target },
  { id: 'quantifier' as TabType, label: 'Achievement Quantifier', icon: TrendingUp },
  { id: 'weakness' as TabType, label: 'Weakness Detector', icon: Shield },
  { id: 'follow-up' as TabType, label: 'Follow-up Emails', icon: Mail },
  { id: 'networking' as TabType, label: 'Networking Messages', icon: Users },
];

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('job-match');
  const [resumes, setResumes] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobApplication[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(true);

  useEffect(() => {
    loadResumes();
    loadSavedJobs();
  }, []);

  const loadResumes = async () => {
    setIsLoadingResumes(true);
    try {
      const response = await api.getResumes();
      if (response.success && response.data) {
        setResumes(response.data);
      }
    } catch (error) {
      console.error('Failed to load resumes:', error);
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const loadSavedJobs = async () => {
    setIsLoadingSavedJobs(true);
    try {
      const response = await api.getJobApplications();
      if (response.success && response.data?.applications) {
        // Filter to only include jobs with descriptions
        setSavedJobs(response.data.applications.filter((job: JobApplication) => job.jobDescription));
      }
    } catch (error) {
      console.error('Failed to load saved jobs:', error);
    } finally {
      setIsLoadingSavedJobs(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PageHeader
          icon={<Sparkles className="h-5 w-5" />}
          label="AI-Powered Tools"
          title="AI Career Assistant"
          description="Advanced AI tools to supercharge your job search. Match with jobs, improve your resume, and craft perfect messages."
        />

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-lg border border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'job-match' && <JobMatchTab resumes={resumes} savedJobs={savedJobs} isLoadingResumes={isLoadingResumes} isLoadingSavedJobs={isLoadingSavedJobs} />}
          {activeTab === 'quantifier' && <AchievementQuantifierTab resumes={resumes} isLoadingResumes={isLoadingResumes} />}
          {activeTab === 'weakness' && <WeaknessDetectorTab resumes={resumes} savedJobs={savedJobs} isLoadingResumes={isLoadingResumes} isLoadingSavedJobs={isLoadingSavedJobs} />}
          {activeTab === 'follow-up' && <FollowUpEmailTab resumes={resumes} savedJobs={savedJobs} isLoadingResumes={isLoadingResumes} isLoadingSavedJobs={isLoadingSavedJobs} />}
          {activeTab === 'networking' && <NetworkingMessageTab resumes={resumes} isLoadingResumes={isLoadingResumes} />}
        </div>
      </div>
    </div>
  );
}

// Job Match Score Tab
function JobMatchTab({ resumes, savedJobs, isLoadingResumes, isLoadingSavedJobs }: {
  resumes: any[];
  savedJobs: JobApplication[];
  isLoadingResumes: boolean;
  isLoadingSavedJobs: boolean;
}) {
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<JobMatchResult | null>(null);

  // Input mode and dropdowns
  const [jobInputMode, setJobInputMode] = useState<'saved' | 'manual'>('saved');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
  const [showJobDropdown, setShowJobDropdown] = useState(false);

  const handleSelectSavedJob = (jobId: string) => {
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJobId(jobId);
      setJobTitle(job.jobTitle);
      setJobDescription(job.jobDescription || '');
      setShowJobDropdown(false);
    }
  };

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setShowResumeDropdown(false);
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
                  onClick={() => setShowResumeDropdown(!showResumeDropdown)}
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
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showResumeDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showResumeDropdown && (
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
                    onClick={() => setShowJobDropdown(!showJobDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  >
                    {selectedJob ? (
                      <span className="text-slate-900">{selectedJob.jobTitle} at {selectedJob.companyName}</span>
                    ) : (
                      <span className="text-slate-500">Select a job to analyze...</span>
                    )}
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showJobDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showJobDropdown && (
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

// Achievement Quantifier Tab
function AchievementQuantifierTab({ resumes, isLoadingResumes }: { resumes: any[]; isLoadingResumes: boolean }) {
  const [bullets, setBullets] = useState<string[]>(['']);
  const [jobContext, setJobContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AchievementQuantifierResult | null>(null);

  // Resume import state
  const [bulletSource, setBulletSource] = useState<'manual' | 'resume'>('manual');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
  const [resumeBullets, setResumeBullets] = useState<string[]>([]);
  const [selectedBulletIndices, setSelectedBulletIndices] = useState<Set<number>>(new Set());

  const handleSelectResume = async (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setShowResumeDropdown(false);
    setSelectedBulletIndices(new Set());

    // Extract bullet points from resume
    const resume = resumes.find((r) => r.id === resumeId);
    if (resume?.parsedData?.experience) {
      const allBullets: string[] = [];
      resume.parsedData.experience.forEach((exp: any) => {
        if (exp.description && Array.isArray(exp.description)) {
          exp.description.forEach((desc: string) => {
            const cleanBullet = desc.replace(/^[•\-\*▪◦›●○]\s*/, '').trim();
            if (cleanBullet && cleanBullet.length > 10) {
              allBullets.push(cleanBullet);
            }
          });
        }
      });
      setResumeBullets(allBullets);
    } else if (resume?.rawText) {
      // Fallback: extract lines that look like bullet points
      const lines = resume.rawText.split('\n');
      const bulletLines = lines
        .filter((line: string) => line.trim().match(/^[•\-\*▪◦›●○]/))
        .map((line: string) => line.replace(/^[•\-\*▪◦›●○]\s*/, '').trim())
        .filter((line: string) => line.length > 10);
      setResumeBullets(bulletLines.slice(0, 20));
    }
  };

  const toggleBulletSelection = (index: number) => {
    const newSet = new Set(selectedBulletIndices);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setSelectedBulletIndices(newSet);
  };

  const importSelectedBullets = () => {
    const selected = Array.from(selectedBulletIndices).map((i) => resumeBullets[i]);
    setBullets(selected.length > 0 ? selected : ['']);
    setBulletSource('manual');
    toast.success(`Imported ${selected.length} bullet point${selected.length !== 1 ? 's' : ''}`);
  };

  const addBullet = () => {
    if (bullets.length < 10) {
      setBullets([...bullets, '']);
    }
  };

  const updateBullet = (index: number, value: string) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    setBullets(newBullets);
  };

  const removeBullet = (index: number) => {
    if (bullets.length > 1) {
      setBullets(bullets.filter((_, i) => i !== index));
    }
  };

  const handleQuantify = async () => {
    const validBullets = bullets.filter((b) => b.trim());
    if (validBullets.length === 0) {
      toast.error('Please enter at least one bullet point');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.quantifyAchievements({
        bullets: validBullets,
        jobContext: jobContext || undefined,
      });
      if (response.success && response.data) {
        setResult(response.data);
        toast.success('Achievements quantified!');
      }
    } catch (error) {
      toast.error('Failed to quantify achievements');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Enter Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Target Job (Optional)
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={jobContext}
                onChange={(e) => setJobContext(e.target.value)}
                placeholder="e.g., Senior Product Manager at Google"
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Bullet Source Toggle */}
          <SegmentedControl
            options={[
              { value: 'manual' as const, label: 'Enter Manually', icon: <Edit3 className="h-4 w-4" /> },
              { value: 'resume' as const, label: 'From Resume', icon: <FileText className="h-4 w-4" />, count: resumes.length },
            ]}
            value={bulletSource}
            onChange={setBulletSource}
          />

          {bulletSource === 'resume' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Resume</label>
                {isLoadingResumes ? (
                  <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl">
                    <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
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
                      onClick={() => setShowResumeDropdown(!showResumeDropdown)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                    >
                      {selectedResume ? (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <FileText className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-medium">{selectedResume.title || selectedResume.fileName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Choose a resume to import from...</span>
                      )}
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showResumeDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showResumeDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {resumes.map((resume) => (
                          <button
                            key={resume.id}
                            type="button"
                            onClick={() => handleSelectResume(resume.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left border-b border-slate-100 last:border-0 ${
                              selectedResumeId === resume.id ? 'bg-green-50' : ''
                            }`}
                          >
                            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                              <FileText className="h-4 w-4 text-green-600" />
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

              {/* Bullet points from resume */}
              {selectedResumeId && resumeBullets.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-slate-700">
                      Select Bullets to Quantify ({selectedBulletIndices.size} selected)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedBulletIndices.size === resumeBullets.length) {
                          setSelectedBulletIndices(new Set());
                        } else {
                          setSelectedBulletIndices(new Set(resumeBullets.map((_, i) => i)));
                        }
                      }}
                      className="text-xs text-green-600 font-medium"
                    >
                      {selectedBulletIndices.size === resumeBullets.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100">
                    {resumeBullets.map((bullet, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 px-3 py-2 cursor-pointer hover:bg-green-50 transition-colors ${
                          selectedBulletIndices.has(idx) ? 'bg-green-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBulletIndices.has(idx)}
                          onChange={() => toggleBulletSelection(idx)}
                          className="mt-1 h-4 w-4 text-green-600 rounded border-slate-300 focus:ring-green-500"
                        />
                        <span className="text-sm text-slate-700">{bullet}</span>
                      </label>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={importSelectedBullets}
                    disabled={selectedBulletIndices.size === 0}
                  >
                    Import {selectedBulletIndices.size} Bullet{selectedBulletIndices.size !== 1 ? 's' : ''} & Quantify
                  </Button>
                </div>
              )}

              {selectedResumeId && resumeBullets.length === 0 && (
                <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
                  <p className="text-slate-500 text-sm">No bullet points found in this resume</p>
                  <button
                    type="button"
                    onClick={() => setBulletSource('manual')}
                    className="text-green-600 text-sm font-medium mt-1"
                  >
                    Enter manually instead
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bullet Points to Quantify
                </label>
                <div className="space-y-2">
                  {bullets.map((bullet, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => updateBullet(idx, e.target.value)}
                        placeholder="e.g., Improved customer satisfaction"
                        className="flex-1 px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder:text-slate-400"
                      />
                      {bullets.length > 1 && (
                        <button
                          onClick={() => removeBullet(idx)}
                          className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {bullets.length < 10 && (
                  <button
                    onClick={addBullet}
                    className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    + Add another bullet point
                  </button>
                )}
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleQuantify}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Quantifying...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Quantify Achievements
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
              <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Transform Vague to Valuable</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Turn generic bullet points into powerful, metrics-driven achievements
                that capture recruiters' attention.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {result.achievements.map((achievement, idx) => (
              <Card key={idx} variant="elevated">
                <CardContent className="py-4">
                  <div className="mb-3">
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Original</span>
                    <p className="text-slate-600 line-through">{achievement.original}</p>
                  </div>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-green-600 uppercase tracking-wide font-medium">
                        Quantified Version
                      </span>
                      <button
                        onClick={() => copyToClipboard(achievement.quantified)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-slate-900 font-medium">{achievement.quantified}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${
                      achievement.impactLevel === 'High' ? 'bg-green-100 text-green-700' :
                      achievement.impactLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {achievement.impactLevel} Impact
                    </Badge>
                    {achievement.addedMetrics.map((metric, i) => (
                      <Badge key={i} className="bg-blue-50 text-blue-700">
                        +{metric}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Tips */}
            <Card variant="elevated" className="bg-green-50 border-green-200">
              <CardContent className="py-4">
                <h4 className="font-medium text-green-800 mb-2">Pro Tips</h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// Weakness Detector Tab
function WeaknessDetectorTab({ resumes, savedJobs, isLoadingResumes, isLoadingSavedJobs }: {
  resumes: any[];
  savedJobs: JobApplication[];
  isLoadingResumes: boolean;
  isLoadingSavedJobs: boolean;
}) {
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
  const [showResumeDropdown, setShowResumeDropdown] = useState(false);
  const [showJobDropdown, setShowJobDropdown] = useState(false);

  const handleSelectSavedJob = (jobId: string) => {
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJobId(jobId);
      setTargetRole(job.jobTitle);
      setShowJobDropdown(false);
    }
  };

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    setShowResumeDropdown(false);
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
                  onClick={() => setShowResumeDropdown(!showResumeDropdown)}
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
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${showResumeDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showResumeDropdown && (
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
                    onClick={() => setShowJobDropdown(!showJobDropdown)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all text-sm"
                  >
                    {selectedJob ? (
                      <span className="truncate">{selectedJob.jobTitle}</span>
                    ) : (
                      <span className="text-slate-500">Select a job...</span>
                    )}
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform flex-shrink-0 ${showJobDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showJobDropdown && (
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

// Follow-up Email Tab
function FollowUpEmailTab({ resumes, savedJobs, isLoadingResumes, isLoadingSavedJobs }: { resumes: any[]; savedJobs: JobApplication[]; isLoadingResumes: boolean; isLoadingSavedJobs: boolean }) {
  const [emailType, setEmailType] = useState<FollowUpType>('thank_you');
  const [formData, setFormData] = useState({
    candidateName: '',
    companyName: '',
    jobTitle: '',
    recipientName: '',
    recipientTitle: '',
    interviewDate: '',
    interviewDetails: '',
    keyPoints: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FollowUpEmailResult | null>(null);

  // Resume selection
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Job source state
  const [jobInputMode, setJobInputMode] = useState<'saved' | 'manual'>('saved');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [showJobDropdown, setShowJobDropdown] = useState(false);

  const emailTypes: { value: FollowUpType; label: string; description: string }[] = [
    { value: 'thank_you', label: 'Thank You', description: 'Send within 24 hours after interview' },
    { value: 'post_interview', label: 'Post Interview', description: 'Follow up 5-7 days after interview' },
    { value: 'no_response', label: 'No Response', description: 'Gentle nudge after 2+ weeks' },
    { value: 'after_rejection', label: 'After Rejection', description: 'Gracious response to rejection' },
    { value: 'networking', label: 'Networking', description: 'After informational interview' },
  ];

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    const resume = resumes.find((r) => r.id === resumeId);
    if (resume?.parsedData?.contact?.name && !formData.candidateName) {
      setFormData((prev) => ({ ...prev, candidateName: resume.parsedData.contact.name }));
    }
  };

  const handleSelectSavedJob = (jobId: string) => {
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJobId(jobId);
      setFormData((prev) => ({
        ...prev,
        companyName: job.companyName,
        jobTitle: job.jobTitle,
        recipientName: job.contactName || '',
      }));
      setShowJobDropdown(false);
      toast.success('Job details loaded!');
    }
  };

  const handleGenerate = async () => {
    if (!formData.candidateName || !formData.companyName || !formData.jobTitle) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.generateFollowUpEmail({
        type: emailType,
        candidateName: formData.candidateName,
        companyName: formData.companyName,
        jobTitle: formData.jobTitle,
        recipientName: formData.recipientName || undefined,
        recipientTitle: formData.recipientTitle || undefined,
        interviewDate: formData.interviewDate || undefined,
        interviewDetails: formData.interviewDetails || undefined,
        keyPoints: formData.keyPoints ? formData.keyPoints.split(',').map((k) => k.trim()) : undefined,
        resumeId: selectedResumeId || undefined,
      });
      if (response.success && response.data) {
        setResult(response.data);
        toast.success('Email generated!');
      }
    } catch (error) {
      toast.error('Failed to generate email');
    } finally {
      setIsLoading(false);
    }
  };

  const copyEmail = () => {
    if (result) {
      navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
      toast.success('Email copied to clipboard!');
    }
  };

  const selectedJob = savedJobs.find((j) => j.id === selectedJobId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="space-y-4">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Email Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {emailTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setEmailType(type.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    emailType === type.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-purple-200'
                  }`}
                >
                  <div className="font-medium text-slate-900">{type.label}</div>
                  <div className="text-sm text-slate-500">{type.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resume Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-purple-500" />Your Resume (optional — personalizes the email)</span>
              </label>
              {isLoadingResumes ? (
                <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl text-slate-500 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading...</div>
              ) : resumes.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No resumes uploaded yet.</p>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => handleSelectResume(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-slate-900"
                >
                  <option value="">— Select a resume (optional) —</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title || r.originalFileName}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Job Source Toggle */}
            <SegmentedControl
              options={[
                { value: 'saved' as const, label: 'From Job Tracker', icon: <Heart className="h-4 w-4" />, count: savedJobs.length },
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
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Application</label>
                {isLoadingSavedJobs ? (
                  <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl">
                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                    <span className="text-slate-500">Loading...</span>
                  </div>
                ) : savedJobs.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
                    <Heart className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 font-medium text-sm">No job applications</p>
                    <p className="text-xs text-slate-500 mt-1">Add applications in the Job Tracker</p>
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
                      onClick={() => setShowJobDropdown(!showJobDropdown)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      {selectedJob ? (
                        <span className="text-slate-900">{selectedJob.jobTitle} at {selectedJob.companyName}</span>
                      ) : (
                        <span className="text-slate-500">Select a job application...</span>
                      )}
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showJobDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showJobDropdown && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {savedJobs.map((job) => (
                          <button
                            key={job.id}
                            type="button"
                            onClick={() => handleSelectSavedJob(job.id)}
                            className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-slate-100 last:border-0 ${
                              selectedJobId === job.id ? 'bg-purple-50' : ''
                            }`}
                          >
                            <div className="w-10 h-10 bg-slate-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate">{job.jobTitle}</p>
                              <p className="text-sm text-slate-500 truncate">{job.companyName}</p>
                              <Badge className="mt-1 text-xs" variant={
                                job.status === 'INTERVIEWING' ? 'info' :
                                job.status === 'APPLIED' ? 'warning' :
                                job.status === 'REJECTED' ? 'error' : 'secondary'
                              }>
                                {job.status.toLowerCase()}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Show form when manual mode or job selected */}
            {(jobInputMode === 'manual' || (jobInputMode === 'saved' && selectedJobId)) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.candidateName}
                        onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Name</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
                        readOnly={jobInputMode === 'saved' && !!selectedJobId}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
                        readOnly={jobInputMode === 'saved' && !!selectedJobId}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Interview Details</label>
                  <textarea
                    value={formData.interviewDetails}
                    onChange={(e) => setFormData({ ...formData, interviewDetails: e.target.value })}
                    placeholder="Topics discussed, projects mentioned, etc."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                  />
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Generate Email
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Result */}
      <div className="space-y-4">
        {!result ? (
          <Card variant="elevated">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Perfect Follow-up Emails</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Generate professional thank you notes, follow-ups, and responses
                that leave a lasting impression.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Generated Email</CardTitle>
                  <Button variant="outline" size="sm" onClick={copyEmail}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Subject</span>
                    <p className="font-medium text-slate-900">{result.subject}</p>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Body</span>
                    <div className="mt-2 text-slate-700 whitespace-pre-wrap">{result.body}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="py-4">
                <p className="text-sm text-slate-500 mb-2">
                  <span className="font-medium">Best Time to Send:</span> {result.timing}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.alternativeSubjects.map((subject, idx) => (
                    <Badge key={idx} className="bg-purple-50 text-purple-700 cursor-pointer hover:bg-purple-100">
                      Alt: {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated" className="bg-purple-50 border-purple-200">
              <CardContent className="py-4">
                <h4 className="font-medium text-purple-800 mb-2">Tips</h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-purple-700">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// Networking Message Tab
function NetworkingMessageTab({ resumes, isLoadingResumes }: { resumes: any[]; isLoadingResumes: boolean }) {
  const [platform, setPlatform] = useState<NetworkingPlatform>('linkedin');
  const [purpose, setPurpose] = useState<NetworkingPurpose>('informational_interview');
  const [formData, setFormData] = useState({
    senderName: '',
    senderBackground: '',
    recipientName: '',
    recipientTitle: '',
    recipientCompany: '',
    targetRole: '',
    commonGround: '',
    specificAsk: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NetworkingMessageResult | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const platforms: { value: NetworkingPlatform; label: string }[] = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'email', label: 'Email' },
    { value: 'twitter', label: 'Twitter/X' },
  ];

  const purposes: { value: NetworkingPurpose; label: string }[] = [
    { value: 'informational_interview', label: 'Informational Interview' },
    { value: 'job_inquiry', label: 'Job Inquiry' },
    { value: 'referral_request', label: 'Referral Request' },
    { value: 'reconnection', label: 'Reconnection' },
    { value: 'cold_outreach', label: 'Cold Outreach' },
  ];

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    const resume = resumes.find((r) => r.id === resumeId);
    if (resume?.parsedData) {
      const pd = resume.parsedData;
      const name = pd.contact?.name || '';
      const summary = pd.summary || '';
      const topRole = pd.experience?.[0];
      const roleDesc = topRole ? `${topRole.title || topRole.position} at ${topRole.company}` : '';
      const background = summary || roleDesc || '';
      if (name && !formData.senderName) setFormData((prev) => ({ ...prev, senderName: name }));
      if (background && !formData.senderBackground) setFormData((prev) => ({ ...prev, senderBackground: background.slice(0, 200) }));
      toast.success('Resume loaded — name and background pre-filled');
    }
  };

  const handleGenerate = async () => {
    if (!formData.senderName || !formData.senderBackground || !formData.recipientName || !formData.recipientTitle || !formData.recipientCompany) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.generateNetworkingMessage({
        platform,
        purpose,
        senderName: formData.senderName,
        senderBackground: formData.senderBackground,
        recipientName: formData.recipientName,
        recipientTitle: formData.recipientTitle,
        recipientCompany: formData.recipientCompany,
        targetRole: formData.targetRole || undefined,
        commonGround: formData.commonGround ? formData.commonGround.split(',').map((g) => g.trim()) : undefined,
        specificAsk: formData.specificAsk || undefined,
        resumeId: selectedResumeId || undefined,
      });
      if (response.success && response.data) {
        setResult(response.data);
        toast.success('Message generated!');
      }
    } catch (error) {
      toast.error('Failed to generate message');
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = () => {
    if (result) {
      navigator.clipboard.writeText(result.message);
      toast.success('Message copied!');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="space-y-4">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Message Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
              <div className="flex gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={`flex-1 py-2 px-4 rounded-xl border font-medium transition-all ${
                      platform === p.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-blue-200 hover:text-blue-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as NetworkingPurpose)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
              >
                {purposes.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">Your Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resume selector — auto-fills name + background */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-blue-500" />Load from Resume (auto-fills your info)</span>
              </label>
              {isLoadingResumes ? (
                <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl text-slate-500 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading...</div>
              ) : resumes.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No resumes uploaded yet.</p>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => handleSelectResume(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                >
                  <option value="">— Select a resume to auto-fill —</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title || r.originalFileName}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Background *</label>
              <textarea
                value={formData.senderBackground}
                onChange={(e) => setFormData({ ...formData, senderBackground: e.target.value })}
                placeholder="e.g., Software engineer with 5 years experience in fintech"
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Role</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="e.g., Senior Product Manager"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">Recipient Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.recipientTitle}
                  onChange={(e) => setFormData({ ...formData, recipientTitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company *</label>
              <input
                type="text"
                value={formData.recipientCompany}
                onChange={(e) => setFormData({ ...formData, recipientCompany: e.target.value })}
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Common Ground</label>
              <input
                type="text"
                value={formData.commonGround}
                onChange={(e) => setFormData({ ...formData, commonGround: e.target.value })}
                placeholder="Same university, mutual connection, etc. (comma-separated)"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
              />
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Generate Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Result */}
      <div className="space-y-4">
        {!result ? (
          <Card variant="elevated">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Open Doors with Cold Outreach</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Generate personalized networking messages that get responses.
                Perfect for LinkedIn, email, and Twitter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700">{result.platform}</Badge>
                    Message
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={copyMessage}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-700 whitespace-pre-wrap">{result.message}</p>
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  <span className="font-medium">Strategy:</span> {result.approach}
                </p>
              </CardContent>
            </Card>

            {result.followUpMessage && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-base">Follow-up Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-slate-700 whitespace-pre-wrap">{result.followUpMessage}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card variant="elevated" className="bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <h4 className="font-medium text-blue-800 mb-2">Outreach Tips</h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-700">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="py-4">
                <h4 className="font-medium text-slate-900 mb-2">Personalization Points</h4>
                <div className="flex flex-wrap gap-2">
                  {result.personalizationPoints.map((point, idx) => (
                    <Badge key={idx} className="bg-amber-50 text-amber-700">
                      {point}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
