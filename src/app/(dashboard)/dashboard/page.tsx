'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ResumeUploader from '@/components/resume/ResumeUploader';
import { FileText, Briefcase, TrendingUp, Plus, ArrowRight, Crown } from 'lucide-react';
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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'there'}!
          </h1>
          <p className="text-gray-600 mt-1">
            {resumes.length === 0
              ? 'Upload your first resume to get started'
              : 'Manage your resumes and cover letters'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {!isPro && (
            <Link href="/subscription">
              <Button variant="outline">
                <Crown className="h-4 w-4 mr-2 text-yellow-500" />
                Upgrade to Pro
              </Button>
            </Link>
          )}
          <Button onClick={() => setShowUploader(!showUploader)}>
            <Plus className="h-4 w-4 mr-2" />
            Upload Resume
          </Button>
        </div>
      </div>

      {/* Upload Section */}
      {showUploader && (
        <Card>
          <CardHeader>
            <CardTitle>Upload New Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResumeUploader onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cover Letters</p>
                <p className="text-2xl font-bold text-gray-900">{coverLetters.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tailored Versions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resumes.reduce((acc, r) => acc + (r.versionCount || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Resumes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Resumes</CardTitle>
          <Link href="/resumes">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
              <p className="text-gray-500 mb-4">Upload your first resume to get started</p>
              <Button onClick={() => setShowUploader(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.slice(0, 5).map((resume) => (
                <Link key={resume.id} href={`/resumes/${resume.id}`}>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-900">{resume.title}</p>
                        <p className="text-sm text-gray-500">
                          {resume.fileName} • {formatDate(resume.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={resume.parseStatus === 'completed' ? 'success' : 'warning'}>
                        {resume.parseStatus}
                      </Badge>
                      {resume.versionCount !== undefined && resume.versionCount > 0 && (
                        <span className="text-sm text-gray-500">
                          {resume.versionCount} version{resume.versionCount !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {resumes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer">
            <Link href={`/resumes/${resumes[0]?.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Customize for a Job</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Tailor your resume for a specific job posting with AI
                    </p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className={`hover:border-blue-300 transition-colors ${isPro ? 'cursor-pointer' : 'opacity-60'}`}>
            {isPro ? (
              <Link href="/cover-letters">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Briefcase className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">Generate Cover Letter</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Create a tailored cover letter for your application
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Link>
            ) : (
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      Generate Cover Letter
                      <Crown className="h-4 w-4 ml-2 text-yellow-500" />
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Upgrade to Pro to unlock cover letter generation
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {/* Legal Disclaimer */}
      <div className="text-center text-xs text-gray-500 mt-8 pt-8 border-t border-gray-200">
        <p>
          This platform does not fabricate experience or guarantee hiring outcomes.
          AI-generated content is based solely on user-provided information.
        </p>
      </div>
    </div>
  );
}
