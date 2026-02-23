'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { SavedJobsDropdown } from '@/components/ui/SavedJobsDropdown';
import {
  Sparkles,
  RefreshCw,
  Briefcase,
  Building,
  Heart,
  Edit3,
} from 'lucide-react';
import { JobApplication } from '@/lib/api';
import { Resume } from '@/types';

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
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'formal'>('professional');

  const handleSelectSavedJob = (jobId: string) => {
    setSelectedJobId(jobId);
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
          <SavedJobsDropdown
            jobs={savedJobs}
            selectedJobId={selectedJobId}
            onSelect={handleSelectSavedJob}
            label="Select a Saved Job"
            placeholder="Select a job to generate cover letter for..."
            colorTheme="blue"
            onSwitchToManual={() => setInputMode('manual')}
            requireDescription={true}
            onDescriptionMissing={() => {
              // Cover letters need description, but it's already filtered in parent
              // This is just a safety check
              setInputMode('manual');
            }}
          />
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
                  <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    readOnly={inputMode === 'saved' && !!selectedJobId}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Google"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                className={`w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none ${
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
