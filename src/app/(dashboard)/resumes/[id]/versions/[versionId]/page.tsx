'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import DownloadModal from '@/components/resume/DownloadModal';
import ATSSimulator from '@/components/resume/ATSSimulator';
import ShareModal from '@/components/resume/ShareModal';
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  Sparkles,
  Briefcase,
  Share2,
  ShieldAlert,
  Eye,
  Zap,
  User,
  TrendingUp,
  ChevronRight,
  AlertOctagon,
  Info,
  Wand2,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  PenLine,
  Check,
  Copy,
} from 'lucide-react';
import api from '@/lib/api';
import { ResumeVersion } from '@/types';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedResumeData {
  contact?: {
    name?: string; email?: string; phone?: string; location?: string;
    linkedin?: string; github?: string; website?: string;
  };
  summary?: string;
  experience?: Array<{
    title: string; company: string; dates?: string;
    location?: string; description?: string[];
  }>;
  education?: Array<{ degree: string; institution: string; graduationDate?: string; gpa?: string }>;
  skills?: string[];
  certifications?: string[];
  projects?: Array<{ name: string; description?: string; technologies?: string[]; link?: string }>;
}

interface DiffToken { text: string; type: 'added' | 'removed' | 'unchanged' }

// ─── Word-level diff (LCS) ────────────────────────────────────────────────────

function computeWordDiff(a: string, b: string): DiffToken[] {
  const aWords = (a || '').trim().split(/\s+/).filter(Boolean).slice(0, 500);
  const bWords = (b || '').trim().split(/\s+/).filter(Boolean).slice(0, 500);
  const m = aWords.length, n = bWords.length;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = aWords[i - 1] === bWords[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);

  const result: DiffToken[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aWords[i - 1] === bWords[j - 1]) {
      result.unshift({ text: bWords[j - 1], type: 'unchanged' }); i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ text: bWords[j - 1], type: 'added' }); j--;
    } else {
      result.unshift({ text: aWords[i - 1], type: 'removed' }); i--;
    }
  }
  return result;
}

// Left panel — shows what was removed (crossed out in red), unchanged text plain
const OriginalDiff: React.FC<{ tokens: DiffToken[] }> = ({ tokens }) => (
  <>
    {tokens.map((t, i) =>
      t.type === 'added' ? null :
      t.type === 'removed'
        ? <del key={i} className="bg-red-100 text-red-600 line-through decoration-red-400 rounded-sm px-0.5 not-italic">{t.text}{' '}</del>
        : <span key={i}>{t.text}{' '}</span>
    )}
  </>
);

// Right panel — shows what was added (highlighted in green), unchanged text plain
const UpdatedDiff: React.FC<{ tokens: DiffToken[] }> = ({ tokens }) => (
  <>
    {tokens.map((t, i) =>
      t.type === 'removed' ? null :
      t.type === 'added'
        ? <mark key={i} className="bg-emerald-100 text-emerald-800 not-italic rounded-sm px-0.5">{t.text}{' '}</mark>
        : <span key={i}>{t.text}{' '}</span>
    )}
  </>
);

// ─── Collapsible section block ────────────────────────────────────────────────

interface SectionBlockProps {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  badge?: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const SectionBlock: React.FC<SectionBlockProps> = ({
  icon, iconBg, title, badge, expanded, onToggle, children,
}) => (
  <div className="rounded-xl border border-[var(--border)] overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-[var(--surface)] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} flex-shrink-0`}>
          {icon}
        </div>
        <span className="font-semibold text-[var(--text)] text-sm">{title}</span>
        {badge && (
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {expanded
        ? <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" />
        : <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
      }
    </button>
    {expanded && (
      <div className="border-t border-[var(--border)]">
        {children}
      </div>
    )}
  </div>
);

// ─── AI explanation parser ────────────────────────────────────────────────────

function parseChangesExplanation(text: string): string[] {
  if (!text) return [];
  // Numbered list "1. xxx"
  const numbered = text.match(/\d+\.\s+[^\n]+/g);
  if (numbered && numbered.length >= 2) return numbered.map(s => s.replace(/^\d+\.\s+/, '').trim());
  // Line-broken bullets
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length >= 2) return lines.map(l => l.replace(/^[•\-\*]\s*/, '').trim());
  // Split on sentence boundaries
  const sentences = text.split(/\.\s+(?=[A-Z])/).filter(s => s.trim().length > 15);
  if (sentences.length >= 2) return sentences.map((s, i, arr) => s.trim() + (i < arr.length - 1 ? '.' : ''));
  return [text];
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function VersionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;
  const versionId = params.versionId as string;

  const [version, setVersion] = useState<ResumeVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  // All sections collapsed by default so the page isn't overwhelming
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  // Inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ParsedResumeData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [checkedWins, setCheckedWins] = useState<Set<number>>(new Set());
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => { loadVersion(); }, [resumeId, versionId]);

  const loadVersion = async () => {
    try {
      const response = await api.getResumeVersion(resumeId, versionId);
      if (response.success && response.data) setVersion(response.data);
    } catch {
      toast.error('Failed to load version');
      router.push(`/resumes/${resumeId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    const s = new Set(expandedSections);
    s.has(section) ? s.delete(section) : s.add(section);
    setExpandedSections(s);
  };

  const handleStartEdit = () => {
    if (!version?.tailoredData) return;
    setEditData(JSON.parse(JSON.stringify(version.tailoredData)));
    setCheckedWins(new Set());
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(null);
    setNewSkill('');
    setCheckedWins(new Set());
  };

  const handleSave = async () => {
    if (!editData) return;
    setIsSaving(true);
    try {
      const res = await api.updateVersionContent(resumeId, versionId, editData as Record<string, unknown>);
      if (res.success && res.data) {
        setVersion(prev => prev ? {
          ...prev,
          tailoredData: res.data!.tailoredData as unknown as ResumeVersion['tailoredData'],
          tailoredText: res.data!.tailoredText,
        } : prev);
      }
      setIsEditing(false);
      setEditData(null);
      setNewSkill('');
      toast.success('Changes saved. Run ATS scan to update your score.');
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const removeSkill = (skill: string) => {
    if (!editData) return;
    setEditData({ ...editData, skills: (editData.skills || []).filter(s => s !== skill) });
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed || !editData) return;
    setEditData({ ...editData, skills: [...(editData.skills || []), trimmed] });
    setNewSkill('');
  };

  const updateBullet = (jobIdx: number, bulletIdx: number, value: string) => {
    if (!editData?.experience) return;
    const exp = editData.experience.map((e, i) => {
      if (i !== jobIdx) return e;
      const desc = [...(e.description || [])];
      desc[bulletIdx] = value;
      return { ...e, description: desc };
    });
    setEditData({ ...editData, experience: exp });
  };

  const addBullet = (jobIdx: number) => {
    if (!editData?.experience) return;
    const exp = editData.experience.map((e, i) =>
      i === jobIdx ? { ...e, description: [...(e.description || []), ''] } : e
    );
    setEditData({ ...editData, experience: exp });
  };

  const removeBullet = (jobIdx: number, bulletIdx: number) => {
    if (!editData?.experience) return;
    const exp = editData.experience.map((e, i) => {
      if (i !== jobIdx) return e;
      const desc = (e.description || []).filter((_, j) => j !== bulletIdx);
      return { ...e, description: desc };
    });
    setEditData({ ...editData, experience: exp });
  };

  const addKeywordAsSkill = (keyword: string) => {
    if (!editData) return;
    if ((editData.skills || []).includes(keyword)) return;
    setEditData({ ...editData, skills: [...(editData.skills || []), keyword] });
  };

  const toggleWin = (idx: number) => {
    setCheckedWins(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="text-slate-500">Loading version...</p>
        </div>
      </div>
    );
  }

  if (!version) return null;

  // ─── Clean database fields from experience objects ────────────────────────

  const cleanExperience = (exp: any) => {
    if (!exp || typeof exp !== 'object') return exp;
    const cleaned: any = {
      title: String(exp.title || ''),
      company: String(exp.company || ''),
      location: String(exp.location || ''),
      description: [],
    };
    if (exp.dates) {
      cleaned.dates = String(exp.dates);
    } else if (exp.startDate || exp.endDate || exp.current !== undefined) {
      const start = String(exp.startDate || '');
      const end = exp.current ? 'Present' : String(exp.endDate || '');
      cleaned.dates = start && end ? `${start} - ${end}` : (start || end);
    }
    if (Array.isArray(exp.description)) {
      cleaned.description = exp.description.map((d: any) =>
        typeof d === 'string' ? d : String(d)
      );
    }
    return cleaned;
  };

  const deepCleanData = (data: any): any => {
    if (!data) return undefined;
    if (typeof data !== 'object') return data;
    if (Array.isArray(data)) return data.map(deepCleanData);
    const cleaned: any = {};
    for (const key in data) {
      if (key === 'experience' && Array.isArray(data[key])) {
        cleaned[key] = data[key].map(cleanExperience);
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        cleaned[key] = deepCleanData(data[key]);
      } else {
        cleaned[key] = data[key];
      }
    }
    return cleaned;
  };

  const originalData = deepCleanData((version as any).originalData) as ParsedResumeData | undefined;
  const tailoredData = deepCleanData(version.tailoredData) as ParsedResumeData | undefined;

  // Emergency verify — force-clean any leftover DB fields
  if (tailoredData?.experience) {
    tailoredData.experience.forEach((exp, i) => {
      const keys = Object.keys(exp);
      if (keys.includes('id') || keys.includes('current') || keys.includes('startDate') || keys.includes('endDate')) {
        tailoredData.experience![i] = cleanExperience(exp);
      }
    });
  }

  // ─── Compute change summary metrics ──────────────────────────────────────

  const changeSummary = (() => {
    if (!originalData || !tailoredData) return null;
    const summaryChanged = (originalData.summary || '') !== (tailoredData.summary || '') && Boolean(tailoredData.summary);
    const origSkills = originalData.skills || [];
    const newSkills = tailoredData.skills || [];
    const addedSkillsCount = newSkills.filter(s => !origSkills.includes(s)).length;
    const removedSkillsCount = origSkills.filter(s => !newSkills.includes(s)).length;
    let modifiedBullets = 0;
    tailoredData.experience?.forEach((exp, i) => {
      const origExp = originalData.experience?.[i];
      exp.description?.forEach((desc, j) => {
        if (!origExp?.description?.[j] || desc !== origExp.description[j]) modifiedBullets++;
      });
    });
    return { summaryChanged, addedSkillsCount, removedSkillsCount, modifiedBullets };
  })();

  const changesExplanationBullets = parseChangesExplanation(version.changesExplanation || '');

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <Link href={`/resumes/${resumeId}`}>
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Resume
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">
                {version.jobTitle} at {version.companyName}
              </h1>
              <p className="text-[var(--muted)] text-sm">
                Version {version.versionNumber} · Created {formatDate(version.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleStartEdit}
              leftIcon={<PenLine className="h-5 w-5" />}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowShareModal(true)}
              leftIcon={<Share2 className="h-5 w-5" />}
            >
              Share
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowDownloadModal(true)}
              leftIcon={<Download className="h-5 w-5" />}
            >
              Download
            </Button>
          </div>
        </div>

        {/* ── Change Summary bar ───────────────────────────────────────────── */}
        {changeSummary && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mr-1">
                AI Changes
              </span>

              {changeSummary.summaryChanged && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
                  <PenLine className="h-3 w-3" />
                  Summary rewritten
                </span>
              )}
              {changeSummary.addedSkillsCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
                  <Plus className="h-3 w-3" />
                  {changeSummary.addedSkillsCount} skill{changeSummary.addedSkillsCount !== 1 ? 's' : ''} added
                </span>
              )}
              {changeSummary.removedSkillsCount > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                  <Minus className="h-3 w-3" />
                  {changeSummary.removedSkillsCount} skill{changeSummary.removedSkillsCount !== 1 ? 's' : ''} removed
                </span>
              )}
              {changeSummary.modifiedBullets > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700">
                  <Sparkles className="h-3 w-3" />
                  {changeSummary.modifiedBullets} bullet{changeSummary.modifiedBullets !== 1 ? 's' : ''} enhanced
                </span>
              )}
              {!changeSummary.summaryChanged && changeSummary.addedSkillsCount === 0 && changeSummary.removedSkillsCount === 0 && changeSummary.modifiedBullets === 0 && (
                <span className="text-xs text-[var(--muted)]">No detected changes — content was likely re-ordered or rephrased</span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-xs font-semibold text-white ml-auto">
                <TrendingUp className="h-3 w-3" />
                ATS: {version.atsScore}%
              </span>
            </div>
          </div>
        )}

        {/* ── Inline Edit Panel ────────────────────────────────────────────── */}
        {isEditing && editData && (
          <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] border-l-4 border-l-blue-600 overflow-hidden">

            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-[var(--border)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 flex-shrink-0">
                <PenLine className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)]">Edit Tailored Resume</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">Changes are saved to this version only</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                <Button variant="primary" size="sm" isLoading={isSaving} onClick={handleSave}>Save Changes</Button>
              </div>
            </div>

            {/* Two-column body */}
            <div className="grid lg:grid-cols-[1fr_320px] divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">

              {/* ── Left: edit form ── */}
              <div className="p-5 space-y-6">

                {/* Summary */}
                {editData.summary !== undefined && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Summary</label>
                    <textarea
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--text)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                      rows={4}
                      value={editData.summary || ''}
                      onChange={e => setEditData({ ...editData, summary: e.target.value })}
                    />
                  </div>
                )}

                {/* Skills */}
                {editData.skills !== undefined && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {(editData.skills || []).map((skill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300"
                        >
                          {skill}
                          <button onClick={() => removeSkill(skill)} className="ml-1 text-blue-400 hover:text-blue-600 leading-none">×</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <input
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Add skill..."
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      />
                      <Button variant="outline" size="sm" onClick={addSkill}>Add</Button>
                    </div>
                  </div>
                )}

                {/* Experience bullets */}
                {editData.experience && editData.experience.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Experience</label>
                    <div className="space-y-4">
                      {editData.experience.map((job, jobIdx) => (
                        <div key={jobIdx} className="rounded-lg border border-[var(--border)] overflow-hidden">
                          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border)]">
                            <span className="text-sm font-semibold text-[var(--text)]">{job.title}</span>
                            {job.company && <span className="text-sm text-blue-600 font-medium ml-2">at {job.company}</span>}
                          </div>
                          <div className="p-3 space-y-2">
                            {(job.description || []).map((bullet, bulletIdx) => (
                              <div key={bulletIdx} className="flex items-start gap-2">
                                <textarea
                                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                  rows={2}
                                  value={bullet}
                                  onChange={e => updateBullet(jobIdx, bulletIdx, e.target.value)}
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeBullet(jobIdx, bulletIdx)} className="flex-shrink-0 mt-1">
                                  <Minus className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                            <Button variant="ghost" size="sm" leftIcon={<Plus className="h-3 w-3" />} onClick={() => addBullet(jobIdx)}>
                              Add bullet
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right: ATS hints ── */}
              <div className="p-5 space-y-5 bg-slate-50/60 dark:bg-slate-900/20">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 flex-shrink-0">
                    <Zap className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-[var(--text)]">ATS Suggestions</span>
                </div>

                {version.atsDetails ? (
                  <>
                    {/* Section scores */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Section Scores</label>
                      {Object.entries(version.atsDetails.sectionScores).map(([section, score]) => (
                        <div key={section} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-[var(--text)] capitalize">{section}</span>
                            <span className={`font-semibold ${score < 50 ? 'text-red-500' : score < 70 ? 'text-amber-500' : 'text-emerald-600'}`}>{score}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${score < 50 ? 'bg-red-500' : score < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Missing keywords */}
                    {version.atsDetails.missingKeywords?.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Missing Keywords</label>
                        <p className="text-xs text-[var(--muted)]">Click to add directly to skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {version.atsDetails.missingKeywords.slice(0, 20).map((kw, i) => {
                            const added = (editData.skills || []).includes(kw);
                            return (
                              <button
                                key={i}
                                onClick={() => addKeywordAsSkill(kw)}
                                disabled={added}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                  added
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 cursor-default'
                                    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 cursor-pointer'
                                }`}
                              >
                                {added ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
                                {kw}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quick wins */}
                    {version.atsDetails.quickWins && version.atsDetails.quickWins.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Quick Wins</label>
                        <div className="space-y-2">
                          {version.atsDetails.quickWins.map((win, i) => (
                            <button
                              key={i}
                              onClick={() => toggleWin(i)}
                              className="flex items-start gap-2.5 w-full text-left group"
                            >
                              <div className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                                checkedWins.has(i) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-400'
                              }`}>
                                {checkedWins.has(i) && <Check className="h-2.5 w-2.5 text-white" />}
                              </div>
                              <span className={`text-xs leading-relaxed transition-colors ${
                                checkedWins.has(i) ? 'line-through text-[var(--muted)]' : 'text-[var(--text)]'
                              }`}>{win}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Critical recommendations */}
                    {version.atsDetails.detailedRecommendations?.criticalIssues && version.atsDetails.detailedRecommendations.criticalIssues.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Suggestions</label>
                        <div className="space-y-2">
                          {version.atsDetails.detailedRecommendations.criticalIssues.slice(0, 5).map((rec, i) => (
                            <div key={i} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 space-y-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                                  rec.priority === 'CRITICAL' ? 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400'
                                  : rec.priority === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                                  : 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'
                                }`}>{rec.priority}</span>
                                {rec.location && <span className="text-xs text-[var(--muted)] truncate">{rec.location}</span>}
                              </div>
                              <p className="text-xs text-[var(--text)] leading-relaxed">{rec.issue}</p>
                              {rec.suggestedText && (
                                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-2.5">
                                  <p className="text-xs text-emerald-800 dark:text-emerald-300 italic leading-relaxed">&ldquo;{rec.suggestedText}&rdquo;</p>
                                  <button
                                    onClick={() => copyToClipboard(rec.suggestedText, i)}
                                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 transition-colors"
                                  >
                                    {copiedIdx === i
                                      ? <><Check className="h-3 w-3" /> Copied!</>
                                      : <><Copy className="h-3 w-3" /> Copy suggestion</>
                                    }
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback if ATS ran but no extra data */}
                    {!version.atsDetails.quickWins?.length && !version.atsDetails.detailedRecommendations?.criticalIssues?.length && !version.atsDetails.missingKeywords?.length && (
                      <p className="text-xs text-[var(--muted)] text-center py-4">No specific suggestions — your resume looks well-optimised for this role.</p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-10 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <Zap className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">No ATS scan yet</p>
                      <p className="text-xs text-[var(--muted)] mt-1">Run the ATS scan below to get AI-powered suggestions here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── ATS Simulator ────────────────────────────────────────────────── */}
        <ATSSimulator
          resumeId={resumeId}
          versionId={versionId}
          initialScore={version.atsScore}
          initialAnalysis={version.atsDetails ? {
            ...version.atsDetails,
            score: version.atsScore,
            keywordMatchPercentage: version.atsDetails.keywordMatchPercentage
              || Math.round((version.matchedKeywords?.length || 0) / Math.max((version.matchedKeywords?.length || 0) + (version.missingKeywords?.length || 0), 1) * 100),
            matchedKeywords: version.matchedKeywords?.length
              ? version.matchedKeywords
              : (version.atsDetails.matchedKeywords || []),
            missingKeywords: version.missingKeywords?.length
              ? version.missingKeywords
              : (version.atsDetails.missingKeywords || []),
            sectionScores: version.atsDetails.sectionScores || { summary: 0, experience: 0, skills: 0, education: 0, formatting: 0 },
            formattingIssues: version.atsDetails.formattingIssues || [],
            recommendations: version.atsDetails.recommendations || [],
            atsExtractedView: version.atsDetails.atsExtractedView || '',
            riskyElements: version.atsDetails.riskyElements || [],
            quickWins: version.atsDetails.quickWins || [],
            actionPlan: version.atsDetails.actionPlan,
            honestAssessment: version.atsDetails.honestAssessment,
            competitorComparison: version.atsDetails.competitorComparison,
            detailedRecommendations: version.atsDetails.detailedRecommendations,
          } : undefined}
        />

        {/* ── What Changed (AI explanation — structured) ───────────────────── */}
        {version.changesExplanation && (
          <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <div className="flex items-center gap-3 p-5 border-b border-[var(--border)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 flex-shrink-0">
                <Wand2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--text)]">What Changed & Why</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  How your resume was tailored for {version.jobTitle} at {version.companyName}
                </p>
              </div>
            </div>
            <div className="p-5">
              {changesExplanationBullets.length === 1 ? (
                <p className="text-sm text-[var(--text)] leading-relaxed">{changesExplanationBullets[0]}</p>
              ) : (
                <ul className="space-y-3">
                  {changesExplanationBullets.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-sm text-[var(--text)] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── Before & After Comparison ────────────────────────────────────── */}
        {originalData && tailoredData && (
          <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            {/* Section header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 flex-shrink-0">
                  <ArrowRightLeft className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text)]">Before & After Comparison</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5 flex items-center gap-3">
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-sm bg-red-100 border border-red-300" />
                      Removed words
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
                      Added words
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">

              {/* ── Summary ── */}
              {(originalData.summary || tailoredData.summary) && (() => {
                const tokens = computeWordDiff(originalData.summary || '', tailoredData.summary || '');
                const hasChanges = tokens.some(t => t.type !== 'unchanged');
                return (
                  <SectionBlock
                    id="summary"
                    icon={<User className="h-4 w-4 text-white" />}
                    iconBg="bg-emerald-600"
                    title="Professional Summary"
                    badge={hasChanges ? 'Changed' : 'Unchanged'}
                    expanded={expandedSections.has('summary')}
                    onToggle={() => toggleSection('summary')}
                  >
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
                      <div className="p-4">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                          Original
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {hasChanges ? <OriginalDiff tokens={tokens} /> : originalData.summary}
                        </p>
                      </div>
                      <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10">
                        <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-3">
                          Optimized
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {hasChanges ? <UpdatedDiff tokens={tokens} /> : tailoredData.summary}
                        </p>
                      </div>
                    </div>
                  </SectionBlock>
                );
              })()}

              {/* ── Skills ── */}
              {((originalData.skills && originalData.skills.length > 0) || (tailoredData.skills && tailoredData.skills.length > 0)) && (() => {
                const origSkills = originalData.skills || [];
                const newSkills = tailoredData.skills || [];
                const added = newSkills.filter(s => !origSkills.includes(s));
                const removed = origSkills.filter(s => !newSkills.includes(s));
                const unchanged = newSkills.filter(s => origSkills.includes(s));
                const badgeLabel = added.length > 0 || removed.length > 0
                  ? `+${added.length} / −${removed.length}`
                  : 'Unchanged';
                return (
                  <SectionBlock
                    id="skills"
                    icon={<Zap className="h-4 w-4 text-white" />}
                    iconBg="bg-purple-600"
                    title="Skills"
                    badge={badgeLabel}
                    expanded={expandedSections.has('skills')}
                    onToggle={() => toggleSection('skills')}
                  >
                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
                      {/* Original — show removed in red strikethrough */}
                      <div className="p-4">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                          Original ({origSkills.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {origSkills.length === 0 && (
                            <span className="text-xs text-slate-400">No skills listed</span>
                          )}
                          {origSkills.map((skill, i) => {
                            const isRemoved = !newSkills.includes(skill);
                            return (
                              <span
                                key={i}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                  isRemoved
                                    ? 'bg-red-50 text-red-500 border-red-200 line-through decoration-red-400'
                                    : 'bg-white text-slate-600 border-slate-200'
                                }`}
                              >
                                {isRemoved && <Minus className="h-2.5 w-2.5 flex-shrink-0 no-underline" style={{ textDecoration: 'none' }} />}
                                {skill}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      {/* Optimized — show added in green, unchanged plain */}
                      <div className="p-4 bg-purple-50/20 dark:bg-purple-950/10">
                        <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">
                          Optimized ({newSkills.length})
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {newSkills.length === 0 && (
                            <span className="text-xs text-slate-400">No skills listed</span>
                          )}
                          {unchanged.map((skill, i) => (
                            <span key={`u-${i}`} className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-600 border border-slate-200">
                              {skill}
                            </span>
                          ))}
                          {added.map((skill, i) => (
                            <span key={`a-${i}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-300">
                              <Plus className="h-2.5 w-2.5 flex-shrink-0" />
                              {skill}
                            </span>
                          ))}
                        </div>
                        {(added.length > 0 || removed.length > 0) && (
                          <p className="mt-3 text-xs text-slate-500">
                            {added.length > 0 && <span className="text-emerald-600 font-medium">{added.length} added</span>}
                            {added.length > 0 && removed.length > 0 && <span className="mx-1">·</span>}
                            {removed.length > 0 && <span className="text-red-500 font-medium">{removed.length} removed</span>}
                          </p>
                        )}
                      </div>
                    </div>
                  </SectionBlock>
                );
              })()}

              {/* ── Experience ── */}
              {((originalData?.experience && originalData.experience.length > 0) || (tailoredData?.experience && tailoredData.experience.length > 0)) && (
                <SectionBlock
                  id="experience"
                  icon={<Briefcase className="h-4 w-4 text-white" />}
                  iconBg="bg-blue-600"
                  title="Professional Experience"
                  expanded={expandedSections.has('experience')}
                  onToggle={() => toggleSection('experience')}
                >
                  <div className="divide-y divide-[var(--border)]">
                    {tailoredData?.experience?.map((exp, expIndex) => {
                      const origExp = originalData?.experience?.find(
                        o => o.company === exp.company && o.title === exp.title
                      ) || originalData?.experience?.[expIndex];

                      const origBullets = origExp?.description || [];
                      const newBullets = exp.description || [];
                      const maxLen = Math.max(origBullets.length, newBullets.length);

                      return (
                        <div key={expIndex} className="p-4">
                          {/* Job header */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                            <span className="font-semibold text-sm text-[var(--text)]">{exp.title}</span>
                            <span className="text-sm text-blue-600 font-medium">{exp.company}</span>
                            {exp.dates && <span className="text-xs text-[var(--muted)]">· {exp.dates}</span>}
                          </div>

                          {maxLen === 0 ? (
                            <p className="text-xs text-[var(--muted)] italic ml-4">No bullet points</p>
                          ) : (
                            <div className="space-y-1.5 ml-4">
                              {Array.from({ length: maxLen }, (_, j) => {
                                const orig = origBullets[j];
                                const updated = newBullets[j];

                                // Bullet was added (exists in tailored, not in original)
                                if (!orig && updated) {
                                  return (
                                    <div key={j} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                                      <Plus className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                      <span className="text-xs text-emerald-800 leading-relaxed">{updated}</span>
                                    </div>
                                  );
                                }

                                // Bullet was removed (exists in original, not in tailored)
                                if (orig && !updated) {
                                  return (
                                    <div key={j} className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-200 opacity-75">
                                      <Minus className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                                      <span className="text-xs text-red-600 line-through leading-relaxed">{orig}</span>
                                    </div>
                                  );
                                }

                                // Both exist — compute diff
                                const tokens = computeWordDiff(orig || '', updated || '');
                                const hasChanges = tokens.some(t => t.type !== 'unchanged');

                                // Unchanged bullet
                                if (!hasChanges) {
                                  return (
                                    <div key={j} className="flex items-start gap-2 p-2">
                                      <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0 mt-0.5" />
                                      <span className="text-xs text-slate-500 leading-relaxed">{updated}</span>
                                    </div>
                                  );
                                }

                                // Modified bullet — show diff in two-row format
                                return (
                                  <div key={j} className="rounded-lg border border-[var(--border)] overflow-hidden text-xs">
                                    <div className="flex items-start gap-2 px-3 py-2 bg-red-50/60 border-b border-[var(--border)]">
                                      <Minus className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                                      <p className="leading-relaxed text-slate-600">
                                        <OriginalDiff tokens={tokens} />
                                      </p>
                                    </div>
                                    <div className="flex items-start gap-2 px-3 py-2 bg-emerald-50/60">
                                      <Plus className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                      <p className="leading-relaxed text-slate-700">
                                        <UpdatedDiff tokens={tokens} />
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </SectionBlock>
              )}

            </div>
          </div>
        )}

        {/* ── TruthGuard Warnings ──────────────────────────────────────────── */}
        {version.truthGuardWarnings !== undefined && (
          <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg flex-shrink-0 ${version.truthGuardWarnings.length > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                  <ShieldAlert className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text)] flex items-center gap-2">
                    TruthGuard Integrity Check
                    {version.truthGuardWarnings.length > 0 ? (
                      <span className="text-xs font-medium text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                        {version.truthGuardWarnings.length} {version.truthGuardWarnings.length === 1 ? 'alert' : 'alerts'}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                        All clear
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {version.truthGuardWarnings.length > 0
                      ? 'AI may have added content not in your original — review before submitting'
                      : 'AI stayed faithful to your original resume — no fabrications or inflated numbers detected'}
                  </p>
                </div>
              </div>
              {version.truthGuardWarnings.length > 0 && (
                <div className="flex items-center gap-2">
                  {(() => {
                    const high = version.truthGuardWarnings.filter(w => w.severity === 'high').length;
                    const medium = version.truthGuardWarnings.filter(w => w.severity === 'medium').length;
                    const low = version.truthGuardWarnings.filter(w => w.severity === 'low').length;
                    return (
                      <>
                        {high > 0 && <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">{high} High</span>}
                        {medium > 0 && <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">{medium} Medium</span>}
                        {low > 0 && <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">{low} Low</span>}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* All clear state */}
            {version.truthGuardWarnings.length === 0 && (
              <div className="flex items-center gap-3 p-5 text-emerald-700">
                <Sparkles className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <p className="text-sm font-medium">
                  The AI tailoring was accurate — every skill, credential, and number in this resume matches your original.
                </p>
              </div>
            )}

            {/* Warning cards */}
            {version.truthGuardWarnings.length > 0 && (
              <div className="p-5 space-y-3">
                {version.truthGuardWarnings.map((warning, i) => {
                  type SeverityKey = 'high' | 'medium' | 'low';
                  const cfgMap: Record<SeverityKey, { bg: string; border: string; Icon: React.FC<{ className?: string }>; iconBg: string; iconColor: string; badge: string; label: string }> = {
                    high: { bg: 'bg-red-50', border: 'border-l-4 border-l-red-500 border border-red-200/50', Icon: AlertOctagon, iconBg: 'bg-red-100', iconColor: 'text-red-600', badge: 'bg-red-100 text-red-700', label: 'High' },
                    medium: { bg: 'bg-amber-50', border: 'border-l-4 border-l-amber-500 border border-amber-200/50', Icon: AlertTriangle, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', label: 'Medium' },
                    low: { bg: 'bg-blue-50', border: 'border-l-4 border-l-blue-500 border border-blue-200/50', Icon: Info, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', label: 'Low' },
                  };
                  const cfg = cfgMap[(warning.severity as SeverityKey)] ?? cfgMap.low;
                  const { Icon } = cfg;
                  const typeLabel = warning.type === 'fabrication' ? 'Invented Content'
                    : warning.type === 'inflation' ? 'Inflated Number'
                    : warning.type.replace(/_/g, ' ');
                  return (
                    <div key={i} className={`rounded-xl ${cfg.bg} ${cfg.border} p-4`}>
                      <div className="flex gap-3">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${cfg.iconBg}`}>
                          <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          {/* Type + severity + section */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                            <span className="text-xs font-medium text-[var(--text)] uppercase tracking-wide">
                              {typeLabel}
                            </span>
                            {warning.section && (
                              <span className="text-xs text-[var(--muted)]">— {warning.section}</span>
                            )}
                          </div>

                          {/* Concern */}
                          <p className="text-sm text-[var(--text)] leading-relaxed">{warning.concern}</p>

                          {/* Before / After comparison */}
                          {(warning.original || warning.tailored) && (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {warning.original && (
                                <div className="text-xs bg-white/70 rounded-lg p-2.5 border border-slate-200/50">
                                  <p className="font-semibold text-slate-500 uppercase mb-1">Original</p>
                                  <p className="text-slate-600 italic leading-relaxed">
                                    &quot;{typeof warning.original === 'string' ? warning.original : JSON.stringify(warning.original)}&quot;
                                  </p>
                                </div>
                              )}
                              {warning.tailored && (
                                <div className="text-xs bg-white/70 rounded-lg p-2.5 border border-amber-200/60">
                                  <p className="font-semibold text-amber-600 uppercase mb-1">In Tailored Version</p>
                                  <p className="text-slate-700 italic leading-relaxed">
                                    &quot;{warning.tailored}&quot;
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Recommendation */}
                          {warning.recommendation && (
                            <div className="flex items-start gap-2 text-xs bg-white/50 rounded-lg p-2.5 border border-slate-200/50">
                              <Wand2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                              <p className="text-slate-600">{warning.recommendation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modals */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        resumeId={resumeId}
        versionId={versionId}
        versionNumber={version.versionNumber}
        label={version.companyName}
      />
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        resumeId={resumeId}
        versionId={versionId}
        jobTitle={version.jobTitle}
        companyName={version.companyName}
      />
    </div>
  );
}
