'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ResumeUploader from '@/components/resume/ResumeUploader';
import PageHeader from '@/components/shared/PageHeader';
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
  Kanban,
  Calendar,
  CheckCircle,
  Clock,
  BarChart3,
  GraduationCap,
  Send,
  LayoutDashboard,
} from 'lucide-react';
import api, { CareerDashboardStats } from '@/lib/api';
import { Resume, CoverLetter } from '@/types';
import { formatDate } from '@/lib/utils';
import { useFetchMultiple } from '@/hooks/useFetchData';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [showUploader, setShowUploader] = useState(false);

  // Use useFetchMultiple for parallel data loading - replaces 25+ lines!
  const { data, isLoading, setData } = useFetchMultiple([
    () => api.getResumes(),
    () => api.getCoverLetters().catch(() => ({ success: true, data: [] })),
    () => api.getCareerDashboardStats().catch(() => ({ success: false, data: null })),
  ], {
    showErrorToast: false, // Silent errors for dashboard
  });

  const resumes = (data?.[0] as Resume[]) || [];
  const coverLetters = (data?.[1] as CoverLetter[]) || [];
  const careerStats = (data?.[2] as CareerDashboardStats) || null;

  const handleUploadComplete = (resume: Resume) => {
    // Update resumes in data array
    setData((prev) => {
      const newData = [...(prev || [])];
      newData[0] = [resume, ...(newData[0] || [])];
      return newData;
    });
    setShowUploader(false);
  };

  const totalVersions = resumes.reduce((acc, r) => acc + (r.versionCount || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <PageHeader
          icon={<LayoutDashboard className="h-5 w-5" />}
          label="AI-Powered Career Hub"
          title={`Welcome back, ${user?.firstName || 'there'}!`}
          description={
            resumes.length === 0
              ? 'Upload your first resume and let AI help you land your dream job.'
              : 'Your AI-powered career toolkit is ready. Track applications and optimize your job search.'
          }
          actions={
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => setShowUploader(!showUploader)}
            >
              Upload Resume
            </Button>
          }
        />

        {/* Upload Section */}
        {showUploader && (
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-blue-600" />
                Upload New Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResumeUploader onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>
        )}

        {/* Career Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { href: '/resumes', icon: FileText, label: 'Resumes', value: resumes.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/50' },
            { href: '/resumes', icon: Target, label: 'Versions', value: totalVersions, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/50' },
            { href: '/cover-letters', icon: Briefcase, label: 'Cover Letters', value: coverLetters.length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
            { href: '/job-tracker', icon: Send, label: 'Applications', value: (careerStats as any)?.applications?.total || 0, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/50' },
            { href: '/job-tracker', icon: Calendar, label: 'Interviews', value: (careerStats as any)?.upcoming?.interviews?.length || 0, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/50' },
            { href: '/job-tracker', icon: CheckCircle, label: 'Response Rate', value: `${(careerStats as any)?.applications?.responseRate || 0}%`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card variant="default" hover className="group cursor-pointer">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--text)]">{stat.value}</p>
                      <p className="text-xs font-medium text-[var(--text-muted)]">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Application Tracker Summary */}
        {careerStats && (careerStats as any).applications?.total > 0 && (
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Kanban className="h-5 w-5 text-blue-600" />
                Application Pipeline
              </CardTitle>
              <Link href="/job-tracker">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>
                  Open Tracker
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { key: 'WISHLIST', label: 'Wishlist', color: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400' },
                  { key: 'APPLIED', label: 'Applied', color: 'bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
                  { key: 'SCREENING', label: 'Screening', color: 'bg-blue-100 text-blue-600 dark:bg-indigo-950/50 dark:text-blue-400' },
                  { key: 'INTERVIEWING', label: 'Interviewing', color: 'bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400' },
                  { key: 'OFFER', label: 'Offers', color: 'bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
                  { key: 'ACCEPTED', label: 'Accepted', color: 'bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400' },
                  { key: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400' },
                ].map(({ key, label, color }) => (
                  <div
                    key={key}
                    className={`${color} rounded-xl p-3 text-center transition-transform hover:scale-105`}
                  >
                    <p className="text-2xl font-bold">
                      {(careerStats as any).applications?.byStatus?.[key] || 0}
                    </p>
                    <p className="text-xs font-medium opacity-80">{label}</p>
                  </div>
                ))}
              </div>
              {(careerStats as any).applications?.thisWeek > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                  <span>
                    <strong>{(careerStats as any).applications?.thisWeek}</strong> applications this week
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
                      <div key={i} className="animate-pulse flex items-center space-x-4 p-4 rounded-xl bg-[var(--surface-raised)]">
                        <div className="w-12 h-12 bg-[var(--border)] rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-[var(--border)] rounded w-1/3" />
                          <div className="h-3 bg-[var(--border)] rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-[var(--surface-raised)] rounded-xl flex items-center justify-center mx-auto mb-6">
                      <FileText className="h-10 w-10 text-[var(--text-muted)]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No resumes yet</h3>
                    <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                      Upload your first resume and let our AI help you create tailored versions for every job.
                    </p>
                    <Button
                      variant="primary"
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
                          className="group flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-blue-300 hover:shadow-[var(--shadow-md)] transition-all duration-200 cursor-pointer"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-[var(--surface-raised)] rounded-xl flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-colors">
                              <FileText className="h-6 w-6 text-[var(--text-muted)] group-hover:text-blue-600 transition-colors" />
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--text)] group-hover:text-blue-600 transition-colors">
                                {resume.title}
                              </p>
                              <p className="text-sm text-[var(--text-secondary)]">
                                {resume.fileName} • {formatDate(resume.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={resume.parseStatus === 'completed' ? 'success' : 'warning'}>
                              {resume.parseStatus}
                            </Badge>
                            {resume.versionCount !== undefined && resume.versionCount > 0 && (
                              <span className="text-sm text-[var(--text-secondary)] bg-[var(--surface-raised)] px-2.5 py-1 rounded-full">
                                {resume.versionCount} version{resume.versionCount !== 1 ? 's' : ''}
                              </span>
                            )}
                            <ChevronRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Tools */}
          <div className="space-y-4">
            {/* Job Tracker Quick Access */}
            {[
              {
                href: '/job-tracker',
                icon: Kanban,
                iconColor: 'text-blue-600',
                iconBg: 'bg-blue-50 dark:bg-blue-950/50',
                title: 'Job Tracker',
                description: 'Track your job applications with our Kanban board.',
                label: 'Open Tracker',
              },
              {
                href: resumes.length > 0 ? `/resumes/${resumes[0]?.id}` : '#',
                icon: Zap,
                iconColor: 'text-purple-600',
                iconBg: 'bg-purple-50 dark:bg-purple-950/50',
                title: 'AI Customization',
                description: 'Tailor your resume for any job with AI-powered optimization.',
                label: resumes.length > 0 ? 'Customize Now' : 'Upload Resume First',
                disabled: resumes.length === 0,
              },
              {
                href: '/skill-gap',
                icon: GraduationCap,
                iconColor: 'text-emerald-600',
                iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
                title: 'Skill Gap Analyzer',
                description: 'Identify missing skills for your target role.',
                label: 'Analyze Skills',
              },
              {
                href: '/resume-examples',
                icon: BarChart3,
                iconColor: 'text-amber-600',
                iconBg: 'bg-amber-50 dark:bg-amber-950/50',
                title: 'Resume Examples',
                description: 'Browse professional resume examples by industry.',
                label: 'Browse Examples',
              },
            ].map((action) => (
              <Card key={action.title} variant="elevated" hover>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${action.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--text)] mb-1">{action.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-4">{action.description}</p>
                      <Link href={action.href}>
                        <Button variant="primary" size="sm" className="w-full" disabled={action.disabled}>
                          {action.label}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-center py-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)] max-w-2xl mx-auto">
            JobTools AI helps you present your real experience effectively. We never fabricate experience
            or guarantee hiring outcomes. All AI-generated content is based on your provided information.
          </p>
        </div>
      </div>
    </div>
  );
}
