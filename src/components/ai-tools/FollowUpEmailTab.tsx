'use client';

import { useState } from 'react';
import { useModal } from '@/hooks/useModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SegmentedControl from '@/components/ui/SegmentedControl';
import OutOfCreditsInline from '@/components/shared/OutOfCreditsInline';
import { useOutOfCredits } from '@/hooks';
import Link from 'next/link';
import {
  Mail,
  Loader2,
  Copy,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Upload,
  FileText,
  Heart,
  Search,
  Building,
  MapPin,
  DollarSign,
  Edit3,
  Briefcase,
  Send,
  Users,
} from 'lucide-react';
import api, {
  JobApplication,
  FollowUpEmailResult,
  FollowUpType,
} from '@/lib/api';
import toast from 'react-hot-toast';

interface FollowUpEmailTabProps {
  resumes: any[];
  savedJobs: JobApplication[];
  isLoadingResumes: boolean;
  isLoadingSavedJobs: boolean;
}

export default function FollowUpEmailTab({ resumes, savedJobs, isLoadingResumes, isLoadingSavedJobs }: FollowUpEmailTabProps) {
  const [emailType, setEmailType] = useState<FollowUpType>('thank_you');
  const [formData, setFormData] = useState({
    candidateName: '',
    companyName: '',
    jobTitle: '',
    recipientName: '',
    recipientTitle: '',
    interviewDate: '',
    interviewDetails: '',
    keyPoints: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { outOfCredits, check402 } = useOutOfCredits();
  const [result, setResult] = useState<FollowUpEmailResult | null>(null);

  // Resume selection
  const [selectedResumeId, setSelectedResumeId] = useState('');

  // Job source state
  const [jobInputMode, setJobInputMode] = useState<'saved' | 'manual'>('saved');
  const [selectedJobId, setSelectedJobId] = useState('');
  const jobDropdown = useModal();

  const emailTypes: { value: FollowUpType; label: string; description: string }[] = [
    { value: 'thank_you', label: 'Thank You', description: 'Send within 24 hours after interview' },
    { value: 'post_interview', label: 'Post Interview', description: 'Follow up 5-7 days after interview' },
    { value: 'no_response', label: 'No Response', description: 'Gentle nudge after 2+ weeks' },
    { value: 'after_rejection', label: 'After Rejection', description: 'Gracious response to rejection' },
    { value: 'networking', label: 'Networking', description: 'After informational interview' },
  ];

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    const resume = resumes.find((r) => r.id === resumeId);
    if (resume?.parsedData?.contact?.name && !formData.candidateName) {
      setFormData((prev) => ({ ...prev, candidateName: resume.parsedData.contact.name }));
    }
  };

  const handleSelectSavedJob = (jobId: string) => {
    const job = savedJobs.find((j) => j.id === jobId);
    if (job) {
      setSelectedJobId(jobId);
      setFormData((prev) => ({
        ...prev,
        companyName: job.companyName,
        jobTitle: job.jobTitle,
        recipientName: job.contactName || '',
      }));
      jobDropdown.close();
      toast.success('Job details loaded!');
    }
  };

  const handleGenerate = async () => {
    if (!formData.candidateName || !formData.companyName || !formData.jobTitle) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.generateFollowUpEmail({
        type: emailType,
        candidateName: formData.candidateName,
        companyName: formData.companyName,
        jobTitle: formData.jobTitle,
        recipientName: formData.recipientName || undefined,
        recipientTitle: formData.recipientTitle || undefined,
        interviewDate: formData.interviewDate || undefined,
        interviewDetails: formData.interviewDetails || undefined,
        keyPoints: formData.keyPoints ? formData.keyPoints.split(',').map((k) => k.trim()) : undefined,
        resumeId: selectedResumeId || undefined,
      });
      if (response.success && response.data) {
        setResult(response.data);
        toast.success('Email generated!');
      }
    } catch (error: any) {
      if (check402(error)) return;
      toast.error('Failed to generate email');
    } finally {
      setIsLoading(false);
    }
  };

  const copyEmail = () => {
    if (result) {
      navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
      toast.success('Email copied to clipboard!');
    }
  };

  const selectedJob = savedJobs.find((j) => j.id === selectedJobId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="space-y-4">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              Email Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2">
              {emailTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setEmailType(type.value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    emailType === type.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-slate-200 hover:border-purple-200'
                  }`}
                >
                  <div className="font-medium text-slate-900">{type.label}</div>
                  <div className="text-sm text-slate-500">{type.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resume Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-purple-500" />Your Resume (optional — personalizes the email)</span>
              </label>
              {isLoadingResumes ? (
                <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl text-slate-500 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading...</div>
              ) : resumes.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No resumes uploaded yet.</p>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => handleSelectResume(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white text-slate-900"
                >
                  <option value="">— Select a resume (optional) —</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title || r.originalFileName}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Job Source Toggle */}
            <SegmentedControl
              options={[
                { value: 'saved' as const, label: 'From Job Tracker', icon: <Heart className="h-4 w-4" />, count: savedJobs.length },
                { value: 'manual' as const, label: 'Enter Manually', icon: <Edit3 className="h-4 w-4" /> },
              ]}
              value={jobInputMode}
              onChange={(mode) => {
                setJobInputMode(mode);
                if (mode === 'manual') {
                  setSelectedJobId('');
                }
              }}
            />

            {/* Saved Jobs Dropdown */}
            {jobInputMode === 'saved' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Application</label>
                {isLoadingSavedJobs ? (
                  <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl">
                    <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                    <span className="text-slate-500">Loading...</span>
                  </div>
                ) : savedJobs.length === 0 ? (
                  <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
                    <Heart className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-600 font-medium text-sm">No job applications</p>
                    <p className="text-xs text-slate-500 mt-1">Add applications in the Job Tracker</p>
                    <div className="flex justify-center gap-2 mt-3">
                      <Link href="/job-tracker">
                        <Button variant="primary" size="sm" leftIcon={<Search className="h-4 w-4" />}>
                          Job Tracker
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => setJobInputMode('manual')}>
                        Enter Manually
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => jobDropdown.toggle()}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                    >
                      {selectedJob ? (
                        <span className="text-slate-900">{selectedJob.jobTitle} at {selectedJob.companyName}</span>
                      ) : (
                        <span className="text-slate-500">Select a job application...</span>
                      )}
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${jobDropdown.isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {jobDropdown.isOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {savedJobs.map((job) => (
                          <button
                            key={job.id}
                            type="button"
                            onClick={() => handleSelectSavedJob(job.id)}
                            className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-purple-50 transition-colors text-left border-b border-slate-100 last:border-0 ${
                              selectedJobId === job.id ? 'bg-purple-50' : ''
                            }`}
                          >
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate">{job.jobTitle}</p>
                              <p className="text-sm text-slate-500 truncate">{job.companyName}</p>
                              <Badge className="mt-1 text-xs" variant={
                                job.status === 'INTERVIEWING' ? 'info' :
                                job.status === 'APPLIED' ? 'warning' :
                                job.status === 'REJECTED' ? 'error' : 'default'
                              }>
                                {job.status.toLowerCase()}
                              </Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Show form when manual mode or job selected */}
            {(jobInputMode === 'manual' || (jobInputMode === 'saved' && selectedJobId)) && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name *</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.candidateName}
                        onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Recipient Name</label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Company *</label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
                        readOnly={jobInputMode === 'saved' && !!selectedJobId}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full pl-11 pr-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400"
                        readOnly={jobInputMode === 'saved' && !!selectedJobId}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Interview Details</label>
                  <textarea
                    value={formData.interviewDetails}
                    onChange={(e) => setFormData({ ...formData, interviewDetails: e.target.value })}
                    placeholder="Topics discussed, projects mentioned, etc."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                  />
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isLoading || outOfCredits}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Generate Email
                    </>
                  )}
                </Button>
                {outOfCredits && <OutOfCreditsInline />}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Result */}
      <div className="space-y-4">
        {!result ? (
          <Card variant="elevated">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Perfect Follow-up Emails</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Generate professional thank you notes, follow-ups, and responses
                that leave a lasting impression.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Generated Email</CardTitle>
                  <Button variant="outline" size="sm" onClick={copyEmail}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-xl p-4 space-y-4">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Subject</span>
                    <p className="font-medium text-slate-900">{result.subject}</p>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <span className="text-xs text-slate-500 uppercase tracking-wide">Body</span>
                    <div className="mt-2 text-slate-700 whitespace-pre-wrap">{result.body}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="py-4">
                <p className="text-sm text-slate-500 mb-2">
                  <span className="font-medium">Best Time to Send:</span> {result.timing}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.alternativeSubjects.map((subject, idx) => (
                    <Badge key={idx} className="bg-purple-50 text-purple-700 cursor-pointer hover:bg-purple-100">
                      Alt: {subject}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated" className="bg-purple-50 border-purple-200">
              <CardContent className="py-4">
                <h4 className="font-medium text-purple-800 mb-2">Tips</h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-purple-700">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}