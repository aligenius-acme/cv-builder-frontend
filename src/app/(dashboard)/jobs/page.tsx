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
  ExternalLink,
  Filter,
  Loader2,
  ChevronDown,
  FileText,
  Sparkles,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
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

  const handleSaveJob = async (job: JobListing) => {
    try {
      await api.saveJob(job.id, job);
      toast.success('Job saved!');
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 p-8 text-white">
          <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-5 w-5" />
              <span className="text-white/80 text-sm font-medium">Job Discovery</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Job Board
            </h1>
            <p className="text-white/80 text-lg max-w-2xl">
              Find and apply to jobs tailored to your profile. Search thousands of opportunities
              and get AI-powered recommendations based on your skills.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <Card variant="elevated">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Job title, skills, or keywords"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="City, state, or remote"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  leftIcon={<Filter className="h-4 w-4" />}
                >
                  Filters
                  {(experienceLevel || jobType || remoteOnly) && (
                    <Badge variant="info" size="sm" className="ml-1">
                      {[experienceLevel, jobType, remoteOnly && 'Remote'].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant="gradient"
                  onClick={handleSearch}
                  disabled={isSearching}
                  leftIcon={isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                >
                  Search
                </Button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Any level</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead / Manager</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Any type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remoteOnly}
                      onChange={(e) => setRemoteOnly(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Remote only</span>
                  </label>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setExperienceLevel('');
                      setJobType('');
                      setRemoteOnly(false);
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job List */}
          <div className={cn('lg:col-span-1 space-y-4', selectedJob && 'hidden lg:block')}>
            {!hasSearched ? (
              // Recommended Jobs
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Recommended for You
                </h2>
                {recommendedJobs.length > 0 ? (
                  recommendedJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSelected={selectedJob?.id === job.id}
                      onSelect={() => handleSelectJob(job)}
                      onSave={() => handleSaveJob(job)}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">Search for jobs to get started</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : isSearching ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-slate-500">Searching jobs...</p>
              </div>
            ) : jobs.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">{jobs.length} jobs found</p>
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJob?.id === job.id}
                    onSelect={() => handleSelectJob(job)}
                    onSave={() => handleSaveJob(job)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No jobs found. Try different keywords.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Job Details */}
          <div className={cn('lg:col-span-2', !selectedJob && 'hidden lg:block')}>
            {selectedJob ? (
              <Card variant="elevated" className="sticky top-24">
                <CardContent className="p-6">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="lg:hidden flex items-center gap-1 text-sm text-indigo-600 mb-4"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90" />
                    Back to results
                  </button>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{selectedJob.title}</h2>
                      <div className="flex items-center gap-3 mt-2 text-slate-600">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {selectedJob.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {selectedJob.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {selectedJob.salary && (
                          <Badge variant="success" size="lg">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {selectedJob.salary}
                          </Badge>
                        )}
                        <Badge variant="default" size="lg">
                          {selectedJob.type}
                        </Badge>
                        <span className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {selectedJob.posted}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveJob(selectedJob)}
                        leftIcon={<Bookmark className="h-4 w-4" />}
                      >
                        Save
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mb-6">
                    <Button
                      variant="gradient"
                      className="flex-1"
                      leftIcon={<ExternalLink className="h-4 w-4" />}
                      onClick={() => window.open(selectedJob.url, '_blank')}
                    >
                      Apply Now
                    </Button>
                    <Link href={`/resumes?jobTitle=${encodeURIComponent(selectedJob.title)}&company=${encodeURIComponent(selectedJob.company)}`}>
                      <Button
                        variant="outline"
                        leftIcon={<FileText className="h-4 w-4" />}
                      >
                        Tailor Resume
                      </Button>
                    </Link>
                  </div>

                  {/* Details */}
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-3">About this role</h3>
                        <p className="text-slate-700">{jobDetails?.fullDescription || selectedJob.description}</p>
                      </div>

                      {/* Responsibilities */}
                      {jobDetails?.responsibilities && jobDetails.responsibilities.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-3">Responsibilities</h3>
                          <ul className="space-y-2">
                            {jobDetails.responsibilities.map((r: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-slate-700">
                                <span className="text-indigo-500 mt-1.5">•</span>
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Requirements */}
                      {(jobDetails?.requirements || selectedJob.requirements)?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-3">Requirements</h3>
                          <ul className="space-y-2">
                            {(jobDetails?.requirements || selectedJob.requirements).map((r: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-slate-700">
                                <span className="text-indigo-500 mt-1.5">•</span>
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Nice to Have */}
                      {jobDetails?.niceToHave && jobDetails.niceToHave.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-3">Nice to Have</h3>
                          <ul className="space-y-2">
                            {jobDetails.niceToHave.map((n: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-slate-700">
                                <span className="text-green-500 mt-1.5">+</span>
                                {n}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Benefits */}
                      {jobDetails?.benefits && jobDetails.benefits.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-3">Benefits</h3>
                          <div className="flex flex-wrap gap-2">
                            {jobDetails.benefits.map((b: string, i: number) => (
                              <Badge key={i} variant="success" size="lg">{b}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Source */}
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm text-slate-500">
                          Posted via {selectedJob.source}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Select a job to view details</h3>
                  <p className="text-slate-500">Click on any job listing to see the full description and apply</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Job Card Component
function JobCard({
  job,
  isSelected,
  onSelect,
  onSave,
}: {
  job: JobListing;
  isSelected: boolean;
  onSelect: () => void;
  onSave: () => void;
}) {
  return (
    <Card
      variant="elevated"
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        isSelected && 'ring-2 ring-indigo-500'
      )}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{job.title}</h3>
            <p className="text-sm text-slate-600">{job.company}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {job.posted}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {job.salary && (
                <Badge variant="success" size="sm">{job.salary}</Badge>
              )}
              <Badge variant="default" size="sm">{job.type}</Badge>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave();
            }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bookmark className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
