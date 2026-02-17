'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import SegmentedControl from '@/components/ui/SegmentedControl';
import ATSScoreCircle from '@/components/resume/ATSScoreCircle';
import { useAuthStore } from '@/store/auth';
import {
  FileText,
  ArrowLeft,
  Download,
  Plus,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  Sparkles,
  Briefcase,
  Building,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  GitCompare,
  Loader2,
  FolderKanban,
  Award,
  Globe,
  Trophy,
  DollarSign,
  Clock,
  Heart,
  Search,
  ChevronDown,
  ExternalLink,
  Edit2,
} from 'lucide-react';
import api from '@/lib/api';
import { Resume, ResumeVersion } from '@/types';
import { formatDate, downloadBlob, getScoreColor, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ResumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const resumeId = params.id as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showCustomizeForm, setShowCustomizeForm] = useState(false);

  // Customize form state
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Input mode state
  const [inputMode, setInputMode] = useState<'saved' | 'manual'>('saved');

  // Saved jobs state
  const [savedJobs, setSavedJobs] = useState<Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    salary?: string;
    description: string;
    url: string;
    type?: string;
  }>>([]);
  const [isLoadingSavedJobs, setIsLoadingSavedJobs] = useState(false);
  const [selectedSavedJobId, setSelectedSavedJobId] = useState<string>('');
  const [showSavedJobsDropdown, setShowSavedJobsDropdown] = useState(false);

  // Selected job info for display
  const [selectedJobInfo, setSelectedJobInfo] = useState<{
    location?: string;
    salary?: string;
    type?: string;
    url?: string;
  } | null>(null);

  const isPro = user?.planType === 'PRO' || user?.planType === 'BUSINESS';

  useEffect(() => {
    loadResume();
    loadSavedJobs();
  }, [resumeId]);

  const loadSavedJobs = async () => {
    setIsLoadingSavedJobs(true);
    try {
      const response = await api.getSavedJobs(1, 50); // Get up to 50 saved jobs
      if (response.success && response.data) {
        setSavedJobs(response.data.jobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary || undefined,
          description: job.description,
          url: job.url,
          type: job.type || undefined,
        })));
      }
    } catch (error) {
      // Silent fail - saved jobs are optional
    } finally {
      setIsLoadingSavedJobs(false);
    }
  };

  const loadResume = async () => {
    try {
      const response = await api.getResume(resumeId);
      if (response.success && response.data) {
        setResume(response.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load resume'));
      router.push('/resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomize = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobTitle || !companyName || !jobDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsCustomizing(true);

    try {
      const response = await api.customizeResume(resumeId, {
        jobTitle,
        companyName,
        jobDescription,
      });

      if (response.success && response.data) {
        toast.success('Resume customized successfully!');
        setShowCustomizeForm(false);
        setJobTitle('');
        setCompanyName('');
        setJobDescription('');
        loadResume();
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to customize resume'));
    } finally {
      setIsCustomizing(false);
    }
  };

  const handleDownload = async (versionId: string, format: 'pdf' | 'docx') => {
    try {
      const blob = await api.downloadVersion(resumeId, versionId, format);
      const version = resume?.versions?.find((v) => v.id === versionId);
      const filename = `resume-${version?.companyName || 'tailored'}.${format}`;
      downloadBlob(blob, filename);
      toast.success('Download started');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to download resume'));
    }
  };

  const handleSelectSavedJob = (jobId: string) => {
    const job = savedJobs.find((j) => j.id === jobId);
    if (!job) return;

    // Auto-fill the form
    setJobTitle(job.title);
    setCompanyName(job.company);
    setJobDescription(job.description);
    setSelectedSavedJobId(jobId);
    setShowSavedJobsDropdown(false);

    // Store additional info for display
    setSelectedJobInfo({
      location: job.location,
      salary: job.salary,
      type: job.type,
      url: job.url,
    });

    toast.success('Job details loaded!');
  };

  const clearSelectedJob = () => {
    setSelectedSavedJobId('');
    setJobTitle('');
    setCompanyName('');
    setJobDescription('');
    setSelectedJobInfo(null);
  };

  const resetForm = () => {
    setShowCustomizeForm(false);
    setJobTitle('');
    setCompanyName('');
    setJobDescription('');
    setSelectedSavedJobId('');
    setSelectedJobInfo(null);
    setInputMode('saved');
    setShowSavedJobsDropdown(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <p className="text-slate-500">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/resumes">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{resume.title}</h1>
              <p className="text-slate-500">{resume.fileName}</p>
            </div>
          </div>
          <Badge variant={resume.parseStatus === 'completed' ? 'success' : 'warning'} size="lg">
            {resume.parseStatus}
          </Badge>
        </div>

        {/* Customize Form */}
        {resume.parseStatus === 'completed' && (
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Customize for a Job</CardTitle>
                    {!showCustomizeForm && (
                      <CardDescription>
                        Create a tailored version of your resume for a specific job posting
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Button
                  variant={showCustomizeForm ? 'outline' : 'gradient'}
                  onClick={() => setShowCustomizeForm(!showCustomizeForm)}
                  leftIcon={showCustomizeForm ? undefined : <Plus className="h-4 w-4" />}
                >
                  {showCustomizeForm ? 'Cancel' : 'Create New Version'}
                </Button>
              </div>
            </CardHeader>

            {showCustomizeForm && (
              <CardContent>
                {/* Input Mode Toggle */}
                <SegmentedControl
                  options={[
                    { value: 'saved' as const, label: 'From Saved Jobs', icon: <Heart className="h-4 w-4" />, count: savedJobs.length },
                    { value: 'manual' as const, label: 'Enter Manually', icon: <FileText className="h-4 w-4" /> },
                  ]}
                  value={inputMode}
                  onChange={setInputMode}
                  className="mb-6"
                />

                {/* Saved Jobs Selector Mode */}
                {inputMode === 'saved' && !jobTitle && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Select from Saved Jobs
                      </label>
                      {isLoadingSavedJobs ? (
                        <div className="flex items-center gap-2 p-4 border border-slate-200 rounded-xl">
                          <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
                          <span className="text-slate-500">Loading saved jobs...</span>
                        </div>
                      ) : savedJobs.length === 0 ? (
                        <div className="p-6 border border-dashed border-slate-300 rounded-xl text-center">
                          <Heart className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-600 font-medium">No saved jobs yet</p>
                          <p className="text-sm text-slate-500 mt-1">
                            Save jobs from the Job Board to quickly customize your resume
                          </p>
                          <div className="flex justify-center gap-3 mt-4">
                            <a href="/jobs">
                              <Button variant="gradient" size="sm" leftIcon={<Search className="h-4 w-4" />}>
                                Browse Jobs
                              </Button>
                            </a>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInputMode('manual')}
                            >
                              Enter Manually
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowSavedJobsDropdown(!showSavedJobsDropdown)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                          >
                            <span className="text-slate-500">Select a job to customize for...</span>
                            <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showSavedJobsDropdown ? 'rotate-180' : ''}`} />
                          </button>

                          {showSavedJobsDropdown && (
                            <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                              {savedJobs.map((job) => (
                                <button
                                  key={job.id}
                                  type="button"
                                  onClick={() => handleSelectSavedJob(job.id)}
                                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-slate-100 last:border-0"
                                >
                                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Building className="h-5 w-5 text-indigo-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 truncate">{job.title}</p>
                                    <p className="text-sm text-slate-500 truncate">{job.company}</p>
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
                          <a href="/jobs" className="text-indigo-600 hover:text-indigo-700">Manage jobs</a>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Form (shown after job selection or in manual mode) */}
                {(inputMode === 'manual' || jobTitle) && (
                  <form onSubmit={handleCustomize} className="space-y-5">
                    {/* Selected Job Info Banner */}
                    {selectedJobInfo && (selectedJobInfo.location || selectedJobInfo.salary || selectedJobInfo.type || selectedJobInfo.url) && (
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <div className="flex flex-wrap items-center gap-3">
                          {selectedJobInfo.location && (
                            <span className="flex items-center gap-1.5 text-sm text-indigo-700">
                              <MapPin className="h-4 w-4" />
                              {selectedJobInfo.location}
                            </span>
                          )}
                          {selectedJobInfo.salary && (
                            <span className="flex items-center gap-1.5 text-sm text-indigo-700">
                              <DollarSign className="h-4 w-4" />
                              {selectedJobInfo.salary}
                            </span>
                          )}
                          {selectedJobInfo.type && (
                            <span className="flex items-center gap-1.5 text-sm text-indigo-700">
                              <Clock className="h-4 w-4" />
                              {selectedJobInfo.type}
                            </span>
                          )}
                        </div>
                        {selectedJobInfo.url && (
                          <a
                            href={selectedJobInfo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Original
                          </a>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Job Title
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="e.g., Senior Software Engineer"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            required
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Company Name
                        </label>
                        <div className="relative">
                          <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="e.g., Google"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Job Description
                      </label>
                      <textarea
                        rows={8}
                        placeholder="Paste the full job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="gradient"
                        isLoading={isCustomizing}
                        leftIcon={<Sparkles className="h-4 w-4" />}
                      >
                        Customize Resume
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            )}
          </Card>
        )}

        {/* Versions List */}
        {resume.versions && resume.versions.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Tailored Versions
                  </CardTitle>
                  <CardDescription>
                    {resume.versions.length} version{resume.versions.length !== 1 ? 's' : ''} created
                  </CardDescription>
                </div>
                {resume.versions.length >= 2 && (
                  <Link href={`/resumes/${resumeId}/compare`}>
                    <Button variant="outline" size="sm" leftIcon={<GitCompare className="h-4 w-4" />}>
                      Compare
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resume.versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <ATSScoreCircle score={version.atsScore} size="sm" showLabel={false} />
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {version.jobTitle} at {version.companyName}
                        </h4>
                        <p className="text-sm text-slate-500">
                          Version {version.versionNumber} • Created {formatDate(version.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={version.atsScore >= 80 ? 'success' : version.atsScore >= 60 ? 'warning' : 'error'}>
                        ATS: {version.atsScore}%
                      </Badge>
                      <Link href={`/resumes/${resumeId}/versions/${version.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(version.id, 'pdf')}
                        leftIcon={<Download className="h-4 w-4" />}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Original Resume Content */}
        {resume.rawText && resume.rawText.length > 50 && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Resume Content
              </CardTitle>
              <CardDescription>Original content from your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                {(() => {
                  let underSubHeader = false;

                  return resume.rawText.split('\n').map((line, index) => {
                    const trimmedLine = line.trim();

                    if (!trimmedLine) {
                      return <div key={index} className="h-2" />;
                    }

                    // Section header
                    const isHeader = (
                      trimmedLine.length < 50 &&
                      (trimmedLine === trimmedLine.toUpperCase() ||
                       /^(Summary|Experience|Education|Skills|Projects|Certifications|Languages|Awards|Profile|Objective|Work History|Employment|Technical Skills|Professional Experience|Core Competencies|Achievements|Publications|References)/i.test(trimmedLine))
                    );

                    // Sub-header
                    const hasDate = /\b(19|20)\d{2}\b/.test(trimmedLine) || /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(trimmedLine);
                    const isSubHeader = (
                      !isHeader &&
                      trimmedLine.length < 100 &&
                      !/\.$/.test(trimmedLine) &&
                      (hasDate ||
                       /\b(Engineer|Developer|Manager|Director|Lead|Senior|Junior|Intern|Associate|Analyst|Designer|Consultant|Specialist|Coordinator|Administrator|Architect|Scientist|University|College|Institute|School|Inc|LLC|Ltd|Corp|Company|Bachelor|Master|PhD|MBA|B\.S\.|M\.S\.|B\.A\.|M\.A\.)\b/i.test(trimmedLine))
                    );

                    // Remove existing bullet characters for clean display
                    const cleanLine = trimmedLine.replace(/^[•\-\*▪◦›●○]\s*/, '');

                    if (isHeader) {
                      underSubHeader = false;
                      return (
                        <h3 key={index} className="font-bold text-slate-800 uppercase tracking-wide text-xs mt-5 mb-2 border-b border-slate-200 pb-1">
                          {trimmedLine}
                        </h3>
                      );
                    }

                    if (isSubHeader) {
                      underSubHeader = true;
                      return (
                        <p key={index} className="font-semibold text-slate-700 mt-3 mb-0.5">
                          {trimmedLine}
                        </p>
                      );
                    }

                    return (
                      <p key={index} className={`leading-relaxed text-slate-600 ${underSubHeader ? 'pl-4' : 'pl-1'}`}>
                        {cleanLine}
                      </p>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {(!resume.rawText || resume.rawText.length < 50) && resume.fileName === 'Created with Resume Builder' && (() => {
          // Check if parsedData has any actual content
          const hasContent = resume.parsedData && (
            resume.parsedData.contact?.name ||
            resume.parsedData.contact?.email ||
            resume.parsedData.summary ||
            (resume.parsedData.experience && resume.parsedData.experience.length > 0) ||
            (resume.parsedData.education && resume.parsedData.education.length > 0) ||
            (resume.parsedData.skills && resume.parsedData.skills.length > 0)
          );

          if (hasContent) {
            // Show structured content from parsedData
            return (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Resume Content
                  </CardTitle>
                  <CardDescription>Content from Resume Builder</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Contact */}
                    {resume.parsedData.contact && (resume.parsedData.contact.name || resume.parsedData.contact.email) && (
                      <div>
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-3 border-b border-slate-200 pb-1">
                          Contact
                        </h3>
                        <div className="text-sm text-slate-600 space-y-1">
                          {resume.parsedData.contact.name && <p className="font-medium">{resume.parsedData.contact.name}</p>}
                          {resume.parsedData.contact.email && <p>{resume.parsedData.contact.email}</p>}
                          {resume.parsedData.contact.phone && <p>{resume.parsedData.contact.phone}</p>}
                          {resume.parsedData.contact.location && <p>{resume.parsedData.contact.location}</p>}
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {resume.parsedData.summary && (
                      <div>
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-3 border-b border-slate-200 pb-1">
                          Summary
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{resume.parsedData.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {resume.parsedData.experience && resume.parsedData.experience.length > 0 && (
                      <div>
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-3 border-b border-slate-200 pb-1">
                          Experience
                        </h3>
                        <div className="space-y-4">
                          {resume.parsedData.experience.map((exp: any, i: number) => (
                            <div key={i}>
                              <p className="font-semibold text-slate-700">{exp.title}</p>
                              {exp.company && <p className="text-sm text-indigo-600">{exp.company}</p>}
                              {exp.startDate && (
                                <p className="text-xs text-slate-500">
                                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate || 'Present'}
                                </p>
                              )}
                              {exp.description && exp.description.length > 0 && (
                                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                                  {exp.description.map((desc: string, j: number) => (
                                    <li key={j} className="flex items-start gap-2">
                                      <span className="text-slate-400 mt-1">•</span>
                                      <span>{desc}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {resume.parsedData.education && resume.parsedData.education.length > 0 && (
                      <div>
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-3 border-b border-slate-200 pb-1">
                          Education
                        </h3>
                        <div className="space-y-3">
                          {resume.parsedData.education.map((edu: any, i: number) => (
                            <div key={i}>
                              <p className="font-semibold text-slate-700">{edu.degree}</p>
                              {edu.institution && <p className="text-sm text-indigo-600">{edu.institution}</p>}
                              <div className="flex items-center gap-3 mt-0.5">
                                {edu.graduationDate && <p className="text-xs text-slate-500">{edu.graduationDate}</p>}
                                {edu.gpa && <p className="text-xs text-slate-500">GPA: {edu.gpa}</p>}
                              </div>
                              {edu.achievements && edu.achievements.length > 0 && (
                                <ul className="mt-1 space-y-0.5">
                                  {edu.achievements.map((a: string, j: number) => (
                                    <li key={j} className="text-xs text-slate-500 flex items-start gap-1">
                                      <span className="text-indigo-400 mt-0.5">·</span>
                                      <span>{a}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {resume.parsedData.skills && resume.parsedData.skills.length > 0 && (
                      <div>
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-3 border-b border-slate-200 pb-1">
                          Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {resume.parsedData.skills.map((skill: string, i: number) => (
                            <Badge key={i} variant="default" className="text-xs text-slate-800">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {resume.parsedData.projects && resume.parsedData.projects.length > 0 && (
                      <div>
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-3 border-b border-slate-200 pb-1">
                          Projects
                        </h3>
                        <div className="space-y-3">
                          {resume.parsedData.projects.map((project: any, i: number) => (
                            <div key={i}>
                              <p className="font-semibold text-slate-700">{project.name}</p>
                              {project.description && <p className="text-sm text-slate-600 mt-1">{project.description}</p>}
                              {project.technologies && project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {project.technologies.map((tech: string, j: number) => (
                                    <Badge key={j} variant="default" className="text-xs text-slate-800">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              {project.url && (
                                <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline mt-1 inline-block">
                                  {project.url}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {resume.parsedData.certifications && resume.parsedData.certifications.length > 0 && (
                      <div>
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-3 border-b border-slate-200 pb-1">
                          Certifications
                        </h3>
                        <ul className="space-y-2 text-sm">
                          {resume.parsedData.certifications.map((cert: any, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-indigo-600 mt-0.5">•</span>
                              {typeof cert === 'string' ? (
                                <span className="text-slate-600">{cert}</span>
                              ) : (
                                <div>
                                  <span className="font-medium text-slate-700">{cert.name}</span>
                                  {(cert.issuer || cert.date) && (
                                    <span className="text-slate-500 text-xs ml-2">
                                      {cert.issuer}{cert.issuer && cert.date ? ' · ' : ''}{cert.date}
                                    </span>
                                  )}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Languages */}
                    {resume.parsedData.languages && resume.parsedData.languages.length > 0 && (
                      <div>
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-3 border-b border-slate-200 pb-1">
                          Languages
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {resume.parsedData.languages.map((lang: string, i: number) => (
                            <Badge key={i} variant="info" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Awards */}
                    {resume.parsedData.awards && resume.parsedData.awards.length > 0 && (
                      <div>
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-3 border-b border-slate-200 pb-1">
                          Awards & Honors
                        </h3>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {resume.parsedData.awards.map((award: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <Trophy className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span>{award}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Volunteer Work */}
                    {resume.parsedData.volunteerWork && resume.parsedData.volunteerWork.length > 0 && (
                      <div>
                        <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs mb-3 border-b border-slate-200 pb-1">
                          Volunteer Work
                        </h3>
                        <div className="space-y-3">
                          {resume.parsedData.volunteerWork.map((vol: any, i: number) => (
                            <div key={i}>
                              <p className="font-semibold text-slate-700">{vol.role}</p>
                              {vol.organization && <p className="text-sm text-indigo-600">{vol.organization}</p>}
                              {vol.startDate && (
                                <p className="text-xs text-slate-500">
                                  {vol.startDate} - {vol.current ? 'Present' : vol.endDate}
                                </p>
                              )}
                              {vol.description && vol.description.length > 0 && (
                                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                                  {vol.description.map((desc: string, j: number) => (
                                    <li key={j} className="flex items-start gap-2">
                                      <span className="text-indigo-600 mt-1">•</span>
                                      <span>{desc}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-slate-200">
                      <Link href={`/resume-builder?id=${resumeId}`}>
                        <Button size="sm" variant="outline">
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit in Resume Builder
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }

          // No content yet - show add content message
          return (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Resume Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-indigo-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium mb-2">Your resume is ready to be filled in</p>
                  <p className="text-sm text-slate-500 mb-4">
                    Go to the Resume Builder to add your experience, education, skills, and other details.
                  </p>
                  <Link href={`/resume-builder?id=${resumeId}`}>
                    <Button size="sm" variant="primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Content
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {!resume.rawText && resume.fileName !== 'Created with Resume Builder' && (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Resume Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No content could be extracted from this resume.</p>
                <p className="text-sm text-slate-400 mt-2">
                  Try re-uploading the resume or check if the file format is supported (PDF or DOCX).
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden section - keeping parsedData structure for customization features */}
        {false && resume.parsedData && (
          <div className="hidden">

                {/* Experience */}
                {resume.parsedData.experience && resume.parsedData.experience.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      Experience
                    </h4>
                    <div className="space-y-4">
                      {resume.parsedData.experience.map((exp, i) => (
                        <div key={i} className="border-l-2 border-indigo-200 pl-4">
                          <h5 className="font-medium text-slate-900">{exp.title}</h5>
                          <p className="text-sm text-indigo-600 font-medium">
                            {exp.company}
                            {exp.startDate && (
                              <span className="text-slate-500 font-normal">
                                {' '}• {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </span>
                            )}
                          </p>
                          {exp.description && exp.description.length > 0 && (
                            <ul className="mt-2 text-sm text-slate-600 space-y-1">
                              {exp.description.map((desc, j) => {
                                const hasBullet = desc.startsWith('•');
                                const text = hasBullet ? desc.substring(1).trim() : desc;
                                return (
                                  <li key={j} className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-1.5">•</span>
                                    <span className="whitespace-pre-wrap">{text}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resume.parsedData.education && resume.parsedData.education.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      Education
                    </h4>
                    <ul className="space-y-3 text-sm text-slate-600">
                      {resume.parsedData.education.map((edu, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-violet-500 mt-0.5">•</span>
                          <div>
                            <p className="font-medium text-slate-900">{edu.degree}</p>
                            <p className="text-slate-600">
                              {edu.institution}
                              {edu.graduationDate && (
                                <span className="text-slate-400"> • {edu.graduationDate}</span>
                              )}
                            </p>
                            {edu.gpa && (
                              <p className="text-slate-500">GPA: {edu.gpa}</p>
                            )}
                            {edu.achievements && edu.achievements.length > 0 && (
                              <ul className="mt-1 ml-4 space-y-0.5">
                                {edu.achievements.map((achievement, j) => (
                                  <li key={j} className="flex items-start gap-2">
                                    <span className="text-violet-300 mt-0.5">◦</span>
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Projects */}
                {resume.parsedData.projects && resume.parsedData.projects.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-slate-400" />
                      Projects
                    </h4>
                    <div className="space-y-4">
                      {resume.parsedData.projects.map((project, i) => (
                        <div key={i} className="border-l-2 border-purple-200 pl-4">
                          <h5 className="font-medium text-slate-900">{project.name}</h5>
                          {project.company && (
                            <p className="text-sm text-purple-600 font-medium">
                              {project.company}
                              {project.dates && (
                                <span className="text-slate-500 font-normal"> • {project.dates}</span>
                              )}
                            </p>
                          )}
                          {project.description && (
                            <div className="mt-1 text-sm text-slate-600">
                              {project.description.split('\n').map((line, k) => {
                                const trimmedLine = line.trim();
                                if (!trimmedLine) return null;
                                const hasBullet = trimmedLine.startsWith('•');
                                const text = hasBullet ? trimmedLine.substring(1).trim() : trimmedLine;
                                return hasBullet ? (
                                  <div key={k} className="flex items-start gap-2 mb-1">
                                    <span className="text-purple-400 mt-0.5">•</span>
                                    <span>{text}</span>
                                  </div>
                                ) : (
                                  <p key={k} className={k > 0 ? 'mt-1' : ''}>{text}</p>
                                );
                              })}
                            </div>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.map((tech, j) => (
                                <Badge key={j} variant="default" size="sm" className="text-slate-800">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {(project.url || project.link) && (
                            <a
                              href={project.url || project.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Project
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {resume.parsedData.certifications && resume.parsedData.certifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-slate-400" />
                      Certifications
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {resume.parsedData.certifications.map((cert, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>
                            <span className="font-medium text-slate-900">{cert.name}</span>
                            {(cert.issuer || cert.date) && (
                              <span className="text-slate-500">
                                {cert.issuer && ` — ${cert.issuer}`}
                                {cert.date && ` (${cert.date})`}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Languages */}
                {resume.parsedData.languages && resume.parsedData.languages.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-slate-400" />
                      Languages
                    </h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {resume.parsedData.languages.map((language, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          <span>{language}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Awards */}
                {resume.parsedData.awards && resume.parsedData.awards.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-slate-400" />
                      Awards & Achievements
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {resume.parsedData.awards.map((award, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>
                            <span className="font-medium text-slate-900">{award.name}</span>
                            {(award.issuer || award.date) && (
                              <span className="text-slate-500">
                                {award.issuer && ` — ${award.issuer}`}
                                {award.date && ` (${award.date})`}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
          </div>
        )}

        {/* ATS Simulator CTA */}
        {!isPro && (
          <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'%3E%3C/path%3E%3C/svg%3E\")"}} />
            <CardContent className="py-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Crown className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Unlock ATS Simulator</h3>
                    <p className="text-white/80 text-sm">
                      See exactly how ATS systems read your resume. Upgrade to Pro.
                    </p>
                  </div>
                </div>
                <Link href="/subscription">
                  <Button variant="secondary" size="lg">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
