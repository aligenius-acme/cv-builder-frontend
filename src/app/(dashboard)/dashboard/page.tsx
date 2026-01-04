'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ResumeUploader from '@/components/resume/ResumeUploader';
import {
  FileText,
  Briefcase,
  TrendingUp,
  Plus,
  ArrowRight,
  Crown,
  Sparkles,
  Target,
  Zap,
  Upload,
  ChevronRight,
} from 'lucide-react';
import api from '@/lib/api';
import { Resume, CoverLetter } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [resumesRes, coverLettersRes] = await Promise.all([
        api.getResumes(),
        api.getCoverLetters().catch(() => ({ success: true, data: [] })),
      ]);

      if (resumesRes.success && resumesRes.data) {
        setResumes(resumesRes.data);
      }
      if (coverLettersRes.success && coverLettersRes.data) {
        setCoverLetters(coverLettersRes.data);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (resume: Resume) => {
    setResumes((prev) => [resume, ...prev]);
    setShowUploader(false);
  };

  const isPro = user?.planType === 'PRO' || user?.planType === 'BUSINESS';
  const totalVersions = resumes.reduce((acc, r) => acc + (r.versionCount || 0), 0);

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-8 text-white">
          <div className="absolute inset-0 opacity-50" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'%3E%3C/path%3E%3C/svg%3E\")"}} />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-white/80 text-sm font-medium">AI-Powered Resume Builder</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                  Welcome back, {user?.firstName || 'there'}!
                </h1>
                <p className="text-white/80 text-lg max-w-xl">
                  {resumes.length === 0
                    ? 'Upload your first resume and let AI help you land your dream job.'
                    : 'Your AI-powered resume toolkit is ready. Create tailored versions for any job.'}
                </p>
              </div>
              <div className="mt-6 lg:mt-0 flex flex-wrap gap-3">
                {!isPro && (
                  <Link href="/subscription">
                    <Button
                      variant="secondary"
                      size="lg"
                      leftIcon={<Crown className="h-5 w-5 text-amber-500" />}
                    >
                      Upgrade to Pro
                    </Button>
                  </Link>
                )}
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Plus className="h-5 w-5" />}
                  onClick={() => setShowUploader(!showUploader)}
                >
                  Upload Resume
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {showUploader && (
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-indigo-600" />
                Upload New Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResumeUploader onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="gradient" hover className="group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Resumes</p>
                  <p className="text-4xl font-bold text-slate-900">{resumes.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" hover className="group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Cover Letters</p>
                  <p className="text-4xl font-bold text-slate-900">{coverLetters.length}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                  <Briefcase className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="gradient" hover className="group">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Tailored Versions</p>
                  <p className="text-4xl font-bold text-slate-900">{totalVersions}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <Target className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumes List */}
          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Resumes</CardTitle>
                <Link href="/resumes">
                  <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4 p-4 rounded-xl bg-slate-50">
                        <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-1/3" />
                          <div className="h-3 bg-slate-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-10 w-10 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No resumes yet</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                      Upload your first resume and let our AI help you create tailored versions for every job.
                    </p>
                    <Button
                      variant="gradient"
                      size="lg"
                      leftIcon={<Upload className="h-5 w-5" />}
                      onClick={() => setShowUploader(true)}
                    >
                      Upload Your Resume
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {resumes.slice(0, 5).map((resume, index) => (
                      <Link key={resume.id} href={`/resumes/${resume.id}`}>
                        <div
                          className="group flex items-center justify-between p-4 rounded-xl border border-slate-200/60 bg-white hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 cursor-pointer"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center group-hover:from-indigo-100 group-hover:to-indigo-50 transition-colors">
                              <FileText className="h-6 w-6 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                {resume.title}
                              </p>
                              <p className="text-sm text-slate-500">
                                {resume.fileName} • {formatDate(resume.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={resume.parseStatus === 'completed' ? 'success' : 'warning'}>
                              {resume.parseStatus}
                            </Badge>
                            {resume.versionCount !== undefined && resume.versionCount > 0 && (
                              <span className="text-sm text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                {resume.versionCount} version{resume.versionCount !== 1 ? 's' : ''}
                              </span>
                            )}
                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card variant="elevated" hover>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">AI Customization</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Tailor your resume for any job with AI-powered optimization.
                    </p>
                    {resumes.length > 0 ? (
                      <Link href={`/resumes/${resumes[0]?.id}`}>
                        <Button variant="primary" size="sm" className="w-full">
                          Customize Now
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="primary" size="sm" className="w-full" disabled>
                        Upload Resume First
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated" hover className={!isPro ? 'relative' : ''}>
              {!isPro && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10">
                  <Link href="/subscription">
                    <Button variant="gradient" leftIcon={<Crown className="h-4 w-4" />}>
                      Unlock with Pro
                    </Button>
                  </Link>
                </div>
              )}
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">Cover Letters</h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Generate professional cover letters tailored to each application.
                    </p>
                    <Link href="/cover-letters">
                      <Button variant="primary" size="sm" className="w-full">
                        Create Cover Letter
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Features Card */}
            {!isPro && (
              <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 border-0 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown className="h-5 w-5 text-amber-300" />
                    <span className="font-semibold">Upgrade to Pro</span>
                  </div>
                  <p className="text-white/80 text-sm mb-4">
                    Unlock unlimited customizations, cover letters, and priority support.
                  </p>
                  <Link href="/subscription">
                    <Button variant="secondary" size="sm" className="w-full">
                      View Plans
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center py-8 border-t border-slate-200/60">
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            ResumeAI helps you present your real experience effectively. We never fabricate experience
            or guarantee hiring outcomes. All AI-generated content is based on your provided information.
          </p>
        </div>
      </div>
    </div>
  );
}
