'use client';

import { useState } from 'react';
import { Search, MapPin, Filter, X, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface JobFiltersProps {
  keywords: string;
  location: string;
  experienceLevel: string;
  jobType: string;
  remoteOnly: boolean;
  isSearching: boolean;
  onKeywordsChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onExperienceLevelChange: (value: string) => void;
  onJobTypeChange: (value: string) => void;
  onRemoteOnlyChange: (value: boolean) => void;
  onSearch: () => void;
  onClearFilters: () => void;
}

export default function JobFilters({
  keywords,
  location,
  experienceLevel,
  jobType,
  remoteOnly,
  isSearching,
  onKeywordsChange,
  onLocationChange,
  onExperienceLevelChange,
  onJobTypeChange,
  onRemoteOnlyChange,
  onSearch,
  onClearFilters,
}: JobFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = [experienceLevel, jobType, remoteOnly].filter(Boolean).length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <Card variant="elevated">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Main Search Row */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={keywords}
                onChange={(e) => onKeywordsChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Job title, skills, or keywords"
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => onLocationChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="City, state, or 'remote'"
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<Filter className="h-4 w-4" />}
                className={cn(showFilters && 'bg-slate-100')}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="primary" size="sm" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={onSearch}
                disabled={isSearching}
                leftIcon={isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              >
                Search Jobs
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="pt-4 border-t border-slate-200 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => onExperienceLevelChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  >
                    <option value="" className="text-slate-500">Any level</option>
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead / Manager</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Job Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => onJobTypeChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                  >
                    <option value="" className="text-slate-500">Any type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors w-full">
                    <input
                      type="checkbox"
                      checked={remoteOnly}
                      onChange={(e) => onRemoteOnlyChange(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-slate-900">Remote Only</span>
                      <p className="text-xs text-slate-500">Work from anywhere</p>
                    </div>
                  </label>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={onClearFilters}
                    className="w-full"
                    leftIcon={<X className="h-4 w-4" />}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
