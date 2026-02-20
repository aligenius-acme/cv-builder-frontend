'use client';

import { Heart } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import SavedJobCard, { SavedJobListing } from './SavedJobCard';

interface SavedJobListProps {
  jobs: SavedJobListing[];
  isLoading: boolean;
  selectedJobId: string | null;
  trackedJobUrls: Set<string>;
  onSelectJob: (job: SavedJobListing) => void;
  onRemoveJob: (jobId: string, e: React.MouseEvent) => void;
  onAddToTracker: (job: SavedJobListing, e: React.MouseEvent) => void;
  onBrowseJobs: () => void;
  totalCount: number;
}

export default function SavedJobList({
  jobs,
  isLoading,
  selectedJobId,
  trackedJobUrls,
  onSelectJob,
  onRemoveJob,
  onAddToTracker,
  onBrowseJobs,
  totalCount,
}: SavedJobListProps) {
  // Loading state
  if (isLoading) {
    return <LoadingSpinner text="Loading saved jobs..." />;
  }

  // Empty state
  if (jobs.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="h-10 w-10 text-slate-400" />}
        title="No Saved Jobs"
        description="Save jobs you're interested in to review and apply later. Click the bookmark icon on any job to save it."
        action={
          <Button variant="primary" onClick={onBrowseJobs}>
            Browse Jobs
          </Button>
        }
      />
    );
  }

  // Results list
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <div className="p-1.5 bg-rose-50 rounded-lg">
            <Heart className="h-4 w-4 text-pink-600" />
          </div>
          Your Saved Jobs
        </h2>
        <Badge variant="primary" size="sm">{totalCount} saved</Badge>
      </div>
      <div className="space-y-3">
        {jobs.map((job, index) => (
          <SavedJobCard
            key={job.id}
            job={job}
            isSelected={selectedJobId === job.id}
            onSelect={() => onSelectJob(job)}
            onRemove={(e) => onRemoveJob(job.id, e)}
            onAddToTracker={(e) => onAddToTracker(job, e)}
            isTracked={job.url ? trackedJobUrls.has(job.url) : false}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
