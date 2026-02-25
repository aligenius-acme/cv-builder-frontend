'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Download, FileText, Eye, Check, EyeOff, Shield, Search, Filter, Sparkles } from 'lucide-react';
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
  versionId?: string;     // if provided → version download mode; omit for base resume download
  versionNumber?: number; // used in filename for version mode
  label?: string;         // company name for versions, resume title for base download
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
  label,
}: DownloadModalProps) {
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [recommendedTemplates, setRecommendedTemplates] = useState<ResumeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'docx' | null>(null);
  const isDownloading = downloadingFormat !== null;
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

  // Anonymization available to all users
  const canAnonymize = true;

  // All categories matching database - IDs match template data (lowercase with hyphens)
  const categories: Array<{ id: string; label: string }> = [
    { id: 'All', label: 'All Templates' },
    { id: 'ats-professional', label: 'ATS Professional' },
    { id: 'tech-startup', label: 'Tech Startup' },
    { id: 'creative-design', label: 'Creative Design' },
    { id: 'academic-research', label: 'Academic Research' },
    { id: 'entry-student', label: 'Entry Student' },
    { id: 'executive-leadership', label: 'Executive Leadership' },
    { id: 'healthcare-medical', label: 'Healthcare & Medical' },
    { id: 'finance-banking', label: 'Finance & Banking' },
    { id: 'legal-law', label: 'Legal & Law' },
    { id: 'sales-marketing', label: 'Sales & Marketing' },
    { id: 'education-teaching', label: 'Education & Teaching' },
    { id: 'engineering', label: 'Engineering' },
    { id: 'hospitality-service', label: 'Hospitality & Service' },
    { id: 'construction-trades', label: 'Construction & Trades' },
    { id: 'retail-ecommerce', label: 'Retail & E-commerce' },
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

      // Primary Category filter - more flexible matching
      if (selectedCategory !== 'All') {
        const templateCategory = t.primaryCategory || t.category || '';
        if (!templateCategory || templateCategory !== selectedCategory) {
          return false;
        }
      }

      // ATS Compatibility filter
      if (selectedATS !== 'All') {
        if (!t.atsCompatibility || t.atsCompatibility !== selectedATS) {
          return false;
        }
      }

      // Industry filter
      if (selectedIndustry !== 'All') {
        if (!t.industryTags?.some(tag => tag.toLowerCase() === selectedIndustry.toLowerCase())) {
          return false;
        }
      }

      // Experience level filter
      if (selectedExperience !== 'All') {
        if (!t.experienceLevel || t.experienceLevel !== selectedExperience) {
          return false;
        }
      }

      // Design style filter
      if (selectedDesignStyle !== 'All') {
        if (!t.designStyle || t.designStyle !== selectedDesignStyle) {
          return false;
        }
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
    }
  };

  const loadPreview = async () => {
    try {
      setIsPreviewLoading(true);
      // Revoke and clear previous preview immediately so old template doesn't linger
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);

      // Use different API method based on context (versionId presence determines mode)
      const blob = versionId
        ? await api.previewTemplate(selectedTemplate, resumeId, versionId)
        : await api.previewBuiltResume(resumeId, selectedTemplate);

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      toast.error('Failed to load preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    try {
      setDownloadingFormat(format);

      // Use different API method based on context (versionId presence determines mode)
      const blob = versionId
        ? await api.downloadVersion(resumeId, versionId, format, selectedTemplate, anonymize)
        : await api.downloadBuiltResume(resumeId, format, selectedTemplate);

      const prefix = anonymize ? 'anonymous-resume' : 'resume';
      const filename = versionId
        ? `${prefix}-${label || 'tailored'}-v${versionNumber}.${format}`
        : `${label || 'resume'}.${format}`;

      downloadBlob(blob, filename);
      toast.success(`Downloaded ${anonymize ? 'anonymized ' : ''}${format.toUpperCase()}`);
      onClose();
    } catch (error) {
      toast.error('Failed to download resume');
    } finally {
      setDownloadingFormat(null);
    }
  };

  if (!isOpen) return null;

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-2xl max-w-[98vw] w-full max-h-[96vh] overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-slate-900 px-6 py-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-white flex-shrink-0" />
                <div>
                  <h2 className="text-base font-bold text-white">Download Resume</h2>
                  <p className="text-slate-400 text-xs mt-0.5">{templates.length} templates available</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 text-white hover:rotate-90 transform"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row h-[calc(96vh-152px)]">
            {/* Template Selection */}
            <div className="lg:w-[56%] border-r border-slate-200 flex flex-col bg-slate-50/50">
              {/* Search and Filters */}
              <div className="p-4 border-b border-slate-200 bg-white space-y-3 shadow-sm">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                    >
                      <X className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                  )}
                </div>

                {/* Category chips — single scrollable row */}
                <div
                  className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        'flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-xl transition-all duration-200',
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      )}
                    >
                      {cat.label === 'All Templates' ? 'All' : cat.label}
                    </button>
                  ))}
                </div>

                {/* Secondary filters — one compact row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: 'Sort', value: sortBy, onChange: setSortBy, options: sortOptions },
                    { label: 'ATS', value: selectedATS, onChange: setSelectedATS, options: atsLevels },
                    { label: 'Style', value: selectedDesignStyle, onChange: setSelectedDesignStyle, options: designStyles },
                    { label: 'Level', value: selectedExperience, onChange: setSelectedExperience, options: experienceLevels },
                    { label: 'Industry', value: selectedIndustry, onChange: setSelectedIndustry, options: industries },
                  ].map(({ label, value, onChange, options }) => (
                    <select
                      key={label}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      className={cn(
                        'px-2.5 py-1.5 text-xs border rounded-xl bg-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all',
                        value !== 'All' ? 'border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600'
                      )}
                    >
                      {options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  ))}
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-1"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Templates list */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Loading skeleton */}
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="grid grid-cols-4 gap-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                      <div className="grid grid-cols-4 gap-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="aspect-square rounded-lg bg-gray-200 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Recommended Templates Section */}
                    {recommendedTemplates.length > 0 && !hasActiveFilters && (
                      <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-500">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-600 rounded-lg">
                              <Sparkles className="h-3.5 w-3.5 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">Recommended for You</h3>
                          </div>
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-semibold">
                            AI-Powered
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 bg-blue-50 p-3 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
                          {recommendedTemplates.slice(0, 6).map((template, idx) => (
                            <div key={template.id} className="relative animate-in zoom-in duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                              <TemplateCard
                                template={template}
                                selected={selectedTemplate === template.id}
                                onClick={() => setSelectedTemplate(template.id)}
                                variant="grid"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All Templates */}
                    {filteredTemplates.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="relative mb-4">
                          <div className="" />
                          <div className="relative bg-amber-50 p-6 rounded-full">
                            <Search className="h-12 w-12 text-amber-500" />
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No templates match your filters</h3>
                        <p className="text-sm text-gray-600 mb-3 max-w-sm">
                          {hasActiveFilters ? (
                            <>
                              We couldn't find any templates matching your selected filters.
                              Try clearing some filters to see more results.
                            </>
                          ) : (
                            <>No templates available at the moment.</>
                          )}
                        </p>

                        {/* Active filters summary */}
                        {hasActiveFilters && (
                          <div className="mb-4 flex flex-wrap gap-2 justify-center max-w-md">
                            {selectedCategory !== 'All' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                Category: {selectedCategory}
                                <button onClick={() => setSelectedCategory('All')} className="hover:bg-blue-200 rounded p-0.5">
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            )}
                            {selectedATS !== 'All' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
                                ATS: {selectedATS}
                                <button onClick={() => setSelectedATS('All')} className="hover:bg-green-200 rounded p-0.5">
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            )}
                            {selectedDesignStyle !== 'All' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                                Style: {selectedDesignStyle}
                                <button onClick={() => setSelectedDesignStyle('All')} className="hover:bg-purple-200 rounded p-0.5">
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            )}
                            {selectedExperience !== 'All' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                Experience: {selectedExperience}
                                <button onClick={() => setSelectedExperience('All')} className="hover:bg-blue-200 rounded p-0.5">
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            )}
                            {selectedIndustry !== 'All' && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                                Industry: {selectedIndustry}
                                <button onClick={() => setSelectedIndustry('All')} className="hover:bg-amber-200 rounded p-0.5">
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            )}
                          </div>
                        )}

                        <Button
                          variant="primary"
                          onClick={clearAllFilters}
                          leftIcon={<X className="h-4 w-4" />}
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Section header - shown when recommended exists or filters active */}
                        {(recommendedTemplates.length > 0 && !hasActiveFilters) || hasActiveFilters ? (
                          <div className="mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2">
                                {hasActiveFilters ? (
                                  <>
                                    <Filter className="h-4 w-4 text-blue-600" />
                                    <h3 className="text-sm font-bold text-gray-900">Filtered Results</h3>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-4 w-4 text-gray-600" />
                                    <h3 className="text-sm font-bold text-gray-900">All Templates</h3>
                                  </>
                                )}
                              </div>
                              <span className={cn(
                                "text-xs font-semibold px-2 py-1 rounded-full",
                                hasActiveFilters
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-200 text-gray-700"
                              )}>
                                {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'}
                              </span>
                            </div>
                          </div>
                        ) : null}

                        {/* All Templates Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {filteredTemplates.map((template, idx) => (
                            <div key={template.id} className="animate-in zoom-in duration-200" style={{ animationDelay: `${idx * 20}ms` }}>
                              <TemplateCard
                                template={template}
                                selected={selectedTemplate === template.id}
                                onClick={() => setSelectedTemplate(template.id)}
                                variant="grid"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 p-6 bg-slate-50 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {selectedTemplateData ? selectedTemplateData.name : 'Live Preview'}
                  </h3>
                  {selectedTemplateData?.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{selectedTemplateData.description}</p>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                {/* Loading overlay */}
                {isPreviewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full" />
                      <span className="text-sm font-medium">Loading preview...</span>
                    </div>
                  </div>
                )}
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full"
                    title="Resume Preview"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="bg-slate-50 p-8 rounded-2xl mb-4">
                      <FileText className="h-14 w-14 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">Select a template to preview</p>
                    <p className="text-xs text-slate-400 mt-1">Choose from the list on the left</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-sm text-gray-600 font-medium">Selected:</span>
                {selectedTemplateData ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-50 text-blue-700 border-2 border-blue-200">
                    <Check className="h-3.5 w-3.5" />
                    {selectedTemplateData.name}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 border-2 border-gray-200">
                    No template selected
                  </span>
                )}
              </div>

              {/* Anonymization Toggle */}
              {canAnonymize && (
                <div className="flex items-center gap-3 sm:pl-4 sm:border-l border-gray-300">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={anonymize}
                        onChange={(e) => setAnonymize(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={cn(
                        'w-11 h-6 rounded-full transition-all duration-200 shadow-inner',
                        anonymize ? 'bg-blue-600' : 'bg-gray-300'
                      )}>
                        <div className={cn(
                          'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
                          anonymize ? 'translate-x-5' : 'translate-x-0.5'
                        )} />
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                      <EyeOff className="h-4 w-4" />
                      Anonymize
                    </span>
                  </label>
                  {anonymize && (
                    <Badge variant="info" size="sm" className="animate-in fade-in slide-in-from-left-2 duration-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Private Mode
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownload('docx')}
                disabled={isDownloading || !selectedTemplate}
                isLoading={downloadingFormat === 'docx'}
                leftIcon={<Download className="h-4 w-4" />}
                className="flex-1 sm:flex-none"
              >
                DOCX
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading || !selectedTemplate}
                isLoading={downloadingFormat === 'pdf'}
                leftIcon={<Download className="h-4 w-4" />}
                className="flex-1 sm:flex-none"
              >
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
