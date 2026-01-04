'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Download, FileText, Eye, Check, EyeOff, Shield, Search, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth';
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

// Layout types matching backend
type LayoutType = 'single-column' | 'two-column' | 'one-page';
type TemplateFeature = 'ats-optimized' | 'photo-ready' | 'academic' | 'entry-level' | 'executive';

// Extended template type with new fields
interface ExtendedTemplate extends ResumeTemplate {
  category?: 'Professional' | 'Modern' | 'Creative' | 'Simple';
  layoutType?: LayoutType;
  features?: TemplateFeature[];
  colorHex?: string;
  colorName?: string;
  layoutName?: string;
  isPopular?: boolean;
  isNew?: boolean;
  isATSSafe?: boolean;
  hasPhoto?: boolean;
}

export default function DownloadModal({
  isOpen,
  onClose,
  resumeId,
  versionId,
  versionNumber,
  companyName,
}: DownloadModalProps) {
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<ExtendedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('classic-navy');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [anonymize, setAnonymize] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLayoutType, setSelectedLayoutType] = useState<string>('All');
  const [selectedFeature, setSelectedFeature] = useState<string>('All');

  // B2B feature - only available for org users or business plan
  const canAnonymize = user?.organizationId || user?.planType === 'BUSINESS';

  // Categories for filtering (matches resume.io)
  const categories = ['All', 'Professional', 'Modern', 'Creative', 'Simple'];

  // Layout types
  const layoutTypes = [
    { id: 'All', label: 'All Layouts' },
    { id: 'single-column', label: 'Single Column' },
    { id: 'two-column', label: 'Two Column' },
    { id: 'one-page', label: 'One Page' },
  ];

  // Special features
  const features = [
    { id: 'All', label: 'All Types' },
    { id: 'ats-optimized', label: 'ATS-Optimized' },
    { id: 'photo-ready', label: 'Photo Ready' },
    { id: 'executive', label: 'Executive' },
    { id: 'entry-level', label: 'Entry Level' },
    { id: 'academic', label: 'Academic' },
  ];

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesTags = t.tags.some(tag => tag.toLowerCase().includes(query));
        const matchesDescription = t.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesTags && !matchesDescription) return false;
      }

      // Category filter (Professional, Modern, Creative, Simple)
      if (selectedCategory !== 'All' && t.category !== selectedCategory) {
        return false;
      }

      // Layout type filter (single-column, two-column, one-page)
      if (selectedLayoutType !== 'All' && t.layoutType !== selectedLayoutType) {
        return false;
      }

      // Feature filter (ats-optimized, photo-ready, etc.)
      if (selectedFeature !== 'All' && !t.features?.includes(selectedFeature as TemplateFeature)) {
        return false;
      }

      return true;
    });
  }, [templates, searchQuery, selectedCategory, selectedLayoutType, selectedFeature]);

  // Group templates by layout for display
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, ExtendedTemplate[]> = {};
    for (const t of filteredTemplates) {
      const layoutName = t.layoutName || t.name.split(' ')[0];
      if (!groups[layoutName]) groups[layoutName] = [];
      groups[layoutName].push(t);
    }
    return groups;
  }, [filteredTemplates]);

  // Get layout info for grouped display
  const getLayoutCategory = (layoutName: string): string => {
    const template = templates.find(t => t.layoutName === layoutName);
    return template?.category || 'Professional';
  };

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
        // Select first popular template or first template
        const popular = response.data.find((t: ExtendedTemplate) => t.isPopular);
        if (popular) {
          setSelectedTemplate(popular.id);
        } else if (response.data.length > 0) {
          setSelectedTemplate(response.data[0].id);
        }
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
      const blob = await api.downloadVersion(resumeId, versionId, format, selectedTemplate, anonymize);
      const prefix = anonymize ? 'anonymous-resume' : 'resume';
      const filename = `${prefix}-${companyName || 'tailored'}-v${versionNumber}.${format}`;
      downloadBlob(blob, filename);
      toast.success(`Downloaded ${anonymize ? 'anonymized ' : ''}${format.toUpperCase()}`);
      onClose();
    } catch (error) {
      toast.error('Failed to download resume');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Download Resume
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {templates.length} templates available • Choose your style
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row h-[calc(90vh-180px)]">
            {/* Template Selection */}
            <div className="lg:w-2/5 border-r flex flex-col">
              {/* Search and Filters */}
              <div className="p-3 border-b bg-gray-50 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search templates (e.g., London, tech, creative...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Style Category filters (Professional, Modern, Creative, Simple) */}
                <div className="flex items-center gap-2 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Layout Type & Feature filters */}
                <div className="flex items-center gap-2">
                  {/* Layout Type dropdown */}
                  <select
                    value={selectedLayoutType}
                    onChange={(e) => setSelectedLayoutType(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
                  >
                    {layoutTypes.map(lt => (
                      <option key={lt.id} value={lt.id}>{lt.label}</option>
                    ))}
                  </select>

                  {/* Feature dropdown */}
                  <select
                    value={selectedFeature}
                    onChange={(e) => setSelectedFeature(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-blue-500"
                  >
                    {features.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>

                {/* Active filters indicator */}
                {(selectedCategory !== 'All' || selectedLayoutType !== 'All' || selectedFeature !== 'All' || searchQuery) && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {filteredTemplates.length} templates found
                    </span>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setSelectedLayoutType('All');
                        setSelectedFeature('All');
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>

              {/* Templates list */}
              <div className="flex-1 overflow-y-auto p-3">
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No templates match your filters</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setSelectedLayoutType('All');
                        setSelectedFeature('All');
                      }}
                      className="text-blue-600 text-sm mt-2 hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(groupedTemplates).map(([layoutName, layoutTemplates]) => {
                      const category = getLayoutCategory(layoutName);
                      const categoryColors: Record<string, string> = {
                        Professional: 'bg-blue-100 text-blue-700',
                        Modern: 'bg-emerald-100 text-emerald-700',
                        Creative: 'bg-purple-100 text-purple-700',
                        Simple: 'bg-gray-100 text-gray-700',
                      };
                      return (
                      <div key={layoutName}>
                        <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          {layoutName}
                          <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium', categoryColors[category] || categoryColors.Professional)}>
                            {category}
                          </span>
                          <span className="text-gray-400 font-normal">({layoutTemplates.length} colors)</span>
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                          {layoutTemplates.map((template) => {
                            const isSelected = selectedTemplate === template.id;

                            return (
                              <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template.id)}
                                className={cn(
                                  'group relative aspect-square rounded-lg border-2 transition-all overflow-hidden',
                                  isSelected
                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-gray-300'
                                )}
                                title={template.name}
                              >
                                {/* Color preview */}
                                <div
                                  className="absolute inset-0"
                                  style={{ backgroundColor: template.colorHex || '#1e3a5f' }}
                                />

                                {/* Template pattern overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

                                {/* Selection check */}
                                {isSelected && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <Check className="h-5 w-5 text-white drop-shadow-lg" />
                                  </div>
                                )}

                                {/* Badges */}
                                <div className="absolute top-1 right-1 flex flex-col gap-0.5">
                                  {template.isNew && (
                                    <span className="bg-pink-400 text-[8px] px-1 py-0.5 rounded text-white font-medium">
                                      NEW
                                    </span>
                                  )}
                                  {template.isPopular && (
                                    <span className="bg-amber-400 text-[8px] px-1 py-0.5 rounded text-amber-900 font-medium">
                                      ★
                                    </span>
                                  )}
                                  {template.isATSSafe && (
                                    <span className="bg-green-400 text-[8px] px-1 py-0.5 rounded text-green-900 font-medium">
                                      ATS
                                    </span>
                                  )}
                                  {template.hasPhoto && (
                                    <span className="bg-blue-400 text-[8px] px-1 py-0.5 rounded text-white font-medium">
                                      📷
                                    </span>
                                  )}
                                </div>

                                {/* Color name on hover */}
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity truncate px-1">
                                  {template.colorName || template.name.split(' ').slice(1).join(' ')}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="lg:w-3/5 p-4 bg-gray-50 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                    {selectedTemplateData && (
                      <span className="font-normal text-gray-500">
                        — {selectedTemplateData.name}
                      </span>
                    )}
                  </h3>
                  {selectedTemplateData && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedTemplateData.description}
                    </p>
                  )}
                </div>
                {isPreviewLoading && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full" />
                    Loading...
                  </span>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <p className="text-sm text-gray-500">
                Template: <span className="font-medium text-gray-900">
                  {selectedTemplateData?.name || 'Classic Navy'}
                </span>
              </p>

              {/* Anonymization Toggle */}
              {canAnonymize && (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={anonymize}
                        onChange={(e) => setAnonymize(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={cn(
                        'w-10 h-6 rounded-full transition-colors duration-200',
                        anonymize ? 'bg-indigo-600' : 'bg-gray-300'
                      )}>
                        <div className={cn(
                          'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                          anonymize ? 'translate-x-5' : 'translate-x-1'
                        )} />
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-sm text-gray-700">
                      <EyeOff className="h-4 w-4" />
                      Anonymize
                    </span>
                  </label>
                  {anonymize && (
                    <Badge variant="info" size="sm" className="animate-fade-in">
                      <Shield className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  )}
                </div>
              )}
            </div>

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
