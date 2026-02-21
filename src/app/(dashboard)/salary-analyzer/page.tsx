'use client';

import { useState } from 'react';
import { useFetchData } from '@/hooks/useFetchData';
import { DollarSign, BarChart3, Scale, MessageSquare } from 'lucide-react';
import SegmentedControl from '@/components/ui/SegmentedControl';
import PageHeader from '@/components/shared/PageHeader';
import SalaryAnalyzeTab from '@/components/salary-analyzer/SalaryAnalyzeTab';
import OfferCompareTab from '@/components/salary-analyzer/OfferCompareTab';
import NegotiationScriptTab from '@/components/salary-analyzer/NegotiationScriptTab';
import api from '@/lib/api';

type TabType = 'analyze' | 'compare' | 'negotiate';

export default function SalaryAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('analyze');

  // Saved Jobs State
  const { data: savedJobsData, isLoading: isLoadingSavedJobs } = useFetchData({
    fetchFn: () => api.getSavedJobs(),
    errorMessage: 'Failed to load saved jobs',
    showErrorToast: false,
  });
  const savedJobs = savedJobsData?.jobs || [];

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <PageHeader
          icon={<DollarSign className="h-5 w-5" />}
          label="Compensation Intelligence"
          title="Salary Analyzer"
          description="Research market rates, compare job offers, and get AI-powered negotiation scripts to maximize your compensation."
        />

        {/* Tabs */}
        <SegmentedControl
          options={[
            { value: 'analyze', label: 'Salary Research', icon: <BarChart3 className="h-4 w-4" /> },
            { value: 'compare', label: 'Compare Offers', icon: <Scale className="h-4 w-4" /> },
            { value: 'negotiate', label: 'Negotiation Script', icon: <MessageSquare className="h-4 w-4" /> },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab Content */}
        {activeTab === 'analyze' && <SalaryAnalyzeTab savedJobs={savedJobs} isLoadingSavedJobs={isLoadingSavedJobs} />}
        {activeTab === 'compare' && <OfferCompareTab savedJobs={savedJobs} isLoadingSavedJobs={isLoadingSavedJobs} />}
        {activeTab === 'negotiate' && (
          <NegotiationScriptTab savedJobs={savedJobs} isLoadingSavedJobs={isLoadingSavedJobs} />
        )}
      </div>
    </div>
  );
}
