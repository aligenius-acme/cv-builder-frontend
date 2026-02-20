'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
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

const tabs = [
  { id: 'job-match' as TabType, label: 'Job Match', icon: Target },
  { id: 'quantifier' as TabType, label: 'Achievement Quantifier', icon: TrendingUp },
  { id: 'weakness' as TabType, label: 'Weakness Detector', icon: Shield },
  { id: 'follow-up' as TabType, label: 'Follow-up Emails', icon: Mail },
  { id: 'networking' as TabType, label: 'Networking Messages', icon: Users },
];

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('job-match');

  // Use useFetchMultiple for parallel data loading - replaces 30+ lines!
  const { data, isLoading } = useFetchMultiple([
    () => api.getResumes(),
    () => api.getJobApplications(),
  ], {
    showErrorToast: false, // Silent errors
  });

  const resumes = (data?.[0] as any[]) || [];
  const savedJobs = ((data?.[1] as any)?.applications || []).filter((job: JobApplication) => job.jobDescription);
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