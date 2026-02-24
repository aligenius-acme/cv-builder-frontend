'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
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

export default function AdminPromptsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/resumes');
      return;
    }
    loadPrompts();
  }, [user, router]);

  const loadPrompts = async () => {
    try {
      const response = await api.getAdminPrompts();
      if (response.success && response.data) {
        setPrompts(response.data);
      }
    } catch (error) {
      toast.error('Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt.id);
    setEditedText(prompt.promptText);
    setExpandedPrompt(prompt.id);
  };

  const handleCancel = () => {
    setEditingPrompt(null);
    setEditedText('');
  };

  const handleSave = async (promptId: string) => {
    setIsSaving(true);
    try {
      const response = await api.updateAdminPrompt(promptId, { promptText: editedText });
      if (response.success) {
        toast.success('Prompt updated successfully');
        setEditingPrompt(null);
        setEditedText('');
        loadPrompts();
      }
    } catch (error) {
      toast.error('Failed to update prompt');
    } finally {
      setIsSaving(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  // Group prompts by name
  const groupedPrompts = prompts.reduce((acc, prompt) => {
    if (!acc[prompt.name]) {
      acc[prompt.name] = [];
    }
    acc[prompt.name].push(prompt);
    return acc;
  }, {} as Record<string, Prompt[]>);

  // Get the active prompt for each name
  const activePrompts = Object.entries(groupedPrompts).map(([name, versions]) => {
    const active = versions.find(p => p.isActive) || versions[0];
    return { name, active, versions };
  });

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI Prompt Management</h1>
              <p className="text-slate-500">
                Manage AI prompts used for resume customization
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card variant="elevated" className="border-amber-200 bg-amber-50/50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Prompt Versioning</p>
                <p className="text-sm text-amber-700">
                  When you edit a prompt, a new version is created. Previous versions are preserved for rollback if needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prompts List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : activePrompts.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No prompts found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activePrompts.map(({ name, active, versions }) => (
              <Card key={name} variant="elevated">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        {name.replace(/_/g, ' ')}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Version {active.version}
                        </span>
                        <span>Updated {formatDate(active.createdAt)}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {active.isActive && (
                        <Badge variant="success" size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setExpandedPrompt(expandedPrompt === name ? null : name)}
                      >
                        {expandedPrompt === name ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedPrompt === name && (
                  <CardContent>
                    {editingPrompt === active.id ? (
                      <div className="space-y-4">
                        <textarea
                          value={editedText}
                          onChange={(e) => setEditedText(e.target.value)}
                          rows={12}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-y"
                        />
                        <div className="flex items-center gap-3">
                          <Button
                            variant="primary"
                            onClick={() => handleSave(active.id)}
                            isLoading={isSaving}
                            leftIcon={<Save className="h-4 w-4" />}
                          >
                            Save New Version
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            leftIcon={<RotateCcw className="h-4 w-4" />}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                            {active.promptText}
                          </pre>
                        </div>
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(active)}
                          >
                            Edit Prompt
                          </Button>
                          {versions.length > 1 && (
                            <p className="text-sm text-slate-400">
                              {versions.length} versions available
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
