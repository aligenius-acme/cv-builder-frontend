'use client';

import { Search, Globe, Sparkles } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import JobCard, { JobListing } from './JobCard';
import Button from '@/components/ui/Button';

interface JobListProps {
  jobs: JobListing[];
  isSearching: boolean;
  hasSearched: boolean;
  selectedJobId: string | null;
  savedJobIds: Set<string>;
  onSelectJob: (job: JobListing) => void;
  onSaveJob: (job: JobListing, e: React.MouseEvent) => void;
  onClearFilters: () => void;
  title?: string;
  subtitle?: string;
  showRecommended?: boolean;
}

export default function JobList({
  jobs,
  isSearching,
  hasSearched,
  selectedJobId,
  savedJobIds,
  onSelectJob,
  onSaveJob,
  onClearFilters,
  title = 'Search Results',
  subtitle,
  showRecommended = false,
}: JobListProps) {
  // Loading state
  if (isSearching) {
    return <LoadingSpinner text="Searching jobs..." />;
  }

  // Empty state - before search
  if (!hasSearched) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
            Recommended for You
          </h2>
          {jobs.length > 0 && (
            <Badge variant="info" size="sm">{jobs.length} jobs</Badge>
          )}
        </div>
        {jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job, index) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJobId === job.id}
                isSaved={savedJobIds.has(job.id)}
                onSelect={() => onSelectJob(job)}
                onSave={(e) => onSaveJob(job, e)}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Search className="h-10 w-10 text-slate-400" />}
            title="Search for Jobs"
            description="Enter keywords above to discover thousands of opportunities matching your skills."
          />
        )}
      </div>
    );
  }

  // Empty state - no results
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-10 w-10 text-slate-400" />}
        title="No Jobs Found"
        description="Try different keywords or adjust your filters to find more opportunities."
        action={
          <Button variant="outline" onClick={onClearFilters}>
            Clear Filters
          </Button>
        }
      />
    );
  }

  // Results list
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <Badge variant="default" size="sm">{jobs.length} jobs</Badge>
        </div>
        {subtitle && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {subtitle}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {jobs.map((job, index) => (
          <JobCard
            key={job.id}
            job={job}
            isSelected={selectedJobId === job.id}
            isSaved={savedJobIds.has(job.id)}
            onSelect={() => onSelectJob(job)}
            onSave={(e) => onSaveJob(job, e)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
