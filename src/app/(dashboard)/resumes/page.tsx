'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ResumeUploader from '@/components/resume/ResumeUploader';
import SegmentedControl from '@/components/ui/SegmentedControl';
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
  SortAsc,
  Clock,
  ArrowDownAZ,
} from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import api from '@/lib/api';
import { Resume } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useFetchData } from '@/hooks/useFetchData';

export default function ResumesPage() {
  // Use the new useFetchData hook - replaces 15 lines of boilerplate!
  const { data: resumes, isLoading, setData: setResumes, refetch } = useFetchData<Resume[]>({
    fetchFn: () => api.getResumes(),
    errorMessage: 'Failed to load resumes',
  });

  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  const handleUploadComplete = (resume: Resume) => {
    setResumes((prev) => [resume, ...(prev || [])]);
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
      setResumes((prev) => (prev || []).filter((r) => r.id !== id));
      toast.success('Resume deleted');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const filteredResumes = (resumes || [])
    .filter(
      (resume) =>
        (resume.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (resume.fileName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return (a.title || '').localeCompare(b.title || '');
    });

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PageHeader
          icon={<FileText className="h-5 w-5" />}
          label="Document Management"
          title="My Resumes"
          description="Manage and customize your resumes for different job applications. Upload, edit, and create tailored versions for each opportunity."
          actions={
            <div className="flex flex-wrap gap-3">
              <Link href="/resume-builder">
                <Button variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />}>
                  Create New
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={() => setShowUploader(true)}
              >
                Upload Resume
              </Button>
            </div>
          }
        />

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-[var(--text-muted)]"
            />
          </div>
          <div className="flex items-center gap-3">
            <SegmentedControl
              options={[
                { value: 'newest', label: 'Newest', icon: <Clock className="h-4 w-4" /> },
                { value: 'oldest', label: 'Oldest', icon: <Clock className="h-4 w-4" /> },
                { value: 'name', label: 'Name', icon: <ArrowDownAZ className="h-4 w-4" /> },
              ]}
              value={sortBy}
              onChange={setSortBy}
            />
            <SegmentedControl
              options={[
                { value: 'list', label: '', icon: <List className="h-4 w-4" /> },
                { value: 'grid', label: '', icon: <LayoutGrid className="h-4 w-4" /> },
              ]}
              value={viewMode}
              onChange={setViewMode}
            />
          </div>
        </div>

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

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="elevated">
                <CardContent className="py-6">
                  <div className="animate-pulse flex flex-col space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-[var(--border)] rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[var(--border)] rounded w-3/4" />
                        <div className="h-3 bg-[var(--border)] rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-8 bg-[var(--border)] rounded w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredResumes.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="py-16">
              <div className="text-center">
                <div className="w-20 h-20 bg-[var(--accent-subtle)] rounded-xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-[var(--accent-text)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text)] mb-2">
                  {searchQuery ? 'No resumes found' : 'No resumes yet'}
                </h3>
                <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Create a resume from scratch or upload an existing one to get started'}
                </p>
                {!searchQuery && (
                  <div className="flex gap-3 justify-center">
                    <Link href="/resume-builder">
                      <Button
                        variant="primary"
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
                        <div className="w-14 h-14 bg-[var(--surface-raised)] rounded-xl flex items-center justify-center group-hover:bg-[var(--accent-subtle)] transition-colors">
                          <FileText className="h-7 w-7 text-[var(--text-muted)] group-hover:text-blue-600 transition-colors" />
                        </div>
                        <button
                          onClick={(e) => handleDelete(resume.id, e)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      <h3 className="font-semibold text-[var(--text)] group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                        {resume.title}
                      </h3>
                      <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-1">{resume.fileName}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <Badge variant={resume.parseStatus === 'completed' ? 'success' : 'warning'}>
                          {resume.parseStatus}
                        </Badge>
                        <span className="text-xs text-[var(--text-muted)]">{formatDate(resume.createdAt)}</span>
                      </div>
                      {resume.versionCount !== undefined && resume.versionCount > 0 && (
                        <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-[var(--text-secondary)]">
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
                  className="group hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-[var(--surface-raised)] rounded-xl flex items-center justify-center group-hover:bg-[var(--accent-subtle)] transition-colors">
                          <FileText className="h-7 w-7 text-[var(--text-muted)] group-hover:text-blue-600 transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--text)] group-hover:text-blue-600 transition-colors">
                            {resume.title}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)]">
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
                            <p className="text-sm text-[var(--text-secondary)] mt-1 flex items-center gap-1 justify-end">
                              <Sparkles className="h-3 w-3 text-purple-500" />
                              {resume.versionCount} version{resume.versionCount !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => handleDelete(resume.id, e)}
                          className="p-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        <ChevronRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
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
          <div className="flex items-center justify-center gap-8 py-6 border-t border-[var(--border)]">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text)]">{filteredResumes.length}</p>
              <p className="text-sm text-[var(--text-secondary)]">Total Resumes</p>
            </div>
            <div className="w-px h-10 bg-[var(--border)]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--text)]">
                {filteredResumes.reduce((acc, r) => acc + (r.versionCount || 0), 0)}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">Tailored Versions</p>
            </div>
            <div className="w-px h-10 bg-[var(--border)]" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {filteredResumes.filter((r) => r.parseStatus === 'completed').length}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">Ready to Customize</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
