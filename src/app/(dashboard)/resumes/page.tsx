'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ResumeUploader from '@/components/resume/ResumeUploader';
import {
  FileText,
  Plus,
  Trash2,
  Upload,
  ChevronRight,
  Search,
  Filter,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import api from '@/lib/api';
import { Resume } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const response = await api.getResumes();
      if (response.success && response.data) {
        setResumes(response.data);
      }
    } catch (error) {
      toast.error('Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (resume: Resume) => {
    setResumes((prev) => [resume, ...prev]);
    setShowUploader(false);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await api.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success('Resume deleted');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const filteredResumes = resumes.filter(
    (resume) =>
      resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Resumes</h1>
            <p className="text-slate-500 mt-1">
              Manage and customize your resumes for different job applications
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/resume-builder">
              <Button
                variant="gradient"
                size="lg"
                leftIcon={<Plus className="h-5 w-5" />}
              >
                Create New
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              leftIcon={<Upload className="h-5 w-5" />}
              onClick={() => setShowUploader(!showUploader)}
            >
              Upload
            </Button>
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

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
                    <div className="h-8 bg-slate-200 rounded w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredResumes.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {searchQuery ? 'No resumes found' : 'No resumes yet'}
                </h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Create a resume from scratch or upload an existing one to get started'}
                </p>
                {!searchQuery && (
                  <div className="flex gap-3 justify-center">
                    <Link href="/resume-builder">
                      <Button
                        variant="gradient"
                        size="lg"
                        leftIcon={<Plus className="h-5 w-5" />}
                      >
                        Create New Resume
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="lg"
                      leftIcon={<Upload className="h-5 w-5" />}
                      onClick={() => setShowUploader(true)}
                    >
                      Upload Resume
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredResumes.map((resume, index) => (
              <Link key={resume.id} href={`/resumes/${resume.id}`}>
                <Card
                  variant="elevated"
                  hover
                  className="h-full group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="py-6">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center group-hover:from-indigo-100 group-hover:to-indigo-50 transition-colors">
                          <FileText className="h-7 w-7 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <button
                          onClick={(e) => handleDelete(resume.id, e)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1 line-clamp-1">
                        {resume.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-4 line-clamp-1">{resume.fileName}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <Badge variant={resume.parseStatus === 'completed' ? 'success' : 'warning'}>
                          {resume.parseStatus}
                        </Badge>
                        <span className="text-xs text-slate-400">{formatDate(resume.createdAt)}</span>
                      </div>
                      {resume.versionCount !== undefined && resume.versionCount > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-slate-600">
                            {resume.versionCount} tailored version{resume.versionCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResumes.map((resume, index) => (
              <Link key={resume.id} href={`/resumes/${resume.id}`}>
                <Card
                  variant="elevated"
                  className="group hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center group-hover:from-indigo-100 group-hover:to-indigo-50 transition-colors">
                          <FileText className="h-7 w-7 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {resume.title}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {resume.fileName} • {formatDate(resume.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <Badge
                            variant={
                              resume.parseStatus === 'completed'
                                ? 'success'
                                : resume.parseStatus === 'failed'
                                ? 'error'
                                : 'warning'
                            }
                          >
                            {resume.parseStatus}
                          </Badge>
                          {resume.versionCount !== undefined && resume.versionCount > 0 && (
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1 justify-end">
                              <Sparkles className="h-3 w-3 text-purple-500" />
                              {resume.versionCount} version{resume.versionCount !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleDelete(resume.id, e)}
                          className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {filteredResumes.length > 0 && (
          <div className="flex items-center justify-center gap-8 py-6 border-t border-slate-200/60">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{filteredResumes.length}</p>
              <p className="text-sm text-slate-500">Total Resumes</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">
                {filteredResumes.reduce((acc, r) => acc + (r.versionCount || 0), 0)}
              </p>
              <p className="text-sm text-slate-500">Tailored Versions</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {filteredResumes.filter((r) => r.parseStatus === 'completed').length}
              </p>
              <p className="text-sm text-slate-500">Ready to Customize</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
