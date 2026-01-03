'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { FileText, Plus, Trash2, Download, RefreshCw, Lock } from 'lucide-react';
import api from '@/lib/api';
import { CoverLetter, Resume } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CoverLettersPage() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);

  // Form state
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<'professional' | 'enthusiastic' | 'formal'>('professional');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coverLettersRes, resumesRes] = await Promise.all([
        api.getCoverLetters().catch((err) => {
          if (err.response?.status === 403) {
            setHasAccess(false);
          }
          return { success: false, data: [] };
        }),
        api.getResumes(),
      ]);

      if (coverLettersRes.success && coverLettersRes.data) {
        setCoverLetters(coverLettersRes.data);
      }
      if (resumesRes.success && resumesRes.data) {
        setResumes(resumesRes.data);
        if (resumesRes.data.length > 0) {
          setSelectedResumeId(resumesRes.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedResumeId || !jobTitle || !companyName || !jobDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await api.generateCoverLetter({
        resumeId: selectedResumeId,
        jobTitle,
        companyName,
        jobDescription,
        tone,
      });

      if (response.success && response.data) {
        setCoverLetters((prev) => [response.data!, ...prev]);
        setShowGenerator(false);
        setJobTitle('');
        setCompanyName('');
        setJobDescription('');
        toast.success('Cover letter generated!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate cover letter');
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
      setCoverLetters((prev) => prev.filter((cl) => cl.id !== id));
      toast.success('Cover letter deleted');
    } catch (error) {
      toast.error('Failed to delete cover letter');
    }
  };

  const handleDownload = async (id: string, format: 'pdf' | 'docx') => {
    try {
      const blob = await api.downloadCoverLetter(id, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cover-letter.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error('Failed to download cover letter');
    }
  };

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cover Letters</h1>
          <p className="text-gray-600 mt-1">
            Generate AI-powered cover letters tailored to your job applications
          </p>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pro Feature</h3>
              <p className="text-gray-500 mb-4">
                Cover letter generation is available on Pro and Business plans.
              </p>
              <Button onClick={() => window.location.href = '/subscription'}>
                Upgrade to Pro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cover Letters</h1>
          <p className="text-gray-600 mt-1">
            Generate AI-powered cover letters tailored to your job applications
          </p>
        </div>
        <Button onClick={() => setShowGenerator(!showGenerator)}>
          <Plus className="h-4 w-4 mr-2" />
          Generate Cover Letter
        </Button>
      </div>

      {showGenerator && (
        <Card>
          <CardHeader>
            <CardTitle>Generate New Cover Letter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Resume
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title} ({resume.fileName})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Google"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as typeof tone)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="professional">Professional</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="formal">Formal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Cover Letter'
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowGenerator(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : coverLetters.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cover letters yet</h3>
              <p className="text-gray-500 mb-4">
                Generate your first AI-powered cover letter for a job application
              </p>
              <Button onClick={() => setShowGenerator(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Cover Letter
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coverLetters.map((coverLetter) => (
            <Card key={coverLetter.id} className="hover:border-blue-300 hover:shadow-md transition-all">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-900">
                        {coverLetter.jobTitle} at {coverLetter.companyName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created {formatDate(coverLetter.createdAt)}
                      </p>
                      <div className="mt-2">
                        <Badge variant="default">{coverLetter.tone}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(coverLetter.id, 'pdf')}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Download PDF"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(coverLetter.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                    {coverLetter.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
