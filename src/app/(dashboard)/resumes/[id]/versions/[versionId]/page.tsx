'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ATSScoreCircle from '@/components/resume/ATSScoreCircle';
import DownloadModal from '@/components/resume/DownloadModal';
import {
  ArrowLeft,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import api from '@/lib/api';
import { ResumeVersion } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function VersionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;
  const versionId = params.versionId as string;

  const [version, setVersion] = useState<ResumeVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    loadVersion();
  }, [resumeId, versionId]);

  const loadVersion = async () => {
    try {
      const response = await api.getResumeVersion(resumeId, versionId);
      if (response.success && response.data) {
        setVersion(response.data);
      }
    } catch (error) {
      toast.error('Failed to load version');
      router.push(`/resumes/${resumeId}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!version) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        resumeId={resumeId}
        versionId={versionId}
        versionNumber={version.versionNumber}
        companyName={version.companyName}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/resumes/${resumeId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resume
            </Button>
          </Link>
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {version.jobTitle} at {version.companyName}
            </h1>
            <p className="text-gray-500">
              Version {version.versionNumber} • Created {formatDate(version.createdAt)}
            </p>
          </div>
        </div>
        <Button onClick={() => setShowDownloadModal(true)}>
          <Download className="h-4 w-4 mr-2" />
          Download Resume
        </Button>
      </div>

      {/* ATS Score Card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <ATSScoreCircle score={version.atsScore} size="lg" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">ATS Compatibility Score</h2>
                <p className="text-gray-600">
                  {version.atsScore >= 80
                    ? 'Excellent! Your resume is well-optimized for ATS.'
                    : version.atsScore >= 60
                    ? 'Good. Some improvements could increase your chances.'
                    : 'Needs work. Consider adding more relevant keywords.'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keywords Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matched Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-700">
              <CheckCircle className="h-5 w-5 mr-2" />
              Matched Keywords
            </CardTitle>
            <CardDescription>
              Keywords from the job description found in your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {version.matchedKeywords && version.matchedKeywords.length > 0 ? (
                version.matchedKeywords.map((keyword, i) => (
                  <Badge key={i} variant="success">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No matched keywords found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Missing Keywords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <XCircle className="h-5 w-5 mr-2" />
              Missing Keywords
            </CardTitle>
            <CardDescription>
              Important keywords from the job description not in your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {version.missingKeywords && version.missingKeywords.length > 0 ? (
                version.missingKeywords.map((keyword, i) => (
                  <Badge key={i} variant="error">
                    {keyword}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Great! No critical keywords missing</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Changes Explanation */}
      {version.changesExplanation && (
        <Card>
          <CardHeader>
            <CardTitle>Changes Made</CardTitle>
            <CardDescription>
              Summary of how your resume was tailored for this position
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{version.changesExplanation}</p>
          </CardContent>
        </Card>
      )}

      {/* TruthGuard Warnings */}
      {version.truthGuardWarnings && version.truthGuardWarnings.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              TruthGuard Warnings
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Review these items to ensure accuracy in your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {version.truthGuardWarnings.map((warning, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    warning.severity === 'high'
                      ? 'bg-red-50 border-red-200'
                      : warning.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge
                        variant={
                          warning.severity === 'high'
                            ? 'error'
                            : warning.severity === 'medium'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {warning.type.replace('_', ' ')}
                      </Badge>
                      <p className="mt-2 text-sm text-gray-700">{warning.concern}</p>
                      {warning.original && (
                        <p className="mt-1 text-xs text-gray-500">
                          Original: &quot;{warning.original}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tailored Resume Content */}
      {version.tailoredData && (
        <Card>
          <CardHeader>
            <CardTitle>Tailored Resume Content</CardTitle>
            <CardDescription>
              The tailored version of your resume for this job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary */}
              {version.tailoredData.summary && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                    {version.tailoredData.summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {version.tailoredData.skills && version.tailoredData.skills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {version.tailoredData.skills.map((skill, i) => (
                      <Badge key={i} variant="info">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {version.tailoredData.experience && version.tailoredData.experience.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Experience</h4>
                  <div className="space-y-4">
                    {version.tailoredData.experience.map((exp, i) => (
                      <div key={i} className="border-l-2 border-blue-200 pl-4">
                        <h5 className="font-medium text-gray-900">{exp.title}</h5>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        {exp.description && exp.description.length > 0 && (
                          <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
                            {exp.description.map((desc, j) => (
                              <li key={j}>{desc}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
