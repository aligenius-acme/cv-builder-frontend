'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  RefreshCw,
  Lock,
  Sparkles,
  Briefcase,
  Building,
  ChevronRight,
  Crown,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  Lightbulb,
  Mail,
  MessageSquare,
  Target,
  Wand2,
  X,
  Edit3,
} from 'lucide-react';
import api from '@/lib/api';
import { CoverLetter, Resume } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Link from 'next/link';

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
  const [coverLetters, setCoverLetters] = useState<EnhancedCoverLetter[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAccess, setHasAccess] = useState(true);
  const [expandedLetter, setExpandedLetter] = useState<string | null>(null);
  const [showEnhancements, setShowEnhancements] = useState<Record<string, boolean>>({});
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Form state
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
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!jobTitle || !companyName || !jobDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsGenerating(true);
    try {
      // Try enhanced endpoint first, fallback to regular
      let response;
      try {
        response = await api.generateEnhancedCoverLetter({
          jobTitle,
          companyName,
          jobDescription,
          tone,
        });
      } catch {
        response = await api.generateCoverLetter({
          jobTitle,
          companyName,
          jobDescription,
          tone,
        });
      }

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

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Cover Letters</h1>
            <p className="text-slate-500 mt-1">
              Generate AI-powered cover letters tailored to your job applications
            </p>
          </div>

          <Card variant="elevated">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-10 w-10 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Pro Feature</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  Cover letter generation is available on Pro and Business plans. Upgrade to unlock AI-powered cover letters.
                </p>
                <Link href="/subscription">
                  <Button variant="gradient" size="lg" leftIcon={<Crown className="h-5 w-5" />}>
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-8 text-white">
          <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5" />
                <span className="text-white/80 text-sm font-medium">AI Writing Assistant</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Cover Letters</h1>
              <p className="text-white/80 text-lg max-w-2xl">
                Generate compelling, personalized cover letters that highlight your unique value
                and match each job opportunity perfectly.
              </p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => setShowGenerator(!showGenerator)}
              className="mt-6 lg:mt-0"
            >
              Generate Cover Letter
            </Button>
          </div>
        </div>

        {/* Generator Form */}
        {showGenerator && (
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Generate New Cover Letter
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
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
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
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
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
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
                          ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
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
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  leftIcon={isGenerating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                >
                  {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
                </Button>
                <Button variant="outline" size="lg" onClick={() => setShowGenerator(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
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
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No cover letters yet</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  Generate your first AI-powered cover letter for a job application
                </p>
                <Button
                  variant="gradient"
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
              <Card
                key={coverLetter.id}
                variant="elevated"
                className="group hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="py-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-pink-200 transition-colors">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors">
                          {coverLetter.jobTitle}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Building className="h-3.5 w-3.5" />
                          {coverLetter.companyName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="info" size="sm">{coverLetter.tone}</Badge>
                          <span className="text-xs text-slate-400">{formatDate(coverLetter.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDownload(coverLetter.id, 'pdf')}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Download PDF"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(coverLetter.content, coverLetter.id)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                        title="Copy content"
                      >
                        {copiedItem === coverLetter.id ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Copy className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(coverLetter.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Cover Letter Content */}
                  <div className="p-4 bg-slate-50 rounded-xl mb-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-4">
                      {coverLetter.content}
                    </p>
                    <button
                      onClick={() => setExpandedLetter(expandedLetter === coverLetter.id ? null : coverLetter.id)}
                      className="mt-2 text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                    >
                      {expandedLetter === coverLetter.id ? (
                        <>
                          Show less
                          <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Read full letter
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    {expandedLetter === coverLetter.id && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">
                          {coverLetter.content}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Enhanced AI Features Section */}
                  {(coverLetter.alternativeOpenings || coverLetter.subjectLineOptions || coverLetter.callToActionVariations) && (
                    <div className="border-t border-slate-200 pt-4">
                      <button
                        onClick={() => toggleEnhancements(coverLetter.id)}
                        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors mb-3"
                      >
                        <Wand2 className="h-4 w-4" />
                        {showEnhancements[coverLetter.id] ? 'Hide' : 'Show'} AI Alternatives & Enhancements
                        {showEnhancements[coverLetter.id] ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {showEnhancements[coverLetter.id] && (
                        <div className="space-y-4 animate-slide-up">
                          {/* Subject Line Options */}
                          {coverLetter.subjectLineOptions && coverLetter.subjectLineOptions.length > 0 && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                              <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Subject Lines
                              </h4>
                              <div className="space-y-2">
                                {coverLetter.subjectLineOptions.map((subject, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
                                    <span className="text-sm text-slate-700">{subject}</span>
                                    <button
                                      onClick={() => copyToClipboard(subject, `subject-${coverLetter.id}-${idx}`)}
                                      className="text-blue-600 hover:text-blue-700 p-1"
                                    >
                                      {copiedItem === `subject-${coverLetter.id}-${idx}` ? (
                                        <CheckCircle className="h-4 w-4" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Alternative Openings */}
                          {coverLetter.alternativeOpenings && coverLetter.alternativeOpenings.length > 0 && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                              <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
                                <Edit3 className="h-4 w-4" />
                                Alternative Opening Paragraphs
                              </h4>
                              <div className="space-y-3">
                                {coverLetter.alternativeOpenings.map((opening, idx) => (
                                  <div key={idx} className="bg-white rounded-lg p-3 border border-purple-100">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <Badge className="bg-purple-100 text-purple-700 mb-2">Option {idx + 1}</Badge>
                                        <p className="text-sm text-slate-700">{opening}</p>
                                      </div>
                                      <button
                                        onClick={() => copyToClipboard(opening, `opening-${coverLetter.id}-${idx}`)}
                                        className="text-purple-600 hover:text-purple-700 p-1 flex-shrink-0"
                                      >
                                        {copiedItem === `opening-${coverLetter.id}-${idx}` ? (
                                          <CheckCircle className="h-4 w-4" />
                                        ) : (
                                          <Copy className="h-4 w-4" />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Call to Action Variations */}
                          {coverLetter.callToActionVariations && coverLetter.callToActionVariations.length > 0 && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                              <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Call-to-Action Closing Variations
                              </h4>
                              <div className="space-y-2">
                                {coverLetter.callToActionVariations.map((cta, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 border border-emerald-100">
                                    <span className="text-sm text-slate-700">{cta}</span>
                                    <button
                                      onClick={() => copyToClipboard(cta, `cta-${coverLetter.id}-${idx}`)}
                                      className="text-emerald-600 hover:text-emerald-700 p-1"
                                    >
                                      {copiedItem === `cta-${coverLetter.id}-${idx}` ? (
                                        <CheckCircle className="h-4 w-4" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Key Phrases */}
                          {coverLetter.keyPhrases && coverLetter.keyPhrases.length > 0 && (
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                              <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4" />
                                Key Phrases to Highlight
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {coverLetter.keyPhrases.map((phrase, idx) => (
                                  <Badge
                                    key={idx}
                                    className="bg-white text-amber-700 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors"
                                    onClick={() => copyToClipboard(phrase, `phrase-${coverLetter.id}-${idx}`)}
                                  >
                                    {copiedItem === `phrase-${coverLetter.id}-${idx}` ? (
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : null}
                                    {phrase}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tone Analysis */}
                          {coverLetter.toneAnalysis && (
                            <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
                              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Tone Analysis
                              </h4>
                              <div className="flex items-center gap-4 mb-2">
                                <span className="text-sm text-slate-600">Current Tone:</span>
                                <Badge className="bg-slate-100 text-slate-700">{coverLetter.toneAnalysis.current}</Badge>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-600">Score:</span>
                                  <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        coverLetter.toneAnalysis.score >= 80 ? 'bg-emerald-500' :
                                        coverLetter.toneAnalysis.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${coverLetter.toneAnalysis.score}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium text-slate-700">{coverLetter.toneAnalysis.score}%</span>
                                </div>
                              </div>
                              {coverLetter.toneAnalysis.suggestions && coverLetter.toneAnalysis.suggestions.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                  <span className="text-xs font-medium text-slate-500 uppercase">Suggestions:</span>
                                  <ul className="mt-1 space-y-1">
                                    {coverLetter.toneAnalysis.suggestions.map((suggestion, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                        <ChevronRight className="h-4 w-4 mt-0.5 text-slate-400 flex-shrink-0" />
                                        {suggestion}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
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
