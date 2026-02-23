'use client';

import Link from 'next/link';
import { ChevronDown, Upload, FileText, Loader2 } from 'lucide-react';
import Button from './Button';
import { useModal } from '@/hooks/useModal';

export interface Resume {
  id: string;
  title?: string;
  fileName: string;
}

export interface ResumeSelectorProps {
  /** Array of resumes to display */
  resumes: Resume[];
  /** Currently selected resume ID */
  selectedResumeId: string;
  /** Callback when a resume is selected */
  onSelect: (resumeId: string) => void;
  /** Loading state for fetching resumes */
  isLoading?: boolean;
  /** Optional label for the selector */
  label?: string;
  /** Placeholder text when no resume is selected */
  placeholder?: string;
  /** Color theme for styling (affects icon colors and focus rings) */
  colorTheme?: 'blue' | 'amber' | 'green' | 'purple';
}

export function ResumeSelector({
  resumes,
  selectedResumeId,
  onSelect,
  isLoading = false,
  label = 'Select Resume',
  placeholder = 'Choose a resume...',
  colorTheme = 'blue',
}: ResumeSelectorProps) {
  const dropdown = useModal();
  const selectedResume = resumes.find((resume) => resume.id === selectedResumeId);

  const handleSelectResume = (resumeId: string) => {
    onSelect(resumeId);
    dropdown.close();
  };

  // Color theme classes
  const themeClasses = {
    blue: {
      icon: 'text-blue-600',
      iconBg: 'bg-blue-50',
      focus: 'focus:ring-blue-500/20 focus:border-blue-500',
      hover: 'hover:border-blue-300',
      hoverBg: 'hover:bg-blue-50',
      selectedBg: 'bg-blue-50',
    },
    amber: {
      icon: 'text-amber-600',
      iconBg: 'bg-amber-50',
      focus: 'focus:ring-amber-500/20 focus:border-amber-500',
      hover: 'hover:border-amber-300',
      hoverBg: 'hover:bg-amber-50',
      selectedBg: 'bg-amber-50',
    },
    green: {
      icon: 'text-green-600',
      iconBg: 'bg-green-50',
      focus: 'focus:ring-green-500/20 focus:border-green-500',
      hover: 'hover:border-green-300',
      hoverBg: 'hover:bg-green-50',
      selectedBg: 'bg-green-50',
    },
    purple: {
      icon: 'text-purple-600',
      iconBg: 'bg-purple-50',
      focus: 'focus:ring-purple-500/20 focus:border-purple-500',
      hover: 'hover:border-purple-300',
      hoverBg: 'hover:bg-purple-50',
      selectedBg: 'bg-purple-50',
    },
  };

  const theme = themeClasses[colorTheme];

  // Loading state
  if (isLoading) {
    return (
      <div>
        {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
        <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl">
          <Loader2 className={`h-5 w-5 ${theme.icon} animate-spin`} />
          <span className="text-slate-500">Loading resumes...</span>
        </div>
      </div>
    );
  }

  // Empty state
  if (resumes.length === 0) {
    return (
      <div>
        {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
        <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center">
          <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-medium text-sm">No resumes yet</p>
          <p className="text-xs text-slate-500 mt-1">Upload a resume to get started</p>
          <Link href="/resumes">
            <Button variant="primary" size="sm" className="mt-3" leftIcon={<Upload className="h-4 w-4" />}>
              Upload Resume
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Dropdown with resumes
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={dropdown.toggle}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 ${theme.hover} focus:outline-none focus:ring-2 ${theme.focus} transition-all`}
        >
          {selectedResume ? (
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${theme.iconBg} rounded-lg flex items-center justify-center`}>
                <FileText className={`h-4 w-4 ${theme.icon}`} />
              </div>
              <span className="font-medium">{selectedResume.title || selectedResume.fileName}</span>
            </div>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
          <ChevronDown
            className={`h-5 w-5 text-slate-400 transition-transform ${dropdown.isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {dropdown.isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {resumes.map((resume) => (
              <button
                key={resume.id}
                type="button"
                onClick={() => handleSelectResume(resume.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 ${theme.hoverBg} transition-colors text-left border-b border-slate-100 last:border-0 ${
                  selectedResumeId === resume.id ? theme.selectedBg : ''
                }`}
              >
                <div className={`w-8 h-8 ${theme.iconBg} rounded-lg flex items-center justify-center`}>
                  <FileText className={`h-4 w-4 ${theme.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{resume.title || resume.fileName}</p>
                  <p className="text-xs text-slate-500 truncate">{resume.fileName}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
