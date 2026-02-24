'use client';

import { Check, FileText, Columns2, FileImage } from 'lucide-react';
import { ResumeTemplate } from '@/types';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: ResumeTemplate;
  selected: boolean;
  onClick: () => void;
  variant?: 'default' | 'compact' | 'grid';
}

export default function TemplateCard({
  template,
  selected,
  onClick,
  variant = 'default',
}: TemplateCardProps) {
  const getATSBadgeColor = (ats?: string) => {
    switch (ats) {
      case 'ATS-Safe':
        return 'bg-green-500 text-white';
      case 'ATS-Friendly':
        return 'bg-yellow-500 text-white';
      case 'Visual-First':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'ats-professional': 'bg-blue-100 text-blue-700',
      'tech-startup': 'bg-emerald-100 text-emerald-700',
      'creative-design': 'bg-purple-100 text-purple-700',
      'academic-research': 'bg-amber-100 text-amber-700',
      'entry-student': 'bg-pink-100 text-pink-700',
      'executive-leadership': 'bg-blue-100 text-blue-700',
      // Legacy support for old format
      'ATS-Professional': 'bg-blue-100 text-blue-700',
      'Tech-Startup': 'bg-emerald-100 text-emerald-700',
      'Creative-Design': 'bg-purple-100 text-purple-700',
      'Academic-Research': 'bg-amber-100 text-amber-700',
      'Entry-Student': 'bg-pink-100 text-pink-700',
      'Executive-Leadership': 'bg-blue-100 text-blue-700',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-700';
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'group relative aspect-square rounded-lg border-2 transition-all duration-300 overflow-hidden bg-gray-50 hover:scale-105',
          selected
            ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg shadow-blue-200/50'
            : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
        )}
        title={template.name}
      >
        {/* Template preview image */}
        {template.preview ? (
          <img
            src={template.preview}
            alt={template.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            {/* Fallback color preview with pattern */}
            <div
              className="absolute inset-0 bg-blue-600"
              style={{
                backgroundImage: `linear-gradient(135deg, ${template.colorHex || '#1e3a5f'} 0%, ${template.colorHex || '#1e3a5f'}dd 100%)`
              }}
            />
            {/* Decorative pattern - varies by layout type */}
            <div className="absolute inset-0 opacity-30">
              {template.layoutType === 'two-column' ? (
                <>
                  {/* Two column layout visualization */}
                  <div className="absolute top-2 left-2 w-5/12 h-3/5 bg-white/40 rounded-sm space-y-1 p-1">
                    <div className="h-1 bg-white/60 rounded w-2/3" />
                    <div className="h-0.5 bg-white/40 rounded w-full" />
                    <div className="h-0.5 bg-white/40 rounded w-5/6" />
                  </div>
                  <div className="absolute top-2 right-2 w-5/12 space-y-1">
                    <div className="h-6 bg-white/40 rounded-sm" />
                    <div className="h-0.5 bg-white/30 rounded w-3/4" />
                    <div className="h-0.5 bg-white/30 rounded w-full" />
                  </div>
                </>
              ) : (
                <>
                  {/* Single column layout visualization */}
                  <div className="absolute top-2 left-2 w-1/3 h-1/4 bg-white/40 rounded-sm" />
                  <div className="absolute top-2 right-2 w-1/4 h-1/4 bg-white/20 rounded-full" />
                  <div className="absolute bottom-2 left-2 right-2 space-y-1">
                    <div className="h-1 bg-white/40 rounded w-3/4" />
                    <div className="h-1 bg-white/30 rounded w-full" />
                    <div className="h-1 bg-white/30 rounded w-5/6" />
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Selection check */}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-600/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-full p-1.5 shadow-lg">
              <Check className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        )}

        {/* Top badges - always visible */}
        <div className="absolute top-1 left-1 flex gap-1 z-10">
          {/* Layout type indicator */}
          {template.layoutType && (
            <span className="bg-black/60 backdrop-blur-sm p-1 rounded" title={template.layoutType}>
              {template.layoutType === 'two-column' ? (
                <Columns2 className="h-2.5 w-2.5 text-white" />
              ) : template.layoutType === 'one-page' ? (
                <FileImage className="h-2.5 w-2.5 text-white" />
              ) : (
                <FileText className="h-2.5 w-2.5 text-white" />
              )}
            </span>
          )}
          {template.atsCompatibility === 'ATS-Safe' && (
            <span className="bg-emerald-600 text-[8px] px-1.5 py-0.5 rounded-full text-white font-bold">
              ATS
            </span>
          )}
          {template.isNew && (
            <span className="bg-rose-600 text-[8px] px-1.5 py-0.5 rounded-full text-white font-bold">
              NEW
            </span>
          )}
        </div>

        {/* Right badges - show on hover */}
        <div className="absolute top-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {template.isPopular && (
            <span className="bg-amber-500 text-[8px] px-1.5 py-0.5 rounded-full text-white font-semibold">
              ★
            </span>
          )}
          {template.supportsDocx && (
            <span className="bg-blue-600 text-[8px] px-1.5 py-0.5 rounded-full text-white font-semibold">
              DOCX
            </span>
          )}
        </div>

        {/* Template name overlay - always visible on compact */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-white text-[10px] py-2 pb-1.5 text-center transition-all duration-300 px-1">
          <div className="font-semibold truncate">{template.name}</div>
          {template.colorName && template.colorName !== template.name && (
            <div className="text-[8px] text-white/80 truncate mt-0.5">{template.colorName}</div>
          )}
        </div>

        {/* Hover info overlay */}
        <div className="absolute inset-0 bg-black/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white text-[9px] p-2 gap-1 z-20">
          <div className="font-bold text-[11px] text-center leading-tight mb-1">{template.name}</div>
          {template.description && (
            <div className="text-center line-clamp-2 text-white/90 leading-tight">{template.description}</div>
          )}
          <div className="flex flex-wrap gap-1 justify-center mt-1">
            {template.atsCompatibility && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[8px]">{template.atsCompatibility}</span>
            )}
            {template.designStyle && (
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[8px]">{template.designStyle}</span>
            )}
          </div>
        </div>
      </button>
    );
  }

  if (variant === 'grid') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'group relative p-3 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-xl hover:-translate-y-1 h-full flex flex-col',
          selected
            ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50 shadow-sm'
            : 'border-gray-200 hover:border-blue-300 bg-white'
        )}
      >
        {/* Large Preview Thumbnail */}
        <div className="relative mb-3 rounded-lg overflow-hidden aspect-[3/4] bg-gray-100">
          {template.preview ? (
            <img
              src={template.preview}
              alt={template.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className="w-full h-full relative"
              style={{
                background: `linear-gradient(135deg, ${template.colorHex || '#1e3a5f'} 0%, ${template.colorHex || '#1e3a5f'}dd 100%)`
              }}
            >
              {/* Enhanced pattern for larger preview */}
              <div className="absolute inset-0 opacity-30 p-3">
                {template.layoutType === 'two-column' ? (
                  <>
                    <div className="flex gap-2 h-full">
                      <div className="w-7/12 space-y-2">
                        <div className="h-4 bg-white/60 rounded" />
                        <div className="h-1 bg-white/40 rounded w-3/4" />
                        <div className="space-y-1 mt-3">
                          <div className="h-1 bg-white/40 rounded" />
                          <div className="h-1 bg-white/40 rounded w-5/6" />
                          <div className="h-1 bg-white/40 rounded w-4/5" />
                        </div>
                      </div>
                      <div className="w-5/12 space-y-2">
                        <div className="h-8 bg-white/50 rounded" />
                        <div className="h-6 bg-white/40 rounded" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-6 bg-white/60 rounded mb-2" />
                    <div className="space-y-1">
                      <div className="h-1 bg-white/40 rounded w-3/4" />
                      <div className="h-1 bg-white/40 rounded w-full" />
                      <div className="h-1 bg-white/40 rounded w-5/6" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-4 bg-white/50 rounded" />
                      <div className="h-4 bg-white/40 rounded" />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Selection indicator */}
          {selected && (
            <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1.5 shadow-lg animate-in zoom-in duration-200">
              <Check className="h-4 w-4 text-white" />
            </div>
          )}

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {template.atsCompatibility === 'ATS-Safe' && (
              <span className="bg-emerald-600 text-[9px] px-2 py-0.5 rounded-full text-white font-bold">
                ATS
              </span>
            )}
            {template.isNew && (
              <span className="bg-rose-600 text-[9px] px-2 py-0.5 rounded-full text-white font-bold">
                NEW
              </span>
            )}
          </div>
        </div>

        {/* Template Info */}
        <div className="flex-1">
          <h4 className="font-bold text-sm text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
            {template.name}
          </h4>
          {template.colorName && template.colorName !== template.name && (
            <p className="text-[10px] text-gray-500 mb-2">{template.colorName}</p>
          )}
        </div>

        {/* Compact info badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {template.primaryCategory && (
            <span
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-semibold',
                getCategoryColor(template.primaryCategory)
              )}
            >
              {template.primaryCategory}
            </span>
          )}
          {template.designStyle && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700">
              {template.designStyle}
            </span>
          )}
          {template.isPopular && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500 text-white">
              Popular
            </span>
          )}
        </div>

        {/* Description */}
        {template.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        )}
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full p-3 rounded-lg border-2 transition-all duration-300 text-left hover:shadow-lg hover:scale-[1.02]',
        selected
          ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50 shadow-sm'
          : 'border-gray-200 hover:border-blue-300 bg-white'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Preview image or color */}
        {template.preview ? (
          <img
            src={template.preview}
            alt={template.name}
            className="w-10 h-10 rounded-md flex-shrink-0 shadow-md object-cover ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-md flex-shrink-0 shadow-md ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${template.colorHex || '#1e3a5f'} 0%, ${template.colorHex || '#1e3a5f'}dd 100%)`
            }}
          >
            {/* Mini pattern indicator */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-sm" />
              <div className="absolute bottom-1 left-1 right-1 space-y-0.5">
                <div className="h-0.5 bg-white/50 rounded w-2/3" />
                <div className="h-0.5 bg-white/40 rounded w-full" />
              </div>
            </div>
          </div>
        )}

        {/* Template info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors duration-300">
              {template.name}
            </h4>
            {selected && (
              <div className="flex-shrink-0 bg-blue-600 rounded-full p-0.5 shadow-md animate-in zoom-in duration-200">
                <Check className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {template.atsCompatibility && (
              <span
                className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded-full font-semibold shadow-sm transition-all duration-300 hover:scale-105',
                  getATSBadgeColor(template.atsCompatibility)
                )}
              >
                {template.atsCompatibility}
              </span>
            )}
            {template.isNew && (
              <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold transition-all duration-300 hover:scale-105">
                New
              </span>
            )}
            {template.isPopular && (
              <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold transition-all duration-300 hover:scale-105">
                Popular
              </span>
            )}
            {template.supportsDocx && (
              <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold transition-all duration-300 hover:scale-105">
                DOCX
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
