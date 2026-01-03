'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import ATSScoreCircle from '@/components/resume/ATSScoreCircle';
import { useAuthStore } from '@/store/auth';
import {
  FileText,
  ArrowLeft,
  Download,
  Plus,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
} from 'lucide-react';
import api from '@/lib/api';
import { Resume, ResumeVersion } from '@/types';
import { formatDate, downloadBlob, getScoreColor } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ResumeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const resumeId = params.id as string;

  const [resume, setResume] = useState<Resume | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showCustomizeForm, setShowCustomizeForm] = useState(false);

  // Customize form state
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const isPro = user?.planType === 'PRO' || user?.planType === 'BUSINESS';

  useEffect(() => {
    loadResume();
  }, [resumeId]);

  const loadResume = async () => {
    try {
      const response = await api.getResume(resumeId);
      if (response.success && response.data) {
        setResume(response.data);
      }
    } catch (error) {
      toast.error('Failed to load resume');
      router.push('/resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomize = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobTitle || !companyName || !jobDescription) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsCustomizing(true);

    try {
      const response = await api.customizeResume(resumeId, {
        jobTitle,
        companyName,
        jobDescription,
      });

      if (response.success && response.data) {
        toast.success('Resume customized successfully!');
        setShowCustomizeForm(false);
        setJobTitle('');
        setCompanyName('');
        setJobDescription('');
        loadResume();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to customize resume');
    } finally {
      setIsCustomizing(false);
    }
  };

  const handleDownload = async (versionId: string, format: 'pdf' | 'docx') => {
    try {
      const blob = await api.downloadVersion(resumeId, versionId, format);
      const version = resume?.versions?.find((v) => v.id === versionId);
      const filename = `resume-${version?.companyName || 'tailored'}.${format}`;
      downloadBlob(blob, filename);
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!resume) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/resumes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">{resume.title}</h1>
            <p className="text-gray-500">{resume.fileName}</p>
          </div>
        </div>
        <Badge variant={resume.parseStatus === 'completed' ? 'success' : 'warning'}>
          {resume.parseStatus}
        </Badge>
      </div>

      {/* Customize Form */}
      {resume.parseStatus === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Customize for a Job</span>
              <Button
                variant={showCustomizeForm ? 'secondary' : 'primary'}
                onClick={() => setShowCustomizeForm(!showCustomizeForm)}
              >
                {showCustomizeForm ? (
                  'Cancel'
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Version
                  </>
                )}
              </Button>
            </CardTitle>
            {!showCustomizeForm && (
              <CardDescription>
                Create a tailored version of your resume for a specific job posting
              </CardDescription>
            )}
          </CardHeader>

          {showCustomizeForm && (
            <CardContent>
              <form onSubmit={handleCustomize} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Job Title"
                    placeholder="e.g., Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    required
                  />
                  <Input
                    label="Company Name"
                    placeholder="e.g., Google"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={8}
                    placeholder="Paste the full job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCustomizeForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isCustomizing}>
                    <Target className="h-4 w-4 mr-2" />
                    Customize Resume
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      )}

      {/* Versions List */}
      {resume.versions && resume.versions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tailored Versions</CardTitle>
            <CardDescription>
              {resume.versions.length} version{resume.versions.length !== 1 ? 's' : ''} created
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resume.versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center">
                    <ATSScoreCircle score={version.atsScore} size="sm" showLabel={false} />
                    <div className="ml-4">
                      <h4 className="font-medium text-gray-900">
                        {version.jobTitle} at {version.companyName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Version {version.versionNumber} • Created {formatDate(version.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${getScoreColor(version.atsScore)}`}>
                      ATS: {version.atsScore}%
                    </span>
                    <Link href={`/resumes/${resumeId}/versions/${version.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(version.id, 'pdf')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Original Resume Data */}
      {resume.parsedData && (
        <Card>
          <CardHeader>
            <CardTitle>Parsed Resume Data</CardTitle>
            <CardDescription>
              Data extracted from your original resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Contact */}
              {resume.parsedData.contact && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    {resume.parsedData.contact.name && <p>Name: {resume.parsedData.contact.name}</p>}
                    {resume.parsedData.contact.email && <p>Email: {resume.parsedData.contact.email}</p>}
                    {resume.parsedData.contact.phone && <p>Phone: {resume.parsedData.contact.phone}</p>}
                    {resume.parsedData.contact.location && <p>Location: {resume.parsedData.contact.location}</p>}
                  </div>
                </div>
              )}

              {/* Summary */}
              {resume.parsedData.summary && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-sm text-gray-600">{resume.parsedData.summary}</p>
                </div>
              )}

              {/* Skills */}
              {resume.parsedData.skills && resume.parsedData.skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {resume.parsedData.skills.map((skill, i) => (
                      <Badge key={i} variant="info">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {resume.parsedData.experience && resume.parsedData.experience.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                  <div className="space-y-4">
                    {resume.parsedData.experience.map((exp, i) => (
                      <div key={i} className="border-l-2 border-blue-200 pl-4">
                        <h5 className="font-medium text-gray-900">{exp.title}</h5>
                        <p className="text-sm text-gray-600">
                          {exp.company}
                          {exp.startDate && ` • ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`}
                        </p>
                        {exp.description && exp.description.length > 0 && (
                          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                            {exp.description.slice(0, 3).map((desc, j) => (
                              <li key={j}>{desc}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {resume.parsedData.education && resume.parsedData.education.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Education</h4>
                  <div className="space-y-2">
                    {resume.parsedData.education.map((edu, i) => (
                      <div key={i}>
                        <p className="font-medium text-gray-800">{edu.degree}</p>
                        <p className="text-sm text-gray-600">
                          {edu.institution}
                          {edu.graduationDate && ` • ${edu.graduationDate}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ATS Simulator CTA */}
      {!isPro && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Crown className="h-8 w-8 text-yellow-500 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Unlock ATS Simulator</h3>
                  <p className="text-sm text-gray-600">
                    See exactly how ATS systems read your resume. Upgrade to Pro.
                  </p>
                </div>
              </div>
              <Link href="/subscription">
                <Button>Upgrade Now</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
