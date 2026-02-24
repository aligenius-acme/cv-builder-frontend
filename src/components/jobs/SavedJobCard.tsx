'use client';

import Link from 'next/link';
import { Building2, MapPin, Calendar, DollarSign, Trash2, Target, ListChecks } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CompanyLogo from './CompanyLogo';
import { cn } from '@/lib/utils';
import { JobListing } from './JobCard';

export interface SavedJobListing extends JobListing {
  savedJobId: string;
  savedAt: string;
  notes?: string;
}

interface SavedJobCardProps {
  job: SavedJobListing;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: (e: React.MouseEvent) => void;
  onAddToTracker: (e: React.MouseEvent) => void;
  isTracked: boolean;
  index: number;
}

export default function SavedJobCard({
  job,
  isSelected,
  onSelect,
  onRemove,
  onAddToTracker,
  isTracked,
  index,
}: SavedJobCardProps) {
  const savedDate = new Date(job.savedAt);
  const formattedDate = savedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card
      variant="elevated"
      hover
      className={cn(
        'cursor-pointer transition-all duration-200 group',
        isSelected && 'ring-2 ring-pink-500 shadow-lg shadow-pink-500/10'
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
                <h3 className="font-semibold text-slate-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-slate-600 flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {job.company}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {isTracked ? (
                  <Link href="/job-tracker">
                    <Badge variant="info" size="sm" className="cursor-pointer hover:bg-blue-200">
                      <ListChecks className="h-3 w-3 mr-1" />
                      In Tracker
                    </Badge>
                  </Link>
                ) : (
                  <button
                    onClick={onAddToTracker}
                    className="p-2 rounded-lg transition-all duration-200 flex-shrink-0 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600"
                    title="Add to Job Tracker"
                  >
                    <Target className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onRemove}
                  className="p-2 rounded-lg transition-all duration-200 flex-shrink-0 hover:bg-red-50 text-red-600 hover:text-red-700"
                  title="Remove from saved"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{job.location}</span>
              </span>
              <span className="flex items-center gap-1 text-pink-600">
                <Calendar className="h-3.5 w-3.5" />
                Saved {formattedDate}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {job.salary && (
                <Badge variant="success" size="sm" className="font-medium">
                  <DollarSign className="h-3 w-3 mr-0.5" />
                  {job.salary}
                </Badge>
              )}
              <Badge variant="default" size="sm">{job.type || 'Full-time'}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
