'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ResumeUploader from '@/components/resume/ResumeUploader';
import { FileText, Plus, Trash2, Edit, MoreVertical } from 'lucide-react';
import api from '@/lib/api';
import { Resume } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
          <p className="text-gray-600 mt-1">
            Manage and customize your resumes for different job applications
          </p>
        </div>
        <Button onClick={() => setShowUploader(!showUploader)}>
          <Plus className="h-4 w-4 mr-2" />
          Upload Resume
        </Button>
      </div>

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

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        </div>
      ) : resumes.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
              <p className="text-gray-500 mb-4">
                Upload your first resume to start customizing it for job applications
              </p>
              <Button onClick={() => setShowUploader(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <Link key={resume.id} href={`/resumes/${resume.id}`}>
              <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium text-gray-900">{resume.title}</h3>
                        <p className="text-sm text-gray-500">
                          {resume.fileName} • Uploaded {formatDate(resume.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
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
                          <p className="text-sm text-gray-500 mt-1">
                            {resume.versionCount} version{resume.versionCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleDelete(resume.id, e)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
