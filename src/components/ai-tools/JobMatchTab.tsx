'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { SavedJobsDropdown } from '@/components/ui/SavedJobsDropdown';
import { ResumeSelector } from '@/components/ui/ResumeSelector';
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
  Briefcase,
  BookOpen,
  ExternalLink,
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
  const [courseRecommendations, setCourseRecommendations] = useState<Array<{ title: string; url: string; provider: string }>>([]);

  // Input mode and dropdowns
  const [jobInputMode, setJobInputMode] = useState<'saved' | 'manual'>('saved');
  const [selectedJobId, setSelectedJobId] = useState('');

  const handleSelectSavedJob = (jobId: string) => {
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJobId(jobId);
      setJobTitle(job.jobTitle);
      setJobDescription(job.jobDescription || '');
    }
  };

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
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
        setCourseRecommendations((response.data as any).courseRecommendations || []);
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
          <ResumeSelector
            resumes={resumes}
            selectedResumeId={selectedResumeId}
            onSelect={handleSelectResume}
            isLoading={isLoadingResumes}
            colorTheme="blue"
          />

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
            <SavedJobsDropdown
              jobs={savedJobs}
              selectedJobId={selectedJobId}
              onSelect={handleSelectSavedJob}
              isLoading={isLoadingSavedJobs}
              placeholder="Select a job to analyze..."
              colorTheme="blue"
              onSwitchToManual={() => setJobInputMode('manual')}
              requireDescription={true}
              onDescriptionMissing={() => {
                toast.error('This job needs a description to use AI features. Please add one in Job Tracker or enter details manually.', {
                  duration: 5000,
                });
                setJobInputMode('manual');
              }}
            />
          )}

          {/* Form fields - shown when manual mode or when a saved job is selected */}
          {(jobInputMode === 'manual' || (jobInputMode === 'saved' && selectedJobId)) && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full pl-11 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
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
                  className={`w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none ${
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
                    className={`h-full rounded-full transition-all duration-500 ${
                      result.overallScore >= 85 ? 'bg-green-500' :
                      result.overallScore >= 70 ? 'bg-blue-600' :
                      result.overallScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
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

            {/* Deal Breakers */}
            {(result as any).dealBreakers?.length > 0 && (
              <Card variant="elevated" className="border-red-200 bg-red-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-red-700 flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5" />
                    Deal Breakers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(result as any).dealBreakers.map((db: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-red-700">
                        <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                        {db}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Course Recommendations */}
            {courseRecommendations.length > 0 && (
              <Card variant="elevated">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Close the Skill Gap
                  </CardTitle>
                  <p className="text-sm text-slate-500">Courses to fill the missing skills for this role:</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {courseRecommendations.map((course, idx) => (
                      <a
                        key={idx}
                        href={course.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 group-hover:text-blue-700 truncate">{course.title}</p>
                            <p className="text-xs text-slate-500">{course.provider}</p>
                          </div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}