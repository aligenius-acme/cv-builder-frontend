'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SegmentedControl from '@/components/ui/SegmentedControl';
import {
  Sparkles,
  RefreshCw,
  Briefcase,
  Building,
  Heart,
  Edit3,
  MapPin,
  DollarSign,
  ChevronDown,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { JobApplication, Resume } from '@/types';

interface CoverLetterGeneratorProps {
  savedJobs: JobApplication[];
  resumes: Resume[];
  isGenerating: boolean;
  onGenerate: (data: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    tone: 'professional' | 'enthusiastic' | 'formal';
  }) => void;
  onCancel: () => void;
}

export default function CoverLetterGenerator({
  savedJobs,
  resumes,
  isGenerating,
  onGenerate,
  onCancel,
}: CoverLetterGeneratorProps) {
  const [inputMode, setInputMode] = useState<'manual' | 'saved'>('saved');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [showSavedJobsDropdown, setShowSavedJobsDropdown] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'formal'>('professional');

  const handleSelectSavedJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setShowSavedJobsDropdown(false);
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setJobTitle(job.jobTitle);
      setCompanyName(job.companyName);
      setJobDescription(job.jobDescription || '');
    }
  };

  const handleSubmit = () => {
    onGenerate({ jobTitle, companyName, jobDescription, tone });
  };

  return (
    <Card variant="elevated" className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Generate New Cover Letter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Input Mode Toggle */}
        <SegmentedControl
          options={[
            { value: 'saved' as const, label: 'From Saved Jobs', icon: <Heart className="h-4 w-4" />, count: savedJobs.length },
            { value: 'manual' as const, label: 'Enter Manually', icon: <Edit3 className="h-4 w-4" /> },
          ]}
          value={inputMode}
          onChange={(mode) => {
            setInputMode(mode);
            if (mode === 'manual') {
              setSelectedJobId('');
            }
          }}
        />

        {/* Saved Jobs Dropdown */}
        {inputMode === 'saved' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select a Saved Job
            </label>
            {savedJobs.length === 0 ? (
              <div className="p-6 border border-dashed border-slate-300 rounded-xl text-center">
                <Heart className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No saved jobs yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Save jobs from the Job Tracker to quickly generate cover letters
                </p>
                <div className="flex justify-center gap-3 mt-4">
                  <Link href="/job-tracker">
                    <Button variant="primary" size="sm" leftIcon={<Search className="h-4 w-4" />}>
                      Job Tracker
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMode('manual')}
                  >
                    Enter Manually
                  </Button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSavedJobsDropdown(!showSavedJobsDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                >
                  {selectedJobId ? (
                    <span className="text-slate-900">
                      {savedJobs.find(j => j.id === selectedJobId)?.jobTitle} at {savedJobs.find(j => j.id === selectedJobId)?.companyName}
                    </span>
                  ) : (
                    <span className="text-slate-500">Select a job to generate cover letter for...</span>
                  )}
                  <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${showSavedJobsDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSavedJobsDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    {savedJobs.map((job) => (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => handleSelectSavedJob(job.id)}
                        className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-100 last:border-0 ${
                          selectedJobId === job.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{job.jobTitle}</p>
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
            )}
            {savedJobs.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                {savedJobs.length} saved job{savedJobs.length !== 1 ? 's' : ''} with descriptions •{' '}
                <Link href="/job-tracker" className="text-blue-600 hover:text-blue-700">Manage jobs</Link>
              </p>
            )}
          </div>
        )}

        {/* Form fields - shown when manual mode or when a saved job is selected */}
        {(inputMode === 'manual' || (inputMode === 'saved' && selectedJobId)) && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Job Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    readOnly={inputMode === 'saved' && !!selectedJobId}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    readOnly={inputMode === 'saved' && !!selectedJobId}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tone
              </label>
              <div className="flex gap-3">
                {(['professional', 'enthusiastic', 'formal'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      tone === t
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
                className={`w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none ${
                  inputMode === 'saved' && selectedJobId ? 'bg-slate-50' : ''
                }`}
                readOnly={inputMode === 'saved' && !!selectedJobId}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={isGenerating}
                leftIcon={isGenerating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              >
                {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
              </Button>
              <Button variant="outline" size="lg" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
