'use client';

import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { FileText, Plus, Sparkles } from 'lucide-react';
import api, { JobApplication } from '@/lib/api';
import { CoverLetter, Resume } from '@/types';
import { downloadBlob, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useFetchMultiple } from '@/hooks/useFetchData';
import CoverLetterGenerator from '@/components/cover-letters/CoverLetterGenerator';
import CoverLetterCard from '@/components/cover-letters/CoverLetterCard';

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
  ]);

  const coverLetters = (data?.[0] as EnhancedCoverLetter[]) || [];
  const resumes = (data?.[1] as Resume[]) || [];
  const savedJobs = ((data?.[2] as any)?.applications || []).filter((job: JobApplication) => job.jobDescription);

  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedLetter, setExpandedLetter] = useState<string | null>(null);
  const [showEnhancements, setShowEnhancements] = useState<Record<string, boolean>>({});
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

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
        toast.success('Cover letter generated!');
      }
    } catch (error: any) {
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
                <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mx-auto mb-6">
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
