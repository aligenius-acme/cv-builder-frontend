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
  Sparkles,
  Briefcase,
  Building,
  ChevronRight,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  GitCompare,
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
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          <p className="text-slate-500">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (!resume) {
    return null;
  }

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/resumes">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{resume.title}</h1>
              <p className="text-slate-500">{resume.fileName}</p>
            </div>
          </div>
          <Badge variant={resume.parseStatus === 'completed' ? 'success' : 'warning'} size="lg">
            {resume.parseStatus}
          </Badge>
        </div>

        {/* Customize Form */}
        {resume.parseStatus === 'completed' && (
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Customize for a Job</CardTitle>
                    {!showCustomizeForm && (
                      <CardDescription>
                        Create a tailored version of your resume for a specific job posting
                      </CardDescription>
                    )}
                  </div>
                </div>
                <Button
                  variant={showCustomizeForm ? 'outline' : 'gradient'}
                  onClick={() => setShowCustomizeForm(!showCustomizeForm)}
                  leftIcon={showCustomizeForm ? undefined : <Plus className="h-4 w-4" />}
                >
                  {showCustomizeForm ? 'Cancel' : 'Create New Version'}
                </Button>
              </div>
            </CardHeader>

            {showCustomizeForm && (
              <CardContent>
                <form onSubmit={handleCustomize} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Job Title
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g., Senior Software Engineer"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          required
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
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
                          placeholder="e.g., Google"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Job Description
                    </label>
                    <textarea
                      rows={8}
                      placeholder="Paste the full job description here..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCustomizeForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      isLoading={isCustomizing}
                      leftIcon={<Sparkles className="h-4 w-4" />}
                    >
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
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Tailored Versions
                  </CardTitle>
                  <CardDescription>
                    {resume.versions.length} version{resume.versions.length !== 1 ? 's' : ''} created
                  </CardDescription>
                </div>
                {resume.versions.length >= 2 && (
                  <Link href={`/resumes/${resumeId}/compare`}>
                    <Button variant="outline" size="sm" leftIcon={<GitCompare className="h-4 w-4" />}>
                      Compare
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resume.versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <ATSScoreCircle score={version.atsScore} size="sm" showLabel={false} />
                      <div>
                        <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {version.jobTitle} at {version.companyName}
                        </h4>
                        <p className="text-sm text-slate-500">
                          Version {version.versionNumber} • Created {formatDate(version.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={version.atsScore >= 80 ? 'success' : version.atsScore >= 60 ? 'warning' : 'error'}>
                        ATS: {version.atsScore}%
                      </Badge>
                      <Link href={`/resumes/${resumeId}/versions/${version.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(version.id, 'pdf')}
                        leftIcon={<Download className="h-4 w-4" />}
                      >
                        PDF
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
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Parsed Resume Data
              </CardTitle>
              <CardDescription>
                Data extracted from your original resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Contact */}
                {resume.parsedData.contact && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <User className="h-4 w-4 text-slate-400" />
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {resume.parsedData.contact.name && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="h-4 w-4 text-slate-400" />
                          {resume.parsedData.contact.name}
                        </div>
                      )}
                      {resume.parsedData.contact.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-4 w-4 text-slate-400" />
                          {resume.parsedData.contact.email}
                        </div>
                      )}
                      {resume.parsedData.contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="h-4 w-4 text-slate-400" />
                          {resume.parsedData.contact.phone}
                        </div>
                      )}
                      {resume.parsedData.contact.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          {resume.parsedData.contact.location}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {resume.parsedData.summary && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Summary</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl">
                      {resume.parsedData.summary}
                    </p>
                  </div>
                )}

                {/* Skills */}
                {resume.parsedData.skills && resume.parsedData.skills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Skills</h4>
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
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      Experience
                    </h4>
                    <div className="space-y-4">
                      {resume.parsedData.experience.map((exp, i) => (
                        <div key={i} className="border-l-2 border-indigo-200 pl-4">
                          <h5 className="font-medium text-slate-900">{exp.title}</h5>
                          <p className="text-sm text-indigo-600 font-medium">
                            {exp.company}
                            {exp.startDate && (
                              <span className="text-slate-500 font-normal">
                                {' '}• {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </span>
                            )}
                          </p>
                          {exp.description && exp.description.length > 0 && (
                            <ul className="mt-2 text-sm text-slate-600 space-y-1">
                              {exp.description.slice(0, 3).map((desc, j) => (
                                <li key={j} className="flex items-start gap-2">
                                  <span className="text-indigo-400 mt-1.5">•</span>
                                  {desc}
                                </li>
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
                    <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-slate-400" />
                      Education
                    </h4>
                    <div className="space-y-3">
                      {resume.parsedData.education.map((edu, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-xl">
                          <p className="font-medium text-slate-900">{edu.degree}</p>
                          <p className="text-sm text-slate-600">
                            {edu.institution}
                            {edu.graduationDate && (
                              <span className="text-slate-400"> • {edu.graduationDate}</span>
                            )}
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
          <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z' fill='rgba(255,255,255,0.07)'%3E%3C/path%3E%3C/svg%3E\")"}} />
            <CardContent className="py-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Crown className="h-6 w-6 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Unlock ATS Simulator</h3>
                    <p className="text-white/80 text-sm">
                      See exactly how ATS systems read your resume. Upgrade to Pro.
                    </p>
                  </div>
                </div>
                <Link href="/subscription">
                  <Button variant="secondary" size="lg">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
