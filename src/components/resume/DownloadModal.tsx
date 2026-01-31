'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Download, FileText, Eye, Check, EyeOff, Shield, Search, Filter, Sparkles, ArrowUpDown } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';
import { ResumeTemplate, PrimaryCategory, ATSCompatibility, ExperienceLevel, DesignStyle } from '@/types';
import { downloadBlob, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import TemplateCard from './TemplateCard';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  versionId: string;
  versionNumber: number;
  companyName: string;
}

// INDUSTRY_TAGS matching backend
const INDUSTRY_TAGS = {
  technology: 'Technology',
  business: 'Business',
  creative: 'Creative',
  healthcare: 'Healthcare',
  education: 'Education',
  sales: 'Sales',
  operations: 'Operations',
  legal: 'Legal',
  engineering: 'Engineering',
  hospitality: 'Hospitality',
  nonprofit: 'Nonprofit',
  government: 'Government',
} as const;

export default function DownloadModal({
  isOpen,
  onClose,
  resumeId,
  versionId,
  versionNumber,
  companyName,
}: DownloadModalProps) {
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [recommendedTemplates, setRecommendedTemplates] = useState<ResumeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('classic-navy');
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [anonymize, setAnonymize] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedATS, setSelectedATS] = useState<string>('All');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [selectedExperience, setSelectedExperience] = useState<string>('All');
  const [selectedDesignStyle, setSelectedDesignStyle] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showRecommended, setShowRecommended] = useState(true);

  // B2B feature - only available for org users or business plan
  const canAnonymize = user?.organizationId || user?.planType === 'BUSINESS';

  // New 6-category system
  const categories: Array<{ id: string; label: string }> = [
    { id: 'All', label: 'All Templates' },
    { id: 'ATS-Professional', label: 'ATS-Professional' },
    { id: 'Tech-Startup', label: 'Tech-Startup' },
    { id: 'Creative-Design', label: 'Creative-Design' },
    { id: 'Academic-Research', label: 'Academic-Research' },
    { id: 'Entry-Student', label: 'Entry-Student' },
    { id: 'Executive-Leadership', label: 'Executive-Leadership' },
  ];

  // ATS Compatibility levels
  const atsLevels = [
    { id: 'All', label: 'All ATS Levels' },
    { id: 'ATS-Safe', label: 'ATS-Safe' },
    { id: 'ATS-Friendly', label: 'ATS-Friendly' },
    { id: 'Visual-First', label: 'Visual-First' },
  ];

  // Industry filter options
  const industries = [
    { id: 'All', label: 'All Industries' },
    ...Object.entries(INDUSTRY_TAGS).map(([key, label]) => ({ id: key, label })),
  ];

  // Experience levels
  const experienceLevels = [
    { id: 'All', label: 'All Experience' },
    { id: 'Entry', label: 'Entry Level' },
    { id: 'Mid', label: 'Mid Level' },
    { id: 'Senior', label: 'Senior' },
    { id: 'Executive', label: 'Executive' },
  ];

  // Design styles
  const designStyles = [
    { id: 'All', label: 'All Styles' },
    { id: 'Minimal', label: 'Minimal' },
    { id: 'Modern', label: 'Modern' },
    { id: 'Bold', label: 'Bold' },
    { id: 'Traditional', label: 'Traditional' },
  ];

  // Sort options
  const sortOptions = [
    { id: 'popular', label: 'Popular' },
    { id: 'newest', label: 'Newest' },
    { id: 'name', label: 'Name' },
    { id: 'ats-score', label: 'ATS Score' },
  ];

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(t => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesTags = t.tags?.some(tag => tag.toLowerCase().includes(query)) || false;
        const matchesDescription = t.description?.toLowerCase().includes(query) || false;
        const matchesIndustry = t.industryTags?.some(tag => tag.toLowerCase().includes(query)) || false;
        if (!matchesName && !matchesTags && !matchesDescription && !matchesIndustry) return false;
      }

      // Primary Category filter
      if (selectedCategory !== 'All' && t.primaryCategory !== selectedCategory) {
        return false;
      }

      // ATS Compatibility filter
      if (selectedATS !== 'All' && t.atsCompatibility !== selectedATS) {
        return false;
      }

      // Industry filter
      if (selectedIndustry !== 'All') {
        if (!t.industryTags?.some(tag => tag.toLowerCase() === selectedIndustry.toLowerCase())) {
          return false;
        }
      }

      // Experience level filter
      if (selectedExperience !== 'All' && t.experienceLevel !== selectedExperience) {
        return false;
      }

      // Design style filter
      if (selectedDesignStyle !== 'All' && t.designStyle !== selectedDesignStyle) {
        return false;
      }

      return true;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.popularityScore || 0) - (a.popularityScore || 0);
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'ats-score':
          const aScore = a.atsCompatibility === 'ATS-Safe' ? 3 : a.atsCompatibility === 'ATS-Friendly' ? 2 : 1;
          const bScore = b.atsCompatibility === 'ATS-Safe' ? 3 : b.atsCompatibility === 'ATS-Friendly' ? 2 : 1;
          return bScore - aScore;
        default:
          return 0;
      }
    });

    return filtered;
  }, [templates, searchQuery, selectedCategory, selectedATS, selectedIndustry, selectedExperience, selectedDesignStyle, sortBy]);

  // Group templates by layout for display
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, ResumeTemplate[]> = {};
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
    return template?.primaryCategory || template?.category || 'ATS-Professional';
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedATS !== 'All' ||
    selectedIndustry !== 'All' || selectedExperience !== 'All' || selectedDesignStyle !== 'All';

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedATS('All');
    setSelectedIndustry('All');
    setSelectedExperience('All');
    setSelectedDesignStyle('All');
  };

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      loadRecommendedTemplates();
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
        const popular = response.data.find((t: ResumeTemplate) => t.isPopular);
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

  const loadRecommendedTemplates = async () => {
    try {
      const response = await api.getRecommendedTemplates({ resumeId });
      if (response.success && response.data) {
        setRecommendedTemplates(response.data.templates || []);
      }
    } catch (error) {
      // Silently fail - recommendations are optional
      console.error('Failed to load recommended templates:', error);
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
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Primary Category chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        'px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors',
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-100 border'
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Advanced Filters Row 1 */}
                <div className="grid grid-cols-2 gap-2">
                  {/* ATS Compatibility dropdown */}
                  <select
                    value={selectedATS}
                    onChange={(e) => setSelectedATS(e.target.value)}
                    className="px-2 py-1.5 text-xs border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {atsLevels.map(ats => (
                      <option key={ats.id} value={ats.id}>{ats.label}</option>
                    ))}
                  </select>

                  {/* Industry dropdown */}
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="px-2 py-1.5 text-xs border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {industries.map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.label}</option>
                    ))}
                  </select>
                </div>

                {/* Advanced Filters Row 2 */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Experience Level dropdown */}
                  <select
                    value={selectedExperience}
                    onChange={(e) => setSelectedExperience(e.target.value)}
                    className="px-2 py-1.5 text-xs border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {experienceLevels.map(exp => (
                      <option key={exp.id} value={exp.id}>{exp.label}</option>
                    ))}
                  </select>

                  {/* Design Style dropdown */}
                  <select
                    value={selectedDesignStyle}
                    onChange={(e) => setSelectedDesignStyle(e.target.value)}
                    className="px-2 py-1.5 text-xs border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {designStyles.map(style => (
                      <option key={style.id} value={style.id}>{style.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>Sort by: {opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* Active filters indicator */}
                {hasActiveFilters && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                    </span>
                    <button
                      onClick={clearAllFilters}
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
                ) : (
                  <div className="space-y-4">
                    {/* Recommended Templates Section */}
                    {recommendedTemplates.length > 0 && showRecommended && !hasActiveFilters && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-indigo-600" />
                          <h3 className="text-sm font-semibold text-gray-900">Recommended for you</h3>
                        </div>
                        <div className="space-y-2 bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-200">
                          {recommendedTemplates.slice(0, 6).map((template) => (
                            <TemplateCard
                              key={template.id}
                              template={template}
                              selected={selectedTemplate === template.id}
                              onClick={() => setSelectedTemplate(template.id)}
                              variant="default"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Templates */}
                    {filteredTemplates.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No templates match your filters</p>
                        <button
                          onClick={clearAllFilters}
                          className="text-blue-600 text-sm mt-2 hover:underline"
                        >
                          Clear all filters
                        </button>
                      </div>
                    ) : (
                      <>
                        {hasActiveFilters && (
                          <div className="mb-3">
                            <h3 className="text-sm font-semibold text-gray-900">Filtered Results</h3>
                          </div>
                        )}
                        {Object.entries(groupedTemplates).map(([layoutName, layoutTemplates]) => {
                          const category = getLayoutCategory(layoutName);
                          const categoryColors: Record<string, string> = {
                            'ATS-Professional': 'bg-blue-100 text-blue-700',
                            'Tech-Startup': 'bg-emerald-100 text-emerald-700',
                            'Creative-Design': 'bg-purple-100 text-purple-700',
                            'Academic-Research': 'bg-amber-100 text-amber-700',
                            'Entry-Student': 'bg-pink-100 text-pink-700',
                            'Executive-Leadership': 'bg-indigo-100 text-indigo-700',
                            Professional: 'bg-blue-100 text-blue-700',
                            Modern: 'bg-emerald-100 text-emerald-700',
                            Creative: 'bg-purple-100 text-purple-700',
                            Simple: 'bg-gray-100 text-gray-700',
                          };
                          return (
                            <div key={layoutName}>
                              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                {layoutName}
                                <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-medium', categoryColors[category] || categoryColors['ATS-Professional'])}>
                                  {category}
                                </span>
                                <span className="text-gray-400 font-normal">({layoutTemplates.length} variant{layoutTemplates.length !== 1 ? 's' : ''})</span>
                              </h4>
                              <div className="grid grid-cols-4 gap-2">
                                {layoutTemplates.map((template) => (
                                  <TemplateCard
                                    key={template.id}
                                    template={template}
                                    selected={selectedTemplate === template.id}
                                    onClick={() => setSelectedTemplate(template.id)}
                                    variant="compact"
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
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
