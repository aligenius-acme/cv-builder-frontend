'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Heart, Search, Building, MapPin, DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { useModal } from '@/hooks/useModal';

export interface SavedJob {
  id: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  salary?: string;
  jobDescription?: string;
}

export interface SavedJobsDropdownProps {
  /** Array of saved jobs to display */
  jobs: SavedJob[];
  /** Currently selected job ID */
  selectedJobId: string;
  /** Callback when a job is selected */
  onSelect: (jobId: string) => void;
  /** Loading state for fetching jobs */
  isLoading?: boolean;
  /** Optional label for the dropdown */
  label?: string;
  /** Placeholder text when no job is selected */
  placeholder?: string;
  /** Color theme for styling (affects icon colors and focus rings) */
  colorTheme?: 'blue' | 'amber' | 'green' | 'purple';
  /** Optional custom empty state icon */
  emptyStateIcon?: React.ReactNode;
  /** Callback when switching to manual mode (shows "Enter Manually" button) */
  onSwitchToManual?: () => void;
  /** Show job count and manage link at bottom */
  showFooter?: boolean;
  /** Custom link for empty state CTA */
  emptyStateLinkHref?: string;
  /** Custom label for empty state CTA button */
  emptyStateLinkLabel?: string;
  /** Whether to require job description (shows warning badge if missing) */
  requireDescription?: boolean;
  /** Callback when a job without description is selected */
  onDescriptionMissing?: (jobId: string) => void;
}

export function SavedJobsDropdown({
  jobs,
  selectedJobId,
  onSelect,
  isLoading = false,
  label = 'Select a Saved Job',
  placeholder = 'Select a job...',
  colorTheme = 'blue',
  emptyStateIcon,
  onSwitchToManual,
  showFooter = true,
  emptyStateLinkHref = '/job-tracker',
  emptyStateLinkLabel = 'Job Tracker',
  requireDescription = false,
  onDescriptionMissing,
}: SavedJobsDropdownProps) {
  const dropdown = useModal();
  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  const handleSelectJob = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);

    // Check if description is required but missing
    if (requireDescription && job && !job.jobDescription) {
      if (onDescriptionMissing) {
        onDescriptionMissing(jobId);
      }
      dropdown.close();
      return;
    }

    onSelect(jobId);
    dropdown.close();
  };

  // Color theme classes
  const themeClasses = {
    blue: {
      icon: 'text-blue-600',
      iconBg: 'bg-blue-50',
      focus: 'focus:ring-blue-500/20 focus:border-blue-500',
      hover: 'hover:border-blue-300',
      hoverBg: 'hover:bg-blue-50',
      selectedBg: 'bg-blue-50',
    },
    amber: {
      icon: 'text-amber-600',
      iconBg: 'bg-amber-50',
      focus: 'focus:ring-amber-500/20 focus:border-amber-500',
      hover: 'hover:border-amber-300',
      hoverBg: 'hover:bg-amber-50',
      selectedBg: 'bg-amber-50',
    },
    green: {
      icon: 'text-green-600',
      iconBg: 'bg-green-50',
      focus: 'focus:ring-green-500/20 focus:border-green-500',
      hover: 'hover:border-green-300',
      hoverBg: 'hover:bg-green-50',
      selectedBg: 'bg-green-50',
    },
    purple: {
      icon: 'text-purple-600',
      iconBg: 'bg-purple-50',
      focus: 'focus:ring-purple-500/20 focus:border-purple-500',
      hover: 'hover:border-purple-300',
      hoverBg: 'hover:bg-purple-50',
      selectedBg: 'bg-purple-50',
    },
  };

  const theme = themeClasses[colorTheme];

  // Loading state
  if (isLoading) {
    return (
      <div>
        {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
        <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl">
          <Loader2 className={`h-5 w-5 ${theme.icon} animate-spin`} />
          <span className="text-slate-500">Loading saved jobs...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (jobs.length === 0) {
    return (
      <div>
        {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
        <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
          {emptyStateIcon || <Heart className="h-8 w-8 text-slate-300 mx-auto mb-2" />}
          <p className="text-slate-600 font-medium text-sm">No saved jobs with descriptions</p>
          <p className="text-xs text-slate-500 mt-1">Save jobs from the {emptyStateLinkLabel} to use here</p>
          <div className="flex justify-center gap-2 mt-3">
            <Link href={emptyStateLinkHref}>
              <Button variant="primary" size="sm" leftIcon={<Search className="h-4 w-4" />}>
                {emptyStateLinkLabel}
              </Button>
            </Link>
            {onSwitchToManual && (
              <Button variant="outline" size="sm" onClick={onSwitchToManual}>
                Enter Manually
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dropdown with jobs
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={dropdown.toggle}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 ${theme.hover} focus:outline-none focus:ring-2 ${theme.focus} transition-all`}
        >
          {selectedJob ? (
            <span className="text-slate-900 font-medium">
              {selectedJob.jobTitle} at {selectedJob.companyName}
            </span>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-transform ${dropdown.isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dropdown.isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {jobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => handleSelectJob(job.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 ${theme.hoverBg} transition-colors text-left border-b border-slate-100 last:border-0 ${
                  selectedJobId === job.id ? theme.selectedBg : ''
                }`}
              >
                <div className={`w-10 h-10 ${theme.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Building className={`h-5 w-5 ${theme.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 truncate">{job.jobTitle}</p>
                    {requireDescription && !job.jobDescription && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-medium flex-shrink-0">
                        <AlertTriangle className="h-3 w-3" />
                        No description
                      </span>
                    )}
                  </div>
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

      {showFooter && (
        <p className="mt-2 text-xs text-slate-500">
          {jobs.length} saved job{jobs.length !== 1 ? 's' : ''} with descriptions •{' '}
          <Link href={emptyStateLinkHref} className={`${theme.icon} hover:opacity-80`}>
            Manage jobs
          </Link>
        </p>
      )}
    </div>
  );
}
