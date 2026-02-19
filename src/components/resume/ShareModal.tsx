'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  Eye,
  Download,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  versionId: string;
  jobTitle: string;
  companyName: string;
}

interface ShareStatus {
  isPublic: boolean;
  shareToken: string | null;
  shareUrl: string | null;
  totalViews: number;
  totalDownloads: number;
  viewsLast7Days: number;
  downloadsLast7Days: number;
  recentActivity: Array<{
    id: string;
    eventType: string;
    country?: string;
    city?: string;
    createdAt: string;
  }>;
}

export default function ShareModal({
  isOpen,
  onClose,
  resumeId,
  versionId,
  jobTitle,
  companyName,
}: ShareModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [shareStatus, setShareStatus] = useState<ShareStatus | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShareStatus();
    }
  }, [isOpen, resumeId, versionId]);

  const loadShareStatus = async () => {
    try {
      setIsLoading(true);
      const response = await api.getSharingStatus(resumeId, versionId);
      if (response.success && response.data) {
        setShareStatus(response.data);
      }
    } catch (error) {
      toast.error('Failed to load sharing status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSharing = async () => {
    if (!shareStatus) return;

    try {
      setIsToggling(true);
      const response = await api.toggleSharing(resumeId, versionId, !shareStatus.isPublic);
      if (response.success && response.data) {
        setShareStatus({
          ...shareStatus,
          isPublic: response.data.isPublic,
          shareToken: response.data.shareToken,
          shareUrl: response.data.shareUrl,
          totalViews: response.data.views,
          totalDownloads: response.data.downloads,
        });
        toast.success(response.data.isPublic ? 'Sharing enabled!' : 'Sharing disabled');
      }
    } catch (error) {
      toast.error('Failed to update sharing settings');
    } finally {
      setIsToggling(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareStatus?.shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareStatus.shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Share2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Share Resume</h2>
                <p className="text-sm text-slate-500">{jobTitle} at {companyName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <>
                {/* Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {shareStatus?.isPublic ? (
                      <Globe className="h-5 w-5 text-green-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-slate-400" />
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {shareStatus?.isPublic ? 'Public Link Active' : 'Sharing Disabled'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {shareStatus?.isPublic
                          ? 'Anyone with the link can view this resume'
                          : 'Only you can access this resume'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleSharing}
                    disabled={isToggling}
                    className={cn(
                      'relative w-12 h-7 rounded-full transition-colors',
                      shareStatus?.isPublic ? 'bg-green-500' : 'bg-slate-300'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
                        shareStatus?.isPublic ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                {/* Share Link */}
                {shareStatus?.isPublic && shareStatus.shareUrl && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Share Link</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareStatus.shareUrl}
                        readOnly
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none"
                      />
                      <Button
                        variant="outline"
                        onClick={handleCopyLink}
                        leftIcon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <a
                      href={shareStatus.shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in new tab
                    </a>
                  </div>
                )}

                {/* Analytics */}
                {shareStatus?.isPublic && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Analytics
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <Eye className="h-4 w-4" />
                          <span className="text-sm font-medium">Views</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-900">{shareStatus.totalViews}</p>
                        <p className="text-xs text-blue-600">
                          {shareStatus.viewsLast7Days} in last 7 days
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-xl">
                        <div className="flex items-center gap-2 text-green-600 mb-1">
                          <Download className="h-4 w-4" />
                          <span className="text-sm font-medium">Downloads</span>
                        </div>
                        <p className="text-2xl font-bold text-green-900">{shareStatus.totalDownloads}</p>
                        <p className="text-xs text-green-600">
                          {shareStatus.downloadsLast7Days} in last 7 days
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {shareStatus?.isPublic && shareStatus.recentActivity && shareStatus.recentActivity.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Recent Activity</label>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {shareStatus.recentActivity.slice(0, 5).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {activity.eventType === 'view' ? (
                              <Eye className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Download className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-slate-700 capitalize">{activity.eventType}</span>
                            {activity.city && activity.country && (
                              <Badge variant="default" size="sm">
                                {activity.city}, {activity.country}
                              </Badge>
                            )}
                          </div>
                          <span className="text-slate-500 text-xs">
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-5 border-t bg-slate-50">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
