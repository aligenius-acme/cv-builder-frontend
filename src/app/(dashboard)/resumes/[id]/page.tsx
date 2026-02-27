'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import SegmentedControl from '@/components/ui/SegmentedControl';
import ScoreCircle from '@/components/ui/ScoreCircle';
import DownloadModal from '@/components/resume/DownloadModal';
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
  Trash2,
  BookOpen,
} from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { Resume, ResumeVersion } from '@/types';
import { formatDate, getScoreColor, getErrorMessage } from '@/lib/utils';
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
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedVersionForDownload, setSelectedVersionForDownload] = useState<{
    id: string;
    versionNumber: number;
    label: string;
  } | null>(null);

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

  // Course recommendations after tailoring
  const [courseRecommendations, setCourseRecommendations] = useState<Array<{ title: string; url: string; provider: string }>>([]);

  // Selected job info for display
  const [selectedJobInfo, setSelectedJobInfo] = useState<{
    location?: string;
    salary?: string;
    type?: string;
    url?: string;
  } | null>(null);

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
        if (response.data.courseRecommendations?.length > 0) {
          setCourseRecommendations(response.data.courseRecommendations);
        }
        loadResume();
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to customize resume'));
    } finally {
      setIsCustomizing(false);
    }
  };

  const handleDownloadResume = () => {
    setSelectedVersionForDownload(null);
    setShowDownloadModal(true);
  };

  const handleDownload = (versionId: string) => {
    const version = resume?.versions?.find((v) => v.id === versionId);
    if (!version) return;

    setSelectedVersionForDownload({
      id: version.id,
      versionNumber: version.versionNumber,
      label: version.companyName,
    });
    setShowDownloadModal(true);
  };

  const handleDeleteVersion = async (versionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this tailored version?')) {
      return;
    }

    try {
      await api.deleteVersion(resumeId, versionId);
      toast.success('Version deleted');
      loadResume();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete version'));
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

  // Section header helper used in the resume content renderer
  const SectionHeader = ({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) => (
    <div className="flex items-center gap-2.5 mb-1">
      <div className={`w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">{title}</h3>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-slate-500">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
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
          <div className="flex items-center gap-3">
            {resume.parseStatus === 'completed' && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadResume}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Download Original
              </Button>
            )}
            <Badge variant={resume.parseStatus === 'completed' ? 'success' : 'warning'} size="lg">
              {resume.parseStatus}
            </Badge>
          </div>
        </div>

        {/* Customize Form */}
        {resume.parseStatus === 'completed' && (
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
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
                  variant={showCustomizeForm ? 'outline' : 'primary'}
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
                        <LoadingSpinner size="sm" text="Loading saved jobs..." centered={false} />
                      ) : savedJobs.length === 0 ? (
                        <div className="p-6 border border-dashed border-slate-300 rounded-xl text-center">
                          <Heart className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-600 font-medium">No saved jobs yet</p>
                          <p className="text-sm text-slate-500 mt-1">
                            Save jobs from the Job Board to quickly customize your resume
                          </p>
                          <div className="flex justify-center gap-3 mt-4">
                            <a href="/jobs">
                              <Button variant="primary" size="sm" leftIcon={<Search className="h-4 w-4" />}>
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
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-100 last:border-0"
                                >
                                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Building className="h-5 w-5 text-blue-600" />
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
                          <a href="/jobs" className="text-blue-600 hover:text-blue-700">Manage jobs</a>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Form (shown after job selection or in manual mode) */}
                {(inputMode === 'manual' || jobTitle) && (
                  <form onSubmit={handleCustomize} className="space-y-5">
                    {/* Selected Job Details Card */}
                    {selectedJobInfo && (
                      <div className="border border-blue-200 rounded-xl overflow-hidden">
                        {/* Header row */}
                        <div className="bg-blue-50 px-4 py-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <Building className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate">{jobTitle}</p>
                                <p className="text-sm text-slate-500 truncate">{companyName}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pl-9">
                              {selectedJobInfo.location && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {selectedJobInfo.location}
                                </span>
                              )}
                              {selectedJobInfo.salary && (
                                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  {selectedJobInfo.salary}
                                </span>
                              )}
                              {selectedJobInfo.type && (
                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                  <Clock className="h-3.5 w-3.5" />
                                  {selectedJobInfo.type}
                                </span>
                              )}
                              {selectedJobInfo.url && (
                                <a
                                  href={selectedJobInfo.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                  View Posting
                                </a>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={resetForm}
                            className="shrink-0 text-xs text-slate-400 hover:text-slate-600 transition-colors mt-1"
                          >
                            Change
                          </button>
                        </div>

                        {/* Description preview */}
                        {jobDescription && (
                          <div className="bg-white border-t border-blue-100 px-4 py-3">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Job Description</p>
                            <div className="max-h-40 overflow-y-auto pr-1">
                              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{jobDescription}</p>
                            </div>
                          </div>
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
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
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
                        variant="primary"
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
                    className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <ScoreCircle score={version.atsScore} size="sm" showLabel={false} />
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {version.jobTitle} at {version.companyName}
                        </h4>
                        <p className="text-sm text-slate-500">
                          Version {version.versionNumber} • Created {formatDate(version.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/resumes/${resumeId}/versions/${version.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(version.id)}
                        leftIcon={<Download className="h-4 w-4" />}
                      >
                        Download
                      </Button>
                      <button
                        onClick={(e) => handleDeleteVersion(version.id, e)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resume Content — always prefers structured parsedData, falls back to rawText */}
        {(() => {
          const pd = resume.parsedData;
          const hasStructuredContent = pd && (
            pd.contact?.name || pd.contact?.email || pd.summary ||
            (pd.experience?.length > 0) || (pd.education?.length > 0) || (pd.skills?.length > 0)
          );

          if (hasStructuredContent) {
            const skillColors = [
              'bg-blue-100 text-blue-700 border-blue-200',
              'bg-purple-100 text-purple-700 border-purple-200',
              'bg-emerald-100 text-emerald-700 border-emerald-200',
              'bg-blue-100 text-blue-700 border-blue-200',
              'bg-amber-100 text-amber-700 border-amber-200',
              'bg-rose-100 text-rose-700 border-rose-200',
              'bg-cyan-100 text-cyan-700 border-cyan-200',
              'bg-teal-100 text-teal-700 border-teal-200',
            ];

            return (
              <Card variant="elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Resume Content
                      </CardTitle>
                      <CardDescription>Structured content from your resume</CardDescription>
                    </div>
                    <Link href={`/resume-builder?id=${resumeId}`}>
                      <Button size="sm" variant="outline" leftIcon={<Edit2 className="h-4 w-4" />}>
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">

                    {/* ── CONTACT HEADER ── */}
                    {pd.contact && (pd.contact.name || pd.contact.email) && (
                      <div className="flex flex-col sm:flex-row items-start gap-5 p-5 bg-blue-50 rounded-xl border border-blue-100">
                        {(pd.photoUrl || pd.contact.photoUrl) && (
                          <img
                            src={pd.photoUrl || pd.contact.photoUrl}
                            alt={pd.contact.name || 'Profile photo'}
                            className="w-20 h-20 rounded-xl object-cover shadow-md border-2 border-white flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          {pd.contact.name && (
                            <h2 className="text-2xl font-bold text-slate-900">{pd.contact.name}</h2>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-sm text-slate-600">
                            {pd.contact.email && (
                              <span className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                {pd.contact.email}
                              </span>
                            )}
                            {pd.contact.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                {pd.contact.phone}
                              </span>
                            )}
                            {pd.contact.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                {pd.contact.location}
                              </span>
                            )}
                            {pd.contact.linkedin && (
                              <a href={`https://${pd.contact.linkedin.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium">
                                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                LinkedIn
                              </a>
                            )}
                            {pd.contact.github && (
                              <a href={`https://${pd.contact.github.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium">
                                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                                GitHub
                              </a>
                            )}
                            {pd.contact.website && (
                              <a href={`https://${pd.contact.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium">
                                <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                                {pd.contact.website}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── SUMMARY ── */}
                    {pd.summary && (
                      <div>
                        <SectionHeader icon={<User className="h-4 w-4 text-white" />} title="Professional Summary" color="from-blue-500 to-indigo-600" />
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed bg-blue-50/50 border border-blue-100 rounded-xl p-4 italic">
                          {pd.summary}
                        </p>
                      </div>
                    )}

                    {/* ── EXPERIENCE ── */}
                    {pd.experience && pd.experience.length > 0 && (
                      <div>
                        <SectionHeader icon={<Briefcase className="h-4 w-4 text-white" />} title="Experience" color="bg-blue-600" />
                        <div className="mt-3 space-y-5">
                          {pd.experience.map((exp: any, i: number) => (
                            <div key={i} className="relative pl-5 border-l-2 border-blue-200 hover:border-blue-400 transition-colors group">
                              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-400 group-hover:bg-blue-600 transition-colors ring-2 ring-white" />
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">{exp.title}</p>
                                  <p className="text-sm font-medium text-blue-600">
                                    {exp.company}
                                    {exp.location && <span className="text-slate-400 font-normal"> · {exp.location}</span>}
                                  </p>
                                </div>
                                {exp.startDate && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 flex-shrink-0">
                                    <Clock className="h-3 w-3" />
                                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                                  </span>
                                )}
                              </div>
                              {exp.description && exp.description.length > 0 && (
                                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                                  {exp.description.map((desc: string, j: number) => (
                                    <li key={j} className="flex items-start gap-2">
                                      <ChevronRight className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                                      <span className="leading-relaxed">{desc}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── EDUCATION ── */}
                    {pd.education && pd.education.length > 0 && (
                      <div>
                        <SectionHeader icon={<GraduationCap className="h-4 w-4 text-white" />} title="Education" color="bg-blue-600" />
                        <div className="mt-3 space-y-3">
                          {pd.education.map((edu: any, i: number) => (
                            <div key={i} className="flex gap-3 p-4 rounded-xl bg-violet-50 border border-violet-100 hover:border-violet-300 transition-colors">
                              <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                                <GraduationCap className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <p className="font-semibold text-slate-900 text-sm">{edu.degree}</p>
                                  {edu.gpa && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                      GPA {edu.gpa}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-violet-600">{edu.institution}</p>
                                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                                  {edu.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{edu.location}</span>}
                                  {edu.graduationDate && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{edu.graduationDate}</span>}
                                </div>
                                {edu.achievements && edu.achievements.length > 0 && (
                                  <ul className="mt-2 space-y-1 text-xs text-slate-600">
                                    {edu.achievements.map((ach: string, j: number) => (
                                      <li key={j} className="flex items-start gap-1.5">
                                        <span className="text-violet-400 mt-0.5 font-bold">◦</span>
                                        <span>{ach}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── SKILLS ── */}
                    {pd.skills && pd.skills.length > 0 && (
                      <div>
                        <SectionHeader icon={<Sparkles className="h-4 w-4 text-white" />} title="Skills" color="bg-blue-600" />
                        <div className="flex flex-wrap gap-2 mt-3">
                          {pd.skills.map((skill: string, i: number) => (
                            <span
                              key={i}
                              className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${skillColors[i % skillColors.length]}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── CERTIFICATIONS ── */}
                    {pd.certifications && pd.certifications.length > 0 && (
                      <div>
                        <SectionHeader icon={<Award className="h-4 w-4 text-white" />} title="Certifications" color="from-amber-500 to-orange-500" />
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {pd.certifications.map((cert, i: number) => (
                            <div key={i} className="flex items-center gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl hover:border-amber-300 transition-colors">
                              <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Award className="h-3.5 w-3.5 text-white" />
                              </div>
                              <span className="text-xs text-slate-700 font-medium leading-tight">
                                {typeof cert === 'string' ? cert : cert.name}
                                {typeof cert !== 'string' && cert.issuer && <span className="text-slate-500"> • {cert.issuer}</span>}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── PROJECTS ── */}
                    {pd.projects && pd.projects.length > 0 && (
                      <div>
                        <SectionHeader icon={<FolderKanban className="h-4 w-4 text-white" />} title="Projects" color="bg-blue-600" />
                        <div className="mt-3 space-y-3">
                          {pd.projects.map((project: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl border border-purple-100 bg-purple-50 hover:border-purple-300 transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-slate-900 text-sm">{project.name}</p>
                                {project.url && (
                                  <a
                                    href={`https://${project.url.replace(/^https?:\/\//, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium flex-shrink-0 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    View
                                  </a>
                                )}
                              </div>
                              {project.description && (
                                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{project.description}</p>
                              )}
                              {project.technologies && project.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2.5">
                                  {project.technologies.map((tech: string, j: number) => (
                                    <span key={j} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-white text-purple-700 border border-purple-200">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── VOLUNTEER WORK ── */}
                    {pd.volunteerWork && pd.volunteerWork.length > 0 && (
                      <div>
                        <SectionHeader icon={<Heart className="h-4 w-4 text-white" />} title="Volunteer Work" color="from-rose-500 to-pink-600" />
                        <div className="mt-3 space-y-5">
                          {pd.volunteerWork.map((vol: any, i: number) => (
                            <div key={i} className="relative pl-5 border-l-2 border-rose-200 hover:border-rose-400 transition-colors group">
                              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-rose-400 group-hover:bg-rose-600 transition-colors ring-2 ring-white" />
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">{vol.role}</p>
                                  <p className="text-sm font-medium text-rose-600">
                                    {vol.organization}
                                    {vol.location && <span className="text-slate-400 font-normal"> · {vol.location}</span>}
                                  </p>
                                </div>
                                {vol.startDate && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100 flex-shrink-0">
                                    <Clock className="h-3 w-3" />
                                    {vol.startDate} – {vol.current ? 'Present' : vol.endDate}
                                  </span>
                                )}
                              </div>
                              {vol.description && vol.description.length > 0 && (
                                <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
                                  {vol.description.map((desc: string, j: number) => (
                                    <li key={j} className="flex items-start gap-2">
                                      <Heart className="h-3 w-3 text-rose-400 mt-1 flex-shrink-0" />
                                      <span className="leading-relaxed">{desc}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── AWARDS ── */}
                    {pd.awards && pd.awards.length > 0 && (
                      <div>
                        <SectionHeader icon={<Trophy className="h-4 w-4 text-white" />} title="Awards & Honors" color="from-yellow-500 to-amber-500" />
                        <div className="mt-3 space-y-2">
                          {pd.awards.map((award, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl hover:border-amber-300 transition-colors">
                              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Trophy className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-sm text-slate-700 leading-relaxed">
                                {typeof award === 'string' ? award : award.name}
                                {typeof award !== 'string' && award.issuer && <span className="text-slate-500 text-xs block mt-0.5">{award.issuer}</span>}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── LANGUAGES ── */}
                    {pd.languages && pd.languages.length > 0 && (
                      <div>
                        <SectionHeader icon={<Globe className="h-4 w-4 text-white" />} title="Languages" color="from-cyan-500 to-blue-600" />
                        <div className="flex flex-wrap gap-2 mt-3">
                          {pd.languages.map((lang: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 px-3.5 py-2 bg-cyan-50 border border-cyan-200 rounded-full text-sm text-cyan-800 font-medium hover:border-cyan-400 transition-colors">
                              <Globe className="h-3.5 w-3.5 text-cyan-500" />
                              {lang}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </CardContent>
              </Card>
            );
          }

          // Fallback: rawText plain-text renderer
          if (resume.rawText && resume.rawText.length > 50) {
            return (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Resume Content
                  </CardTitle>
                  <CardDescription>Extracted from your uploaded file</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
                    {resume.rawText}
                  </div>
                </CardContent>
              </Card>
            );
          }

          // Nothing to show
          return (
            <Card variant="elevated">
              <CardContent>
                <div className="text-center py-10">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No resume content yet</p>
                  <p className="text-sm text-slate-400 mt-1 mb-4">Use the Resume Builder to add your details.</p>
                  <Link href={`/resume-builder?id=${resumeId}`}>
                    <Button size="sm" variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
                      Add Content
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Course Recommendations after tailoring */}
        {courseRecommendations.length > 0 && (
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Skill Up for This Role
                </CardTitle>
                <button
                  onClick={() => setCourseRecommendations([])}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-sm text-slate-500">Your resume is missing these skills. Close the gap with these courses:</p>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {courseRecommendations.map((course, idx) => (
                  <a
                    key={idx}
                    href={course.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 group-hover:text-blue-700 truncate">{course.title}</p>
                        <p className="text-xs text-slate-500">{course.provider}</p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download Modal */}
        {showDownloadModal && (
          <DownloadModal
            isOpen={showDownloadModal}
            onClose={() => {
              setShowDownloadModal(false);
              setSelectedVersionForDownload(null);
            }}
            resumeId={resumeId}
            versionId={selectedVersionForDownload?.id}
            versionNumber={selectedVersionForDownload?.versionNumber}
            label={selectedVersionForDownload?.label || resume?.title}
          />
        )}
      </div>
    </div>
  );
}
