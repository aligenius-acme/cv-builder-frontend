'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useFetchData } from '@/hooks/useFetchData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Shield,
  Building,
  ArrowLeft,
  FileText,
  Mail,
  Crown,
  Zap,
  Loader2,
  MoreVertical,
  Check,
  X,
} from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  plan: string;
  stripeSubscriptionId: string | null;
  resumeCount: number;
  coverLetterCount: number;
  createdAt: string;
  lastLoginAt: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const { data: usersData, isLoading, setData: setUsersData, refetch: loadUsers } = useFetchData<{ users: AdminUser[], pagination: Pagination }>({
    fetchFn: () => api.getAdminUsers(page, 20, search || undefined, roleFilter || undefined, planFilter || undefined),
    errorMessage: 'Failed to load users',
    immediate: user?.role === 'ADMIN',
    deps: [page, roleFilter, planFilter],
  });

  const users = usersData?.users || [];
  const pagination = usersData?.pagination || null;

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/resumes');
      return;
    }
  }, [user, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteAdminUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await api.updateAdminUser(userId, { role: newRole });
      toast.success('User role updated');
      loadUsers();
      setActionUserId(null);
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const handleTogglePlan = async (userId: string, currentPlan: string) => {
    const newPlan = currentPlan === 'PRO' ? 'FREE' : 'PRO';
    try {
      await api.updateAdminUser(userId, { plan: newPlan });
      toast.success(`User plan set to ${newPlan}`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user plan');
    }
  };

  if (user?.role !== 'ADMIN') {
    return null;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="error" size="sm">{role}</Badge>;
      default:
        return <Badge variant="default" size="sm">{role}</Badge>;
    }
  };

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
              <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
              <p className="text-slate-500">
                {pagination?.total || 0} total users
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card variant="elevated">
          <CardContent className="py-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by email or name..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
              <select
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">All Plans</option>
                <option value="FREE">Free</option>
                <option value="PRO">Pro</option>
              </select>
              <Button type="submit" variant="primary">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card variant="elevated">
          <CardContent className="p-0">
            {isLoading ? (
              <LoadingSpinner />
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-4 px-6 text-sm font-medium text-slate-600">User</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Role</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Plan</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Content</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Joined</th>
                      <th className="text-left py-4 px-4 text-sm font-medium text-slate-600">Last Login</th>
                      <th className="text-right py-4 px-6 text-sm font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {(u.firstName?.[0] || u.email[0]).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 text-sm">
                                {u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : 'No name'}
                              </p>
                              <p className="text-sm text-slate-500">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="relative">
                            <button
                              onClick={() => setActionUserId(actionUserId === u.id ? null : u.id)}
                              className="hover:opacity-80 transition-opacity"
                            >
                              {getRoleBadge(u.role)}
                            </button>
                            {actionUserId === u.id && (
                              <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10 min-w-[120px]">
                                {['USER', 'ADMIN'].map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => handleUpdateRole(u.id, role)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center justify-between ${
                                      u.role === role ? 'text-blue-600 font-medium' : 'text-slate-700'
                                    }`}
                                  >
                                    {role}
                                    {u.role === role && <Check className="h-4 w-4" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleTogglePlan(u.id, u.plan)}
                            title={u.plan === 'PRO' ? 'Click to revoke Pro' : 'Click to grant Pro'}
                            className="hover:opacity-80 transition-opacity"
                          >
                            {u.plan === 'PRO' ? (
                              <Badge variant="primary" size="sm">Pro</Badge>
                            ) : (
                              <Badge variant="default" size="sm">Free</Badge>
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-slate-400" />
                              {u.resumeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4 text-slate-400" />
                              {u.coverLetterCount}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500">
                          {u.lastLoginAt ? formatDate(u.lastLoginAt) : 'Never'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {u.role !== 'ADMIN' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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
              Showing {(page - 1) * pagination.limit + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} users
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
