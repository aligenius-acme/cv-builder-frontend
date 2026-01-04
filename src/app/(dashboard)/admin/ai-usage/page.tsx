'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Cpu,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Clock,
  Zap,
  Loader2,
  User,
  TrendingUp,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AILog {
  id: string;
  userId: string;
  operation: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  durationMs: number;
  estimatedCost: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
}

interface Aggregates {
  totalTokens: number;
  totalCost: string;
  avgDuration: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminAIUsagePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [logs, setLogs] = useState<AILog[]>([]);
  const [aggregates, setAggregates] = useState<Aggregates | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [operationFilter, setOperationFilter] = useState('');

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/resumes');
      return;
    }
    loadAIUsage();
  }, [user, router, page, operationFilter]);

  const loadAIUsage = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminAIUsage(page, 50, undefined, operationFilter || undefined);
      if (response.success && response.data) {
        setLogs(response.data.logs);
        setAggregates(response.data.aggregates);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to load AI usage data');
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  const getOperationBadge = (operation: string) => {
    switch (operation) {
      case 'RESUME_PARSE':
        return <Badge variant="info" size="sm">Parse</Badge>;
      case 'RESUME_CUSTOMIZE':
        return <Badge variant="success" size="sm">Customize</Badge>;
      case 'COVER_LETTER':
        return <Badge variant="warning" size="sm">Cover Letter</Badge>;
      case 'ATS_SIMULATE':
        return <Badge variant="gradient" size="sm">ATS Sim</Badge>;
      default:
        return <Badge variant="default" size="sm">{operation}</Badge>;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">AI Usage Monitor</h1>
              <p className="text-slate-500">
                Track API usage and costs
              </p>
            </div>
          </div>
        </div>

        {/* Aggregate Stats */}
        {aggregates && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="elevated">
              <CardContent className="py-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Tokens</p>
                    <p className="text-2xl font-bold text-slate-900">{formatTokens(aggregates.totalTokens)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="py-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Cost</p>
                    <p className="text-2xl font-bold text-slate-900">${aggregates.totalCost}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardContent className="py-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Avg Duration</p>
                    <p className="text-2xl font-bold text-slate-900">{formatDuration(aggregates.avgDuration)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card variant="elevated">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <select
                value={operationFilter}
                onChange={(e) => {
                  setOperationFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="">All Operations</option>
                <option value="RESUME_PARSE">Resume Parse</option>
                <option value="RESUME_CUSTOMIZE">Resume Customize</option>
                <option value="COVER_LETTER">Cover Letter</option>
                <option value="ATS_SIMULATE">ATS Simulate</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card variant="elevated">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <Cpu className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No AI usage logs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">User</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Operation</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Model</th>
                      <th className="text-right py-4 px-4 text-sm font-medium text-slate-600">Input</th>
                      <th className="text-right py-4 px-4 text-sm font-medium text-slate-600">Output</th>
                      <th className="text-right py-4 px-4 text-sm font-medium text-slate-600">Total</th>
                      <th className="text-right py-4 px-4 text-sm font-medium text-slate-600">Duration</th>
                      <th className="text-right py-4 px-4 text-sm font-medium text-slate-600">Cost</th>
                      <th className="text-right py-4 px-6 text-sm font-medium text-slate-600">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {log.user.email[0].toUpperCase()}
                            </div>
                            <span className="text-sm text-slate-600 truncate max-w-[150px]" title={log.user.email}>
                              {log.user.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getOperationBadge(log.operation)}</td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-slate-600 font-mono">{log.model}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-slate-600">{log.inputTokens.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-slate-600">{log.outputTokens.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-medium text-slate-900">{log.totalTokens.toLocaleString()}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-slate-600">{formatDuration(log.durationMs)}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm font-medium text-emerald-600">${parseFloat(log.estimatedCost).toFixed(4)}</span>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <span className="text-sm text-slate-500">{formatDate(log.createdAt)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(page - 1) * pagination.limit + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} logs
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
