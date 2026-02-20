'use client';

import { Building2, MapPin, Clock, DollarSign, Bookmark, BookmarkCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import CompanyLogo from './CompanyLogo';
import { cn } from '@/lib/utils';

export interface JobListing {
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

interface JobCardProps {
  job: JobListing;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: () => void;
  onSave: (e: React.MouseEvent) => void;
  index: number;
}

export default function JobCard({
  job,
  isSelected,
  isSaved,
  onSelect,
  onSave,
  index,
}: JobCardProps) {
  return (
    <Card
      variant="elevated"
      hover
      className={cn(
        'cursor-pointer transition-all duration-200 group',
        isSelected && 'ring-2 ring-blue-500 shadow-lg'
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
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
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
                    ? 'bg-blue-100 text-blue-600'
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
