'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import SegmentedControl from '@/components/ui/SegmentedControl';
import Link from 'next/link';
import {
  Users,
  Loader2,
  Copy,
  ChevronRight,
  FileText,
  MessageCircle,
} from 'lucide-react';
import api, {
  NetworkingMessageResult,
  NetworkingPlatform,
  NetworkingPurpose,
} from '@/lib/api';
import toast from 'react-hot-toast';

interface NetworkingMessageTabProps {
  resumes: any[];
  isLoadingResumes: boolean;
}

export default function NetworkingMessageTab({ resumes, isLoadingResumes }: NetworkingMessageTabProps) {
  const [platform, setPlatform] = useState<NetworkingPlatform>('linkedin');
  const [purpose, setPurpose] = useState<NetworkingPurpose>('informational_interview');
  const [formData, setFormData] = useState({
    senderName: '',
    senderBackground: '',
    recipientName: '',
    recipientTitle: '',
    recipientCompany: '',
    targetRole: '',
    commonGround: '',
    specificAsk: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NetworkingMessageResult | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const platforms: { value: NetworkingPlatform; label: string }[] = [
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'email', label: 'Email' },
    { value: 'twitter', label: 'Twitter/X' },
  ];

  const purposes: { value: NetworkingPurpose; label: string }[] = [
    { value: 'informational_interview', label: 'Informational Interview' },
    { value: 'job_inquiry', label: 'Job Inquiry' },
    { value: 'referral_request', label: 'Referral Request' },
    { value: 'reconnection', label: 'Reconnection' },
    { value: 'cold_outreach', label: 'Cold Outreach' },
  ];

  const handleSelectResume = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    const resume = resumes.find((r) => r.id === resumeId);
    if (resume?.parsedData) {
      const pd = resume.parsedData;
      const name = pd.contact?.name || '';
      const summary = pd.summary || '';
      const topRole = pd.experience?.[0];
      const roleDesc = topRole ? `${topRole.title || topRole.position} at ${topRole.company}` : '';
      const background = summary || roleDesc || '';
      if (name && !formData.senderName) setFormData((prev) => ({ ...prev, senderName: name }));
      if (background && !formData.senderBackground) setFormData((prev) => ({ ...prev, senderBackground: background.slice(0, 200) }));
      toast.success('Resume loaded — name and background pre-filled');
    }
  };

  const handleGenerate = async () => {
    if (!formData.senderName || !formData.senderBackground || !formData.recipientName || !formData.recipientTitle || !formData.recipientCompany) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.generateNetworkingMessage({
        platform,
        purpose,
        senderName: formData.senderName,
        senderBackground: formData.senderBackground,
        recipientName: formData.recipientName,
        recipientTitle: formData.recipientTitle,
        recipientCompany: formData.recipientCompany,
        targetRole: formData.targetRole || undefined,
        commonGround: formData.commonGround ? formData.commonGround.split(',').map((g) => g.trim()) : undefined,
        specificAsk: formData.specificAsk || undefined,
        resumeId: selectedResumeId || undefined,
      });
      if (response.success && response.data) {
        setResult(response.data);
        toast.success('Message generated!');
      }
    } catch (error) {
      toast.error('Failed to generate message');
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = () => {
    if (result) {
      navigator.clipboard.writeText(result.message);
      toast.success('Message copied!');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input */}
      <div className="space-y-4">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Message Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Platform</label>
              <div className="flex gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={`flex-1 py-2 px-4 rounded-xl border font-medium transition-all ${
                      platform === p.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-900 hover:border-blue-200 hover:text-blue-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Purpose</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value as NetworkingPurpose)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
              >
                {purposes.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">Your Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resume selector — auto-fills name + background */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5"><FileText className="h-4 w-4 text-blue-500" />Load from Resume (auto-fills your info)</span>
              </label>
              {isLoadingResumes ? (
                <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl text-slate-500 text-sm"><Loader2 className="h-4 w-4 animate-spin" />Loading...</div>
              ) : resumes.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No resumes uploaded yet.</p>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => handleSelectResume(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
                >
                  <option value="">— Select a resume to auto-fill —</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title || r.originalFileName}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Name *</label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Background *</label>
              <textarea
                value={formData.senderBackground}
                onChange={(e) => setFormData({ ...formData, senderBackground: e.target.value })}
                placeholder="e.g., Software engineer with 5 years experience in fintech"
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Role</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="e.g., Senior Product Manager"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="text-base">Recipient Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
                <input
                  type="text"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={formData.recipientTitle}
                  onChange={(e) => setFormData({ ...formData, recipientTitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company *</label>
              <input
                type="text"
                value={formData.recipientCompany}
                onChange={(e) => setFormData({ ...formData, recipientCompany: e.target.value })}
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Common Ground</label>
              <input
                type="text"
                value={formData.commonGround}
                onChange={(e) => setFormData({ ...formData, commonGround: e.target.value })}
                placeholder="Same university, mutual connection, etc. (comma-separated)"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Specific Ask</label>
              <input
                type="text"
                value={formData.specificAsk}
                onChange={(e) => setFormData({ ...formData, specificAsk: e.target.value })}
                placeholder="e.g., 15-min call, referral to hiring manager"
                className="w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Generate Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Result */}
      <div className="space-y-4">
        {!result ? (
          <Card variant="elevated">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Open Doors with Cold Outreach</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Generate personalized networking messages that get responses.
                Perfect for LinkedIn, email, and Twitter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-700">{result.platform}</Badge>
                    Message
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={copyMessage}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-slate-700 whitespace-pre-wrap">{result.message}</p>
                </div>
                <p className="text-sm text-slate-500 mt-3">
                  <span className="font-medium">Strategy:</span> {result.approach}
                </p>
              </CardContent>
            </Card>

            {result.followUpMessage && (
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle className="text-base">Follow-up Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-slate-700 whitespace-pre-wrap">{result.followUpMessage}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card variant="elevated" className="bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <h4 className="font-medium text-blue-800 mb-2">Outreach Tips</h4>
                <ul className="space-y-1">
                  {result.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-blue-700">
                      <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="py-4">
                <h4 className="font-medium text-slate-900 mb-2">Personalization Points</h4>
                <div className="flex flex-wrap gap-2">
                  {result.personalizationPoints.map((point, idx) => (
                    <Badge key={idx} className="bg-amber-50 text-amber-700">
                      {point}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}