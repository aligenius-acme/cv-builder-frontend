'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Filter,
  Loader2,
  ChevronLeft,
  FileText,
  Sparkles,
  X,
  TrendingUp,
  Users,
  Globe,
  CheckCircle2,
  Star,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: string;
  posted: string;
  description: string;
  requirements?: string[];
  source: string;
  url: string;
  logo?: string;
}

export default function JobBoardPage() {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobType, setJobType] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState<JobListing[]>([]);
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendedJobs();
  }, []);

  const loadRecommendedJobs = async () => {
    try {
      const response = await api.getRecommendedJobs();
      if (response.success && response.data) {
        setRecommendedJobs(response.data.jobs);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleSearch = async () => {
    if (!keywords.trim()) {
      toast.error('Please enter search keywords');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    setSelectedJob(null);
    setJobDetails(null);

    try {
      const response = await api.searchJobs({
        keywords,
        location: location || undefined,
        experienceLevel: experienceLevel || undefined,
        jobType: jobType || undefined,
        remote: remoteOnly,
      });

      if (response.success && response.data) {
        setJobs(response.data.jobs);
      }
    } catch (error) {
      toast.error('Failed to search jobs');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectJob = async (job: JobListing) => {
    setSelectedJob(job);
    setIsLoadingDetails(true);
    setJobDetails(null);

    try {
      const response = await api.getJobDetails(job.id, job.url);
      if (response.success && response.data) {
        setJobDetails(response.data);
      }
    } catch (error) {
      // Use basic info if details fail
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSaveJob = async (job: JobListing, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.saveJob(job.id, job);
      setSavedJobs(prev => new Set(prev).add(job.id));
      toast.success('Job saved to your list!');
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const clearFilters = () => {
    setExperienceLevel('');
    setJobType('');
    setRemoteOnly(false);
  };

  const activeFiltersCount = [experienceLevel, jobType, remoteOnly].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <PageHeader
          icon={<Briefcase className="h-5 w-5" />}
          label="Job Discovery"
          title="Job Board"
          description="Find and apply to jobs tailored to your profile. Search thousands of opportunities and get AI-powered recommendations."
          gradient="slate"
        />

        {/* Search Section */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              {/* Main Search Row */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Job title, skills, or keywords"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="City, state, or 'remote'"
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowFilters(!showFilters)}
                    leftIcon={<Filter className="h-4 w-4" />}
                    className={cn(showFilters && 'bg-slate-100')}
                  >
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="gradient" size="sm" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={handleSearch}
                    disabled={isSearching}
                    leftIcon={isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  >
                    Search Jobs
                  </Button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="pt-4 border-t border-slate-200 animate-slide-down">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Experience Level
                      </label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="" className="text-slate-500">Any level</option>
                        <option value="entry">Entry Level</option>
                        <option value="mid">Mid Level</option>
                        <option value="senior">Senior</option>
                        <option value="lead">Lead / Manager</option>
                        <option value="executive">Executive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Job Type
                      </label>
                      <select
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        <option value="" className="text-slate-500">Any type</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors w-full">
                        <input
                          type="checkbox"
                          checked={remoteOnly}
                          onChange={(e) => setRemoteOnly(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-slate-900">Remote Only</span>
                          <p className="text-xs text-slate-500">Work from anywhere</p>
                        </div>
                      </label>
                    </div>
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="w-full"
                        leftIcon={<X className="h-4 w-4" />}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Job List - 2 columns */}
          <div className={cn('lg:col-span-2 space-y-4', selectedJob && 'hidden lg:block')}>
            {!hasSearched ? (
              // Recommended Jobs
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                    </div>
                    Recommended for You
                  </h2>
                  {recommendedJobs.length > 0 && (
                    <Badge variant="info" size="sm">{recommendedJobs.length} jobs</Badge>
                  )}
                </div>
                {recommendedJobs.length > 0 ? (
                  <div className="space-y-3">
                    {recommendedJobs.map((job, index) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSelected={selectedJob?.id === job.id}
                        isSaved={savedJobs.has(job.id)}
                        onSelect={() => handleSelectJob(job)}
                        onSave={(e) => handleSaveJob(job, e)}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Search className="h-10 w-10 text-slate-400" />}
                    title="Search for Jobs"
                    description="Enter keywords above to discover thousands of opportunities matching your skills."
                    gradient="slate"
                  />
                )}
              </div>
            ) : isSearching ? (
              <LoadingSpinner text="Searching jobs..." />
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">Search Results</h2>
                    <Badge variant="default" size="sm">{jobs.length} jobs</Badge>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Powered by Adzuna
                  </span>
                </div>
                <div className="space-y-3">
                  {jobs.map((job, index) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSelected={selectedJob?.id === job.id}
                      isSaved={savedJobs.has(job.id)}
                      onSelect={() => handleSelectJob(job)}
                      onSave={(e) => handleSaveJob(job, e)}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Search className="h-10 w-10 text-slate-400" />}
                title="No Jobs Found"
                description="Try different keywords or adjust your filters to find more opportunities."
                gradient="slate"
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                }
              />
            )}
          </div>

          {/* Job Details - 3 columns */}
          <div className={cn('lg:col-span-3', !selectedJob && 'hidden lg:block')}>
            {selectedJob ? (
              <JobDetailsPanel
                job={selectedJob}
                details={jobDetails}
                isLoading={isLoadingDetails}
                isSaved={savedJobs.has(selectedJob.id)}
                onBack={() => setSelectedJob(null)}
                onSave={() => handleSaveJob(selectedJob)}
              />
            ) : (
              <Card variant="elevated" className="h-full min-h-[500px]">
                <CardContent className="h-full flex flex-col items-center justify-center text-center p-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-gray-100 rounded-3xl flex items-center justify-center mb-6">
                    <Briefcase className="h-12 w-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a Job</h3>
                  <p className="text-slate-500 max-w-sm mb-6">
                    Click on any job listing to view the full description, requirements, and apply directly.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>Get personalized recommendations based on your profile</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Company Logo component with fallback
function CompanyLogo({ company, size = 48 }: { company: string; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initials = company.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  // Common company domain mappings
  const domains: Record<string, string> = {
    'google': 'google.com', 'microsoft': 'microsoft.com', 'apple': 'apple.com',
    'amazon': 'amazon.com', 'meta': 'meta.com', 'netflix': 'netflix.com',
    'salesforce': 'salesforce.com', 'oracle': 'oracle.com', 'ibm': 'ibm.com',
    'adobe': 'adobe.com', 'spotify': 'spotify.com', 'uber': 'uber.com',
    'stripe': 'stripe.com', 'shopify': 'shopify.com', 'slack': 'slack.com',
    'github': 'github.com', 'atlassian': 'atlassian.com', 'figma': 'figma.com',
    'boeing': 'boeing.com', 'intel': 'intel.com', 'nvidia': 'nvidia.com',
  };

  const normalized = company.toLowerCase().trim();
  let domain = domains[normalized];
  if (!domain) {
    for (const [key, val] of Object.entries(domains)) {
      if (normalized.includes(key)) { domain = val; break; }
    }
  }
  if (!domain) {
    const cleaned = normalized.replace(/\s+(inc\.?|llc\.?|ltd\.?|corp\.?)$/i, '').replace(/[^a-z0-9]/g, '');
    if (cleaned.length > 2) domain = `${cleaned}.com`;
  }

  if (imgError || !domain) {
    return (
      <div
        className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm"
        style={{ width: size, height: size, fontSize: size * 0.35 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={`https://logo.clearbit.com/${domain}?size=${size * 2}`}
      alt={company}
      className="rounded-xl object-contain flex-shrink-0 bg-white border border-slate-100 shadow-sm"
      style={{ width: size, height: size }}
      onError={() => setImgError(true)}
    />
  );
}

// Job Card Component
function JobCard({
  job,
  isSelected,
  isSaved,
  onSelect,
  onSave,
  index,
}: {
  job: JobListing;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: () => void;
  onSave: (e: React.MouseEvent) => void;
  index: number;
}) {
  return (
    <Card
      variant="elevated"
      hover
      className={cn(
        'cursor-pointer transition-all duration-200 group',
        isSelected && 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10'
      )}
      onClick={onSelect}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <CompanyLogo company={job.company} size={52} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-slate-600 flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {job.company}
                </p>
              </div>
              <button
                onClick={onSave}
                className={cn(
                  'p-2 rounded-lg transition-all flex-shrink-0',
                  isSaved
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                )}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{job.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {job.posted}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {job.salary && (
                <Badge variant="success" size="sm" className="font-medium">
                  <DollarSign className="h-3 w-3 mr-0.5" />
                  {job.salary}
                </Badge>
              )}
              <Badge variant="default" size="sm">{job.type}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Job Details Panel Component
function JobDetailsPanel({
  job,
  details,
  isLoading,
  isSaved,
  onBack,
  onSave,
}: {
  job: JobListing;
  details: any;
  isLoading: boolean;
  isSaved: boolean;
  onBack: () => void;
  onSave: () => void;
}) {
  return (
    <Card variant="elevated" className="sticky top-6">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
          {/* Mobile back button */}
          <button
            onClick={onBack}
            className="lg:hidden flex items-center gap-1 text-sm text-indigo-600 mb-4 hover:text-indigo-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to results
          </button>

          <div className="flex items-start gap-4">
            <CompanyLogo company={job.company} size={64} />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 line-clamp-2">{job.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {job.location}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {job.salary && (
                  <Badge variant="success" size="lg" className="font-semibold">
                    <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                    {job.salary}
                  </Badge>
                )}
                <Badge variant="default" size="lg">{job.type}</Badge>
                <Badge variant="info" size="lg" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {job.posted}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="gradient"
              size="lg"
              className="flex-1"
              leftIcon={<ExternalLink className="h-4 w-4" />}
              onClick={() => window.open(job.url, '_blank')}
            >
              Apply Now
            </Button>
            <Link href={`/resumes?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`}>
              <Button
                variant="outline"
                size="lg"
                leftIcon={<FileText className="h-4 w-4" />}
              >
                Tailor Resume
              </Button>
            </Link>
            <Button
              variant={isSaved ? 'primary' : 'outline'}
              size="lg"
              onClick={onSave}
              leftIcon={isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            >
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-6 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Loading job details...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 rounded-lg">
                    <FileText className="h-4 w-4 text-indigo-600" />
                  </div>
                  About this Role
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {details?.fullDescription || job.description}
                </p>
              </div>

              {/* Responsibilities */}
              {details?.responsibilities?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {details.responsibilities.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <ArrowRight className="h-4 w-4 text-indigo-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {(details?.requirements || job.requirements)?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    </div>
                    Requirements
                  </h3>
                  <ul className="space-y-2">
                    {(details?.requirements || job.requirements).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nice to Have */}
              {details?.niceToHave?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <Star className="h-4 w-4 text-emerald-600" />
                    </div>
                    Nice to Have
                  </h3>
                  <ul className="space-y-2">
                    {details.niceToHave.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <Star className="h-4 w-4 text-amber-400 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {details?.benefits?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    Benefits & Perks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details.benefits.map((item: string, i: number) => (
                      <Badge key={i} variant="success" size="lg" className="font-normal">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Footer */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    Posted via {job.source}
                  </span>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
                  >
                    View original posting
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
