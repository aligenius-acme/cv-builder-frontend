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
  FileText,
  Plus,
  CheckCircle,
  Crown,
  Shield,
  Loader2,
  X,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  isPremium: boolean;
  isAtsSafe: boolean;
  createdAt: string;
}

export default function AdminTemplatesPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    isDefault: false,
    isPremium: false,
    isAtsSafe: true,
  });

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/resumes');
      return;
    }
    loadTemplates();
  }, [user, router]);

  const loadTemplates = async () => {
    try {
      const response = await api.getAdminTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name) {
      toast.error('Template name is required');
      return;
    }

    setIsCreating(true);
    try {
      const response = await api.createAdminTemplate({
        name: newTemplate.name,
        description: newTemplate.description || undefined,
        templateConfig: {
          // Default template config
          layout: 'single-column',
          colors: {
            primary: '#4F46E5',
            secondary: '#6366F1',
            text: '#1E293B',
          },
          fonts: {
            heading: 'Inter',
            body: 'Inter',
          },
        },
        isDefault: newTemplate.isDefault,
        isPremium: newTemplate.isPremium,
        isAtsSafe: newTemplate.isAtsSafe,
      });
      if (response.success) {
        toast.success('Template created successfully');
        setShowCreateForm(false);
        setNewTemplate({
          name: '',
          description: '',
          isDefault: false,
          isPremium: false,
          isAtsSafe: true,
        });
        loadTemplates();
      }
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setIsCreating(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-mesh">
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
              <h1 className="text-2xl font-bold text-slate-900">Template Management</h1>
              <p className="text-slate-500">
                Manage resume templates
              </p>
            </div>
          </div>
          <Button
            variant="gradient"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreateForm(true)}
          >
            Create Template
          </Button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <Card variant="elevated" className="animate-slide-up">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create New Template</CardTitle>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    placeholder="e.g., Modern Professional"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                    placeholder="Describe the template style and features..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 resize-none"
                  />
                </div>

                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTemplate.isDefault}
                      onChange={(e) => setNewTemplate({ ...newTemplate, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Set as default</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTemplate.isPremium}
                      onChange={(e) => setNewTemplate({ ...newTemplate, isPremium: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">Premium only</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTemplate.isAtsSafe}
                      onChange={(e) => setNewTemplate({ ...newTemplate, isAtsSafe: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">ATS-safe formatting</span>
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isCreating}
                  >
                    Create Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Templates List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : templates.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No templates found</p>
                <p className="text-sm text-slate-400 mt-1">Create your first template to get started</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} variant="elevated" className="hover:border-indigo-200 transition-colors">
                <CardContent className="py-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                        <FileText className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{template.name}</h3>
                        {template.description && (
                          <p className="text-sm text-slate-500 line-clamp-1">{template.description}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {template.isDefault && (
                      <Badge variant="info" size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                    {template.isPremium && (
                      <Badge variant="warning" size="sm">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {template.isAtsSafe && (
                      <Badge variant="success" size="sm">
                        <Shield className="h-3 w-3 mr-1" />
                        ATS-Safe
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-slate-400">
                    Created {formatDate(template.createdAt)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
