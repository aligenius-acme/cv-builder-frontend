'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import SegmentedControl, { SegmentOption } from '@/components/ui/SegmentedControl';
import { useFetchMultiple } from '@/hooks/useFetchData';
import {
  Sparkles,
  Target,
  TrendingUp,
  Shield,
  Mail,
  Users,
} from 'lucide-react';
import api, { JobApplication } from '@/lib/api';
import JobMatchTab from '@/components/ai-tools/JobMatchTab';
import AchievementQuantifierTab from '@/components/ai-tools/AchievementQuantifierTab';
import WeaknessDetectorTab from '@/components/ai-tools/WeaknessDetectorTab';
import FollowUpEmailTab from '@/components/ai-tools/FollowUpEmailTab';
import NetworkingMessageTab from '@/components/ai-tools/NetworkingMessageTab';

type TabType = 'job-match' | 'quantifier' | 'weakness' | 'follow-up' | 'networking';

const tabs: SegmentOption<TabType>[] = [
  { value: 'job-match', label: 'Job Match', icon: <Target className="h-4 w-4" /> },
  { value: 'quantifier', label: 'Achievement Quantifier', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'weakness', label: 'Weakness Detector', icon: <Shield className="h-4 w-4" /> },
  { value: 'follow-up', label: 'Follow-up Emails', icon: <Mail className="h-4 w-4" /> },
  { value: 'networking', label: 'Networking Messages', icon: <Users className="h-4 w-4" /> },
];

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('job-match');

  // Use useFetchMultiple for parallel data loading - now fetches from BOTH sources!
  const { data, isLoading } = useFetchMultiple([
    () => api.getResumes(),
    () => api.getJobApplications(),
    () => api.getSavedJobs(1, 100), // Get saved jobs from job search
  ], {
    showErrorToast: false, // Silent errors
  });

  const resumes = (data?.[0] as any[]) || [];

  // Merge jobs from Job Tracker (JobApplication) and Jobs page (SavedJob)
  const jobTrackerJobs = ((data?.[1] as any)?.applications || []) as JobApplication[];
  const savedJobsFromSearch = ((data?.[2] as any)?.jobs || []);

  // Convert saved jobs to JobApplication format and merge
  const mergedJobs: JobApplication[] = [
    ...jobTrackerJobs,
    ...savedJobsFromSearch.map((job: any) => ({
      id: job.savedJobId || job.id,
      jobTitle: job.title,
      companyName: job.company,
      location: job.location,
      salary: job.salary,
      jobUrl: job.url,
      jobDescription: job.description || '', // May be empty
      source: job.source || 'Saved Jobs',
    }))
  ];

  // Deduplicate by job title + company (in case job exists in both tables)
  const uniqueJobs = mergedJobs.reduce((acc, job) => {
    const key = `${job.jobTitle}-${job.companyName}`.toLowerCase();
    if (!acc.has(key)) {
      acc.set(key, job);
    }
    return acc;
  }, new Map<string, JobApplication>());

  const savedJobs = Array.from(uniqueJobs.values());
  const isLoadingResumes = isLoading;
  const isLoadingSavedJobs = isLoading;

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
        <SegmentedControl
          options={tabs}
          value={activeTab}
          onChange={setActiveTab}
        />

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