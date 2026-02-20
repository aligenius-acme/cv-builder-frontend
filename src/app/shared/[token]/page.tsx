'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText,
  Download,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Target,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import ScoreCircle from '@/components/ui/ScoreCircle';
import api from '@/lib/api';
import { downloadBlob } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SharedResumeData {
  jobTitle: string;
  companyName: string;
  atsScore: number;
  candidateName: string;
  resume: {
    contact: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      github?: string;
    };
    summary: string;
    experience: Array<{
      title: string;
      company: string;
      location?: string;
      startDate: string;
      endDate?: string;
      current?: boolean;
      description: string[];
    }>;
    education: Array<{
      degree: string;
      institution: string;
      graduationDate?: string;
      gpa?: string;
    }>;
    skills: string[];
    certifications?: string[];
    projects?: Array<{
      name: string;
      description?: string;
      technologies?: string[];
    }>;
  };
}

export default function SharedResumePage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<SharedResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadSharedResume();
  }, [token]);

  const loadSharedResume = async () => {
    try {
      const response = await api.getSharedResume(token);
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'This resume is no longer available');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    setIsDownloading(true);
    try {
      const blob = await api.downloadSharedResume(token, format);
      const filename = `resume-${data?.companyName || 'shared'}.${format}`;
      downloadBlob(blob, filename);
      toast.success('Download started');
    } catch (err) {
      toast.error('Failed to download resume');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-slate-500">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Resume Not Found</h2>
            <p className="text-slate-500">{error || 'This resume is no longer available or the link has expired.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { resume } = data;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">{data.candidateName}</h1>
              <p className="text-sm text-slate-500">{data.jobTitle} at {data.companyName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ScoreCircle score={data.atsScore} size="sm" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload('docx')}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-1" />
              DOCX
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleDownload('pdf')}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Resume Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 space-y-8">
            {/* Contact Header */}
            <div className="text-center border-b pb-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {resume.contact.name || data.candidateName}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
                {resume.contact.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {resume.contact.email}
                  </span>
                )}
                {resume.contact.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {resume.contact.phone}
                  </span>
                )}
                {resume.contact.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {resume.contact.location}
                  </span>
                )}
              </div>
            </div>

            {/* Summary */}
            {resume.summary && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Professional Summary
                </h3>
                <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
              </div>
            )}

            {/* Experience */}
            {resume.experience && resume.experience.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Experience
                </h3>
                <div className="space-y-6">
                  {resume.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                      <h4 className="font-semibold text-slate-900">{exp.title}</h4>
                      <p className="text-blue-600 text-sm">{exp.company}{exp.location ? ` | ${exp.location}` : ''}</p>
                      <p className="text-slate-500 text-sm mb-2">
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </p>
                      {exp.description && exp.description.length > 0 && (
                        <ul className="list-disc list-inside text-slate-700 space-y-1">
                          {exp.description.map((desc, i) => (
                            <li key={i}>{desc}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resume.education && resume.education.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Education
                </h3>
                <div className="space-y-4">
                  {resume.education.map((edu, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                      <p className="text-blue-600 text-sm">{edu.institution}</p>
                      {edu.graduationDate && (
                        <p className="text-slate-500 text-sm">{edu.graduationDate}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {resume.skills && resume.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, index) => (
                    <Badge key={index} variant="default" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {resume.certifications && resume.certifications.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Certifications
                </h3>
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  {resume.certifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Projects */}
            {resume.projects && resume.projects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  Projects
                </h3>
                <div className="space-y-4">
                  {resume.projects.map((proj, index) => (
                    <div key={index}>
                      <h4 className="font-semibold text-slate-900">{proj.name}</h4>
                      {proj.description && (
                        <p className="text-slate-700 text-sm">{proj.description}</p>
                      )}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {proj.technologies.map((tech, i) => (
                            <Badge key={i} variant="info" size="sm">{tech}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-slate-500">
          <p>Resume tailored for {data.jobTitle} position at {data.companyName}</p>
          <p className="mt-1">ATS Compatibility Score: {data.atsScore}%</p>
        </div>
      </div>
    </div>
  );
}
