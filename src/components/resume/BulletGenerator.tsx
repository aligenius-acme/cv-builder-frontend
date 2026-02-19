'use client';

import { useState } from 'react';
import {
  X,
  Sparkles,
  Briefcase,
  Building2,
  Target,
  Trophy,
  ClipboardList,
  Loader2,
  Copy,
  Check,
  Plus,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface BulletGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (bullets: string[]) => void;
  defaultJobTitle?: string;
  defaultCompany?: string;
}

export default function BulletGenerator({
  isOpen,
  onClose,
  onInsert,
  defaultJobTitle = '',
  defaultCompany = '',
}: BulletGeneratorProps) {
  const [jobTitle, setJobTitle] = useState(defaultJobTitle);
  const [company, setCompany] = useState(defaultCompany);
  const [responsibilities, setResponsibilities] = useState('');
  const [achievements, setAchievements] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bullets, setBullets] = useState<string[]>([]);
  const [selectedBullets, setSelectedBullets] = useState<Set<number>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!jobTitle.trim() || !company.trim()) {
      toast.error('Please enter job title and company');
      return;
    }

    setIsLoading(true);
    setBullets([]);
    setSelectedBullets(new Set());

    try {
      const response = await api.generateBulletPoints({
        jobTitle,
        company,
        responsibilities: responsibilities || undefined,
        achievements: achievements || undefined,
        targetRole: targetRole || undefined,
      });

      if (response.success && response.data) {
        setBullets(response.data.bulletPoints);
      }
    } catch (error) {
      toast.error('Failed to generate bullet points');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBullet = (index: number) => {
    const newSelected = new Set(selectedBullets);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedBullets(newSelected);
  };

  const copyBullet = async (bullet: string, index: number) => {
    try {
      await navigator.clipboard.writeText(bullet);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleInsert = () => {
    const selectedItems = Array.from(selectedBullets).map((i) => bullets[i]);
    if (selectedItems.length === 0) {
      toast.error('Please select at least one bullet point');
      return;
    }
    onInsert(selectedItems);
    onClose();
    toast.success(`${selectedItems.length} bullet point(s) inserted`);
  };

  const selectAll = () => {
    setSelectedBullets(new Set(bullets.map((_, i) => i)));
  };

  const selectNone = () => {
    setSelectedBullets(new Set());
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
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">AI Bullet Generator</h2>
                <p className="text-sm text-slate-500">Generate professional resume bullets</p>
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
          <div className="p-5 space-y-5 overflow-y-auto flex-1">
            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Job Title *
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Company *
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <ClipboardList className="h-4 w-4 inline mr-1" />
                Key Responsibilities (optional)
              </label>
              <textarea
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="Briefly describe your main responsibilities..."
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Trophy className="h-4 w-4 inline mr-1" />
                Key Achievements (optional)
              </label>
              <textarea
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="Any metrics, awards, or accomplishments..."
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                <Target className="h-4 w-4 inline mr-1" />
                Target Role (optional)
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Role you're applying for - bullets will be tailored"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              variant="primary"
              onClick={handleGenerate}
              disabled={isLoading}
              leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              className="w-full"
            >
              {isLoading ? 'Generating...' : 'Generate Bullet Points'}
            </Button>

            {/* Generated Bullets */}
            {bullets.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Generated Bullet Points ({selectedBullets.size} selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={selectNone}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {bullets.map((bullet, index) => (
                    <div
                      key={index}
                      onClick={() => toggleBullet(index)}
                      className={cn(
                        'p-3 rounded-xl border cursor-pointer transition-all group',
                        selectedBullets.has(index)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5',
                            selectedBullets.has(index)
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-slate-300'
                          )}
                        >
                          {selectedBullets.has(index) && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <p className="text-sm text-slate-700 flex-1">{bullet}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyBullet(bullet, index);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition-all"
                          title="Copy"
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {bullets.length > 0 && (
            <div className="flex justify-end gap-3 p-5 border-t bg-slate-50 shrink-0">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleInsert}
                disabled={selectedBullets.size === 0}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Insert Selected ({selectedBullets.size})
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
