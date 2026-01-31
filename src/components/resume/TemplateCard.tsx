'use client';

import { Check } from 'lucide-react';
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
      'ATS-Professional': 'bg-blue-100 text-blue-700',
      'Tech-Startup': 'bg-emerald-100 text-emerald-700',
      'Creative-Design': 'bg-purple-100 text-purple-700',
      'Academic-Research': 'bg-amber-100 text-amber-700',
      'Entry-Student': 'bg-pink-100 text-pink-700',
      'Executive-Leadership': 'bg-indigo-100 text-indigo-700',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-700';
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'group relative aspect-square rounded-lg border-2 transition-all overflow-hidden',
          selected
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
        {selected && (
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
          {template.atsCompatibility === 'ATS-Safe' && (
            <span className="bg-green-400 text-[8px] px-1 py-0.5 rounded text-green-900 font-medium">
              ATS
            </span>
          )}
          {template.supportsDocx && (
            <span className="bg-blue-400 text-[8px] px-1 py-0.5 rounded text-white font-medium">
              DOCX
            </span>
          )}
        </div>

        {/* Color name on hover */}
        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] py-1 text-center opacity-0 group-hover:opacity-100 transition-opacity truncate px-1">
          {template.colorName || template.name}
        </div>
      </button>
    );
  }

  if (variant === 'grid') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'group relative p-4 rounded-xl border-2 transition-all text-left hover:shadow-lg',
          selected
            ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 bg-white'
        )}
      >
        {/* Header with color preview */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-lg flex-shrink-0 shadow-sm"
            style={{ backgroundColor: template.colorHex || '#1e3a5f' }}
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 truncate">
              {template.name}
            </h4>
            {template.colorName && (
              <p className="text-xs text-gray-500">{template.colorName}</p>
            )}
          </div>
          {selected && <Check className="h-5 w-5 text-blue-600 flex-shrink-0" />}
        </div>

        {/* Description */}
        {template.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
            {template.description}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {template.atsCompatibility && (
            <span
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                getATSBadgeColor(template.atsCompatibility)
              )}
            >
              {template.atsCompatibility}
            </span>
          )}
          {template.primaryCategory && (
            <span
              className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                getCategoryColor(template.primaryCategory)
              )}
            >
              {template.primaryCategory}
            </span>
          )}
          {template.isNew && (
            <span className="bg-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              New
            </span>
          )}
          {template.isPopular && (
            <span className="bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              Popular
            </span>
          )}
          {template.isFeatured && (
            <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              Featured
            </span>
          )}
          {template.supportsDocx && (
            <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
              DOCX
            </span>
          )}
        </div>

        {/* Industry tags */}
        {template.industryTags && template.industryTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {template.industryTags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {template.industryTags.length > 3 && (
              <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                +{template.industryTags.length - 3}
              </span>
            )}
          </div>
        )}
      </button>
    );
  }

  // Default variant
  return (
    <button
      onClick={onClick}
      className={cn(
        'group w-full p-3 rounded-lg border-2 transition-all text-left hover:shadow-md',
        selected
          ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Color preview */}
        <div
          className="w-10 h-10 rounded-md flex-shrink-0 shadow-sm"
          style={{ backgroundColor: template.colorHex || '#1e3a5f' }}
        />

        {/* Template info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {template.name}
            </h4>
            {selected && <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {template.atsCompatibility && (
              <span
                className={cn(
                  'text-[9px] px-1.5 py-0.5 rounded font-medium',
                  getATSBadgeColor(template.atsCompatibility)
                )}
              >
                {template.atsCompatibility}
              </span>
            )}
            {template.isNew && (
              <span className="bg-pink-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                New
              </span>
            )}
            {template.isPopular && (
              <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                Popular
              </span>
            )}
            {template.supportsDocx && (
              <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                DOCX
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
