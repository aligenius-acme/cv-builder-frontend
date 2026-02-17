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
  isResumeBuilder?: boolean; // Flag to indicate if used from resume-builder
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
  isResumeBuilder = false,
}: DownloadModalProps) {
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [recommendedTemplates, setRecommendedTemplates] = useState<ResumeTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
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

    console.log('Filtered results:', filtered.length, 'out of', templates.length);

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

        // Debug: Log template properties to understand filtering
        console.log('=== TEMPLATES LOADED ===');
        console.log('Total templates:', response.data.length);

        // Log all unique categories
        const categories = [...new Set(response.data.map((t: ResumeTemplate) => t.primaryCategory || t.category))];
        console.log('Available categories:', categories);

        // Log all unique ATS levels
        const atsLevels = [...new Set(response.data.map((t: ResumeTemplate) => t.atsCompatibility))];
        console.log('Available ATS levels:', atsLevels);

        // Log all unique design styles
        const designStyles = [...new Set(response.data.map((t: ResumeTemplate) => t.designStyle))];
        console.log('Available design styles:', designStyles);

        // Log sample template
        if (response.data.length > 0) {
          console.log('Sample template:', {
            name: response.data[0].name,
            primaryCategory: response.data[0].primaryCategory,
            category: response.data[0].category,
            atsCompatibility: response.data[0].atsCompatibility,
            designStyle: response.data[0].designStyle,
            experienceLevel: response.data[0].experienceLevel,
            industryTags: response.data[0].industryTags,
          });
        }
        console.log('======================');

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

      // Use different API method based on context
      const blob = isResumeBuilder
        ? await api.previewBuiltResume(resumeId, selectedTemplate)
        : await api.previewTemplate(selectedTemplate, resumeId, versionId);

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Failed to load preview:', error);
      toast.error('Failed to load preview');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    try {
      setIsDownloading(true);

      // Use different API method based on context
      const blob = isResumeBuilder
        ? await api.downloadBuiltResume(resumeId, format, selectedTemplate)
        : await api.downloadVersion(resumeId, versionId, format, selectedTemplate, anonymize);

      const prefix = anonymize ? 'anonymous-resume' : 'resume';
      const filename = isResumeBuilder
        ? `${companyName || 'resume'}.${format}`
        : `${prefix}-${companyName || 'tailored'}-v${versionNumber}.${format}`;

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
    <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/70 to-gray-900/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[92vh] overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header with Gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Download className="h-7 w-7" />
                  Download Resume
                </h2>
                <p className="text-blue-100 mt-1.5 flex items-center gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white">
                    {templates.length} templates
                  </span>
                  <span>•</span>
                  <span>Choose your perfect style</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-white/20 rounded-full transition-all duration-200 text-white hover:rotate-90 transform"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row h-[calc(92vh-200px)]">
            {/* Template Selection */}
            <div className="lg:w-1/2 border-r border-gray-200 flex flex-col bg-gray-50/50">
              {/* Search and Filters */}
              <div className="p-4 border-b border-gray-200 bg-white space-y-3 shadow-sm">
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-3.5 w-3.5 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Quick Filters - Category */}
                <div>
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Category</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all duration-200',
                          selectedCategory === cat.id
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                        )}
                      >
                        {cat.label === 'All Templates' ? 'All' : cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Filters</label>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* ATS Compatibility */}
                    <select
                      value={selectedATS}
                      onChange={(e) => setSelectedATS(e.target.value)}
                      className={cn(
                        "px-2 py-1.5 text-[11px] border-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium",
                        selectedATS !== 'All' ? 'border-blue-500 text-blue-700' : 'border-gray-200 text-gray-700'
                      )}
                    >
                      {atsLevels.map(ats => (
                        <option key={ats.id} value={ats.id}>{ats.label}</option>
                      ))}
                    </select>

                    {/* Design Style */}
                    <select
                      value={selectedDesignStyle}
                      onChange={(e) => setSelectedDesignStyle(e.target.value)}
                      className={cn(
                        "px-2 py-1.5 text-[11px] border-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium",
                        selectedDesignStyle !== 'All' ? 'border-blue-500 text-blue-700' : 'border-gray-200 text-gray-700'
                      )}
                    >
                      {designStyles.map(style => (
                        <option key={style.id} value={style.id}>{style.label}</option>
                      ))}
                    </select>

                    {/* Experience Level */}
                    <select
                      value={selectedExperience}
                      onChange={(e) => setSelectedExperience(e.target.value)}
                      className={cn(
                        "px-2 py-1.5 text-[11px] border-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium",
                        selectedExperience !== 'All' ? 'border-blue-500 text-blue-700' : 'border-gray-200 text-gray-700'
                      )}
                    >
                      {experienceLevels.map(exp => (
                        <option key={exp.id} value={exp.id}>{exp.label}</option>
                      ))}
                    </select>

                    {/* Industry */}
                    <select
                      value={selectedIndustry}
                      onChange={(e) => setSelectedIndustry(e.target.value)}
                      className={cn(
                        "px-2 py-1.5 text-[11px] border-2 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-medium",
                        selectedIndustry !== 'All' ? 'border-blue-500 text-blue-700' : 'border-gray-200 text-gray-700'
                      )}
                    >
                      {industries.map(ind => (
                        <option key={ind.id} value={ind.id}>{ind.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sort */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Sort By</label>
                  <div className="flex items-center gap-2">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={cn(
                          'px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all duration-200',
                          sortBy === opt.id
                            ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Results indicator */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between px-2 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <span className="text-[11px] text-gray-600 font-medium">Showing Results</span>
                    <span className="text-[11px] font-bold text-gray-900 bg-white px-2 py-0.5 rounded-full">
                      {filteredTemplates.length} / {templates.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Templates list */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Loading skeleton */}
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                      <div className="grid grid-cols-4 gap-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-pulse" />
                      <div className="grid grid-cols-4 gap-2">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Recommended Templates Section */}
                    {recommendedTemplates.length > 0 && showRecommended && !hasActiveFilters && (
                      <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-500">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-sm">
                              <Sparkles className="h-3.5 w-3.5 text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">Recommended for You</h3>
                          </div>
                          <span className="text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-1 rounded-full font-semibold shadow-sm">
                            AI-Powered
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-3 rounded-xl border-2 border-indigo-200/50 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl" />
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
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-xl opacity-20 animate-pulse" />
                          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-full">
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
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                                Experience: {selectedExperience}
                                <button onClick={() => setSelectedExperience('All')} className="hover:bg-indigo-200 rounded p-0.5">
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

                        <button
                          onClick={clearAllFilters}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <X className="h-4 w-4" />
                          Clear All Filters
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Section header - shown when recommended exists or filters active */}
                        {(recommendedTemplates.length > 0 && showRecommended && !hasActiveFilters) || hasActiveFilters ? (
                          <div className="mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
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
                        <div className="grid grid-cols-3 gap-3">
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
            <div className="lg:w-1/2 p-6 bg-gradient-to-br from-gray-50 to-gray-100/50 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Live Preview
                    {selectedTemplateData && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {selectedTemplateData.name}
                      </span>
                    )}
                  </h3>
                  {selectedTemplateData && (
                    <p className="text-sm text-gray-600 mt-1 flex items-start gap-1.5">
                      <span className="inline-block w-1 h-1 rounded-full bg-blue-500 mt-1.5"></span>
                      {selectedTemplateData.description}
                    </p>
                  )}
                </div>
                {isPreviewLoading && (
                  <span className="text-sm text-blue-600 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200/50 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                    <span className="font-medium">Loading preview...</span>
                  </span>
                )}
              </div>

              <div className="flex-1 bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden relative group hover:shadow-xl transition-all duration-300">
                {previewUrl ? (
                  <>
                    <iframe
                      src={previewUrl}
                      className="w-full h-full animate-in fade-in duration-300"
                      title="Resume Preview"
                    />
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium rounded-lg shadow-lg backdrop-blur-sm">
                        Live Preview
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-in fade-in duration-500">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full blur-xl opacity-20 animate-pulse" />
                      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl">
                        <FileText className="h-16 w-16 text-gray-300" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Select a template to preview</p>
                    <p className="text-xs text-gray-400 mt-1">Choose from the templates on the left</p>
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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-200 shadow-sm">
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
                        anonymize ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-300'
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
                className="flex-1 sm:flex-none bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:from-green-100 hover:to-emerald-100 text-green-700 hover:text-green-800 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                DOCX
              </Button>
              <Button
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading || !selectedTemplate}
                className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 disabled:opacity-50"
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
