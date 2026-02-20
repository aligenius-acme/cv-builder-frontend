'use client';

import Link from 'next/link';
import {
  ExternalLink,
  FileText,
  ChevronLeft,
  Loader2,
  DollarSign,
  Clock,
  Building2,
  MapPin,
  Target,
  Bookmark,
  BookmarkCheck,
  Users,
  CheckCircle2,
  Star,
  TrendingUp,
  Globe,
  ArrowRight,
  ListChecks,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import CompanyLogo from './CompanyLogo';
import { JobListing } from './JobCard';

interface JobDetailsProps {
  job: JobListing;
  details: any;
  isLoading: boolean;
  isSaved: boolean;
  isTracked: boolean;
  onBack: () => void;
  onSave: () => void;
  onAddToTracker: () => void;
}

export default function JobDetailsPanel({
  job,
  details,
  isLoading,
  isSaved,
  isTracked,
  onBack,
  onSave,
  onAddToTracker,
}: JobDetailsProps) {
  return (
    <Card variant="elevated" className="sticky top-6">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          {/* Mobile back button */}
          <button
            onClick={onBack}
            className="lg:hidden flex items-center gap-1 text-sm text-blue-600 mb-4 hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to results
          </button>

          <div className="flex items-start gap-4">
            <CompanyLogo company={job.company} size={64} />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-slate-900 line-clamp-2">{job.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {job.location}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {job.salary && (
                  <Badge variant="success" size="lg" className="font-semibold">
                    <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                    {job.salary}
                  </Badge>
                )}
                <Badge variant="default" size="lg">{job.type}</Badge>
                <Badge variant="info" size="lg" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {job.posted}
                </Badge>
              </div>
            </div>
          </div>

          {/* Tracker Status */}
          {isTracked && (
            <Link href="/job-tracker" className="block mt-4">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-xl text-emerald-700 hover:bg-emerald-100 transition-colors">
                <ListChecks className="h-4 w-4" />
                <span className="text-sm font-medium">This job is in your tracker</span>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </div>
            </Link>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              leftIcon={<ExternalLink className="h-4 w-4" />}
              onClick={() => window.open(job.url, '_blank')}
            >
              Apply Now
            </Button>
            <Link href={`/resumes?jobTitle=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`}>
              <Button
                variant="outline"
                size="lg"
                leftIcon={<FileText className="h-4 w-4" />}
              >
                Tailor Resume
              </Button>
            </Link>
            {!isTracked && (
              <Button
                variant="outline"
                size="lg"
                onClick={onAddToTracker}
                leftIcon={<Target className="h-4 w-4" />}
                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
              >
                Add to Tracker
              </Button>
            )}
            <Button
              variant={isSaved ? 'primary' : 'outline'}
              size="lg"
              onClick={onSave}
              leftIcon={isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            >
              {isSaved ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Details Content */}
        <div className="p-6 max-h-[600px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm text-slate-500">Loading job details...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  About this Role
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {details?.fullDescription || job.description}
                </p>
              </div>

              {/* Responsibilities */}
              {details?.responsibilities?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    Responsibilities
                  </h3>
                  <ul className="space-y-2">
                    {details.responsibilities.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {(details?.requirements || job.requirements)?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-amber-100 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-amber-600" />
                    </div>
                    Requirements
                  </h3>
                  <ul className="space-y-2">
                    {(details?.requirements || job.requirements).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Nice to Have */}
              {details?.niceToHave?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <Star className="h-4 w-4 text-emerald-600" />
                    </div>
                    Nice to Have
                  </h3>
                  <ul className="space-y-2">
                    {details.niceToHave.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
                        <Star className="h-4 w-4 text-amber-400 mt-1 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {details?.benefits?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    Benefits & Perks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details.benefits.map((item: string, i: number) => (
                      <Badge key={i} variant="success" size="lg" className="font-normal">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Source Footer */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    Posted via {job.source}
                  </span>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    View original posting
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
