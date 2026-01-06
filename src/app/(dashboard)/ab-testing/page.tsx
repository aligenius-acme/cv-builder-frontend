'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  FlaskConical,
  Plus,
  Play,
  Pause,
  Trophy,
  BarChart3,
  Eye,
  Download,
  MessageSquare,
  Users,
  Calendar,
  ChevronRight,
  X,
  Copy,
  Check,
  Loader2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import api, { ABTest, ABTestVariant, ABTestAnalytics } from '@/lib/api';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';
import PageHeader from '@/components/shared/PageHeader';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { AB_TEST_STATUS_CONFIG } from '@/lib/colors';

export default function ABTestingPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [analytics, setAnalytics] = useState<ABTestAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Create form state
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    targetJobTitle: '',
    targetCompany: '',
    goal: 'response_rate',
    variants: [{ name: 'Version A' }, { name: 'Version B' }],
  });

  useEffect(() => {
    loadTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      loadAnalytics(selectedTest.id);
    }
  }, [selectedTest]);

  const loadTests = async () => {
    try {
      setIsLoading(true);
      const response = await api.getABTests();
      if (response.success && response.data) {
        setTests(response.data);
      }
    } catch (error) {
      toast.error('Failed to load A/B tests');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async (testId: string) => {
    try {
      const response = await api.getABTestAnalytics(testId);
      if (response.success && response.data) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const createTest = async () => {
    if (!newTest.name || newTest.variants.length < 2) {
      toast.error('Please provide a name and at least 2 variants');
      return;
    }

    try {
      const response = await api.createABTest({
        name: newTest.name,
        description: newTest.description || undefined,
        targetJobTitle: newTest.targetJobTitle || undefined,
        targetCompany: newTest.targetCompany || undefined,
        goal: newTest.goal,
        variants: newTest.variants,
      });

      if (response.success && response.data) {
        setTests([response.data, ...tests]);
        setShowCreateModal(false);
        setNewTest({
          name: '',
          description: '',
          targetJobTitle: '',
          targetCompany: '',
          goal: 'response_rate',
          variants: [{ name: 'Version A' }, { name: 'Version B' }],
        });
        toast.success('A/B test created');
      }
    } catch (error) {
      toast.error('Failed to create A/B test');
    }
  };

  const updateStatus = async (testId: string, status: string) => {
    try {
      const response = await api.updateABTestStatus(testId, status);
      if (response.success && response.data) {
        const updatedTest = response.data;
        setTests(tests.map((t) => (t.id === testId ? updatedTest : t)));
        if (selectedTest?.id === testId) {
          setSelectedTest(updatedTest);
        }
        toast.success(`Test ${status.toLowerCase()}`);
      }
    } catch (error) {
      toast.error('Failed to update test status');
    }
  };

  const deleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      await api.deleteABTest(testId);
      setTests(tests.filter((t) => t.id !== testId));
      if (selectedTest?.id === testId) {
        setSelectedTest(null);
        setAnalytics(null);
      }
      toast.success('Test deleted');
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  const updateVariantMetrics = async (variantId: string, field: string, value: number) => {
    if (!selectedTest) return;

    try {
      await api.updateABTestVariantMetrics(selectedTest.id, variantId, {
        [field]: value,
      });
      await loadTests();
      const updated = tests.find((t) => t.id === selectedTest.id);
      if (updated) setSelectedTest(updated);
      await loadAnalytics(selectedTest.id);
      toast.success('Metrics updated');
    } catch (error) {
      toast.error('Failed to update metrics');
    }
  };

  const copyShareLink = (token: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${baseUrl}/shared/${token}`);
    setCopiedToken(token);
    toast.success('Link copied!');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PageHeader
          icon={<FlaskConical className="h-5 w-5" />}
          label="Resume Optimization"
          title="A/B Testing"
          description="Test different resume versions to see which performs better. Track views, downloads, and response rates to optimize your job applications."
          gradient="cyan"
          actions={
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<Plus className="h-5 w-5" />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Test
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tests List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="font-semibold text-slate-900">Your Tests</h2>
            {isLoading ? (
              <Card variant="elevated">
                <CardContent className="py-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
                </CardContent>
              </Card>
            ) : tests.length === 0 ? (
              <Card variant="elevated">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FlaskConical className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No tests yet</h3>
                  <p className="text-slate-500 text-sm mb-4">
                    Create your first A/B test to start optimizing
                  </p>
                  <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    Create Test
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {tests.map((test) => (
                  <Card
                    key={test.id}
                    variant={selectedTest?.id === test.id ? 'elevated' : 'default'}
                    hover
                    className={`cursor-pointer ${selectedTest?.id === test.id ? 'ring-2 ring-indigo-500' : ''}`}
                    onClick={() => setSelectedTest(test)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{test.name}</h3>
                        <Badge className={AB_TEST_STATUS_CONFIG[test.status as keyof typeof AB_TEST_STATUS_CONFIG]?.color}>
                          {AB_TEST_STATUS_CONFIG[test.status as keyof typeof AB_TEST_STATUS_CONFIG]?.label}
                        </Badge>
                      </div>
                      {test.targetJobTitle && (
                        <p className="text-sm text-slate-500 mb-2">{test.targetJobTitle}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {test.variants.length} variants
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {test.variants.reduce((sum, v) => sum + v.views, 0)} views
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Test Details & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedTest ? (
              <Card variant="elevated">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Select a Test
                  </h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Choose a test from the list to view details and analytics
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Test Controls */}
                <Card variant="elevated">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{selectedTest.name}</CardTitle>
                      <p className="text-sm text-slate-500 mt-1">
                        {selectedTest.description || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedTest.status === 'DRAFT' && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Play className="h-4 w-4" />}
                          onClick={() => updateStatus(selectedTest.id, 'RUNNING')}
                        >
                          Start Test
                        </Button>
                      )}
                      {selectedTest.status === 'RUNNING' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Pause className="h-4 w-4" />}
                            onClick={() => updateStatus(selectedTest.id, 'PAUSED')}
                          >
                            Pause
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Trophy className="h-4 w-4" />}
                            onClick={() => updateStatus(selectedTest.id, 'COMPLETED')}
                          >
                            End Test
                          </Button>
                        </>
                      )}
                      {selectedTest.status === 'PAUSED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Play className="h-4 w-4" />}
                          onClick={() => updateStatus(selectedTest.id, 'RUNNING')}
                        >
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTest(selectedTest.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                          <Eye className="h-4 w-4" />
                          <span className="text-xs">Views</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">
                          {selectedTest.variants.reduce((sum, v) => sum + v.views, 0)}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                          <Download className="h-4 w-4" />
                          <span className="text-xs">Downloads</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">
                          {selectedTest.variants.reduce((sum, v) => sum + v.downloads, 0)}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                          <MessageSquare className="h-4 w-4" />
                          <span className="text-xs">Responses</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">
                          {selectedTest.variants.reduce((sum, v) => sum + v.responses, 0)}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl text-center">
                        <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-xs">Interviews</span>
                        </div>
                        <p className="text-xl font-bold text-slate-900">
                          {selectedTest.variants.reduce((sum, v) => sum + v.interviews, 0)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Variants Comparison */}
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="h-5 w-5 text-blue-600" />
                      Variants Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedTest.variants.map((variant, idx) => {
                        const isWinner = analytics?.bestPerformer?.id === variant.id;
                        return (
                          <div
                            key={variant.id}
                            className={`p-4 rounded-xl border ${
                              isWinner ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                                  idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : 'bg-amber-500'
                                }`}>
                                  {String.fromCharCode(65 + idx)}
                                </span>
                                <div>
                                  <h4 className="font-semibold text-slate-900">{variant.name}</h4>
                                  {isWinner && (
                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                      <Trophy className="h-3 w-3" /> Current Leader
                                    </span>
                                  )}
                                </div>
                              </div>
                              {variant.shareToken && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyShareLink(variant.shareToken!);
                                  }}
                                >
                                  {copiedToken === variant.shareToken ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                  Share Link
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-5 gap-4 text-center">
                              <div>
                                <p className="text-2xl font-bold text-slate-900">{variant.views}</p>
                                <p className="text-xs text-slate-500">Views</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-slate-900">{variant.downloads}</p>
                                <p className="text-xs text-slate-500">Downloads</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-slate-900">{variant.applications}</p>
                                <p className="text-xs text-slate-500">Applications</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold text-slate-900">{variant.responses}</p>
                                <p className="text-xs text-slate-500">Responses</p>
                              </div>
                              <div>
                                <p className={`text-2xl font-bold ${
                                  variant.responseRate >= 20 ? 'text-green-600' :
                                  variant.responseRate >= 10 ? 'text-amber-600' : 'text-slate-900'
                                }`}>
                                  {variant.responseRate.toFixed(1)}%
                                </p>
                                <p className="text-xs text-slate-500">Response Rate</p>
                              </div>
                            </div>
                            {/* Manual metrics update */}
                            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-4">
                              <span className="text-sm text-slate-500">Update metrics:</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  className="w-16 px-2 py-1 text-sm border border-slate-200 rounded"
                                  placeholder="Apps"
                                  onBlur={(e) => {
                                    if (e.target.value) {
                                      updateVariantMetrics(variant.id, 'applications', parseInt(e.target.value));
                                    }
                                  }}
                                />
                                <input
                                  type="number"
                                  min="0"
                                  className="w-16 px-2 py-1 text-sm border border-slate-200 rounded"
                                  placeholder="Resp"
                                  onBlur={(e) => {
                                    if (e.target.value) {
                                      updateVariantMetrics(variant.id, 'responses', parseInt(e.target.value));
                                    }
                                  }}
                                />
                                <input
                                  type="number"
                                  min="0"
                                  className="w-16 px-2 py-1 text-sm border border-slate-200 rounded"
                                  placeholder="Int"
                                  onBlur={(e) => {
                                    if (e.target.value) {
                                      updateVariantMetrics(variant.id, 'interviews', parseInt(e.target.value));
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Create Test Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">Create A/B Test</h2>
                  <button onClick={() => setShowCreateModal(false)}>
                    <X className="h-6 w-6 text-slate-400 hover:text-slate-600" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Test Name *</label>
                  <input
                    type="text"
                    value={newTest.name}
                    onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                    placeholder="e.g., Software Engineer Resume Test"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                    placeholder="What are you testing?"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Job Title</label>
                    <input
                      type="text"
                      value={newTest.targetJobTitle}
                      onChange={(e) => setNewTest({ ...newTest, targetJobTitle: e.target.value })}
                      placeholder="e.g., Software Engineer"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Target Company</label>
                    <input
                      type="text"
                      value={newTest.targetCompany}
                      onChange={(e) => setNewTest({ ...newTest, targetCompany: e.target.value })}
                      placeholder="e.g., Google"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Goal</label>
                  <select
                    value={newTest.goal}
                    onChange={(e) => setNewTest({ ...newTest, goal: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="response_rate">Response Rate</option>
                    <option value="interview_rate">Interview Rate</option>
                    <option value="download_rate">Download Rate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Variants</label>
                  <div className="space-y-2">
                    {newTest.variants.map((variant, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                          idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-purple-500' : 'bg-amber-500'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => {
                            const variants = [...newTest.variants];
                            variants[idx].name = e.target.value;
                            setNewTest({ ...newTest, variants });
                          }}
                          className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {newTest.variants.length > 2 && (
                          <button
                            onClick={() => {
                              const variants = newTest.variants.filter((_, i) => i !== idx);
                              setNewTest({ ...newTest, variants });
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {newTest.variants.length < 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewTest({
                            ...newTest,
                            variants: [
                              ...newTest.variants,
                              { name: `Version ${String.fromCharCode(65 + newTest.variants.length)}` },
                            ],
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Variant
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={createTest}>
                  Create Test
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
