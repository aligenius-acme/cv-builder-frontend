'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FileText, Plus, Sparkles, ExternalLink, X } from 'lucide-react';
import api, { JobApplication } from '@/lib/api';
import { CoverLetter, Resume } from '@/types';
import { downloadBlob, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useFetchMultiple } from '@/hooks/useFetchData';
import CoverLetterGenerator from '@/components/cover-letters/CoverLetterGenerator';
import CoverLetterCard from '@/components/cover-letters/CoverLetterCard';
import OutOfCreditsInline from '@/components/shared/OutOfCreditsInline';
import { useOutOfCredits } from '@/hooks';

interface EnhancedCoverLetter extends CoverLetter {
  alternativeOpenings?: string[];
  keyPhrases?: string[];
  toneAnalysis?: {
    current: string;
    score: number;
    suggestions?: string[];
  };
  callToActionVariations?: string[];
  subjectLineOptions?: string[];
}

export default function CoverLettersPage() {
  // Use useFetchMultiple for parallel data loading - replaces 30+ lines!
  const { data, isLoading, setData } = useFetchMultiple([
    () => api.getCoverLetters().catch(() => ({ success: false, data: [] })),
    () => api.getResumes(),
    () => api.getJobApplications().catch(() => ({ success: false, data: { applications: [] } })),
    () => api.getSavedJobs(1, 100).catch(() => ({ success: false, data: { jobs: [] } })),
  ]);

  const coverLetters = (data?.[0] as EnhancedCoverLetter[]) || [];
  const resumes = (data?.[1] as Resume[]) || [];

  // Merge jobs from Job Tracker and Saved Jobs (same as AI Tools)
  const jobTrackerJobs = ((data?.[2] as any)?.applications || []) as JobApplication[];
  const savedJobsFromSearch = ((data?.[3] as any)?.jobs || []);

  const mergedJobs: JobApplication[] = [
    ...jobTrackerJobs,
    ...savedJobsFromSearch.map((job: any) => ({
      id: job.savedJobId || job.id,
      jobTitle: job.title,
      companyName: job.company,
      location: job.location,
      salary: job.salary,
      jobUrl: job.url,
      jobDescription: job.description || '',
      source: job.source || 'Saved Jobs',
    }))
  ];

  // Deduplicate and filter for those with descriptions (required for cover letters)
  const uniqueJobs = mergedJobs.reduce((acc, job) => {
    const key = `${job.jobTitle}-${job.companyName}`.toLowerCase();
    if (!acc.has(key) && job.jobDescription) {
      acc.set(key, job);
    }
    return acc;
  }, new Map<string, JobApplication>());

  const savedJobs = Array.from(uniqueJobs.values());

  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { outOfCredits, check402 } = useOutOfCredits();
  const [expandedLetter, setExpandedLetter] = useState<string | null>(null);
  const [showEnhancements, setShowEnhancements] = useState<Record<string, boolean>>({});
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [showGrammarlyBanner, setShowGrammarlyBanner] = useState(false);
  const [grammarlyUrl, setGrammarlyUrl] = useState('');

  useEffect(() => {
    api.getPublicAffiliates(['grammarly'])
      .then((res) => {
        if (res.success && res.data?.grammarly?.url) {
          setGrammarlyUrl(res.data.grammarly.url);
        }
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async (data: {
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    tone: 'professional' | 'enthusiastic' | 'formal';
  }) => {
    if (!data.jobTitle || !data.companyName || !data.jobDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.generateCoverLetter(data);

      if (response.success && response.data) {
        // Update cover letters in the data array
        setData((prev) => {
          const newData = [...(prev || [])];
          newData[0] = [response.data!, ...(newData[0] || [])];
          return newData;
        });
        setShowGenerator(false);
        setShowGrammarlyBanner(true);
        toast.success('Cover letter generated!');
      }
    } catch (error: any) {
      if (check402(error)) return;
      toast.error(getErrorMessage(error, 'Failed to generate cover letter'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this cover letter?')) {
      return;
    }

    try {
      await api.deleteCoverLetter(id);
      // Update cover letters in the data array
      setData((prev) => {
        const newData = [...(prev || [])];
        newData[0] = ((newData[0] as EnhancedCoverLetter[]) || []).filter((cl) => cl.id !== id);
        return newData;
      });
      toast.success('Cover letter deleted');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete cover letter'));
    }
  };

  const handleDownload = async (id: string, format: 'pdf' | 'docx') => {
    try {
      const blob = await api.downloadCoverLetter(id, format);
      downloadBlob(blob, `cover-letter.${format}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to download cover letter'));
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const toggleEnhancements = (id: string) => {
    setShowEnhancements((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PageHeader
          icon={<FileText className="h-5 w-5" />}
          label="AI Writing Assistant"
          title="Cover Letters"
          description="Generate compelling, personalized cover letters that highlight your unique value and match each job opportunity perfectly."
          actions={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setShowGenerator(!showGenerator)}
            >
              Generate Cover Letter
            </Button>
          }
        />

        {/* Grammarly affiliate CTA — shown after cover letter generation */}
        {showGrammarlyBanner && grammarlyUrl && (
          <div className="flex items-center justify-between gap-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-green-700 dark:text-green-400 text-sm font-medium">✨ Polish your writing:</span>
              <a
                href={grammarlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-400 hover:underline font-semibold"
              >
                Try Grammarly for free
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
            <button onClick={() => setShowGrammarlyBanner(false)} className="text-green-500 hover:text-green-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Generator Form */}
        {showGenerator && (
          <CoverLetterGenerator
            savedJobs={savedJobs}
            resumes={resumes}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            onCancel={() => setShowGenerator(false)}
          />
        )}
        {outOfCredits && <OutOfCreditsInline />}

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} variant="elevated">
                <CardContent className="py-6">
                  <div className="animate-pulse flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-slate-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-20 bg-slate-200 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : coverLetters.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No cover letters yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  Generate your first AI-powered cover letter for a job application
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Sparkles className="h-5 w-5" />}
                  onClick={() => setShowGenerator(true)}
                >
                  Generate Cover Letter
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {coverLetters.map((coverLetter, index) => (
              <CoverLetterCard
                key={coverLetter.id}
                coverLetter={coverLetter}
                index={index}
                expanded={expandedLetter === coverLetter.id}
                showEnhancements={showEnhancements[coverLetter.id] || false}
                copiedItem={copiedItem}
                onExpand={() => setExpandedLetter(expandedLetter === coverLetter.id ? null : coverLetter.id)}
                onToggleEnhancements={() => toggleEnhancements(coverLetter.id)}
                onCopy={copyToClipboard}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {coverLetters.length > 0 && (
          <div className="flex items-center justify-center gap-8 py-6 border-t border-slate-200/60">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{coverLetters.length}</p>
              <p className="text-sm text-slate-500">Cover Letters</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {new Set(coverLetters.map(cl => cl.companyName)).size}
              </p>
              <p className="text-sm text-slate-500">Companies</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
