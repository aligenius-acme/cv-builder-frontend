'use client';

import { useState, useEffect } from 'react';
import { X, Download, FileText, Eye, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import api from '@/lib/api';
import { ResumeTemplate } from '@/types';
import { downloadBlob, cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  versionId: string;
  versionNumber: number;
  companyName: string;
}

// Template colors for visual distinction
const templateColors: Record<string, { bg: string; border: string; accent: string }> = {
  professional: { bg: 'bg-blue-50', border: 'border-blue-300', accent: 'text-blue-600' },
  modern: { bg: 'bg-green-50', border: 'border-green-300', accent: 'text-green-600' },
  minimal: { bg: 'bg-gray-50', border: 'border-gray-300', accent: 'text-gray-600' },
  'ats-friendly': { bg: 'bg-slate-50', border: 'border-slate-400', accent: 'text-slate-700' },
  executive: { bg: 'bg-indigo-50', border: 'border-indigo-300', accent: 'text-indigo-600' },
  creative: { bg: 'bg-purple-50', border: 'border-purple-300', accent: 'text-purple-600' },
};

export default function DownloadModal({
  isOpen,
  onClose,
  resumeId,
  versionId,
  versionNumber,
  companyName,
}: DownloadModalProps) {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    // Load preview when template changes
    if (isOpen && selectedTemplate) {
      loadPreview();
    }
    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [selectedTemplate, isOpen]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await api.getTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreview = async () => {
    try {
      setIsPreviewLoading(true);
      // Revoke previous URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const blob = await api.previewTemplate(selectedTemplate, resumeId, versionId);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Failed to load preview:', error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    try {
      setIsDownloading(true);
      const blob = await api.downloadVersion(resumeId, versionId, format, selectedTemplate);
      const filename = `resume-${companyName || 'tailored'}-v${versionNumber}.${format}`;
      downloadBlob(blob, filename);
      toast.success(`Downloaded ${format.toUpperCase()}`);
      onClose();
    } catch (error) {
      toast.error('Failed to download resume');
    } finally {
      setIsDownloading(false);
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
        <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Download Resume
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row h-[calc(90vh-140px)]">
            {/* Template Selection */}
            <div className="lg:w-1/3 p-4 border-r overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Select Template
              </h3>

              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              ) : (
                <div className="space-y-2">
                  {templates.map((template) => {
                    const colors = templateColors[template.id] || templateColors.professional;
                    const isSelected = selectedTemplate === template.id;

                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={cn(
                          'w-full p-3 rounded-lg border-2 text-left transition-all',
                          isSelected
                            ? `${colors.bg} ${colors.border} ring-2 ring-offset-2 ring-blue-500`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={cn(
                              'font-medium',
                              isSelected ? colors.accent : 'text-gray-900'
                            )}>
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {template.description}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className={cn('h-5 w-5', colors.accent)} />
                          )}
                        </div>
                        <div className="flex gap-1 mt-2">
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="lg:w-2/3 p-4 bg-gray-50 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </h3>
                {isPreviewLoading && (
                  <span className="text-xs text-gray-500">Loading preview...</span>
                )}
              </div>

              <div className="flex-1 bg-white rounded-lg border shadow-inner overflow-hidden">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full"
                    title="Resume Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <FileText className="h-12 w-12" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-500">
              Selected: <span className="font-medium text-gray-900">
                {templates.find(t => t.id === selectedTemplate)?.name || 'Professional'}
              </span>
            </p>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload('docx')}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                DOCX
              </Button>
              <Button
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
