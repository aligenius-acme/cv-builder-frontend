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
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ExternalLink,
  Link2,
  Loader2,
  Search,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AffiliateLink {
  id: string;
  skill: string;
  title: string;
  url: string;
  provider: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const PROVIDERS = ['Udemy', 'Coursera', 'LinkedIn Learning', 'Grammarly', 'Other'];

const providerColors: Record<string, string> = {
  Udemy: 'bg-orange-100 text-orange-700',
  Coursera: 'bg-blue-100 text-blue-700',
  'LinkedIn Learning': 'bg-sky-100 text-sky-700',
  Grammarly: 'bg-green-100 text-green-700',
  Other: 'bg-slate-100 text-slate-600',
};

const emptyForm = { skill: '', title: '', url: '', provider: 'Udemy', isActive: true };

export default function AdminAffiliatesPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [isSavingNew, setIsSavingNew] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    loadLinks();
  }, [user]);

  const loadLinks = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAdminAffiliates();
      setLinks(res.data || []);
    } catch {
      toast.error('Failed to load affiliate links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!addForm.skill.trim() || !addForm.title.trim() || !addForm.url.trim()) {
      toast.error('Skill, title, and URL are required');
      return;
    }
    setIsSavingNew(true);
    try {
      const res = await api.createAdminAffiliate(addForm);
      setLinks((prev) => [...prev, res.data].sort((a, b) => a.provider.localeCompare(b.provider) || a.skill.localeCompare(b.skill)));
      setAddForm(emptyForm);
      setShowAddForm(false);
      toast.success('Affiliate link added');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create link');
    } finally {
      setIsSavingNew(false);
    }
  };

  const startEdit = (link: AffiliateLink) => {
    setEditingId(link.id);
    setEditForm({ skill: link.skill, title: link.title, url: link.url, provider: link.provider, isActive: link.isActive });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setIsSavingEdit(true);
    try {
      const res = await api.updateAdminAffiliate(editingId, editForm);
      setLinks((prev) => prev.map((l) => (l.id === editingId ? res.data : l)));
      setEditingId(null);
      toast.success('Affiliate link updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update link');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.deleteAdminAffiliate(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
      toast.success('Affiliate link deleted');
    } catch {
      toast.error('Failed to delete link');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (link: AffiliateLink) => {
    try {
      const res = await api.updateAdminAffiliate(link.id, { isActive: !link.isActive });
      setLinks((prev) => prev.map((l) => (l.id === link.id ? res.data : l)));
      toast.success(res.data.isActive ? 'Link enabled' : 'Link disabled');
    } catch {
      toast.error('Failed to update link');
    }
  };

  const filtered = links.filter(
    (l) =>
      l.skill.toLowerCase().includes(search.toLowerCase()) ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.provider.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, AffiliateLink[]>>((acc, link) => {
    const p = link.provider;
    if (!acc[p]) acc[p] = [];
    acc[p].push(link);
    return acc;
  }, {});

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Link2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">Affiliate Links</h1>
              <p className="text-sm text-[var(--text-secondary)]">
                {links.filter((l) => l.isActive).length} active · {links.length} total ·{' '}
                <span className="text-amber-600 font-medium">Replace placeholder URLs with real tracking links after joining affiliate programs</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadLinks}>
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Link
            </Button>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <strong>Affiliate Programs to join:</strong> Udemy (Impact/Rakuten, 15% commission) · Coursera (CJ Affiliate, up to $45/purchase) · Grammarly (Impact, $20/upgrade) · LinkedIn Learning (Impact, ~35%)
          {' · '}The <code className="bg-amber-100 px-1 rounded">grammarly</code> skill keyword controls the Grammarly CTA URL shown on cover letters.
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search skills, titles, providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
          />
        </div>

        {/* Add form */}
        {showAddForm && (
          <Card variant="elevated" className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" />
                New Affiliate Link
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Skill Keyword *</label>
                  <input
                    type="text"
                    placeholder="e.g. python, grammarly"
                    value={addForm.skill}
                    onChange={(e) => setAddForm({ ...addForm, skill: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
                  />
                  <p className="text-xs text-slate-400 mt-1">Must match exactly what AI returns as a skill</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Course / Product Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Complete Python Bootcamp"
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Provider</label>
                  <select
                    value={addForm.provider}
                    onChange={(e) => setAddForm({ ...addForm, provider: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
                  >
                    {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Affiliate URL *</label>
                  <input
                    type="url"
                    placeholder="https://udemy.com/course/...?affid=YOUR_ID"
                    value={addForm.url}
                    onChange={(e) => setAddForm({ ...addForm, url: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900 font-mono"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addForm.isActive}
                      onChange={(e) => setAddForm({ ...addForm, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="primary" size="sm" onClick={handleCreate} disabled={isSavingNew}>
                  {isSavingNew ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
                  Save Link
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setShowAddForm(false); setAddForm(emptyForm); }}>
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Links grouped by provider */}
        {Object.keys(grouped).length === 0 ? (
          <Card variant="elevated">
            <CardContent className="py-16 text-center">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">{search ? 'No links match your search' : 'No affiliate links yet'}</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([provider, providerLinks]) => (
            <Card key={provider} variant="elevated">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${providerColors[provider] || providerColors.Other}`}>
                    {provider}
                  </span>
                  <span className="text-slate-400 font-normal text-sm">{providerLinks.length} link{providerLinks.length !== 1 ? 's' : ''}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-slate-100">
                  {providerLinks.map((link) => (
                    <div key={link.id} className="py-3">
                      {editingId === link.id ? (
                        // ── Edit row ──
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Skill keyword</label>
                            <input
                              type="text"
                              value={editForm.skill}
                              onChange={(e) => setEditForm({ ...editForm, skill: e.target.value })}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Provider</label>
                            <select
                              value={editForm.provider}
                              onChange={(e) => setEditForm({ ...editForm, provider: e.target.value })}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900"
                            >
                              {PROVIDERS.map((p) => <option key={p}>{p}</option>)}
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Affiliate URL</label>
                            <input
                              type="url"
                              value={editForm.url}
                              onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-slate-900 font-mono"
                            />
                          </div>
                          <div className="flex items-end gap-2 pb-0.5">
                            <Button variant="primary" size="sm" onClick={handleUpdate} disabled={isSavingEdit}>
                              {isSavingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                              Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                              <X className="h-3.5 w-3.5 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // ── Display row ──
                        <div className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">{link.skill}</code>
                              {!link.isActive && <Badge className="bg-slate-100 text-slate-400 text-xs">Disabled</Badge>}
                              {link.skill === 'grammarly' && (
                                <Badge className="bg-green-100 text-green-700 text-xs">Grammarly CTA</Badge>
                              )}
                            </div>
                            <p className="text-sm font-medium text-slate-900 truncate">{link.title}</p>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:text-blue-700 hover:underline font-mono truncate flex items-center gap-1 max-w-md"
                            >
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              {link.url}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Active toggle */}
                            <button
                              onClick={() => toggleActive(link)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${link.isActive ? 'bg-blue-600' : 'bg-slate-200'}`}
                              title={link.isActive ? 'Disable' : 'Enable'}
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${link.isActive ? 'translate-x-4' : 'translate-x-1'}`} />
                            </button>
                            <Button variant="ghost" size="sm" onClick={() => startEdit(link)} className="h-8 w-8 p-0">
                              <Pencil className="h-3.5 w-3.5 text-slate-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(link.id)}
                              disabled={deletingId === link.id}
                              className="h-8 w-8 p-0 hover:text-red-600"
                            >
                              {deletingId === link.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
