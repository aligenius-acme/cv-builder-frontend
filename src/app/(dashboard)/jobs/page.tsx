'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Briefcase, Heart } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import JobFilters from '@/components/jobs/JobFilters';
import JobList from '@/components/jobs/JobList';
import SavedJobList from '@/components/jobs/SavedJobList';
import JobDetailsPanel from '@/components/jobs/JobDetailsPanel';
import EmptyJobDetailsState from '@/components/jobs/EmptyJobDetailsState';
import { JobListing } from '@/components/jobs/JobCard';
import { SavedJobListing } from '@/components/jobs/SavedJobCard';

type TabType = 'search' | 'saved';

export default function JobBoardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobType, setJobType] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);

  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [recommendedJobs, setRecommendedJobs] = useState<JobListing[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Saved jobs state
  const [savedJobsList, setSavedJobsList] = useState<SavedJobListing[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [savedJobsCount, setSavedJobsCount] = useState(0);

  // Tracked jobs state (jobs already in Job Tracker)
  const [trackedJobUrls, setTrackedJobUrls] = useState<Set<string>>(new Set());

  const router = useRouter();

  useEffect(() => {
    loadRecommendedJobs();
    loadSavedJobs();
    loadTrackedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'saved') {
      loadSavedJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

  const loadSavedJobs = async () => {
    setIsLoadingSaved(true);
    try {
      const response = await api.getSavedJobs();
      if (response.success && response.data) {
        const jobs = response.data.jobs.map((job) => ({
          ...job,
          posted: job.postedAt || '',
        }));
        setSavedJobsList(jobs);
        setSavedJobsCount(response.data.total);
        // Update the saved job IDs set
        setSavedJobIds(new Set(jobs.map((j) => j.id)));
      }
    } catch (error) {
      // Silent fail
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const loadTrackedJobs = async () => {
    try {
      const response = await api.getJobApplications();
      if (response.success && response.data) {
        // Track by job URL to identify duplicates
        const urls = new Set(
          response.data.applications
            .filter((app) => app.jobUrl)
            .map((app) => app.jobUrl as string)
        );
        setTrackedJobUrls(urls);
      }
    } catch (error) {
      // Silent fail
    }
  };

  const handleAddToTracker = async (job: JobListing, e?: React.MouseEvent) => {
    e?.stopPropagation();

    // Check if already tracked
    if (job.url && trackedJobUrls.has(job.url)) {
      toast('This job is already in your tracker', { icon: '📋' });
      return;
    }

    try {
      const response = await api.createJobApplication({
        jobTitle: job.title,
        companyName: job.company,
        location: job.location,
        salary: job.salary,
        jobUrl: job.url,
        jobDescription: job.description,
        status: 'WISHLIST',
        source: job.source || 'Job Board',
      });

      if (response.success) {
        // Update tracked URLs
        if (job.url) {
          setTrackedJobUrls((prev) => new Set(prev).add(job.url));
        }
        toast.success(
          <div className="flex flex-col">
            <span className="font-medium">Added to Job Tracker!</span>
            <button
              onClick={() => router.push('/job-tracker')}
              className="text-sm text-blue-600 hover:text-blue-700 text-left mt-1"
            >
              View in Tracker →
            </button>
          </div>,
          { duration: 4000 }
        );
      }
    } catch (error) {
      toast.error('Failed to add to tracker');
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

    const isCurrentlySaved = savedJobIds.has(job.id);

    if (isCurrentlySaved) {
      // Unsave
      try {
        await api.deleteSavedJob(job.id);
        setSavedJobIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(job.id);
          return newSet;
        });
        setSavedJobsList(prev => prev.filter(j => j.id !== job.id));
        setSavedJobsCount(prev => Math.max(0, prev - 1));
        toast.success('Job removed from saved list');
      } catch (error) {
        toast.error('Failed to remove job');
      }
    } else {
      // Save
      try {
        await api.saveJob(job.id, {
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          type: job.type,
          description: job.description,
          url: job.url,
          postedAt: job.posted,
          source: job.source,
          logoUrl: job.logo,
        });
        setSavedJobIds(prev => new Set(prev).add(job.id));
        setSavedJobsCount(prev => prev + 1);
        toast.success('Job saved to your list!');
      } catch (error: any) {
        if (error.response?.status === 409) {
          // Already saved
          setSavedJobIds(prev => new Set(prev).add(job.id));
          toast('Job already saved', { icon: '📌' });
        } else {
          toast.error('Failed to save job');
        }
      }
    }
  };

  const handleUnsaveJob = async (jobId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.deleteSavedJob(jobId);
      setSavedJobIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
      setSavedJobsList(prev => prev.filter(j => j.id !== jobId));
      setSavedJobsCount(prev => Math.max(0, prev - 1));
      toast.success('Job removed from saved list');
    } catch (error) {
      toast.error('Failed to remove job');
    }
  };

  const clearFilters = () => {
    setExperienceLevel('');
    setJobType('');
    setRemoteOnly(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <PageHeader
          icon={<Briefcase className="h-5 w-5" />}
          label="Job Discovery"
          title="Job Board"
          description="Find and apply to jobs tailored to your profile. Search thousands of opportunities and get AI-powered recommendations."
        />

        {/* Tabs */}
        <SegmentedControl
          options={[
            { value: 'search', label: 'Search Jobs', icon: <Search className="h-4 w-4" /> },
            { value: 'saved', label: 'Saved Jobs', icon: <Heart className="h-4 w-4" />, count: savedJobsCount },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        {/* Search Tab Content */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Filters */}
            <JobFilters
              keywords={keywords}
              location={location}
              experienceLevel={experienceLevel}
              jobType={jobType}
              remoteOnly={remoteOnly}
              isSearching={isSearching}
              onKeywordsChange={setKeywords}
              onLocationChange={setLocation}
              onExperienceLevelChange={setExperienceLevel}
              onJobTypeChange={setJobType}
              onRemoteOnlyChange={setRemoteOnly}
              onSearch={handleSearch}
              onClearFilters={clearFilters}
            />

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Job List - 2 columns */}
              <div className={cn('lg:col-span-2 space-y-4', selectedJob && 'hidden lg:block')}>
                <JobList
                  jobs={hasSearched ? jobs : recommendedJobs}
                  isSearching={isSearching}
                  hasSearched={hasSearched}
                  selectedJobId={selectedJob?.id || null}
                  savedJobIds={savedJobIds}
                  onSelectJob={handleSelectJob}
                  onSaveJob={handleSaveJob}
                  onClearFilters={clearFilters}
                  subtitle="Powered by Adzuna"
                />
              </div>

              {/* Job Details - 3 columns */}
              <div className={cn('lg:col-span-3', !selectedJob && 'hidden lg:block')}>
                {selectedJob ? (
                  <JobDetailsPanel
                    job={selectedJob}
                    details={jobDetails}
                    isLoading={isLoadingDetails}
                    isSaved={savedJobIds.has(selectedJob.id)}
                    isTracked={selectedJob.url ? trackedJobUrls.has(selectedJob.url) : false}
                    onBack={() => setSelectedJob(null)}
                    onSave={() => handleSaveJob(selectedJob)}
                    onAddToTracker={() => handleAddToTracker(selectedJob)}
                  />
                ) : (
                  <EmptyJobDetailsState variant="default" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Saved Jobs Tab Content */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Saved Jobs List - 2 columns */}
              <div className={cn('lg:col-span-2 space-y-4', selectedJob && 'hidden lg:block')}>
                <SavedJobList
                  jobs={savedJobsList}
                  isLoading={isLoadingSaved}
                  selectedJobId={selectedJob?.id || null}
                  trackedJobUrls={trackedJobUrls}
                  onSelectJob={handleSelectJob}
                  onRemoveJob={handleUnsaveJob}
                  onAddToTracker={handleAddToTracker}
                  onBrowseJobs={() => setActiveTab('search')}
                  totalCount={savedJobsCount}
                />
              </div>

              {/* Job Details - 3 columns */}
              <div className={cn('lg:col-span-3', !selectedJob && 'hidden lg:block')}>
                {selectedJob ? (
                  <JobDetailsPanel
                    job={selectedJob}
                    details={jobDetails}
                    isLoading={isLoadingDetails}
                    isSaved={savedJobIds.has(selectedJob.id)}
                    isTracked={selectedJob.url ? trackedJobUrls.has(selectedJob.url) : false}
                    onBack={() => setSelectedJob(null)}
                    onSave={() => handleSaveJob(selectedJob)}
                    onAddToTracker={() => handleAddToTracker(selectedJob)}
                  />
                ) : (
                  <EmptyJobDetailsState variant="saved" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
