'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  ArrowLeft,
  MessageSquare,
  Save,
  RotateCcw,
  CheckCircle,
  Clock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileText,
  Mail,
  TrendingUp,
  PenTool,
  DollarSign,
  BookOpen,
  Plus,
  X,
  Info,
  Code2,
} from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Prompt {
  id: string;
  name: string;
  version: number;
  promptText: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Static metadata ───────────────────────────────────────────────────────────
const PROMPT_META: Record<string, { description: string; category: string; variables?: string[] }> = {
  // Resume Pipeline
  job_analysis: {
    description: 'Extracts structured data from job postings — required/preferred skills, keywords, responsibilities, qualifications.',
    category: 'Resume Pipeline',
    variables: ['{job_description}'],
  },
  resume_customize: {
    description: 'Tailors the resume to a specific job while preserving all metrics and factual accuracy.',
    category: 'Resume Pipeline',
    variables: ['{resume_data}', '{job_data}', '{job_title}', '{company_name}'],
  },
  ats_analysis: {
    description: 'Scores the resume against job keywords with section-by-section recommendations, quick wins, and an action plan.',
    category: 'Resume Pipeline',
    variables: ['{resume_text}', '{job_keywords}'],
  },
  truth_guard: {
    description: 'Compares the original vs tailored resume to detect fabrications or inflated metrics.',
    category: 'Resume Pipeline',
    variables: ['{original_data}', '{tailored_data}'],
  },
  // Cover Letters
  cover_letter: {
    description: 'System instructions for writing honest, targeted cover letters. Candidate data is injected separately.',
    category: 'Cover Letters',
  },
  cover_letter_enhanced: {
    description: 'Cover letters with alternative openings (story/achievement/connection/passion), tone analysis, and subject line options.',
    category: 'Cover Letters',
  },
  // Career Tools
  job_match_score: {
    description: 'Calculates a realistic match percentage between a candidate and a job before applying.',
    category: 'Career Tools',
  },
  quantify_achievements: {
    description: 'Converts vague resume bullets into measurable achievements using realistic placeholder metrics.',
    category: 'Career Tools',
  },
  weakness_detector: {
    description: 'Identifies resume red flags, gaps, clichés, and areas that weaken the candidate\'s position.',
    category: 'Career Tools',
  },
  resume_performance_score: {
    description: 'Scores the resume across 6 categories: impact language, quantification, keywords, readability, uniqueness, completeness.',
    category: 'Career Tools',
  },
  skill_gap_analysis: {
    description: 'Analyzes missing skills for a target role with realistic learning paths and honest time estimates.',
    category: 'Career Tools',
  },
  // Writing Assistant
  writing_suggestions: {
    description: 'Powers AI Writing Assistant — controls improve, expand, quantify, action-verb, and complete operations on bullet points.',
    category: 'Writing Assistant',
  },
  generate_bullets: {
    description: 'Generates 5 realistic experience bullet points from a job title and key responsibilities.',
    category: 'Writing Assistant',
  },
  // Salary Analyzer
  salary_analysis: {
    description: 'Provides realistic salary ranges, percentile data, market outlook, and negotiation tips for a role and location.',
    category: 'Salary Analyzer',
  },
  offer_comparison: {
    description: 'Compares multiple job offers across total compensation, benefits, career trajectory, and work-life balance.',
    category: 'Salary Analyzer',
  },
  negotiation_script: {
    description: 'Generates word-for-word negotiation scripts, counter-offer templates, benefits scripts, and email drafts.',
    category: 'Salary Analyzer',
  },
  // Interview Prep
  interview_questions: {
    description: 'Generates 10 realistic interview questions with red flag answers, follow-ups, STAR templates, and scoring rubrics.',
    category: 'Interview Prep',
  },
  answer_evaluation: {
    description: 'Evaluates interview answers on a 1-10 scale with honest feedback, identified issues, and an improved example.',
    category: 'Interview Prep',
  },
};

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; borderColor: string; bgColor: string }> = {
  'Resume Pipeline':   { icon: FileText,    color: 'text-blue-600',   borderColor: 'border-blue-200 dark:border-blue-900/40',   bgColor: 'bg-blue-50 dark:bg-blue-900/10' },
  'Cover Letters':     { icon: Mail,        color: 'text-purple-600', borderColor: 'border-purple-200 dark:border-purple-900/40', bgColor: 'bg-purple-50 dark:bg-purple-900/10' },
  'Career Tools':      { icon: TrendingUp,  color: 'text-emerald-600',borderColor: 'border-emerald-200 dark:border-emerald-900/40',bgColor: 'bg-emerald-50 dark:bg-emerald-900/10' },
  'Writing Assistant': { icon: PenTool,     color: 'text-amber-600',  borderColor: 'border-amber-200 dark:border-amber-900/40',  bgColor: 'bg-amber-50 dark:bg-amber-900/10' },
  'Salary Analyzer':   { icon: DollarSign,  color: 'text-teal-600',   borderColor: 'border-teal-200 dark:border-teal-900/40',    bgColor: 'bg-teal-50 dark:bg-teal-900/10' },
  'Interview Prep':    { icon: BookOpen,    color: 'text-rose-600',   borderColor: 'border-rose-200 dark:border-rose-900/40',    bgColor: 'bg-rose-50 dark:bg-rose-900/10' },
};

const CATEGORY_ORDER = ['Resume Pipeline', 'Cover Letters', 'Career Tools', 'Writing Assistant', 'Salary Analyzer', 'Interview Prep'];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AdminPromptsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [expandedName, setExpandedName] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newText, setNewText] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') { router.push('/resumes'); return; }
    loadPrompts();
  }, [user, router]);

  const loadPrompts = async () => {
    try {
      const response = await api.getAdminPrompts();
      if (response.success && response.data) setPrompts(response.data);
    } catch { toast.error('Failed to load prompts'); }
    finally { setIsLoading(false); }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingId(prompt.id);
    setEditedText(prompt.promptText);
    setExpandedName(prompt.name);
  };

  const handleCancel = () => { setEditingId(null); setEditedText(''); };

  const handleSave = async (promptId: string) => {
    if (!editedText.trim()) { toast.error('Prompt text cannot be empty'); return; }
    setIsSaving(true);
    try {
      const response = await api.updateAdminPrompt(promptId, { promptText: editedText });
      if (response.success) {
        toast.success('New version saved');
        setEditingId(null);
        setEditedText('');
        loadPrompts();
      }
    } catch { toast.error('Failed to save prompt'); }
    finally { setIsSaving(false); }
  };

  const handleCreate = async () => {
    const safeName = newName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (!safeName || !newText.trim()) { toast.error('Name and prompt text are required'); return; }
    setIsCreating(true);
    try {
      const response = await api.createAdminPrompt({ name: safeName, promptText: newText });
      if (response.success) {
        toast.success(`Prompt "${safeName}" created`);
        setShowCreate(false);
        setNewName('');
        setNewText('');
        loadPrompts();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to create prompt');
    } finally { setIsCreating(false); }
  };

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  if (user?.role !== 'ADMIN') return null;

  // Build active-prompt map grouped by category
  const byName: Record<string, { active: Prompt; versions: Prompt[] }> = {};
  const grouped: Record<string, typeof byName> = {};

  prompts.forEach(p => {
    if (!byName[p.name]) byName[p.name] = { active: p, versions: [] };
    byName[p.name].versions.push(p);
    if (p.isActive) byName[p.name].active = p;
  });

  Object.entries(byName).forEach(([name, data]) => {
    const cat = PROMPT_META[name]?.category ?? 'Other';
    if (!grouped[cat]) grouped[cat] = {};
    grouped[cat][name] = data;
  });

  const totalPrompts = Object.keys(byName).length;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">AI Prompt Management</h1>
              <p className="text-[var(--text-muted)] text-sm mt-0.5">
                {totalPrompts} prompts across {Object.keys(grouped).length} feature areas
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreate(true)}
          >
            New Prompt
          </Button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10">
          <Sparkles className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Prompt Versioning Active</p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
              Every save creates a new version — previous versions are preserved for rollback. The system falls back to built-in defaults if a prompt is missing.
            </p>
          </div>
        </div>

        {/* Prompts */}
        {isLoading ? (
          <LoadingSpinner />
        ) : totalPrompts === 0 ? (
          <Card variant="elevated">
            <CardContent className="py-16 text-center">
              <MessageSquare className="h-12 w-12 text-[var(--border)] mx-auto mb-4" />
              <p className="text-[var(--text-muted)] mb-4">No prompts found. Run the seed script or create one above.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {CATEGORY_ORDER.filter(cat => grouped[cat]).map(cat => {
              const cfg = CATEGORY_CONFIG[cat] ?? CATEGORY_CONFIG['Resume Pipeline'];
              const Icon = cfg.icon;
              const isCollapsed = collapsedCategories.has(cat);
              const entries = Object.entries(grouped[cat]);

              return (
                <div key={cat}>
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-center gap-3 mb-3 group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${cfg.bgColor} ${cfg.borderColor} border`}>
                      <Icon className={`h-4 w-4 ${cfg.color}`} />
                    </div>
                    <h2 className="text-base font-semibold text-[var(--text)]">{cat}</h2>
                    <Badge variant="default" size="sm">{entries.length}</Badge>
                    <div className="ml-auto">
                      {isCollapsed
                        ? <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                        : <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
                      }
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-3 pl-0">
                      {entries.map(([name, { active, versions }]) => {
                        const meta = PROMPT_META[name];
                        const isExpanded = expandedName === name;
                        const isEditing = editingId === active.id;
                        const lineCount = active.promptText.split('\n').length;
                        const charCount = active.promptText.length;

                        return (
                          <Card key={name} variant="elevated" className={`transition-all duration-150 ${isExpanded ? `border-l-4 ${cfg.borderColor.replace('border-', 'border-l-').split(' ')[0]}` : ''}`}>
                            {/* Prompt row */}
                            <button
                              className="w-full px-6 py-4 flex items-start gap-4 text-left hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors rounded-t-xl"
                              onClick={() => setExpandedName(isExpanded ? null : name)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-[var(--text)] text-sm font-mono">{name}</span>
                                  <Badge variant="success" size="sm">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    v{active.version}
                                  </Badge>
                                  {versions.length > 1 && (
                                    <Badge variant="default" size="sm">{versions.length} versions</Badge>
                                  )}
                                </div>
                                {meta?.description && (
                                  <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">{meta.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-1.5 text-xs text-[var(--text-muted)]">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDate(active.createdAt)}
                                  </span>
                                  <span>{lineCount} lines · {charCount.toLocaleString()} chars</span>
                                </div>
                              </div>
                              <div className="flex-shrink-0 mt-0.5">
                                {isExpanded
                                  ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
                                  : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                                }
                              </div>
                            </button>

                            {/* Expanded content */}
                            {isExpanded && (
                              <CardContent className="pt-0 space-y-4">
                                {/* Variable hints */}
                                {meta?.variables && meta.variables.length > 0 && (
                                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/40">
                                    <Code2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Template variables — do not remove these</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {meta.variables.map(v => (
                                          <code key={v} className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded font-mono border border-blue-200 dark:border-blue-800">
                                            {v}
                                          </code>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Prompt text — view or edit */}
                                {isEditing ? (
                                  <div className="space-y-3">
                                    <textarea
                                      value={editedText}
                                      onChange={e => setEditedText(e.target.value)}
                                      rows={Math.min(Math.max(editedText.split('\n').length + 2, 10), 30)}
                                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                                      spellCheck={false}
                                    />
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs text-[var(--text-muted)]">
                                        {editedText.split('\n').length} lines · {editedText.length.toLocaleString()} chars
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={handleCancel} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="primary"
                                          size="sm"
                                          onClick={() => handleSave(active.id)}
                                          isLoading={isSaving}
                                          leftIcon={<Save className="h-3.5 w-3.5" />}
                                        >
                                          Save New Version
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 overflow-auto max-h-96">
                                      <pre className="text-sm text-[var(--text)] whitespace-pre-wrap font-mono leading-relaxed">
                                        {active.promptText}
                                      </pre>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      {meta?.variables && meta.variables.length > 0 ? (
                                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                          <Info className="h-3 w-3" />
                                          Data is injected at runtime — edit only the instructions above
                                        </p>
                                      ) : <span />}
                                      <Button variant="outline" size="sm" onClick={() => handleEdit(active)}>
                                        Edit Prompt
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* "Other" category for custom/unknown prompts */}
            {grouped['Other'] && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700">
                    <MessageSquare className="h-4 w-4 text-slate-500" />
                  </div>
                  <h2 className="text-base font-semibold text-[var(--text)]">Other</h2>
                  <Badge variant="default" size="sm">{Object.keys(grouped['Other']).length}</Badge>
                </div>
                <div className="space-y-3">
                  {Object.entries(grouped['Other']).map(([name, { active }]) => (
                    <Card key={name} variant="elevated">
                      <button
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors rounded-xl"
                        onClick={() => setExpandedName(expandedName === name ? null : name)}
                      >
                        <span className="font-semibold text-[var(--text)] text-sm font-mono">{name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="success" size="sm">v{active.version}</Badge>
                          {expandedName === name ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />}
                        </div>
                      </button>
                      {expandedName === name && (
                        <CardContent className="pt-0 space-y-3">
                          {editingId === active.id ? (
                            <div className="space-y-3">
                              <textarea
                                value={editedText}
                                onChange={e => setEditedText(e.target.value)}
                                rows={12}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                              />
                              <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={handleCancel}>Cancel</Button>
                                <Button variant="primary" size="sm" onClick={() => handleSave(active.id)} isLoading={isSaving} leftIcon={<Save className="h-3.5 w-3.5" />}>Save New Version</Button>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="p-4 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-200 dark:border-zinc-700 max-h-72 overflow-auto">
                                <pre className="text-sm text-[var(--text)] whitespace-pre-wrap font-mono">{active.promptText}</pre>
                              </div>
                              <div className="flex justify-end">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(active)}>Edit Prompt</Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Prompt Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-2xl bg-[var(--surface)] rounded-2xl shadow-[var(--shadow-lg)] border border-[var(--border)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-[var(--text)]">Create New Prompt</h2>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors">
                <X className="h-4 w-4 text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Prompt key <span className="text-[var(--text-muted)] font-normal">(snake_case, e.g. cover_letter_v2)</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="my_custom_prompt"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {newName && (
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Will be saved as: <code className="font-mono bg-slate-100 dark:bg-zinc-700 px-1 rounded">{newName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')}</code>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Prompt text</label>
                <textarea
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  rows={12}
                  placeholder="You are an expert..."
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"
                  spellCheck={false}
                />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-zinc-800 border border-[var(--border)]">
                <Info className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0" />
                <p className="text-xs text-[var(--text-muted)]">
                  Use this key in your backend code via <code className="font-mono bg-white dark:bg-zinc-700 px-1 rounded">getPrompt('your_key')</code> — the system will fetch this from the DB and fall back to the hardcoded default if not found.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-raised)]">
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate} isLoading={isCreating} leftIcon={<Save className="h-4 w-4" />}>
                Create Prompt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
