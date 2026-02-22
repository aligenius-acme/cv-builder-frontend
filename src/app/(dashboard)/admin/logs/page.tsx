'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileText,
  Loader2,
  Shield,
  Eye,
  Trash2,
  Edit3,
  UserPlus,
  Settings,
  X,
} from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ParsingError {
  id: string;
  fileName: string;
  fileType: string;
  errorType: string;
  errorMessage: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  details: any;
  createdAt: string;
  admin?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminLogsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'errors' | 'audit'>('errors');
  const [parsingErrors, setParsingErrors] = useState<ParsingError[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [errorPagination, setErrorPagination] = useState<Pagination | null>(null);
  const [auditPagination, setAuditPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorPage, setErrorPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/resumes');
      return;
    }
    if (activeTab === 'errors') {
      loadParsingErrors();
    } else {
      loadAuditLogs();
    }
  }, [user, router, activeTab, errorPage, auditPage]);

  const loadParsingErrors = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminParsingErrors(errorPage, 50);
      if (response.success && response.data) {
        setParsingErrors(response.data.errors);
        setErrorPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to load parsing errors');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.getAdminAuditLogs(auditPage, 50);
      if (response.success && response.data) {
        setAuditLogs(response.data.logs);
        setAuditPagination(response.data.pagination);
      }
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedLog(null);
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  const getActionIcon = (action: string) => {
    if (action.includes('VIEW')) return <Eye className="h-4 w-4" />;
    if (action.includes('DELETE')) return <Trash2 className="h-4 w-4" />;
    if (action.includes('UPDATE')) return <Edit3 className="h-4 w-4" />;
    if (action.includes('CREATE')) return <UserPlus className="h-4 w-4" />;
    return <Settings className="h-4 w-4" />;
  };

  const getActionBadge = (action: string) => {
    if (action.includes('DELETE')) return <Badge variant="error" size="sm">{action}</Badge>;
    if (action.includes('UPDATE')) return <Badge variant="warning" size="sm">{action}</Badge>;
    if (action.includes('CREATE')) return <Badge variant="success" size="sm">{action}</Badge>;
    if (action.includes('VIEW')) return <Badge variant="info" size="sm">{action}</Badge>;
    return <Badge variant="default" size="sm">{action}</Badge>;
  };

  const getErrorTypeBadge = (errorType: string) => {
    switch (errorType) {
      case 'PARSE_FAILED':
        return <Badge variant="error" size="sm">Parse Failed</Badge>;
      case 'UNSUPPORTED_FORMAT':
        return <Badge variant="warning" size="sm">Unsupported Format</Badge>;
      case 'CORRUPTED_FILE':
        return <Badge variant="error" size="sm">Corrupted File</Badge>;
      default:
        return <Badge variant="default" size="sm">{errorType}</Badge>;
    }
  };

  const currentPagination = activeTab === 'errors' ? errorPagination : auditPagination;
  const currentPage = activeTab === 'errors' ? errorPage : auditPage;
  const setCurrentPage = activeTab === 'errors' ? setErrorPage : setAuditPage;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
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
              <h1 className="text-2xl font-bold text-slate-900">System Logs</h1>
              <p className="text-slate-500">
                View parsing errors and admin activity
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('errors')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'errors'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Parsing Errors
            </span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === 'audit'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Audit Logs
            </span>
          </button>
        </div>

        {/* Content */}
        <Card variant="elevated">
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSpinner />
            ) : activeTab === 'errors' ? (
              parsingErrors.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No parsing errors found</p>
                  <p className="text-sm text-slate-400 mt-1">All files are being parsed successfully</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">File</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Type</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Error</th>
                        <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Message</th>
                        <th className="text-right py-4 px-6 text-sm font-medium text-slate-600">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsingErrors.map((error) => (
                        <tr key={error.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-6">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-400" />
                              <span className="text-sm text-slate-900 font-medium truncate max-w-[200px]">
                                {error.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="default" size="sm">{error.fileType}</Badge>
                          </td>
                          <td className="py-3 px-4">{getErrorTypeBadge(error.errorType)}</td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-slate-600 truncate block max-w-[300px]" title={error.errorMessage}>
                              {error.errorMessage}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right">
                            <span className="text-sm text-slate-500">{formatDate(error.createdAt)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : auditLogs.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No audit logs found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">Action</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Admin</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Target</th>
                      <th className="text-right py-4 px-4 text-sm font-medium text-slate-600">Time</th>
                      <th className="text-center py-4 px-4 text-sm font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-6">
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            {getActionBadge(log.action)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {log.admin?.avatarUrl ? (
                              <img
                                src={log.admin.avatarUrl}
                                alt={log.admin.email}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {(log.admin?.firstName?.[0] || log.admin?.email[0] || '?').toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm text-slate-900">
                              {log.admin?.firstName && log.admin?.lastName
                                ? `${log.admin.firstName} ${log.admin.lastName}`
                                : log.admin?.email || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <span className="text-slate-600">{log.targetType}</span>
                            {log.targetId && (
                              <span className="text-slate-400 ml-2 font-mono text-xs">
                                {log.targetId.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-sm text-slate-500">{formatDate(log.createdAt)}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                            leftIcon={<Eye className="h-4 w-4" />}
                          >
                            Details
                          </Button>
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
        {currentPagination && currentPagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing {(currentPage - 1) * currentPagination.limit + 1} to {Math.min(currentPage * currentPagination.limit, currentPagination.total)} of {currentPagination.total} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {currentPage} of {currentPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === currentPagination.totalPages}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto animate-in fade-in duration-200">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm"
              onClick={closeDetailsModal}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Audit Log Details</h2>
                    <p className="text-sm text-slate-500">{formatDate(selectedLog.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={closeDetailsModal}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {/* Admin Info */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Performed By</h3>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    {selectedLog.admin?.avatarUrl ? (
                      <img
                        src={selectedLog.admin.avatarUrl}
                        alt={selectedLog.admin.email}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                        {(selectedLog.admin?.firstName?.[0] || selectedLog.admin?.email[0] || '?').toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {selectedLog.admin?.firstName && selectedLog.admin?.lastName
                          ? `${selectedLog.admin.firstName} ${selectedLog.admin.lastName}`
                          : selectedLog.admin?.email || 'Unknown Admin'}
                      </p>
                      <p className="text-sm text-slate-500">{selectedLog.admin?.email || selectedLog.adminId}</p>
                    </div>
                  </div>
                </div>

                {/* Action Info */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Action</h3>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Action Type</p>
                        {getActionBadge(selectedLog.action)}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Target</p>
                        <Badge variant="default">{selectedLog.targetType}</Badge>
                      </div>
                      {selectedLog.targetId && (
                        <div className="col-span-2">
                          <p className="text-xs text-slate-500 mb-1">Target ID</p>
                          <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                            {selectedLog.targetId}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details JSON */}
                {selectedLog.details && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Additional Details</h3>
                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-sm text-slate-100 font-mono">
                        <code>{JSON.stringify(selectedLog.details, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Metadata</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Log ID</p>
                      <code className="text-xs font-mono text-slate-900">{selectedLog.id}</code>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                      <p className="text-xs text-slate-900">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-slate-50">
                <Button variant="outline" onClick={closeDetailsModal}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
